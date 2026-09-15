import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PROMO } from "../../data/features.js";
import { getClip } from "../../data/gallery.js";
import "./PromoBanner.css";

function format(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

/**
 * The offer block. The clock is real: it counts down from a deadline fixed on
 * first paint, and the tile swaps to an expired state at zero rather than
 * sitting on 0h 00m 00s. A countdown that cannot reach its end is the detail
 * that gives a rebuild away.
 */
export default function PromoBanner() {
  const deadline = useRef(Date.now() + PROMO.durationMs);
  const [left, setLeft] = useState(PROMO.durationMs);
  const clip = getClip(PROMO.clipId);

  useEffect(() => {
    const tick = () => setLeft(deadline.current - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const expired = left <= 0;

  return (
    <section
      className="promo"
      style={clip ? { "--tint": clip.tint } : undefined}
      aria-label="Current offer"
    >
      <div className="promo__tint" aria-hidden="true" />
      {clip && (
        <img className="promo__art" src={clip.poster} alt="" loading="lazy" decoding="async" />
      )}
      <div className="promo__scrim" aria-hidden="true" />

      <div className="promo__body">
        <div className="promo__head">
          <h2 className="promo__headline display">
            {PROMO.eyebrow}
            <span className="promo__headline-accent">{PROMO.headline}</span>
          </h2>
          <p className="promo__blurb">{PROMO.blurb}</p>
        </div>

        <div className="promo__action">
          <Link to="/create" className="promo__cta">
            {PROMO.cta}
          </Link>
          <span className={`promo__clock ${expired ? "is-done" : ""}`}>
            {expired ? (
              "Discount expired"
            ) : (
              <>
                Discount expires in <time data-numeric>{format(left)}</time>
              </>
            )}
          </span>
        </div>
      </div>
    </section>
  );
}
