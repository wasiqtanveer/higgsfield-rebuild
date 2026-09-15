import { useEffect, useRef, useState } from "react";
import "./AnimatedNumber.css";

const DEFAULT_FORMAT = (n) => Math.round(n).toLocaleString("en-US");

/**
 * A number that counts to its new value instead of snapping to it.
 *
 * The point is not decoration: when a slider moves a credit allowance from 600
 * to 900, the jump is the only feedback that the control did anything, and a
 * value that simply replaces itself is easy to miss entirely. Counting makes
 * the change legible and shows the direction it moved.
 *
 * Driven by requestAnimationFrame rather than a CSS transition, because there
 * is no interpolatable CSS property here -- the thing changing is text.
 */
export default function AnimatedNumber({
  value,
  duration = 480,
  format = DEFAULT_FORMAT,
  className = "",
}) {
  const [shown, setShown] = useState(value);
  /* What is on screen right now, not what we last settled on -- retargeting
     mid-flight must start from where the eye currently is, or the number
     visibly jumps backwards before running forwards again. */
  const current = useRef(value);
  const frame = useRef(0);

  useEffect(() => {
    if (value === current.current) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || duration <= 0) {
      current.current = value;
      setShown(value);
      return;
    }

    const from = current.current;
    const delta = value - from;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      /* Ease-out cubic: fast enough to feel immediate, settling rather than
         stopping dead on the final digit. */
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + delta * eased;
      current.current = next;
      setShown(next);
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else current.current = value;
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  return <span className={`anum ${className}`.trim()}>{format(shown)}</span>;
}
