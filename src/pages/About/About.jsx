import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CornerDownRight, GitFork } from "lucide-react";
import Arrive from "../../components/Arrive/Arrive.jsx";
import Magnetic from "../../components/Magnetic/Magnetic.jsx";
import SiteFoot from "../../components/SiteFoot/SiteFoot.jsx";
import { NODES, TERMINUS } from "../../data/abouttree.js";
import "./About.css";

/**
 * /about — the page built out of the mechanism it describes.
 *
 * The category ships an About page as a prose column of mission copy with a team
 * grid and a timeline of dates. This product's claim is that a prompt is an
 * artifact and that a claim gets tested by forking it, so this page sets its own
 * text as a prompt tree and asks the visitor to perform that gesture on the
 * sentence that makes the claim. A claim you can fork is a claim under test. A
 * paragraph is not.
 *
 * THE ONE STRUCTURAL DECISION
 *
 * The page keeps ONE node at the focus position and grows its children beneath
 * it. It does not render the whole tree as a static org chart. That is the
 * difference between a diagram of lineage and an act of lineage: an org chart
 * shows you that a hierarchy exists, while promoting a node makes you do the
 * thing the product is for. The path you took stays visible above the focus as a
 * spine of collapsed ancestors, so the depth you have reached is something you
 * can see rather than a number you are told.
 *
 * WHY THE DIFF IS COMPUTED HERE
 *
 * Same reason `ForkDiff` computes its own: a hand-marked diff would look
 * identical, cost nothing, and be wrong the first time anybody edited
 * `abouttree.js` — and that file is written to be edited. The whole page is an
 * argument that Graft computes the change between two prompts, so the page
 * computes it.
 */

/* The page's one arrival curve, shared with the Hero, ForkDiff and ModelSpec.
   One ease for every authored motion is most of what makes a site read as one
   hand rather than as a set of components that each animate. */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ---------------------------------------------------------------------------
 * Word-level diff.
 *
 * Longest common subsequence over whitespace-split tokens, built from the end so
 * the forward walk can read the table greedily. The quadratic form is what buys
 * the property this page needs: it finds the LONGEST shared run, so one clause
 * swapped in the middle of an otherwise identical sentence comes out as a
 * deletion and an insertion in place rather than as a rewrite of the tail. A
 * greedy or line-based diff gets exactly this case wrong, and exactly this case
 * is the product's entire claim.
 *
 * Deliberately a copy of the same routine in ForkDiff rather than a shared
 * import: the two sections are free to diverge (this one diffs a claim about the
 * product, that one diffs a generation prompt), and coupling them would mean a
 * change to one section's diff silently re-times the other's animation.
 * ------------------------------------------------------------------------- */
function diffWords(before, after) {
  const a = before.split(/\s+/).filter(Boolean);
  const b = after.split(/\s+/).filter(Boolean);

  const lcs = Array.from({ length: a.length + 1 }, () =>
    new Uint16Array(b.length + 1)
  );
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ type: "same", word: a[i] });
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      /* Deletions before insertions at the same position: that ordering is what
         makes a swap read as "the old clause struck, the new one arriving after
         it" rather than as two unrelated edits. */
      out.push({ type: "del", word: a[i] });
      i += 1;
    } else {
      out.push({ type: "ins", word: b[j] });
      j += 1;
    }
  }
  while (i < a.length) out.push({ type: "del", word: a[i++] });
  while (j < b.length) out.push({ type: "ins", word: b[j++] });
  return out;
}

/** The chain of ids from the root down to `id`, root first. */
function pathTo(id) {
  const chain = [];
  let cursor = id;
  while (cursor) {
    chain.unshift(cursor);
    cursor = NODES[cursor]?.parent;
  }
  return chain;
}

/* ---------------------------------------------------------------------------
 * The diffed line.
 *
 * Tokens animate on a stagger taken from their index, so the change resolves
 * left to right in reading order rather than all at once — the reader's eye is
 * already travelling that way, and a diff that lands on one frame is a state
 * change rather than a revision. Only the changed tokens are staggered; the
 * shared words are just text, because animating them would say something
 * changed there.
 *
 * `runs` carries the tokens' state: false while the line is showing its parent's
 * wording, true once the revision has resolved. Both states render the full
 * text, so with JS dead the line is simply the new wording with the old clause
 * struck beside it — readable, and honest about what it is.
 * ------------------------------------------------------------------------- */
