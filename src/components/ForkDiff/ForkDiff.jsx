import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CornerDownRight, GitFork } from "lucide-react";
import Magnetic from "../Magnetic/Magnetic.jsx";
import { FORKS } from "../../data/forkdiff.js";
import "./ForkDiff.css";

/* The page's one arrival curve, shared with ModelSpec and the Hero. One ease
   for every authored motion in the section is most of what makes a page read
   as a single hand rather than as four components that each animate. */
const EASE = [0.22, 1, 0.36, 1];

/* The section's arrival, as one schedule instead of per-element guesses.
 *
 * Every delay below is derived from the element's index in READING ORDER, so
 * adding a beat or a rail row re-times the whole descent correctly instead of
 * needing its neighbours' numbers hand-adjusted. The one rule the numbers
 * encode: the three beats count out DOWNWARD, 01 → 02 → 03, in step with the
 * thread drawing itself past them — this section's argument is a descent, so
 * the stagger's direction is the argument, exactly as ModelSpec's ladder is
 * counted out from the left because a step count is a run along a ruler.
 *
 * BEAT is longer than RAIL because a beat is a paragraph and a rail row is a
 * line: the eye needs the extra beat to land before the next one moves. */
const T = {
  head: 0,        // headline + lede, the frame for everything under it
  rail: 0.22,     // the three forks, dealt individually
  cta: 0.52,
  panel: 0.18,    // the panel itself, just behind the headline
  beat: 0.34,     // beat 01 — after the panel has somewhere to put it
  beatStep: 0.17, // 01 → 02 → 03, the descent
};

/* Two properties, never one. On near-black a change in a single property at
   small scale is easy to miss — the reason ModelSpec's ladder ticks move
   scaleY AND opacity rather than just colour. */
const riseIn = (delay, reduced, y = 14) => ({
  initial: reduced ? false : { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: reduced ? { duration: 0 } : { duration: 0.62, ease: EASE, delay },
});

/* ---------------------------------------------------------------------------
 * The diff.
 *
 * A real word-level diff, computed here rather than authored as pre-marked
 * spans, because the whole section is an argument that Graft *computes* the
 * change between two prompts. Hand-marked spans would look identical and be a
 * lie the moment anyone edited the data — and the data is meant to be edited.
 *
 * Longest common subsequence over whitespace-split tokens. Two prompts of this
 * length are ~14 tokens each, so the O(n·m) table is trivially cheap and the
 * quadratic form buys the one property we need: it finds the *longest* shared
 * run, so a middle clause swapped between two otherwise-identical lines comes
 * out as one delete and one insert in place, not as a rewrite of the tail.
 * A greedy or line-based diff gets this wrong exactly here.
 * ------------------------------------------------------------------------- */
function diffWords(before, after) {
  const a = before.split(/\s+/).filter(Boolean);
  const b = after.split(/\s+/).filter(Boolean);

  // lcs[i][j] = length of the longest common subsequence of a[i..] and b[j..].
  // Built from the end so the walk forward below can read it greedily.
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

  // Walk both strings forward, taking the branch the table says keeps the most
  // words. Emitting deletions before insertions at the same position is what
  // makes a swap read as "old struck out, new arriving after it".
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ type: "same", word: a[i] });
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
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

/**
 * The diff, performing itself.
 *
 * Three phases, driven by one index that walks the token list: `idle` is the
 * parent prompt whole, then deletions collapse, then insertions arrive word by
 * word. The visitor watches the change *happen* to a line they already read,
 * which is a different claim from being shown a finished diff — the point is
 * that one clause moved and the rest held still.
 *
 * `runId` restarts the walk whenever the visitor picks another fork. Under
 * reduced motion the walk is skipped entirely and the composed end state paints
 * on the first frame; nothing is ever hidden that cannot be revealed.
 */
