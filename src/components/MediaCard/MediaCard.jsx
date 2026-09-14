import { useCallback, useEffect, useRef, useState } from "react";
import "./MediaCard.css";

/**
 * Poster-first media tile.
 *
 * Paint order is deliberate, and it is the whole point of this component:
 *   1. the tint gradient renders instantly (no layout shift, never blank)
 *   2. the poster image fades over it once decoded
 *   3. the video is only fetched on hover/focus -- preload="none"
 *
 * So a grid of twelve of these costs twelve small images on load, not twelve
 * videos, and a missing media file degrades to something that still looks
 * designed rather than to a broken-image icon.
 */
export default function MediaCard({
  clip,
  ratio = "16 / 9",
  showMeta = true,
  onClick,
  children,
}) {
  const videoRef = useRef(null);
  const [posterOk, setPosterOk] = useState(false);
  const [wantsVideo, setWantsVideo] = useState(false);
  const [playing, setPlaying] = useState(false);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const engage = useCallback(() => {
    if (reduced) return;
    setWantsVideo(true);
  }, [reduced]);

  const disengage = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setPlaying(false);
  }, []);

  // Play only once the element exists and the source has been attached.
  useEffect(() => {
    if (!wantsVideo) return;
    const v = videoRef.current;
    if (!v) return;
    // A failed play (missing file, autoplay policy) must not throw or leave the
    // card in a half-state -- fall back to the poster silently.
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [wantsVideo]);

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      className="media-card"
      style={{ "--tint": clip.tint, "--ratio": ratio }}
      onMouseEnter={engage}
      onMouseLeave={disengage}
      onFocus={engage}
      onBlur={disengage}
      onClick={onClick}
      {...(onClick ? { type: "button" } : {})}
    >
      <div className="media-card__frame">
        <div className="media-card__tint" aria-hidden="true" />

        <img
          className={`media-card__poster ${posterOk ? "is-loaded" : ""}`}
          src={clip.poster}
          alt={clip.title ? `${clip.title} — generated still` : ""}
          loading="lazy"
          decoding="async"
          onLoad={() => setPosterOk(true)}
          onError={() => setPosterOk(false)}
        />

        {wantsVideo && (
          <video
            ref={videoRef}
            className={`media-card__video ${playing ? "is-playing" : ""}`}
            src={clip.src}
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
            aria-hidden="true"
          />
        )}

        {children}
      </div>

      {showMeta && (
        <div className="media-card__meta">
          <span className="media-card__title">{clip.title}</span>
          <span className="media-card__sub">
            {clip.author ? `@${clip.author}` : null}
            {clip.author && clip.model ? " · " : null}
            {clip.model}
          </span>
        </div>
      )}
    </Tag>
  );
}
