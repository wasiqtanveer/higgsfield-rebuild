import BandHead from "../BandHead/BandHead.jsx";
import MediaCard from "../MediaCard/MediaCard.jsx";
import Wall from "../Wall/Wall.jsx";
import WallReveal from "../WallReveal/WallReveal.jsx";
import { CLIPS } from "../../data/gallery.js";
import "./ModelBand.css";

/* Mixed ratios, cycled so the wall stays identical between renders. */
const RATIOS = ["16 / 9", "16 / 9", "3 / 4", "9 / 16", "4 / 5", "16 / 9", "9 / 16", "3 / 4", "1 / 1", "9 / 16"];

/**
 * A model announcement: the band is a surface of its own, raised off the page
 * ground, with its own heading and its own wall of examples inside it. That
 * containment is what separates it from the effects band above, which sits
 * directly on the page.
 */
export default function ModelBand({
  badge,
  title,
  sub,
  actions,
  reveal,
  columns,
  /* Some bands are a neat grid of one ratio rather than a masonry wall --
     Soul Cinema is all 16:9 stills. Same header, same fade, different shelf. */
  ratio,
  /* Flat bands sit directly on the page ground instead of on a raised card.
     Same header, same wall -- only the surface underneath changes. */
  flat = false,
  clips = CLIPS,
}) {
  return (
    <section className={`mband ${flat ? "mband--flat" : ""}`} aria-labelledby={`mband-${title}`}>
      <BandHead
        id={`mband-${title}`}
        badge={badge}
        title={title}
        sub={sub}
        actions={actions}
      />

      <WallReveal action={reveal}>
        {ratio ? (
          <div className="mband__grid" style={{ "--cols": columns ?? 3 }}>
            {clips.map((c) => (
              <MediaCard key={c.id} clip={c} ratio={ratio} showMeta={false} />
            ))}
          </div>
        ) : (
          <Wall columns={columns}>
            {clips.map((c, i) => (
              <MediaCard
                key={c.id}
                clip={c}
                ratio={RATIOS[i % RATIOS.length]}
                showMeta={false}
              />
            ))}
          </Wall>
        )}
      </WallReveal>
    </section>
  );
}