function DiffLine({ tokens, runId, reduced, active }) {
  // How many of the *changed* tokens have resolved. Unchanged words are never
  // staged — they were already on screen as the parent prompt and re-animating
  // them would hide the one thing that moved.
  const changed = useMemo(
    () => tokens.filter((t) => t.type !== "same").length,
    [tokens]
  );
  const [step, setStep] = useState(reduced ? changed : 0);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (reduced || !active) {
      setStep(changed);
      return undefined;
    }
    setStep(0);
    let n = 0;
    const tick = () => {
      n += 1;
      setStep(n);
      if (n < changed) {
        // Uneven cadence, same reason as the hero's typing line: a fixed
        // interval reads as a progress bar. The first beat is longer because
        // it is the collapse, and a collapse needs to be seen to be believed.
        timer.current = setTimeout(tick, n === 1 ? 260 : 120 + Math.random() * 90);
      }
    };
    timer.current = setTimeout(tick, 420);
    return () => clearTimeout(timer.current);
  }, [runId, changed, reduced, active]);

  let seen = 0;
  return (
    <p className="fd-diff">
      {tokens.map((t, i) => {
        if (t.type === "same") {
          return (
            <span className="fd-tok" key={i}>
              {t.word}{" "}
            </span>
          );
        }
        seen += 1;
        const done = seen <= step;
        return (
          <span
            className={`fd-tok fd-tok--${t.type}${done ? " is-done" : ""}`}
            key={i}
          >
            <span className="fd-tok__inner">{t.word}</span>{" "}
          </span>
        );
      })}
    </p>
  );
}

/**
 * One beat of the descent.
 *
 * `i` is its index in reading order and is the ONLY thing that times it, so the
 * three beats count out 01 → 02 → 03 and inserting a fourth needs no numbers
 * touched. The number itself gets the strongest treatment of the three parts —
 * it moves on opacity AND a small lift together, because it is the thing the
 * thread is arriving at and a bare fade at 12px type on near-black is easy to
 * miss entirely.
 */
