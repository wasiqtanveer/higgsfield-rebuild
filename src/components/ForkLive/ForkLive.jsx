import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CornerDownRight, GitFork } from "lucide-react";
import Magnetic from "../Magnetic/Magnetic.jsx";
import { FORKABLE } from "../../data/forkable.js";
import "./ForkLive.css";

/**
 * The feed, as one prompt you can actually change.
 *
 * Every product in this category shows a grid of finished output with the prompt
 * hidden behind a hover. The first draft of this section inverted that into a
 * column of six prompts — right idea, wrong section: six prompts is a list, a
 * list is skimmed, and the only interaction was hover-to-brighten. Six weak
 * demonstrations of an idea are worth less than one you can operate.
 *
 * So: one prompt, one image, three alternatives for the line that matters. The
 * claim "the prompt is the artifact" stops being a headline and becomes
 * something the visitor did with their own hands inside a few seconds, which is
 * all the attention this audience is giving the page.
 *
 * The honest part, and the reason this composition rather than a prettier one:
 * the library holds no two images that are variations of one prompt, so the
 * frame never swaps. Changing the line re-frames and re-grades the *same*
 * photograph by degree. That is a claim the picture supports — a fork shown as
 * two unrelated photographs is one it visibly contradicts, in front of the one
 * audience hired to notice.
 */

/* One shared curve for everything that moves here. The line, the crop and the
   grade are one event, so they must be one easing and one duration — three
   curves would read as three things happening near each other. */
const EASE = [0.22, 1, 0.36, 1];
const RESPOND_MS = 620;

/**
 * The section's own arrival stagger.
 *
 * Borrowed wholesale from the models section, which is the best-behaved motion
 * on this page: one shared curve, and a per-element delay taken from the
 * element's *index in the reading order* rather than from a hand-picked number.
 * The stagger is the point — it walks the eye down the prompt and onto the
 * chips in the order the section wants to be read, which a simultaneous fade
 * cannot do.
 *
 * `i` is that reading position. Kept as one function so a later edit cannot
 * desynchronise two elements that are meant to land together.
 */
function step(i, shown, reduced) {
  if (reduced) return { initial: false, animate: { opacity: 1, y: 0 } };
  return {
    initial: { opacity: 0, y: 18 },
    animate: shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 0.62, ease: EASE, delay: 0.06 + i * 0.075 },
  };
}

/**
 * Compose a look into the two properties the compositor can animate for free.
 *
 * Kept as one transform and one filter rather than separate animated properties:
 * a crop change and a grade change arriving on different frames is the jank this
 * section would be judged on.
 */
function looks(look) {
  const { scale, x, y, warm, dim, contrast, sat } = look;
  return {
    transform: `scale(${scale}) translate(${x}%, ${y}%)`,
    filter: `brightness(${dim}) contrast(${contrast}) saturate(${sat}) sepia(${Math.max(
      warm,
      0
    )}) hue-rotate(${warm < 0 ? -12 : 0}deg)`,
  };
}

/**
 * The active line, retyping itself when the fork lands.
 *
 * Uneven cadence, same as the hero's prompt line: a constant interval reads as a
 * machine printing, which is the cliché both are avoiding. It types the
 * *difference* rather than the whole prompt, because the difference is the
 * product.
 */
function useRetype(target, enabled) {
  const [shown, setShown] = useState(target);
  /* The first render must not animate — the section arrives composed, and a line
     typing itself on mount before anyone has clicked is a demo, not a response
     to an action. */
  const first = useRef(true);

  useEffect(() => {
    if (!enabled || first.current) {
      first.current = false;
      setShown(target);
      return undefined;
    }

    let char = 0;
    let timer;
    setShown("");

    const type = () => {
      if (char <= target.length) {
        setShown(target.slice(0, char));
        char += 1;
        timer = setTimeout(type, 14 + Math.random() * 26);
      }
    };

    type();
    return () => clearTimeout(timer);
  }, [target, enabled]);

  return shown;
}

