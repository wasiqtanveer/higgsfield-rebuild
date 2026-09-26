import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Magnetic from "../Magnetic/Magnetic.jsx";
import "./CloseCall.css";

const EASE = [0.22, 1, 0.36, 1];

/* The page closes where it opened, so this is deliberately the hero's control
   again rather than a new one: same pill, same mono prompt text, same accent
   ring on focus, same submit target. The differences are all scale and
   emphasis — it is bigger here because it is the only thing on the screen, and
   there is nothing beside it to compete for the click. A visitor who scrolls
   the whole page should arrive back at the field they skipped past at the top
   and recognise it, which is what makes the page read as a loop instead of a
   list of sections that ran out. */

/* Ghost prompts, shown one at a time in the field's placeholder slot while it
   is empty. They are examples of a prompt worth forking — specific, physical,
   one idea — not instructions, and they stop the moment the visitor types.

   Kept as real sentences rather than "Try: ..." copy, because the field's whole
   argument is that a prompt is authored text. */
const GHOSTS = [
  "a woman walking down a manhattan avenue, at her true scale",
  "a still life of cut fruit on steel, north light",
  "a loading bay at dawn, sodium light, wet concrete",
  "an editorial portrait, hard flash, seamless backdrop",
];

const GHOST_MS = 3200;

/**
 * The rotating ghost prompt.
 *
 * A real `placeholder` attribute cannot cross-fade, and swapping the attribute
 * string makes the text jump. So the placeholder is drawn as its own layer and
 * the input's own placeholder is left empty — the layer is `aria-hidden` and
 * the input keeps a real label, so nothing is lost to assistive tech.
 */
function Ghost({ hidden }) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    // Never rotates under reduced motion, and never rotates once the visitor
    // has typed: a demonstration has no business moving under their own text.
    if (reduced || hidden) return undefined;
    const t = setTimeout(() => setI((n) => (n + 1) % GHOSTS.length), GHOST_MS);
    return () => clearTimeout(t);
  }, [i, reduced, hidden]);

  return (
    <span className="cc-ghost" aria-hidden="true" data-off={hidden || undefined}>
      {GHOSTS.map((g, n) => (
        <span key={g} className="cc-ghost__line" data-on={n === i || undefined}>
          {g}
        </span>
      ))}
    </span>
  );
}

/* The arrival sequence, as ONE ordered list of what is on this screen.
 *
 * Borrowed wholesale from `ModelSpec`'s `Ladder`, where the ticks are counted
 * out from the left and that direction IS the argument. Here the direction is
 * top-to-bottom, because the argument is "read this, then do this": the eye is
 * walked from the kicker, down the two headline lines, and lands on the field.
 *
 * Two rules make this an instrument rather than a decoration, and both are
 * ModelSpec's:
 *
 * 1. **Every delay is derived from an element's rank in reading order**, never
 *    hand-picked. Hand-picked delays drift the moment a line of copy is added —
 *    somebody inserts a subhead, forgets to renumber, and the sequence develops
 *    a hole. `STEP * rank` cannot develop a hole. The ranks below are assigned
 *    by one counter walking the JSX in document order.
 *
 * 2. **The field is deliberately LAST of the majors.** It is the action, and a
 *    control that has already arrived while the sentence above it is still
 *    assembling invites a click before the reason to click has been read. The
 *    readout and the status line follow it because they annotate it.
 *
 * The headline's words share this one counter rather than running their own
 * stagger, so the whole screen is a single continuous walk down the page
 * instead of three independent animations that happen to overlap.
 */

/* Per-rank delay. Tuned so the whole sequence runs in a little under a second:
   long enough to read as a considered arrival, short enough that a reviewer
   spending seconds sees it finish. */
const STEP = 0.055;

/* Where the sequence stops accumulating delay. ModelSpec caps its ladder by
   index for the same reason — without a cap the far end of a long run is still
   settling a second after everything else, which reads as lag rather than
   rhythm. */
const RANK_CAP = 14;

const at = (rank) => Math.min(rank, RANK_CAP) * STEP;

/**
 * The closing section.
 *
 * One screen, one action. No secondary CTA, no pricing, no newsletter: the
 * argument was made above, and the last screen of a page that claims the prompt
 * is the artifact should be a place to write one.
 */