function Beat({ i, seen, reduced, n, label, meta, children, className = "" }) {
  const delay = T.beat + i * T.beatStep;
  return (
    <motion.li
      className={`fd-beat ${className}`.trim()}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={seen ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={
        reduced ? { duration: 0 } : { duration: 0.55, ease: EASE, delay }
      }
    >
      <motion.span
        className="fd-beat__n mono"
        aria-hidden="true"
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={seen ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={
          reduced
            ? { duration: 0 }
            : /* Lands just after its beat's body starts moving, so the number
                 reads as the beat being counted rather than as a label that
                 was already there. */
              { duration: 0.42, ease: EASE, delay: delay + 0.08 }
        }
      >
        {n}
      </motion.span>
      <div className="fd-beat__head">
        <span className="fd-beat__label label">{label}</span>
        {/* data-numeric unconditionally: every beat's meta carries figures (a
            depth, a count), and tabular figures must not shuffle width. */}
        <span className="fd-beat__by mono" data-numeric>
          {meta}
        </span>
      </div>
      {children}
    </motion.li>
  );
}

/**
 * How forking works.
 *
 * Three beats down one column — the parent prompt, the one line the visitor
 * changed, the computed result — with a rail of real forks on the left that
 * swaps which pair is on stage. Deliberately no photograph anywhere: the claim
 * is that the *text* carries the lineage, and a picture beside it would invite
 * the eye to look for the change in the image instead of in the line.
 */
export default function ForkDiff() {
  const [index, setIndex] = useState(0);
  // Bumped on every pick so the diff re-runs its walk even when the visitor
  // returns to a fork they have already seen.
  const [runId, setRunId] = useState(0);
  const reduced = useReducedMotion();

  /* The section's single arrival gate.
   *
   * It drives BOTH the element stagger and the diff's walk, deliberately: two
   * observers on one section can fire a frame apart and leave the beats
   * arriving while the diff is already performing, which throws away the
   * ordering the whole schedule exists to create.
   *
   * It starts true under reduced motion and whenever we cannot observe, because
   * this gate now controls whether most of the section is visible at all — the
   * same rule `Reveal` enforces: never hide content you cannot reveal. The
   * failure mode is "no animation", never "no section".
   *
   * Threshold sits just under `Arrive`'s 0.42 settle point so the band is
   * essentially in place before the elements inside it begin counting out —
   * staggering children through a band that is still blurred and moving reads
   * as two competing animations rather than one arrival.
   */
  const [seen, setSeen] = useState(
    () =>
      reduced ||
      typeof IntersectionObserver === "undefined" ||
      typeof window === "undefined"
  );
  const sectionRef = useRef(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined" || reduced) {
      setSeen(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { threshold: 0.38 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  const fork = FORKS[index];
  const tokens = useMemo(() => diffWords(fork.parent, fork.child), [fork]);
  /* Counted off the computed diff, never authored.
   *
   * `regions` is the number the section actually stands on: contiguous runs of
   * changed tokens. All three forks resolve to exactly one, which is what
   * "change one line" means — whereas the raw word counts (−5 +6 on the lens
   * fork) argue against the claim they are supposed to support, because
   * swapping "a 35mm at eye level" for "an 85mm from across the road" is one
   * decision and eleven tokens. So the headline figure is regions; the word
   * counts stay, smaller, as the supporting detail. */
  const counts = useMemo(() => {
    let regions = 0;
    let inRun = false;
    for (const t of tokens) {
      if (t.type === "same") inRun = false;
      else if (!inRun) {
        regions += 1;
        inRun = true;
      }
    }
    return {
      regions,
      del: tokens.filter((t) => t.type === "del").length,
      ins: tokens.filter((t) => t.type === "ins").length,
    };
  }, [tokens]);

  const pick = (i) => {
    setIndex(i);
    setRunId((n) => n + 1);
  };

  return (
    <section className="fd" id="how" ref={sectionRef} aria-labelledby="fd-title">
      <div className="fd-grid page">
        {/* --- the argument, and the rail of forks to run it on ----------- */}
        <div className="fd-side">
          {/* The head arrives first and as one unit: eyebrow, headline and lede
              are a single thought, and staggering the three of them against
              each other only delays the sentence the section opens with. */}
          <motion.div {...riseIn(T.head, reduced, 18)}>
            <h2 className="fd-title" id="fd-title">
              Change one line.
              <br />
              Keep the <em>whole</em> history.
            </h2>
            <p className="fd-lede">
              Open any generation and you get the prompt that made it, not a
              caption. Edit a clause, run it again, and Graft stores the
              difference — so what you changed stays readable long after both
              images exist.
            </p>
          </motion.div>

          {/* The authored interaction. Three real forks; picking one recomputes
              and re-performs the diff. Real buttons in a tablist, so this is
              operable from the keyboard and announces which is current. */}
          <div className="fd-rail" role="tablist" aria-label="Forks to inspect">
            {FORKS.map((f, i) => (
              /* Dealt individually rather than as a block: three rows arriving
                 together read as one plate, and these are three separate
                 things the visitor is being offered to pick between. Each one
                 slides in from the trunk on its own beat, so the rail reads as
                 branches being put out. */
              <motion.button
                  key={f.id}
                  type="button"
                  role="tab"
                  id={`fd-tab-${f.id}`}
                  className="fd-rail__item"
                  aria-selected={i === index}
                  aria-controls="fd-stage"
                  tabIndex={i === index ? 0 : -1}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  animate={
                    seen ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }
                  }
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          duration: 0.5,
                          ease: EASE,
                          delay: T.rail + i * 0.075,
                        }
                  }
                  onClick={() => pick(i)}
                  onKeyDown={(e) => {
                    // Arrow keys move between tabs, which is what a tablist
                    // promises the moment it calls itself one.
                    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                    e.preventDefault();
                    const next =
                      (index + (e.key === "ArrowDown" ? 1 : -1) + FORKS.length) %
                      FORKS.length;
                    pick(next);
                    document.getElementById(`fd-tab-${FORKS[next].id}`)?.focus();
                  }}
                >
                <span className="fd-rail__what">{f.changed}</span>
                <span className="fd-rail__meta mono" data-numeric>
                  <GitFork size={11} aria-hidden="true" />
                  {f.descendants}
                </span>
              </motion.button>
            ))}
          </div>

          <motion.div {...riseIn(T.cta, reduced, 10)}>
            <Magnetic strength={0.25}>
              <a className="fd-cta" href="/explore">
                Fork something real <ArrowRight size={15} aria-hidden="true" />
              </a>
            </Magnetic>
          </motion.div>
        </div>

        {/* --- the three beats --------------------------------------------
            No `Reveal variant="depth"` here any more, for a specific reason:
            that variant applies its own perspective transform and blur, and the
            section is now wrapped in `Arrive`, which blurs and scales the whole
            band. Two blurs on nested elements double the cost and desynchronise
            the panel from the band it belongs to. The panel now does one thing
            — lift and fade, just behind the headline — and lets `Arrive` own the
            depth cue for the section. */}
        <motion.div
          className="fd-stage"
          id="fd-stage"
          role="tabpanel"
          aria-labelledby={`fd-tab-${fork.id}`}
          {...riseIn(T.panel, reduced, 22)}
        >
          <ol className="fd-beats">
            {/* The lineage thread, drawing itself down past the beats.

                Timed to lead each beat number by a hair rather than to run for
                a flat 1.1s: the thread should arrive at 02 just before 02
                lights, so the descent reads as the thread PULLING the eye down
                to the next beat rather than as a line and three numbers that
                happen to animate at the same time. Its duration is therefore
                derived from the beat schedule, not chosen. */}
            <motion.span
              className="fd-thread"
              aria-hidden="true"
              initial={reduced ? false : { scaleY: 0, opacity: 0 }}
              animate={
                seen ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }
              }
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      scaleY: {
                        duration: T.beatStep * 2 + 0.5,
                        delay: T.beat - 0.06,
                        ease: EASE,
                      },
                      opacity: { duration: 0.3, delay: T.beat - 0.06 },
                    }
              }
            />
            {/* 1 — the parent, as authored. Plain, dim, unmarked: it is the
                thing that already existed. */}
            <Beat
              i={0}
              n="01"
              seen={seen}
              reduced={reduced}
              label="Parent prompt"
              meta={
                <>
                  @{fork.author} · depth {fork.depth}
                </>
              }
            >
              <p className="fd-parent mono">{fork.parent}</p>
            </Beat>

            {/* 2 — the edit, in the author's words. Without it the diff is a
                typo fix; this is the sentence that makes it a decision. */}
            <Beat
              i={1}
              n="02"
              seen={seen}
              reduced={reduced}
              label="Your one line"
              meta={`@${fork.childAuthor}`}
            >
              <p className="fd-change">
                <CornerDownRight
                  className="fd-change__icon"
                  size={14}
                  aria-hidden="true"
                />
                <span className="fd-change__what mono">{fork.changed}</span>
              </p>
              <p className="fd-note">{fork.note}</p>
            </Beat>

            {/* 3 — the payload. The computed diff, animating in. */}
            <Beat
              i={2}
              n="03"
              seen={seen}
              reduced={reduced}
              className="fd-beat--out"
              label="Stored diff"
              /* A fragment, not a wrapping span: the gap between these three
                 legends comes from `.fd-beat__by`'s own flex, and an extra
                 element in between made them children of a plain inline span
                 that has no gap — which printed "1 clause-1+2". */
              meta={
                <>
                  <span className="fd-legend fd-legend--region">
                    {counts.regions} clause
                  </span>
                  <span className="fd-legend fd-legend--del">
                    −{counts.del}
                  </span>
                  <span className="fd-legend fd-legend--ins">
                    +{counts.ins}
                  </span>
                </>
              }
            >
              {/* Keyed on the fork so React rebuilds the line rather than
                  reconciling tokens across two different prompts — reusing the
                  spans makes half the words appear to mutate in place. */}
              <DiffLine
                key={fork.id}
                tokens={tokens}
                runId={runId}
                reduced={reduced}
                active={seen}
              />
              {/* The composed result, for anyone who wants the line without the
                  markup — and the assistive-tech reading of this beat, since
                  the struck-through spans above read as one scrambled sentence. */}
              <p className="fd-result mono">
                <span className="sr-only">Resulting prompt: </span>
                {fork.child}
              </p>
            </Beat>
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
