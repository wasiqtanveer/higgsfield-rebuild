import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Explore.css";

/**
 * Explore — the public record.
 *
 * Two rebuilds got this here, and the failure each time is worth keeping.
 *
 * The first was a masonry of equal square tiles: the lazy container, and it
 * could not express descent at all. The second was a single vertical column,
 * which expressed descent but turned 22 rows into an endless scroll of
 * full-width pictures where every entry had identical weight.
 *
 * The fix is not a third uniform rhythm. It is to stop treating the feed as a
 * list of generations and start treating it as **a set of lineages**:
 *
 * 1. **A lineage is one unit.** A root and its forks render together, in a
 *    frame, with the thread running between them. That is what this product
 *    is; showing a fork 14 rows away from its parent hides the only feature
 *    the category does not have.
 *
 * 2. **Lineages lead, orphans follow.** Chains go first at full weight, then
 *    everything that descends from nothing sits in a denser grid underneath.
 *    Uniform weight across 22 entries is what made it read as a long scroll.
 *
 * 3. **The diff is the headline of a fork.** When a child changed one word of
 *    its parent, that edit is the most interesting thing on the page and it is
 *    set as the largest type in the entry.
 */

const PAGE = 30;

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const secs = Math.max(0, (Date.now() - then) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function modelLeaf(id = "") {
  const leaf = String(id).split("/").filter(Boolean).pop() || id;
  return leaf.replace(/^flux-1-/, "flux ");
}

/**
 * The word-level edit between a parent prompt and its child.
 *
 * Word-level rather than character-level: a character diff of two prose prompts
 * is confetti, and the claim is specifically that you can read *the one line
 * that changed*. Returns null when the two share no prefix or suffix, because a
 * rewrite is not an edit and inventing one would assert what the data does not
 * support.
 */
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
  ) {
    tail++;
  }

  const removed = a.slice(head, a.length - tail).join(" ");
  const added = b.slice(head, b.length - tail).join(" ");
  if (!removed && !added) return null;
  if (head === 0 && tail === 0) return null;
  return { removed, added, before: a.slice(0, head).join(" "), after: a.slice(a.length - tail).join(" ") };
}

function Mark({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 6.5c4.4 0 5.6 5.5 10 5.5" />
        <path d="M5 17.5c4.4 0 5.6-5.5 10-5.5" />
        <path d="M15 12h4" />
      </g>
    </svg>
  );
}

function Shot({ row, className }) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  if (!row.image_url || broken) {
    return (
      <div className={`${className} is-bare`}>
        <p className="xp__noshot">no image stored — the prompt is the record</p>
      </div>
    );
  }

  return (
    <div className={`${className}${loaded ? " is-loaded" : ""}`}>
      <img
        className="xp__img"
        src={row.image_url}
        alt={row.prompt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setBroken(true)}
      />
    </div>
  );
}

function Facts({ row }) {
  return (
    <p className="xp__facts">
      <span className="xp__who">{row.author === "anon" ? "anon" : `@${row.author}`}</span>
      <span className="xp__sep" aria-hidden="true" />
      <span className="mono">{modelLeaf(row.model)}</span>
      <span className="xp__sep" aria-hidden="true" />
      <span className="mono">seed {row.seed}</span>
      <span className="xp__sep" aria-hidden="true" />
      <time dateTime={row.created_at}>{timeAgo(row.created_at)}</time>
    </p>
  );
}

/**
 * One lineage: a root and everything that descends from it, together.
 *
 * The root is shown large because it is what the chain is *of*; its children
 * are shown beside it at smaller weight with the edit that produced each one.
 */
