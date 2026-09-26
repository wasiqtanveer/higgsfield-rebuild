import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./RouteTransition.css";

/**
 * The move between pages.
 *
 * The first version of this only animated the page coming *in*. That is why it
 * did not read as a transition: the outgoing page was destroyed on the same
 * frame the click landed, so what you actually saw was a hard cut followed by
 * a gentle fade onto an empty screen. A cut and a fade are not a transition,
 * they are a glitch with a soft edge. Motion on the entrance alone can never
 * fix that, no matter how long you make it -- there has to be something
 * leaving.
 *
 * So both halves move, and they are deliberately not symmetrical:
 *
 * - **Out is short and falls away.** The page you are leaving drops slightly
 *   and dims. It is already decided, so it does not get to spend much time.
 *
 * - **In is longer and rises.** The page you asked for comes up into place on
 *   a decelerating curve. Giving the arrival more time than the departure is
 *   what makes the pair feel like one movement with a direction, rather than
 *   two effects taking turns.
 *
 * `mode="wait"` is what sequences them: the incoming page is not mounted until
 * the outgoing one has finished leaving. Overlapping the two would cross-fade
 * two full pages on top of each other, which on long documents means the tall
 * one is briefly visible through the short one.
 *
 * Three things this has to get right beyond the motion itself:
 *
 * 1. **The scroll resets at the handoff**, not on the click. Resetting while
 *    the old page is still on screen would animate that page flying to its own
 *    top on the way out -- the wrong document, moving for no reason. It
 *    happens in the gap between exit and enter, when nothing is on screen.
 *
 * 2. **Back and forward keep their restored position.** Returning to a page
 *    you already read should put you where you were.
 *
 * 3. **The header never moves.** It lives outside this component, so the pill
 *    and its travelling dot stay put while the page changes underneath them.
 *    That contrast is doing real work: one fixed element makes the moving one
 *    read as a page rather than as the whole window lurching.
 */

/* `useLayoutEffect` warns when React renders on the server, where there is no
   layout to read and no scroll position to set. */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Out is quick, in has room to land.
 *
 * These are deliberately tight. `mode="wait"` runs them back to back and adds
 * its own frame or two handing over between the two pages, so the number that
 * matters is the sum plus that gap, not either half on its own -- budget for
 * each separately and the move quietly becomes a wait. Measured end to end,
 * this lands a little under half a second: long enough to read as one
 * deliberate movement, short enough to still feel like the click caused it. */
const OUT_S = 0.16;
const IN_S = 0.3;

export default function RouteTransition({ children }) {
  const location = useLocation();
  const navType = useNavigationType();
  const reduced = useReducedMotion();

  /* Where the scroll should go once the outgoing page is gone. Null means
     leave it alone, which is what back and forward want. */
  const pending = useRef(null);
  const lastPath = useRef(location.pathname);

  useIsoLayoutEffect(() => {
    /* A hash or query change on the same page is not a navigation between
       pages: re-running the transition because a filter changed would throw
       away the visitor's place in a list they are reading. */
    if (location.pathname === lastPath.current) return;
    lastPath.current = location.pathname;

    /* POP is back/forward, where the browser restores the previous offset
       itself and that offset is the right answer. */
    pending.current = navType === "POP" ? null : 0;
  }, [location, navType]);

  /* Fired in the gap between the two pages -- see rule 1. */
  const onExited = useCallback(() => {
    if (pending.current === null) return;
    window.scrollTo({ top: pending.current, left: 0, behavior: "instant" });
    pending.current = null;
  }, []);

  /* Under reduced motion the pages swap with no motion at all, so there is no
     gap to reset in and the reset has to happen with the swap. */
  useIsoLayoutEffect(() => {
    if (reduced) onExited();
  }, [reduced, location, onExited]);

  if (reduced) {
    return <div className="rt__page">{children(location)}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={onExited}>
      <motion.div
        /* Keyed on the path, so React treats each route as its own element to
           mount and unmount rather than reconciling two unrelated trees. */
        key={location.pathname}
        className="rt__page"
        initial={{ opacity: 0, y: 22 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: IN_S, ease: [0.16, 1, 0.3, 1] },
        }}
        /* The exit carries its own, faster clock. It belongs inside the variant
           rather than in a `transition` prop: one prop would apply a single
           timing to both halves and flatten the asymmetry the effect rests on,
           and it leaves accelerating rather than decelerating -- a thing on its
           way out should gather speed, not ease to a stop. */
        exit={{
          opacity: 0,
          y: -14,
          transition: { duration: OUT_S, ease: [0.4, 0, 1, 1] },
        }}
      >
        {children(location)}
      </motion.div>
    </AnimatePresence>
  );
}
