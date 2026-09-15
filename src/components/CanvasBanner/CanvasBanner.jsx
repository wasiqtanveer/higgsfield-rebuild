import { Link } from "react-router-dom";
import { Sparkle } from "../Icon/Icon.jsx";
import "./CanvasBanner.css";

/**
 * The Canvas announcement.
 *
 * The one place in the page where the ground is not black. That is the whole
 * job of the band: a colour field this saturated, surrounded by near-black
 * sections, stops the scroll without needing a bigger headline.
 */
export default function CanvasBanner() {
  return (
    <section className="cbanner" aria-labelledby="cbanner-title">
      <div className="cbanner__grain" aria-hidden="true" />

      <div className="cbanner__body">
        <p className="cbanner__kicker">New feature</p>
        <h2 className="cbanner__title display" id="cbanner-title">
          One canvas.
          <br />
          Every workflow.
        </h2>
        <p className="cbanner__sub">
          Moodboard, chain workflows, and share
          <br />
          with your team &ndash; all on one canvas
        </p>
        <Link to="/create" className="cbanner__cta">
          <Sparkle size={16} />
          Try Canvas
        </Link>
      </div>
    </section>
  );
}