function Lineage({ root, children, index }) {
  return (
    <article
      className={`xp__chain${children.length === 1 ? " is-single" : ""}`}
      style={{ "--i": Math.min(index, 6) }}
    >
      <header className="xp__chain-head">
        <Mark className="xp__chain-mark" />
        <span className="xp__chain-label">
          {children.length} {children.length === 1 ? "fork" : "forks"} of this prompt
        </span>
        <span className="xp__chain-rule" aria-hidden="true" />
      </header>

      <div className="xp__chain-body">
        <div className="xp__origin-col">
          <Shot row={root} className="xp__shot xp__shot--lead" />
          <h2 className="xp__prompt mono">{root.prompt}</h2>
          <Facts row={root} />
          <Link
            className="xp__take"
            to={`/create?prompt=${encodeURIComponent(root.prompt)}`}
          >
            Change one line
          </Link>
        </div>

        <ol className="xp__kids">
          {children.map((kid) => {
            const diff = promptDiff(root.prompt, kid.prompt);
            return (
              <li className="xp__kid" key={kid.id}>
                <Shot row={kid} className="xp__shot xp__shot--kid" />
                <div className="xp__kid-text">
                  {diff ? (
                    /* The edit IS the headline of a fork -- it is the one thing
                       here the category cannot show. */
                    <p className="xp__edit mono">
                      {diff.removed && <span className="xp__edit-out">{diff.removed}</span>}
                      {diff.removed && diff.added && (
                        <span className="xp__edit-to" aria-hidden="true">
                          →
                        </span>
                      )}
                      {diff.added && <span className="xp__edit-in">{diff.added}</span>}
                    </p>
                  ) : (
                    <p className="xp__edit is-same mono">
                      same prompt, new seed
                    </p>
                  )}
                  <p className="xp__kid-prompt mono">{kid.prompt}</p>
                  <Facts row={kid} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </article>
  );
}

/* A generation nothing descends from and which forked nothing. Denser, because
   a root with no chain is a picture and a prompt, not a story. */
function Solo({ row, index }) {
  return (
    <article className="xp__solo" style={{ "--i": Math.min(index, 11) }}>
      <Shot row={row} className="xp__shot xp__shot--solo" />
      <h3 className="xp__solo-prompt mono">{row.prompt}</h3>
      <Facts row={row} />
      <Link
        className="xp__take xp__take--quiet"
        to={`/create?prompt=${encodeURIComponent(row.prompt)}`}
      >
        Change one line
      </Link>
    </article>
  );
}

export default function Explore() {
  const [rows, setRows] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");

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

  /* Group the flat feed into lineages. A chain is a row that has children in
     this page; everything else is a solo. Done once per fetch rather than per
     render, because it walks the whole set. */
  const { chains, solos, forkCount } = useMemo(() => {
    const kids = new Map();
    for (const r of rows) {
      if (!r.parent_id) continue;
      if (!kids.has(r.parent_id)) kids.set(r.parent_id, []);
      kids.get(r.parent_id).push(r);
    }

    const claimed = new Set();
    const chains = [];
    for (const r of rows) {
      const mine = kids.get(r.id);
      if (!mine?.length) continue;
      chains.push({ root: r, children: mine });
      claimed.add(r.id);
      mine.forEach((k) => claimed.add(k.id));
    }

    return {
      chains,
      solos: rows.filter((r) => !claimed.has(r.id)),
      forkCount: rows.filter((r) => r.parent_id).length,
    };
  }, [rows]);

  return (
    <div className="xp">
      <header className="xp__head">
        <div className="page">
          <h1 className="xp__h1">
            Every prompt here is <span className="xp__serif">forkable</span>.
          </h1>
          <p className="xp__lede">
            Lineages first — a prompt and everything that descends from it, with
            the edit that produced each one. Take any of them, change one line,
            and run it again.
          </p>
          {state === "ready" && rows.length > 0 && (
            <p className="xp__tally mono">
              {rows.length} generations
              <span className="xp__tally-sep" aria-hidden="true" />
              {forkCount} {forkCount === 1 ? "fork" : "forks"}
              <span className="xp__tally-sep" aria-hidden="true" />
              {chains.length} {chains.length === 1 ? "lineage" : "lineages"}
            </p>
          )}
        </div>
      </header>

      <div className="page">
        {state === "loading" && (
          <div className="xp__skels" aria-busy="true" aria-live="polite">
            {Array.from({ length: 6 }, (_, i) => (
              <div className="xp__skel" key={i} style={{ "--i": i }}>
                <div className="xp__skel-shot" />
                <div className="xp__skel-line" />
                <div className="xp__skel-line is-short" />
              </div>
            ))}
            <p className="sr-only">Loading the record…</p>
          </div>
        )}

        {state === "error" && (
          <div className="xp__state" role="alert">
            <h2 className="xp__state-h">The record could not be read.</h2>
            <p className="xp__state-p">{error}</p>
            <button type="button" className="xp__cta" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {state === "ready" && rows.length === 0 && (
          <div className="xp__state">
            <h2 className="xp__state-h">Nothing has been made yet.</h2>
            <p className="xp__state-p">
              The record fills as people run prompts. Be the root of the first
              lineage.
            </p>
            <Link className="xp__cta" to="/create">
              Write a prompt
            </Link>
          </div>
        )}

        {state === "ready" && chains.length > 0 && (
          <section className="xp__chains">
            {chains.map((c, i) => (
              <Lineage root={c.root} children={c.children} index={i} key={c.root.id} />
            ))}
          </section>
        )}

        {state === "ready" && solos.length > 0 && (
          <section className="xp__solos-wrap">
            <header className="xp__solos-head">
              <h2 className="xp__solos-h">Roots, unforked</h2>
              <p className="xp__solos-p">
                {solos.length} prompts nothing descends from yet.
              </p>
            </header>
            <div className="xp__solos">
              {solos.map((row, i) => (
                <Solo row={row} index={i} key={row.id} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