function DiffLine({ before, after, resolved, reduced }) {
  const tokens = useMemo(() => diffWords(before, after), [before, after]);

  /* Stagger index counted over CHANGED tokens only. Counting over all of them
     would make a late clause in a long sentence wait behind a dozen unchanged
     words for no reason the reader can see. */
  let changed = -1;

  return (
    <span className="abt__line" aria-label={after}>
      {tokens.map((tok, index) => {
        if (tok.type === "same") {
          return (
            <span className="abt__tok" key={`${index}-${tok.word}`}>
              {tok.word}{" "}
            </span>
          );
        }
        changed += 1;
        const delay = reduced ? 0 : changed * 46;
        return (
          <span
            className={[
              "abt__tok",
              `abt__tok--${tok.type}`,
              resolved ? "is-resolved" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={`${index}-${tok.word}`}
            style={{ "--tok-delay": `${delay}ms` }}
          >
            <span className="abt__tok-ink">{tok.word}</span>{" "}
          </span>
        );
      })}
    </span>
  );
}

export default function About() {
  /* Which node holds the focus position. The page starts one level down rather
     than at the root, because the root is the category's claim and the swap is
     Graft's — opening on `thesis` means the first thing on screen is already a
     diff, which is the mechanism, rather than a sentence about someone else's
     product. The root stays visible above it as the first spine entry. */
  const [focus, setFocus] = useState("thesis");

  /* Whether the focus node's diff has resolved. Split from `focus` so the
     promotion reads as two beats: the node takes the position, THEN the clause
     turns over. Doing both on one frame makes the travel and the revision
     indistinguishable, and the revision is the part that matters. */
  const [resolved, setResolved] = useState(false);
  const [reduced, setReduced] = useState(true);
  const timers = useRef([]);

  /* Reduced motion is read once and held, and it is read BEFORE anything is
     armed. A CSS-paused animation still runs its JS timer, so honouring the
     setting only in CSS would leave this page scheduling work nobody asked for.
     Defaulting to `true` means the first paint is never the animated state on a
     machine we have not asked yet. */
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) {
      setReduced(false);
      return undefined;
    }
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  /* The first node resolves its own diff, once, unprompted. The page's whole
     argument depends on the visitor seeing a revision happen before they are
     asked to cause one — a tree that waits for a click shows a static sentence
     to anybody who does not click, which is most people. It fires once and stays
     resolved. */
  const armed = useRef(false);
  useEffect(() => {
    if (armed.current) return;
    armed.current = true;
    if (reduced) {
      setResolved(true);
      return;
    }
    const t = setTimeout(() => setResolved(true), 900);
    timers.current.push(t);
  }, [reduced]);

  const promote = useCallback(
    (id) => {
      if (id === focus) return;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setFocus(id);
      if (reduced) {
        setResolved(true);
        return;
      }
      /* Two beats: the node arrives, and then — once it has stopped travelling —
         its clause turns over. The gap is the shared arrival duration, so the
         revision starts exactly as the travel ends rather than crossing it. */
      setResolved(false);
      const t = setTimeout(() => setResolved(true), 520);
      timers.current.push(t);
    },
    [focus, reduced]
  );

  const node = NODES[focus];
  const spine = pathTo(focus);
  const ancestors = spine.slice(0, -1);
  const parent = node.parent ? NODES[node.parent] : null;
  const children = node.children.map((id) => NODES[id]);

  /* Depth is read off the spine rather than stored on the node, so it cannot
      disagree with the path the visitor actually walked. */
  const depth = spine.length - 1;
  const deepest = children.length === 0;

  return (
    <>
      <div className="abt">
        {/* The claim, and the instruction. No kicker above it: the heading
            carries its own weight, and an eyebrow here would be the page
            explaining itself before it has done anything. */}
        <header className="abt__head page">
          <h1 className="abt__title">
            A claim you can <em>fork</em> is a claim under test.
          </h1>
          <p className="abt__lede">
            Everything below is one sentence and its revisions. Each one differs
            from its parent by a single clause, and the change between them is
            computed, not marked up. Open any of them.
          </p>
        </header>

        <Arrive as="section" className="abt__tree page" lift={40}>
          {/* ---------------------------------------------------------------
              The spine: the path already walked, collapsed to its lines.
              This is what makes depth legible without a breadcrumb — a
              breadcrumb names where you are, while the spine shows what you
              revised to get there, which is the artifact itself.
              --------------------------------------------------------------- */}
          {ancestors.length > 0 && (
            <ol className="abt__spine">
              {ancestors.map((id, index) => {
                const step = NODES[id];
                return (
                  <li className="abt__spine-row" key={id}>
                    <button
                      type="button"
                      className="abt__spine-btn"
                      onClick={() => promote(id)}
                      style={{ "--row": index }}
                    >
                      <span className="abt__spine-depth">
                        {String(index).padStart(2, "0")}
                      </span>
                      <span className="abt__spine-line">{step.line}</span>
                      <span className="abt__spine-label">{step.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          {/* ---------------------------------------------------------------
              The focus node. `key` is the node id on purpose: promoting a node
              REPLACES this element rather than mutating it, so the arrival
              animation runs from its own start state instead of interpolating
              out of the previous node's. Reusing one element here was the first
              version and it read as text being retyped, not as a node arriving.
              --------------------------------------------------------------- */}
          <article
            className={[
              "abt__node",
              resolved ? "is-resolved" : "",
              reduced ? "is-still" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={focus}
          >
            <div className="abt__node-meta">
              <span className="abt__depth">
                <span className="abt__depth-num">
                  {String(depth).padStart(2, "0")}
                </span>
                <span className="abt__depth-unit">depth</span>
              </span>
              <span className="abt__node-label">{node.label}</span>
            </div>

            {/* The artifact. Mono at reading size, because on this product a
                prompt is authored data and this page's prompt is its claim. */}
            <p className="abt__node-line">
              <DiffLine
                before={parent ? parent.line : node.line}
                after={node.line}
                resolved={resolved || !parent}
                reduced={reduced}
              />
            </p>

            {/* The reasoning. Sans, because commentary about the artifact is not
                the artifact — that split is the product's typographic argument
                and it is load-bearing on this page. */}
            <p className="abt__node-body">{node.body}</p>

            {node.cost && (
              <p className="abt__cost">
                <span className="abt__cost-label">What it cost</span>
                {node.cost}
              </p>
            )}
          </article>

          {/* ---------------------------------------------------------------
              The children, or the terminus. Threads drop from the node above
              into each child: the same 2px accent line as the header's progress
              ring and the fork rail, doing the same job it does everywhere else
              on this product.
              --------------------------------------------------------------- */}
          {!deepest ? (
            <div
              className="abt__children"
              style={{ "--count": children.length }}
            >
              {children.map((child, index) => (
                <button
                  type="button"
                  className="abt__child"
                  key={child.id}
                  onClick={() => promote(child.id)}
                  style={{ "--child": index }}
                >
                  <span className="abt__thread" aria-hidden="true" />
                  <span className="abt__child-head">
                    <GitFork size={13} aria-hidden="true" />
                    <span className="abt__child-label">{child.label}</span>
                    <span className="abt__child-depth">
                      {String(depth + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="abt__child-line">{child.line}</span>
                  <span className="abt__child-go">
                    <CornerDownRight size={13} aria-hidden="true" />
                    Fork this line
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="abt__terminus">
              <span className="abt__thread abt__thread--end" aria-hidden="true" />
              <p className="abt__terminus-note">
                This branch ends here. {TERMINUS.note}
              </p>
              <Magnetic>
                <Link className="abt__action" to={TERMINUS.href}>
                  {TERMINUS.label}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Magnetic>
            </div>
          )}
        </Arrive>
      </div>
      <SiteFoot />
    </>
  );
}
