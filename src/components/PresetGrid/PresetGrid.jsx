import { useNavigate } from "react-router-dom";
import { PRESETS } from "../../data/presets.js";
import { CLIPS } from "../../data/gallery.js";
import MediaCard from "../MediaCard/MediaCard.jsx";
import Wall from "../Wall/Wall.jsx";
import { Sparkle } from "../Icon/Icon.jsx";
import "./PresetGrid.css";

/**
 * The effects gallery.
 *
 * "Recreate" is the important part: it routes to /create?preset=<id>, which
 * pre-fills the composer with that preset's prompt and model. A preset tile
 * that only looks pretty is marketing; one that loads the thing it depicts is
 * the product.
 *
 * `layout="wall"` drops the tiles into masonry columns with mixed aspect
 * ratios, which is how the effects band reads on the live site; the default
 * uniform grid stays for places that need a tidy row.
 */

/* Cycled rather than random: a wall has to look the same on every render, and
   the sequence is chosen so no column ends up all-tall or all-short. */
const WALL_RATIOS = ["3 / 4", "9 / 16", "1 / 1", "4 / 5", "3 / 4", "16 / 9", "9 / 16", "1 / 1"];

export default function PresetGrid({ limit = PRESETS.length, layout = "grid" }) {
  const navigate = useNavigate();
  const shown = PRESETS.slice(0, limit);

  const tiles = shown.map((preset, i) => {
    // Pair each preset with a clip so the tile has a palette of its own.
    const clip = CLIPS[i % CLIPS.length];
    const ratio = layout === "wall" ? WALL_RATIOS[i % WALL_RATIOS.length] : "3 / 4";

    return (
      <div className="pg__cell" key={preset.id}>
        <MediaCard
          clip={{ ...clip, title: preset.name, author: null, model: null }}
          ratio={ratio}
          showMeta={false}
          onClick={() => navigate(`/create?preset=${preset.id}`)}
        >
          <div className="pg__scrim" aria-hidden="true" />
          <div className="pg__body">
            <span className="pg__name display">{preset.name}</span>
            <span className="pg__cta">
              <Sparkle size={16} />
              Recreate
            </span>
          </div>
        </MediaCard>
      </div>
    );
  });

  if (layout === "wall") return <Wall>{tiles}</Wall>;
  return <div className="pg">{tiles}</div>;
}
