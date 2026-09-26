import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GitBranch, CornerDownRight, Sprout } from "lucide-react";
import "./Lineage.css";

/**
 * /lineage — browse prompts by descent.
 *
 * Explore answers "what has been made". This answers "what came from what",
 * which is a different question and needs a different shape: a tree you open
 * rather than a feed you scroll.
 *
 * The one animated moment is the expand. Everything else — hover, selection —
 * is a transition measured in the low hundreds of milliseconds, because those
 * fire constantly and motion on them would be noise.
 */

/* The chain is walked client-side from one /api/feed read. A page that fetched
   each node's children on open would make the tree feel like a network, which
   is the opposite of what a lineage should feel like. */
const PAGE = 60;

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const s = Math.max(0, (Date.now() - then) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** The word-level edit between parent and child. Null when it was a rewrite. */
function promptDiff(parent, child) {
  if (!parent || !child || parent === child) return null;
  const a = parent.trim().split(/\s+/);
  const b = child.trim().split(/\s+/);
  let head = 0;
  while (head < a.length && head < b.length && a[head].toLowerCase() === b[head].toLowerCase()) head++;
  let tail = 0;
  while (
    tail < a.length - head &&
    tail < b.length - head &&
    a[a.length - 1 - tail].toLowerCase() === b[b.length - 1 - tail].toLowerCase()
  ) tail++;
  const removed = a.slice(head, a.length - tail).join(" ");
  const added = b.slice(head, b.length - tail).join(" ");
  if (!removed && !added) return null;
  if (head === 0 && tail === 0) return null;
  return { removed, added };
}

function Node({ row, childrenOf, depth, reduce }) {
  const kids = childrenOf.get(row.id) ?? [];
  /* Roots start open one level down: a tree whose every branch is shut is a
     list of prompts with the feature hidden behind a click. */
  const [open, setOpen] = useState(depth === 0);
  const hasKids = kids.length > 0;

  return (
    <li className="ln__node" data-depth={depth}>
      <div className={`ln__row${hasKids ? " has-kids" : ""}`}>
        {hasKids ? (
          <button
            type="button"
            className="ln__toggle"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <motion.span
              className="ln__chev"
              aria-hidden="true"
              animate={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
              transition={reduce ? { duration: 0 } : { duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              <CornerDownRight size={14} />
            </motion.span>
            <span className="sr-only">
              {open ? "Collapse" : "Expand"} {kids.length} fork
              {kids.length === 1 ? "" : "s"}
            </span>
          </button>
        ) : (
          <span className="ln__leaf" aria-hidden="true" />
        )}

        {row.image_url ? (
          <img className="ln__thumb" src={row.image_url} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="ln__thumb is-bare" aria-hidden="true" />
        )}

        <div className="ln__text">
          <p className="ln__prompt mono">{row.prompt}</p>
          <p className="ln__meta">
            <span className="ln__who">{row.author === "anon" ? "anon" : `@${row.author}`}</span>
            <span className="ln__dot" aria-hidden="true" />
            <span className="mono">seed {row.seed}</span>
            <span className="ln__dot" aria-hidden="true" />
            <time dateTime={row.created_at}>{timeAgo(row.created_at)}</time>
            {hasKids && (
              <>
                <span className="ln__dot" aria-hidden="true" />
                <span className="ln__count">
                  <GitBranch size={11} aria-hidden="true" />
                  {kids.length}
                </span>
              </>
            )}
          </p>
        </div>

        <Link
          className="ln__take"
          to={`/create?prompt=${encodeURIComponent(row.prompt)}&from=${row.id}`}
        >
          Fork
        </Link>
      </div>

      <AnimatePresence initial={false}>
        {hasKids && open && (
          /* Height is the one property with no transform equivalent for a
             disclosure, so it is the sanctioned exception. Opacity leads
             slightly so the content does not appear to grow out of nothing. */
          <motion.ul
            className="ln__kids"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    height: { duration: 0.24, ease: [0.23, 1, 0.32, 1] },
                    opacity: { duration: 0.16, ease: [0.23, 1, 0.32, 1] },
                  }
            }
          >
            {kids.map((kid) => {
              const diff = promptDiff(row.prompt, kid.prompt);
              return (
                <div className="ln__branch" key={kid.id}>
                  {diff && (
                    <p className="ln__edit mono">
                      {diff.removed && <span className="ln__edit-out">{diff.removed}</span>}
                      {diff.removed && diff.added && (
                        <span className="ln__edit-to" aria-hidden="true">→</span>
                      )}
                      {diff.added && <span className="ln__edit-in">{diff.added}</span>}
                    </p>
                  )}
                  <Node row={kid} childrenOf={childrenOf} depth={depth + 1} reduce={reduce} />
                </div>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

export default function Lineage() {
  const [rows, setRows] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const reduce = useReducedMotion();

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(`/api/feed?limit=${PAGE}`, { signal: ac.signal });
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
  }, []);

  /* Built once per fetch. `roots` is anything whose parent is not in this page
     — a row whose parent fell outside the window is still the top of the chain
     we can actually show, and dropping it would hide its children entirely. */
  const { roots, childrenOf, chains } = useMemo(() => {
    const byId = new Map(rows.map((r) => [r.id, r]));
    const childrenOf = new Map();
    for (const r of rows) {
      if (!r.parent_id || !byId.has(r.parent_id)) continue;
      if (!childrenOf.has(r.parent_id)) childrenOf.set(r.parent_id, []);
      childrenOf.get(r.parent_id).push(r);
    }
    /* Oldest first inside a chain: descent reads downward in the order it
       happened, and reversing it makes a fork look like it preceded its
       parent. */
    for (const list of childrenOf.values()) {
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    const roots = rows.filter((r) => !r.parent_id || !byId.has(r.parent_id));
    return {
      roots,
      childrenOf,
      chains: roots.filter((r) => childrenOf.has(r.id)).length,
    };
  }, [rows]);

  /* Chains first. A page that opens on forty leaves buries the one thing it is
     for. */
  const ordered = useMemo(
    () => [...roots].sort((a, b) => (childrenOf.has(b.id) ? 1 : 0) - (childrenOf.has(a.id) ? 1 : 0)),
    [roots, childrenOf]
  );

  return (
    <div className="ln">
      <header className="ln__head">
        <div className="page">
          <h1 className="ln__h1">
            Read it by <span className="ln__serif">descent</span>.
          </h1>
          <p className="ln__lede">
            Every prompt and what came out of it. Open a root to walk its forks,
            and the edit that produced each one sits on the branch.
          </p>
          {state === "ready" && rows.length > 0 && (
            <p className="ln__tally mono">
              {roots.length} roots
              <span className="ln__tally-sep" aria-hidden="true" />
              {chains} with forks
              <span className="ln__tally-sep" aria-hidden="true" />
              {rows.length} generations
            </p>
          )}
        </div>
      </header>

      <div className="page ln__body">
        {state === "loading" && (
          <div className="ln__skels" aria-busy="true" aria-live="polite">
            {Array.from({ length: 5 }, (_, i) => (
              <div className="ln__skel" key={i} style={{ "--i": i }}>
                <span className="ln__skel-thumb" />
                <span className="ln__skel-lines">
                  <span className="ln__skel-line" />
                  <span className="ln__skel-line is-short" />
                </span>
              </div>
            ))}
            <p className="sr-only">Loading lineages…</p>
          </div>
        )}

        {state === "error" && (
          <div className="ln__state" role="alert">
            <h2 className="ln__state-h">The tree could not be read.</h2>
            <p className="ln__state-p">{error}</p>
            <button type="button" className="ln__cta" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {state === "ready" && rows.length === 0 && (
          <div className="ln__state">
            <Sprout size={20} aria-hidden="true" className="ln__state-icon" />
            <h2 className="ln__state-h">No lineages yet.</h2>
            <p className="ln__state-p">
              A lineage starts the moment someone forks a prompt. Write one and
              it becomes a root.
            </p>
            <Link className="ln__cta" to="/create">
              Write a prompt
            </Link>
          </div>
        )}

        {state === "ready" && ordered.length > 0 && (
          <ul className="ln__tree">
            {ordered.map((row, i) => (
              <motion.div
                key={row.id}
                initial={reduce ? false : { opacity: 0, transform: "translateY(10px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.34, ease: [0.23, 1, 0.32, 1], delay: Math.min(i, 8) * 0.04 }
                }
              >
                <Node row={row} childrenOf={childrenOf} depth={0} reduce={reduce} />
              </motion.div>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