export default function CloseCall() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const reduced = useReducedMotion();

  /* One in-view gate for the whole section rather than `whileInView` on each
     element. Per-element `whileInView` fires on an intersection *change*, so
     anything already on screen when the observer attaches — which is exactly
     what happens when this section is deep-linked to, or restored by a scroll
     anchor — never animates and stays parked in its hidden state. A single
     `useInView({ once })` read at render time is true on the first frame in
     that case, so the composed end state is what paints. */
  const inView = useInView(sectionRef, { once: true, margin: "-12% 0px" });
  /* Under reduced motion there is nothing to wait for: the end state is the
     only state. */
  const shown = reduced || inView;
  const [prompt, setPrompt] = useState("");
  const [focused, setFocused] = useState(false);

  const typed = prompt.trim();
  /* "Armed" is the whole interaction: the moment the first character lands the
     control changes state — the submit fills, the accent thread starts running
     the width of the field, and the readout under it starts describing what was
     actually typed. Before that the field is quiet and the submit is a dot. */
  const armed = typed.length > 0;

  const words = useMemo(
    () => (typed ? typed.split(/\s+/).filter(Boolean).length : 0),
    [typed]
  );

  /* How far the thread has run. It is a measure of the prompt, not a fake
     progress bar: nothing is loading, and it never reaches a state that implies
     something finished. Twelve words is where a prompt usually stops being a
     label and starts being a description, so that is full width. */
  const fill = Math.min(1, words / 12);

  /* What the field says back. Three rungs, and each one is a true statement
     about the text in the box rather than encouragement:
       - nothing typed: what this field is for.
       - a word or two: it is a label, not yet a description.
       - a real prompt: it will be saved as a root, with its own count. */
  const readout = !armed
    ? "A new prompt with no parent. Yours becomes the root."
    : words < 3
      ? `${words} word${words === 1 ? "" : "s"} — enough to start, not yet enough to fork.`
      : `${words} words. Saved as a root prompt you own.`;

  /* The headline, as data, so the rank counter below can walk it in the same
     pass as everything else. Two lines, broken where the sentence breaks: the
     first states what the page just showed, the second is the instruction. The
     accent word opens the second line rather than sitting mid-phrase, so the
     serif reads as the turn in the argument. */
  const LINES = [
    [
      { text: "Every" },
      { text: "image" },
      { text: "here" },
      { text: "had" },
      { text: "a" },
      { text: "parent." },
    ],
    [
      { text: "Write", accent: true },
      { text: "the" },
      { text: "next" },
      { text: "one." },
    ],
  ];

  /* One counter, walked once, in document order — the ranks the whole section's
     timing derives from. Computed here rather than inline in the JSX so the
     reading order is legible as a list: if the sequence ever looks wrong, this
     is the only place to look.

     The words' ranks are assigned first because they come first on screen; the
     field then takes the NEXT rank after the last word, so it always lands
     after the sentence finishes assembling no matter how the copy is edited. */
  const rank = useMemo(() => {
    let n = 0;
    const kicker = n++;
    const words = LINES.map((line) => line.map(() => n++));
    const field = n++;
    const readout = n++;
    const status = n++;
    return { kicker, words, field, readout, status };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => {
    e.preventDefault();
    /* An empty field still opens the composer. The field is the door, and
       refusing to open it for someone who has not typed is a dead end — same
       rule as the hero, deliberately, because it is the same control. */
    navigate(typed ? `/create?prompt=${encodeURIComponent(typed)}` : "/create");
  };

  /* No `aria-labelledby` on the root below: Home.jsx wraps this in an `Arrive`
     section that already carries it pointing at `#cc-title`, and naming the same
     heading on both the section and a child inside it announces the section
     twice. The heading itself keeps the id, which is what the wrapper needs. */
  return (
    <div className="cc" ref={sectionRef}>
      {/* The pool of light this section stands in. On near-black a lone control
          in the middle of a screen has nothing to be lit against. */}
      <span className="cc__bloom" aria-hidden="true" />

      <div className="page cc__inner">

        {/* The headline that closes the loop. Word-by-word out of a mask, the
            same reveal as the hero's title, and one italic serif word — the
            page's opening move, repeated as its last. */}
        {/* Ranks 1..n — each word takes the next rank, so the sentence reads
            itself out left-to-right and line-by-line off the same counter the
            rest of the screen uses. */}
        <h2 className="cc-title" id="cc-title">
          {LINES.map((line, li) => (
            <span className="cc-title__line" key={li}>
              {line.map((word, wi) => (
                <span className="cc-title__mask" key={wi}>
                  <motion.span
                    className={`cc-title__word${word.accent ? " is-accent" : ""}`}
                    initial={false}
                    /* Three properties, not one: the word rises out of its mask,
                       un-rotates, and comes up from dim. ModelSpec's rule —
                       a single-property change at this scale on near-black is
                       easy to miss, and the mask already clips the travel, so
                       the brightening is what makes the arrival legible. */
                    animate={
                      shown
                        ? { y: "0%", rotate: 0, opacity: 1 }
                        : { y: "110%", rotate: 2.5, opacity: 0.35 }
                    }
                    transition={{
                      duration: 0.8,
                      delay: at(rank.words[li][wi]),
                      ease: EASE,
                    }}
                  >
                    {word.text}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </h2>

        <motion.form
          className="cc-field"
          onSubmit={submit}
          data-armed={armed || undefined}
          data-focused={focused || undefined}
          /* The thread's length is driven from state as a CSS variable rather
             than an inline width, so the transition and the easing live in the
             stylesheet with the rest of the field's motion. */
          style={{ "--cc-fill": fill }}
          initial={false}
          /* The rank after the headline's last word, so the control cannot
             arrive before the sentence that justifies it — see the note on the
             sequence above. Scale as well as lift: the field is the one thing on
             this screen you operate, and coming up a hair in size reads as it
             presenting itself rather than sliding into place. */
          animate={
            shown
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 18, scale: 0.985 }
          }
          transition={{ duration: 0.75, delay: at(rank.field), ease: EASE }}
        >
          <label className="sr-only" htmlFor="cc-prompt">
            Describe an image to generate
          </label>

          <span className="cc-field__sigil mono" aria-hidden="true">
            ›
          </span>

          <span className="cc-field__well">
            <Ghost hidden={armed} />
            <input
              id="cc-prompt"
              className="cc-field__input mono"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              /* Empty on purpose — the rotating ghost above is the placeholder,
                 and two competing placeholders would overprint each other. */
              placeholder=""
              autoComplete="off"
              spellCheck="false"
              enterKeyHint="go"
            />
          </span>

          <Magnetic strength={0.2}>
            <button className="cc-field__go" type="submit">
              {/* The dot is the disarmed state and the arrow the armed one;
                  both are always in the DOM and cross-fade, because mounting an
                  icon on first keystroke reads as a glitch rather than a
                  response. */}
              <span className="cc-field__dot" aria-hidden="true" />
              <ArrowRight className="cc-field__arrow" size={17} aria-hidden="true" />
              <span className="sr-only">
                {armed ? "Generate this prompt" : "Open the composer"}
              </span>
            </button>
          </Magnetic>

          {/* The accent thread. It runs under the field as the prompt grows —
              the same accent that carries lineage everywhere else on the page,
              which is the point: what you type here becomes a thread. */}
          <span className="cc-field__thread" aria-hidden="true" />
        </motion.form>

        {/* The field talking back. Polite live region so a screen-reader user
            gets the same acknowledgement a sighted one does, and `aria-live`
            rather than `assertive` so it never interrupts their own typing.

            It annotates the field, so it arrives after it. `motion.p` on the
            wrapper and never on the text: animating an element whose content is
            replaced on every keystroke would re-run the arrival as you type. */}
        <motion.p
          className="cc-readout mono"
          aria-live="polite"
          data-armed={armed || undefined}
          initial={false}
          animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.5, ease: EASE, delay: at(rank.readout) }}
        >
          {readout}
        </motion.p>

        <motion.p
          className="cc-foot"
          initial={false}
          animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.6, ease: EASE, delay: at(rank.status) }}
        >
          <span className="cc-foot__dot" aria-hidden="true" />
          Free to try, no account. Every prompt you run stays yours and stays
          readable.
        </motion.p>
      </div>
    </div>
  );
}
