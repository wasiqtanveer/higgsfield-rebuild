import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import Magnetic from "../Magnetic/Magnetic.jsx";
import PhotoWall from "../PhotoWall/PhotoWall.jsx";
import "./Hero.css";

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay: 0.25 + 0.12 * i, ease: EASE },
  }),
};

/* The field writes prompts to itself while it is idle. Real prompts, in the
   product's own voice — a demonstration of what a good one looks like, not
   instructions. */
const PROMPTS = [
  "a woman walking down a manhattan avenue, at her true scale",
  "an editorial portrait, hard flash, seamless backdrop",
  "a still life of cut fruit on steel, north light",
  "a street-style campaign shot, striped knit, late afternoon",
];

/**
 * The prompt line, typing itself.
 *
 * Uneven cadence on purpose: a constant interval reads as a machine printing,
 * which is the cliché this is trying to avoid. Under reduced motion it shows
 * the first prompt whole and never animates.
 */
function PromptLine() {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setText(PROMPTS[0]);
      return undefined;
    }

    const full = PROMPTS[index];
    let char = 0;
    let timer;

    const type = () => {
      if (char <= full.length) {
        setText(full.slice(0, char));
        char += 1;
        timer = setTimeout(type, 30 + Math.random() * 42);
      } else {
        timer = setTimeout(
          () => setIndex((i) => (i + 1) % PROMPTS.length),
          2300
        );
      }
    };

    type();
    return () => clearTimeout(timer);
  }, [index, reduced]);

  return (
    <div className="hero-term" aria-hidden="true">
      <span className="hero-term__sigil">›</span>
      <span className="hero-term__text">{text}</span>
      <span className="hero-term__caret" />
    </div>
  );
}

/**
 * The rotating stamp around the portrait.
 *
 * Drawn as real text on a path rather than letters placed by hand, so it stays
 * a string a screen reader could read if it ever needed to and never drifts
 * out of register at a different size.
 */
function Stamp() {
  const label = "FORK THE PROMPT • CHANGE ONE LINE • ";
  return (
    <motion.div
      className="hero-stamp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 1.3, ease: EASE }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="hero-stamp__svg">
        <defs>
          <path
            id="graft-stamp"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>
        <text>
          <textPath href="#graft-stamp">{label}</textPath>
        </text>
      </svg>
      <span className="hero-stamp__dot" />
    </motion.div>
  );
}

/**
 * The models orbiting the artifact.
 *
 * Each sits at a fixed angle on an ellipse, placed by trigonometry rather than
 * by hand-tuned offsets, so the ring stays true at every size. Positions are
 * deliberately uneven — a perfectly regular ring reads as a diagram.
 */
/* Four, not six, and all of them clear of the frame's silhouette: chips sitting
   on the photograph obscure the one thing the stage exists to show. They ring
   the arch at its widest points, where the frame curves away. */
const ORBIT = [
  { id: "flux", label: "FLUX", angle: -152, r: 0.48 },
  { id: "sdxl", label: "SDXL", angle: -28, r: 0.48 },
  { id: "sd3", label: "SD3", angle: 26, r: 0.47 },
  { id: "pix", label: "Pixart", angle: 168, r: 0.47 },
];

function Orbit() {
  return (
    <div className="hero-orbit" aria-hidden="true">
      <div className="hero-orbit__ring" />
      {ORBIT.map((m, i) => {
        const rad = (m.angle * Math.PI) / 180;
        return (
          <motion.span
            key={m.id}
            className="hero-chip"
            style={{
              left: `${50 + Math.cos(rad) * m.r * 100}%`,
              top: `${50 + Math.sin(rad) * m.r * 88}%`,
            }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 + i * 0.08, ease: EASE }}
          >
            {m.label}
          </motion.span>
        );
      })}
    </div>
  );
}

/**
 * The headline, revealed word by word from behind a mask.
 *
 * Each word rises out of its own overflow box, so the line assembles rather
 * than fading in as a block. The accent word is set in italic serif — one word,
 * never a whole line: the contrast is the point.
 */