export default function ForkLive() {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  /* One gate for the section, read at render time. Per-element `whileInView`
     fires on an intersection *change*, so anything already on screen when the
     observer attaches never animates and stays parked hidden — which is exactly
     what a deep link to #feed does. */
  const inView = useInView(sectionRef, { once: true, margin: "-12% 0px" });
  const shown = reduced || inView;
  const [entry, setEntry] = useState(0);
  const [choice, setChoice] = useState(0);
  /* Forks are real data, and forking is what this section demonstrates — so the
     count goes up when you do it. It starts from the entry's own number and is
     reset when the entry changes, rather than accumulating across prompts. */
  const [added, setAdded] = useState(0);
  const [threading, setThreading] = useState(false);

  const current = FORKABLE[entry];
  const option = current.options[choice];
  const typed = useRetype(option.text, !reduced);

  const fork = useCallback(
    (next) => {
      if (next === choice) return;
      setChoice(next);
      /* Index 0 is the prompt as published. Returning to it is un-forking, so it
         does not count as a new fork. */
      setAdded((n) => (next === 0 ? n : n + 1));
      setThreading(true);
    },
    [choice]
  );

  useEffect(() => {
    if (!threading) return undefined;
    const timer = setTimeout(() => setThreading(false), RESPOND_MS + 240);
    return () => clearTimeout(timer);
  }, [threading]);

  const nextEntry = () => {
    setEntry((i) => (i + 1) % FORKABLE.length);
    setChoice(0);
    setAdded(0);
  };

  const composed = [...current.lines];
  composed[current.edit] = option.text;

  return (
    <div className="fl" ref={sectionRef}>
      <motion.div className="fl__head" {...step(0, shown, reduced)}>
        <h2 className="fl__title" id="feed-title">
          Nothing here is finished. <em>Change</em> a line.
        </h2>
      </motion.div>

      <div className="fl__stage">
        {/* The prompt. First in the DOM and the largest text in the section,
            because it is what this section is about — the photograph is the
            evidence, not the subject. */}
        <div className="fl__prompt-col">
          <p className="fl__prompt mono">
            {current.lines.map((line, i) =>
              i === current.edit ? (
                <motion.span
                  className="fl__line is-edit"
                  key={i}
                  {...step(1 + i * 0.6, shown, reduced)}
                >
                  <CornerDownRight
                    className="fl__caret"
                    size={14}
                    aria-hidden="true"
                  />
                  {/* aria-live so a screen reader hears the change it just
                      made; the visual caret and accent carry it for everyone
                      else. */}
                  <span aria-live="polite">{typed}</span>
                  <span
                    className={`fl__cursor${threading ? " is-on" : ""}`}
                    aria-hidden="true"
                  />
                </motion.span>
              ) : (
                /* Each line counted out on its own delay rather than the block
                   arriving as one plane — the eye is walked down the prompt in
                   the order it is meant to be read, and the forkable line is
                   the last thing to land. */
                <motion.span
                  className="fl__line"
                  key={i}
                  {...step(1 + i * 0.6, shown, reduced)}
                >
                  {line}
                </motion.span>
              )
            )}
          </p>

          <motion.div className="fl__forks" {...step(2, shown, reduced)}>
            <p className="fl__forks-label label">
              Change this line
              {/* Which chip is the published prompt belongs on the group, not
                  inside the chip: set in the pill it read as another word of
                  the prompt rather than as a note about it. */}
              <span className="fl__forks-hint">
                first is as published
              </span>
            </p>
            {/* A real radiogroup: these are three mutually exclusive states of
                one line, which is exactly what radios are. Magnetic wraps each
                button in a div, so it goes *outside* the group — an
                intermediate div between radiogroup and radio breaks the
                relationship a screen reader relies on. */}
            <div className="fl__chips">
              {current.options.map((opt, i) => (
                <Magnetic key={opt.text} strength={0.2}>
                  <motion.button
                    type="button"
                    aria-pressed={i === choice}
                    className={`fl__chip mono${i === choice ? " is-on" : ""}`}
                    onClick={() => fork(i)}
                    /* Dealt out one at a time, like the ladder's ticks: three
                       alternatives appearing together read as a toolbar, three
                       arriving in sequence read as options being offered. */
                    initial={reduced ? false : { opacity: 0, y: 12, scale: 0.94 }}
                    animate={
                      shown ? { opacity: 1, y: 0, scale: 1 } : undefined
                    }
                    transition={{
                      duration: 0.5,
                      ease: EASE,
                      delay: 0.34 + i * 0.085,
                    }}
                  >
                    {opt.text.replace(/,$/, "")}
                  </motion.button>
                </Magnetic>
              ))}
            </div>
          </motion.div>

          <motion.div className="fl__meta" {...step(3, shown, reduced)}>
            <span className="fl__by">{current.author}</span>
            <span className="fl__stat" data-numeric>
              <GitFork size={12} aria-hidden="true" />
              <span className={threading ? "is-ticking" : undefined}>
                {current.forks + added}
              </span>
              &nbsp;forks
            </span>
            {/* "Original" rather than "1 deep": a chain of one is not a depth,
                and calling it one invites a look for a parent that is not
                there. */}
            <span className="fl__stat">
              {current.depth > 1 ? `${current.depth} deep` : "original"}
            </span>
          </motion.div>
        </div>

        {/* The artifact. One photograph, re-read — never replaced. */}
        <motion.div
          className="fl__frame-col"
          initial={reduced ? false : { opacity: 0, scale: 0.94 }}
          animate={shown ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.85, ease: EASE, delay: 0.14 }}
        >
          <figure className={`fl__frame${threading ? " is-responding" : ""}`}>
            <span className="fl__frame-glow" aria-hidden="true" />
            <motion.img
              className="fl__img"
              src={`/media/${current.id}.jpg`}
              alt={current.alt}
              width="720"
              height="1280"
              decoding="async"
              loading="lazy"
              draggable="false"
              animate={reduced ? undefined : looks(option.look)}
              transition={{ duration: RESPOND_MS / 1000, ease: EASE }}
            />
            {/* The thread. It draws from the line to the frame when a fork
                lands — the lineage made literal, out of real data, with no
                second photograph pretending to be a child. */}
            <span
              className={`fl__thread${threading ? " is-drawn" : ""}`}
              aria-hidden="true"
            />
          </figure>

          <button type="button" className="fl__next" onClick={nextEntry}>
            Another prompt
            <span className="fl__next-count" data-numeric>
              {entry + 1}/{FORKABLE.length}
            </span>
          </button>
        </motion.div>
      </div>

      <div className="fl__out">
        <Link
          className="fl__open"
          to={`/create?prompt=${encodeURIComponent(composed.join(" "))}`}
        >
          Open this in the composer
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
        <Link className="fl__all" to="/explore">
          Everything public, newest first
        </Link>
      </div>
    </div>
  );
}
