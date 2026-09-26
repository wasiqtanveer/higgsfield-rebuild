import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, FolderOpen } from "lucide-react";
import { useAuth, useAuthStatus } from "../../lib/auth.js";
import "./Library.css";

/**
 * /library — everything you have made.
 *
 * Reads /api/library, which resolves the user from the session cookie. The
 * client never sends an id: `?user=<uuid>` would let anyone read anyone's
 * library by guessing one.
 *
 * The signed-out state is a real door, not a wall. It says what the page would
 * hold and offers the two ways in, because PRODUCT.md is explicit that a
 * signed-out visitor gets a door rather than a signup gate — and because the
 * composer works signed out, so there is something to come back with.
 */

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const s = Math.max(0, (Date.now() - then) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Piece({ row, index, reduce }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.article
      className="lb__piece"
      initial={reduce ? false : { opacity: 0, transform: "translateY(12px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={
        reduce
          ? { duration: 0 }
          : {
              duration: 0.38,
              ease: [0.23, 1, 0.32, 1],
              /* Capped so a full library does not end with a tile waiting two
                 seconds to appear. */
              delay: Math.min(index, 11) * 0.035,
            }
      }
    >
      <div className={`lb__frame${loaded ? " is-loaded" : ""}`}>
        {row.image_url ? (
          <img
            className="lb__img"
            src={row.image_url}
            alt={row.prompt}
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <p className="lb__noimg">image not stored</p>
        )}
        {row.parent_id && <span className="lb__forked">fork</span>}
      </div>

      <p className="lb__prompt mono">{row.prompt}</p>

      <p className="lb__meta">
        <span className="mono">seed {row.seed}</span>
        <span className="lb__dot" aria-hidden="true" />
        <time dateTime={row.created_at}>{timeAgo(row.created_at)}</time>
      </p>

      <Link className="lb__again" to={`/create?prompt=${encodeURIComponent(row.prompt)}&from=${row.id}`}>
        Fork this
      </Link>
    </motion.article>
  );
}

export default function Library() {
  const user = useAuth();
  const authStatus = useAuthStatus();
  const reduce = useReducedMotion();
  const [rows, setRows] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    /* Wait for the session to resolve. Fetching before it does means a signed-in
       visitor gets the signed-out page for a moment, which is the worst of both
       states. */
    if (authStatus !== "ready") return undefined;
    if (!user) {
      setState("anon");
      return undefined;
    }

    const ac = new AbortController();
    setState("loading");
    (async () => {
      try {
        const r = await fetch("/api/library", {
          credentials: "same-origin",
          signal: ac.signal,
        });
        const json = await r.json().catch(() => null);
        if (!r.ok) throw new Error(json?.error ?? `The server answered ${r.status}.`);
        setRows(json?.generations ?? []);
        setState("ready");
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(String(err.message || err));
        setState("error");
      }
    })();
    return () => ac.abort();
  }, [authStatus, user]);

  const forks = rows.filter((r) => r.parent_id).length;

  return (
    <div className="lb">
      <header className="lb__head">
        <div className="page">
          <h1 className="lb__h1">
            {user ? (
              <>
                Everything <span className="lb__serif">you</span> have made.
              </>
            ) : (
              <>
                Your work, kept with its <span className="lb__serif">prompts</span>.
              </>
            )}
          </h1>
          <p className="lb__lede">
            {user
              ? "Each piece keeps the prompt and the seed that produced it, so any of them can be run again or forked into something else."
              : "A library holds what you generate alongside the prompt that made it. Sign in and anything you run is kept here."}
          </p>
          {state === "ready" && rows.length > 0 && (
            <p className="lb__tally mono">
              {rows.length} {rows.length === 1 ? "piece" : "pieces"}
              <span className="lb__tally-sep" aria-hidden="true" />
              {forks} from a fork
              <span className="lb__tally-sep" aria-hidden="true" />
              {user.credits} credits left
            </p>
          )}
        </div>
      </header>

      <div className="page lb__body">
        {(state === "loading" || authStatus !== "ready") && (
          <div className="lb__grid" aria-busy="true" aria-live="polite">
            {Array.from({ length: 8 }, (_, i) => (
              <div className="lb__skel" key={i} style={{ "--i": i }}>
                <span className="lb__skel-frame" />
                <span className="lb__skel-line" />
                <span className="lb__skel-line is-short" />
              </div>
            ))}
            <p className="sr-only">Loading your library…</p>
          </div>
        )}

        {state === "anon" && (
          <div className="lb__state">
            <Lock size={20} aria-hidden="true" className="lb__state-icon" />
            <h2 className="lb__state-h">This is yours once you sign in.</h2>
            <p className="lb__state-p">
              You can run a prompt without an account — the composer is open and
              anything you make is public and forkable. An account is what keeps
              it: a library, a credit balance, and your name on the forks that
              descend from your work.
            </p>
            <div className="lb__state-row">
              <Link className="lb__cta" to="/create">
                Write a prompt
              </Link>
              <Link className="lb__ghost" to="/explore">
                See what others made
              </Link>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="lb__state" role="alert">
            <h2 className="lb__state-h">Your library could not be read.</h2>
            <p className="lb__state-p">{error}</p>
            <button type="button" className="lb__cta" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {state === "ready" && rows.length === 0 && (
          <div className="lb__state">
            <FolderOpen size={20} aria-hidden="true" className="lb__state-icon" />
            <h2 className="lb__state-h">Nothing here yet.</h2>
            <p className="lb__state-p">
              You have {user.credits} credits. A run costs one, and what comes
              back is kept here with the prompt that made it.
            </p>
            <Link className="lb__cta" to="/create">
              Write your first prompt
            </Link>
          </div>
        )}

        {state === "ready" && rows.length > 0 && (
          <div className="lb__grid">
            {rows.map((row, i) => (
              <Piece row={row} index={i} reduce={reduce} key={row.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
