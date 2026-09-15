import { Link } from "react-router-dom";
import "./PhotodumpBanner.css";

/**
 * The Photodump band.
 *
 * The fan is a single authored asset with its own alpha, not four rotated
 * divs. That matters here: the cards overlap with real shadows and the
 * photography carries the pitch -- "same star, different scenes" is a claim
 * about faces, and four gradient rectangles cannot make it.
 */
export default function PhotodumpBanner() {
  return (
    <section className="pdump" aria-labelledby="pdump-title">
      <img
        className="pdump__fan"
        src="/media/photodump-fan.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />

      <div className="pdump__body">
        <span className="pdump__badge">Photodump</span>
        <h2 className="pdump__title display" id="pdump-title">
          Different scenes
          <br />
          same star
        </h2>
        <p className="pdump__sub">Build your character. One click does the rest</p>
        <Link to="/create" className="pdump__cta">
          Try Photodump
        </Link>
      </div>
    </section>
  );
}