function Title({ lines }) {
  const reduced = useReducedMotion();

  return (
    <h1 className="hero-title" id="hero-title">
      {lines.map((line, li) => (
        <span className="hero-title__line" key={li}>
          {line.map((word, wi) => (
            <span className="hero-title__mask" key={wi}>
              <motion.span
                className={`hero-title__word${word.accent ? " is-accent" : ""}`}
                initial={reduced ? false : { y: "110%", rotate: 3 }}
                animate={{ y: "0%", rotate: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.3 + li * 0.11 + wi * 0.045,
                  ease: EASE,
                }}
              >
                {word.text}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

/* The artifacts on show. Each is a real generation with its own prompt and
   author — a rotating set of separate works, never presented as forks of one
   another, because the library holds no two images that are variations of one
   prompt and the hero must not claim a lineage it cannot show. */
const SHOTS = [
  {
    id: "c11",
    alt: "A figure many storeys tall walking down a Manhattan avenue between taxis",
    prompt: "a woman walking down a manhattan avenue, at her true scale",
    author: "mira",
    forks: 214,
  },
  {
    id: "c04",
    alt: "A model in a printed tube top on a Chinatown street under awnings",
    prompt: "street style, printed silk, chinatown awnings, late afternoon",
    author: "koji",
    forks: 86,
  },
  {
    id: "c09",
    alt: "A figure in a blue jacket holding a tiny person on an open palm, ice behind",
    prompt: "a giant cradling a traveller on one palm, glacier light",
    author: "ade",
    forks: 149,
  },
  {
    id: "c12",
    alt: "A woman in a striped knit crossing a street holding a coffee",
    prompt: "a street-style campaign shot, striped knit, late afternoon",
    author: "rue",
    forks: 61,
  },
  {
    id: "c10",
    alt: "A woman in sunglasses and a black blazer standing in an autumn park",
    prompt: "an editorial portrait in a park, autumn, overcast",
    author: "nils",
    forks: 37,
  },
];

const SHOT_MS = 4200;

export default function Hero() {
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const reduced = useReducedMotion();

  /* Which generation is on the stage. It advances on its own so the hero is
     never one static picture, and clicking the frame takes it forward by hand
     — an auto-rotation with no way to drive it leaves you waiting for the one
     you wanted to see again. */
  const [shot, setShot] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    // Paused while the pointer is on the frame, and never runs at all under
    // reduced motion: an unprompted change of image is exactly the kind of
    // motion that setting exists to stop.
    if (held || reduced) return undefined;
    const timer = setTimeout(
      () => setShot((i) => (i + 1) % SHOTS.length),
      SHOT_MS
    );
    return () => clearTimeout(timer);
  }, [shot, held, reduced]);

  const current = SHOTS[shot];
  const advance = () => setShot((i) => (i + 1) % SHOTS.length);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* The hero leaves in layers: the content lifts and fades first, the artifact
     follows more slowly, and the wordmark sinks — so the section reads as
     depth rather than as one block sliding away. */
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0]);
  const shotY = useTransform(scrollYProgress, [0, 1], [0, -64]);
  const shotScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const markY = useTransform(scrollYProgress, [0, 1], [0, 170]);
  const markOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const submit = (e) => {
    e.preventDefault();
    const q = prompt.trim();
    // An empty field still opens the composer — the field is the door, and
    // refusing to open it for someone who has not typed is a dead end.
    navigate(q ? `/create?prompt=${encodeURIComponent(q)}` : "/create");
  };

  return (
    <section className="hero" ref={sectionRef} aria-labelledby="hero-title">
      <PhotoWall />

      <motion.span
        className="hero-edge"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        aria-hidden="true"
      >
        Every image has a parent
      </motion.span>

      <motion.div
        className="hero-content"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="hero-grid page">
          {/* Left — the argument */}
          <div className="hero-left">
            <Title
              lines={[
                [{ text: "The" }, { text: "prompt" }],
                [{ text: "is" }, { text: "the" }, { text: "artifact" }],
                [{ text: "you" }, { text: "can", accent: true }, { text: "fork.", accent: true }],
              ]}
            />

            <motion.div
              className="hero-actions"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
            >
              <Magnetic>
                <button className="hero-cta" type="button" onClick={submit}>
                  Start generating <ArrowRight size={16} aria-hidden="true" />
                </button>
              </Magnetic>
              <Magnetic strength={0.25}>
                <a className="hero-cta--ghost" href="/explore">
                  See the lineage
                </a>
              </Magnetic>
            </motion.div>
          </div>

          {/* Centre — the artifact */}
          <motion.div
            className="hero-stage"
            style={reduced ? undefined : { y: shotY, scale: shotScale }}
            initial={{ opacity: 0, y: 56 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.45, ease: EASE }}
          >
            <Orbit />

            <figure
              className="hero-frame"
              onMouseEnter={() => setHeld(true)}
              onMouseLeave={() => setHeld(false)}
            >
              <span className="hero-frame__glow" aria-hidden="true" />

              {/* One image per generation, crossfading. Each keeps its own
                  element so the outgoing frame is still painted while the
                  incoming one decodes — swapping a single src leaves a blank
                  frame for exactly as long as the network takes. */}
              <AnimatePresence initial={false}>
                <motion.img
                  key={current.id}
                  className="hero-frame__img"
                  src={`/media/${current.id}.jpg`}
                  alt={current.alt}
                  width="720"
                  height="1280"
                  /* Largest paint on the page and above the fold, so never
                     lazy: a lazy hero image stays blank until first scroll. */
                  fetchpriority="high"
                  decoding="async"
                  initial={reduced ? false : { opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </AnimatePresence>

              {/* The whole frame advances the set. A real button, so it is
                  reachable by keyboard and announces what it does. */}
              <button
                type="button"
                className="hero-frame__next"
                onClick={advance}
                onFocus={() => setHeld(true)}
                onBlur={() => setHeld(false)}
              >
                <span className="sr-only">Show the next generation</span>
              </button>

              <figcaption className="hero-frame__meta">
                <span className="hero-frame__prompt mono">{current.prompt}</span>
                <span className="hero-frame__by">
                  {current.author}
                  <span className="hero-frame__forks" data-numeric>
                    {current.forks} forks
                  </span>
                </span>
              </figcaption>

              {/* Which of the set you are on, and how far through it. */}
              <div className="hero-dots" role="tablist" aria-label="Generations">
                {SHOTS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    className="hero-dots__dot"
                    aria-selected={i === shot}
                    aria-label={s.prompt}
                    onClick={() => setShot(i)}
                  />
                ))}
              </div>
            </figure>

            <Stamp />
          </motion.div>

          {/* Right — the claim, the field, the status */}
          <div className="hero-right">
            <motion.p
              className="hero-intro"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
            >
              Every image on Graft carries the prompt that made it. Change{" "}
              <strong>one line</strong>, run it again, and your version keeps
              the history of what it came from.
            </motion.p>

            <motion.form
              className="hero-field"
              onSubmit={submit}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={5}
            >
              <label className="sr-only" htmlFor="hero-prompt">
                Describe an image
              </label>
              <input
                id="hero-prompt"
                className="hero-field__input mono"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe an image…"
                autoComplete="off"
                spellCheck="false"
              />
              <button className="hero-field__go" type="submit">
                <ArrowRight size={15} aria-hidden="true" />
                <span className="sr-only">Generate</span>
              </button>
            </motion.form>

            {/* Only shown while the field is untouched: a demonstration has no
                business running underneath the visitor's own text. */}
            {!prompt && <PromptLine />}

            <motion.p
              className="hero-status"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={6}
            >
              <span className="hero-status__dot" aria-hidden="true" />
              Free to try, no account
            </motion.p>
          </div>
        </div>

        <motion.div
          className="hero-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 1 }}
          aria-hidden="true"
        >
          <motion.span
            animate={reduced ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={13} />
          </motion.span>
          Scroll
        </motion.div>
      </motion.div>

      {/* The wordmark. Decorative and already the page's <h1> in words, so it
          is hidden from assistive tech rather than read twice. */}
      <motion.div
        className="hero-mark"
        style={reduced ? undefined : { y: markY, opacity: markOpacity }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.25, delay: 0.55, ease: EASE }}
        aria-hidden="true"
      >
        <span className="hero-mark__fill">Graft</span>
        <span className="hero-mark__stroke">Graft</span>
      </motion.div>
    </section>
  );
}
