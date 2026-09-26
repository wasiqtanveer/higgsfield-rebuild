import { useEffect, useRef, useState } from "react";
import "./Reveal.css";

/**
 * Reveal-on-scroll, as one primitive the whole site shares.
 *
 * Two rules it enforces so that scroll animation stays a pleasure rather than a
 * tax on reading:
 *
 * 1. It fires once. Content that re-animates every time it crosses the viewport
 *    turns scrolling back up into a light show, and re-reading something you
 *    already read should not cost you a wait.
 *
 * 2. It never hides content it cannot reveal. The hidden state is applied by
 *    JS on mount, so with JS broken or the observer unsupported everything is
 *    simply visible — the failure mode is "no animation", never "no page".
 *
 * `variant` picks the motion: `rise` for text, `depth` for anything that should
 * arrive from behind the screen. `delay` staggers siblings — pass the index.
 */
export default function Reveal({
  children,
  variant = "rise",
  delay = 0,
  as: Tag = "div",
  className = "",
  ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return undefined;
    }

    // Armed only once we know we can observe: this is what applies the hidden
    // state, so it must never run in a browser that will not un-apply it.
    setArmed(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      // Fires a little before the element's top edge arrives, so the motion
      // finishes about when it reaches comfortable reading position rather
      // than starting there.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={[
        "reveal",
        `reveal--${variant}`,
        armed ? "is-armed" : "",
        shown ? "is-in" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={delay ? { "--reveal-delay": `${delay * 70}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
