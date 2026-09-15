import { Link } from "react-router-dom";
import * as Icons from "../Icon/Icon.jsx";
import { PRODUCT_TILES } from "../../data/features.js";
import "./ProductTiles.css";

/* The kind chip carries its own glyph. Mapped here rather than in the data so
   the data stays about products and the icon set stays a component concern. */
const KIND_ICON = { Video: Icons.Film, Image: Icons.Image };

export default function ProductTiles() {
  return (
    <div className="ptiles">
      {PRODUCT_TILES.map((t) => {
        const Glyph = Icons[t.icon] ?? Icons.Burst;
        const KindGlyph = KIND_ICON[t.kind];

        return (
          <Link to="/create" className="ptile" key={t.id}>
            <div className="ptile__top">
              <span className="ptile__glyph" style={t.hue ? { color: t.hue } : undefined}>
                <Glyph size={22} />
              </span>
              {t.kind && (
                <span className="ptile__kind">
                  {KindGlyph && <KindGlyph size={14} />}
                  {t.kind}
                </span>
              )}
            </div>

            <div className="ptile__foot">
              <h3 className="ptile__name">
                {t.name}
                {t.badge && (
                  <span className={`ptile__badge ptile__badge--${t.tone ?? "accent"}`}>
                    {t.badge}
                  </span>
                )}
              </h3>
              <p className="ptile__blurb">{t.blurb}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
