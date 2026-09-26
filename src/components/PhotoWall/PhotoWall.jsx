import { useReducedMotion } from "framer-motion";
import "./PhotoWall.css";

/**
 * The wall of generations behind the hero.
 *
 * Rows of stills drifting sideways at different speeds and sizes, the whole
 * plane tilted, so the page sits on a field of the product's own output rather
 * than on flat black.
 *
 * It is background, so it obeys background rules: heavily darkened, never
 * interactive, hidden from assistive tech, and it never takes priority away
 * from the hero's own image. Reduced motion stops the drift and leaves the
 * field composed and still — the texture is the point, the movement is not.
 */

/* The usable library. c01–c03 are Higgsfield's own marketing banners and
   cannot appear on this product; c08 is byte-identical to c11. */
const STILLS = ["c04", "c05", "c06", "c07", "c09", "c10", "c11", "c12"];

/* Each row gets its own length, speed, direction and tile size, because rows
   that differ only in offset read as one image scrolling, not as a field. */
/* Four rows. More than this is weight for no gain: past the fourth the field
   is already reading as texture, and every extra row is another sixteen
   composited tiles moving every frame. */
const ROWS = [
  { size: "sm", speed: 64, reverse: false, from: 0 },
  { size: "lg", speed: 92, reverse: true, from: 3 },
  { size: "md", speed: 76, reverse: false, from: 6 },
  { size: "sm", speed: 104, reverse: true, from: 1 },
];

/* Rotating the start index per row means no two rows show the same still side
   by side, which is what makes a short library read as a long one. */
function rowTiles(from) {
  return STILLS.map((_, i) => STILLS[(i + from) % STILLS.length]);
}

export default function PhotoWall() {
  const reduced = useReducedMotion();

  return (
    <div className="pwall" aria-hidden="true">
      <div className="pwall__plane">
        {ROWS.map((row, i) => {
          const tiles = rowTiles(row.from);
          return (
            <div className={`pwall__row pwall__row--${row.size}`} key={i}>
              <div
                className="pwall__track"
                data-reverse={row.reverse ? "" : undefined}
                style={
                  reduced
                    ? { animation: "none" }
                    : { animationDuration: `${row.speed}s` }
                }
              >
                {/* Two passes of the same tiles: the track is translated by
                    exactly half its width, so the seam between the copies never
                    arrives and the loop has no visible restart. */}
                {[0, 1].map((pass) =>
                  tiles.map((id, j) => (
                    <span className="pwall__tile" key={`${pass}-${j}`}>
                      {/* 560×420 thumbnails, not the full stills. A tile paints
                          at roughly 347×277, so the 720×1280 originals were
                          handing the compositor many times the pixels it
                          needed and dropping frames on every scroll. */}
                      <img
                        src={`/media/thumb/${id}.jpg`}
                        alt=""
                        width="560"
                        height="420"
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                      />
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* One scrim. It sinks the field so type stays readable over it and
          pulls the centre down hardest, because that is where the headline and
          the artifact land. Three separate layers here cost measurable frames
          on every scroll. */}
      <div className="pwall__veil" />
    </div>
  );
}
