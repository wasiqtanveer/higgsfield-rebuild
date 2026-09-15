import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MediaCard from "../MediaCard/MediaCard.jsx";
import { ArrowLeft, ArrowRight } from "../Icon/Icon.jsx";
import { FEATURES } from "../../data/features.js";
import { getClip } from "../../data/gallery.js";
import "./FeatureRail.css";

/**
 * The announcements rail at the top of Explore.
 *
 * It is a scroller, not a grid: the product shows roughly two and a half cards
 * so the cut edge advertises that there is more. Snapping is per card, and the
 * arrows page by one card width rather than a fixed pixel amount, so the rail
 * lands on a card boundary at every viewport.
 */
export default function FeatureRail() {
  const railRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({
      start: el.scrollLeft <= 2,
      // A rail that fits entirely has max <= 0; treat that as "both ends".
      end: el.scrollLeft >= max - 2,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = railRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const page = (dir) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="frail" aria-label="Announcements">
      <div className="frail__scroll" ref={railRef} onScroll={measure}>
        {FEATURES.map((f) => {
          const clip = getClip(f.clipId);
          if (!clip) return null;
          return (
            <article className="frail__item" key={f.id}>
              <Link to="/create" className="frail__link">
                <MediaCard clip={clip} ratio="16 / 9" showMeta={false} />
                <h2 className="frail__title display">{f.title}</h2>
                <p className="frail__tagline">{f.tagline}</p>
              </Link>
            </article>
          );
        })}
      </div>

      <button
        type="button"
        className="frail__arrow frail__arrow--prev"
        aria-label="Previous announcements"
        hidden={edges.start}
        onClick={() => page(-1)}
      >
        <ArrowLeft />
      </button>
      <button
        type="button"
        className="frail__arrow frail__arrow--next"
        aria-label="More announcements"
        hidden={edges.end}
        onClick={() => page(1)}
      >
        <ArrowRight />
      </button>
    </section>
  );
}
