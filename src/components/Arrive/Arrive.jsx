import { useEffect, useRef, useState } from "react";
import "./Arrive.css";

/**
 * Section-level arrival, as one primitive the whole page shares.
 *
 * `Reveal` moves a block of content. This moves a *section*: it drives a set of
 * CSS custom properties from the section's own scroll position, so a band comes
 * up out of the page — lifting, scaling, unblurring and brightening together —
 * and settles as it takes the screen. The difference between the two matters:
 * a section whose contents fade in still arrives as a flat plane with things
 * appearing on it, which is what the page did before this existed.
 *
 * Why properties on a wrapper rather than motion on each child: the children
 * already own their own staggers, and stacking a second per-element animation
 * on top of those double-animates every element and desynchronises the section
 * from itself. One transform on one element is also one composited layer for
 * the whole band instead of thirty.
 *
 * Three rules it enforces:
 *
 * 1. **It never hides content it cannot reveal.** The transformed state is
 *    applied by JS on mount, so with JS broken or IntersectionObserver missing
 *    the section is simply there, composed and readable.
 *
 * 2. **It settles and stays settled.** Past the settle point the properties are
 *    pinned at their end values and the element stops being driven at all —
 *    scrolling back up must not put a section you already read back into its
 *    arrival, and re-reading should never cost you a wait.
 *
 * 3. **`prefers-reduced-motion` is honoured at source**, not by shortening the
 *    duration. A large scroll-driven luminance and scale change is exactly the
 *    effect that setting exists to stop, so under it nothing is applied.
 */

/* How much of the section must be on screen before it is fully arrived. Settling
   at the point it is properly in view rather than at full visibility: a tall
   section never reaches a high ratio at all, and waiting for one leaves it
   arriving for the entire time you are reading it. */
const SETTLE = 0.42;

export default function Arrive({
  children,
  as: Tag = "div",
  className = "",
  /* How far the band travels. The default is deliberately small — this is a
     section settling into place, not a slide transition. */
  lift = 64,
  ...rest
}) {
  const ref = useRef(null);
  const [armed, setArmed] = useState(false);
  const [settled, setSettled] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    setArmed(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (done.current) return;

        /* 0 at the moment the band's edge appears, 1 once SETTLE of it is on
           screen. Driven by the ratio rather than by a scroll handler doing
           arithmetic on getBoundingClientRect every frame — same reason the
           page's focus observer is built the way it is.
           Ratio alone is not enough: a band taller than the viewport can never
           reach SETTLE, and one scrolled past quickly reports 0 again on the
           way out. Either left the band parked near-invisible for the rest of
           the session. So a band that has covered the viewport, or that has
           already gone by, counts as arrived. */
        const box = entry.boundingClientRect;
        const vh = entry.rootBounds?.height ?? window.innerHeight;
        /* Taller than the viewport and currently filling it. */
        const covers = box.top <= 0 && box.bottom >= vh;
        /* Gone past the top. `box.bottom <= vh` alone would also be true of a
           band still below the fold, which would settle it before it arrived. */
        const gone = box.bottom <= 0;
        const p =
          covers || gone ? 1 : Math.min(entry.intersectionRatio / SETTLE, 1);
        node.style.setProperty("--arrive", p.toFixed(3));

        if (p >= 1) {
          /* Pin it and stop observing. The inline property stays at its end
             value, so nothing re-animates on the way back up. */
          done.current = true;
          node.style.setProperty("--arrive", "1");
          /* A class, not a style-attribute match: whether the browser
             serialises the inline property with a space is not something to
             hang the settled state on. */
          setSettled(true);
          observer.disconnect();
        }
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i * 0.05) }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={[
        "arrive",
        armed ? "is-armed" : "",
        settled ? "is-settled" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={armed ? { "--arrive-lift": `${lift}px` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
