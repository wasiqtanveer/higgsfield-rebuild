import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./BootScreen.css";

/**
 * The first thing anyone sees.
 *
 * It is the only full-screen cover in the product. Moving between pages does
 * not get one: that navigation is already complete by the time it would run,
 * so a cover there would be inventing a wait. This one is different in kind —
 * there genuinely is nothing to show yet, and the moment is spent introducing
 * the product rather than holding up a page that already exists.
 *
 * So it is about the **product**, not a destination. It draws the mark, states
 * the one sentence this thing is for, and runs a bar to the edge of the screen.
 *
 * Shown once per session, not once per page load. A preloader that reappears
 * every time you come back to the tab stops being an entrance and becomes a
 * toll.
 */

const SEEN_KEY = "graft:booted";
/* Long enough for the mark to draw and the line to be read, short enough that
   it never becomes the thing standing between someone and the product. */
const RUN_MS = 1500;

function alreadyBooted() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    /* Private mode, or storage blocked outright. The entrance is decoration;
       the correct failure is to skip it, never to break the page for it. */
    return true;
  }
}

function markBooted() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* Nothing to do. Worst case it plays again next navigation-less load. */
  }
}

export default function BootScreen() {
  const reduced = useReducedMotion();
  /* Resolved before first paint rather than in an effect: defaulting to
     "showing" and then hiding it would flash the entrance at every returning
     visitor for one frame, which is worse than not having one. */
  const [open, setOpen] = useState(() => !alreadyBooted() && !reduced);
  const timer = useRef(0);

  useEffect(() => {
    if (!open) return undefined;

    /* The page behind must not scroll while the cover is up. Restored rather
       than cleared, in case anything else was already holding it. */
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    timer.current = window.setTimeout(() => {
      markBooted();
      setOpen(false);
    }, RUN_MS);

    return () => {
      window.clearTimeout(timer.current);
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* Marked on mount even when it does not play, so a reduced-motion visitor
     who later turns the setting off does not get an entrance mid-session. */
  useEffect(() => {
    if (!open) markBooted();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="boot"
          role="status"
          aria-live="polite"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            /* It lifts *away* — scaled up a touch as it goes, so the product
               is revealed through it rather than from behind a panel that
               simply stopped being drawn. */
            scale: 1.04,
          }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="boot__inner">
            {/* The mark draws itself: two strokes running in, merging into one
                leaving. The glyph is the product's one-sentence explanation, so
                the entrance is spent drawing it rather than spinning something
                that means nothing. */}
            <svg
              className="boot__glyph"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path className="boot__stroke boot__stroke--a" d="M4 6.5c4.4 0 5.6 5.5 10 5.5" />
                <path className="boot__stroke boot__stroke--b" d="M4 17.5c4.4 0 5.6-5.5 10-5.5" />
                <path className="boot__stroke boot__stroke--c" d="M14 12h6" />
              </g>
            </svg>

            <motion.p
              className="boot__word"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.42 }}
            >
              Graft
            </motion.p>

            <motion.p
              className="boot__line"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.58 }}
            >
              Every image starts as someone else&rsquo;s prompt
            </motion.p>
          </div>

          {/* Pinned to the bottom edge of the screen rather than sitting under
              the wordmark: it is the one element here that is about time
              passing, and keeping it away from the mark stops the composition
              reading as a dialog box. */}
          <motion.span
            className="boot__bar"
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: RUN_MS / 1000, ease: [0.4, 0, 0.1, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
