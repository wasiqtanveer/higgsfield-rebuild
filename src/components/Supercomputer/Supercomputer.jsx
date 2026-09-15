import { Link } from "react-router-dom";
import PerspectiveRoom from "../PerspectiveRoom/PerspectiveRoom.jsx";
import { Cursor, Film, Mark, Megaphone, Portrait } from "../Icon/Icon.jsx";
import { CLIPS } from "../../data/gallery.js";
import "./Supercomputer.css";

/**
 * The Supercomputer band.
 *
 * The floating panels are the argument: the claim is "one agent across your
 * whole stack", and three surfaces working at once says that faster than the
 * sentence does. The chrome is authored mini-UI so it stays crisp at any
 * width, but the thumbnails inside it are real stills -- a panel claiming to
 * be a production timeline full of gradient swatches undercuts the claim.
 */

/** A still from the library, over its own tint as the decode fallback. */
function Shot({ clip }) {
  return (
    <i style={{ "--t": clip.tint }}>
      <img src={clip.poster} alt="" loading="lazy" decoding="async" />
    </i>
  );
}

export default function Supercomputer() {
  return (
    <section className="sc" aria-labelledby="sc-title">
      <PerspectiveRoom />

      {/* Left: the creator surface */}
      <article className="sc__panel sc__panel--ugc" aria-hidden="true">
        <header className="sc__panel-head">
          <Portrait size={16} />
          UGC Creator
          <span className="sc__count">2/2</span>
        </header>
        <div className="sc__thumbs">
          <Shot clip={CLIPS.find((c) => c.id === "c04")} />
          <Shot clip={CLIPS.find((c) => c.id === "c06")} />
          <Shot clip={CLIPS.find((c) => c.id === "c09")} />
        </div>
        <span className="sc__chip">UGC ✓</span>
      </article>

      {/* Right: the marketing surface */}
      <article className="sc__panel sc__panel--mkt" aria-hidden="true">
        <header className="sc__panel-head">
          <Megaphone size={16} />
          Marketing
        </header>
        <div className="sc__row">
          <span className="sc__dot" />
          <span className="sc__meta">
            <b>Ms. Higgs</b>
            480M subscribers · 970 videos
          </span>
        </div>
        <div className="sc__thumbs">
          <Shot clip={CLIPS.find((c) => c.id === "c10")} />
          <Shot clip={CLIPS.find((c) => c.id === "c12")} />
        </div>
        <span className="sc__tag">Analyzing hooks</span>
      </article>

      {/* Bottom: the production surface */}
      <article className="sc__panel sc__panel--prod" aria-hidden="true">
        <header className="sc__panel-head">
          <Film size={16} />
          Production
        </header>
        <div className="sc__row sc__row--tight">
          <b>Scene 04</b>
          <span className="sc__meta">Skatepark</span>
          <span className="sc__count">11 shots</span>
        </div>
        <div className="sc__thumbs">
          <Shot clip={CLIPS.find((c) => c.id === "c01")} />
          <Shot clip={CLIPS.find((c) => c.id === "c05")} />
        </div>
      </article>

      <span className="sc__pointer" aria-hidden="true">
        <Cursor size={18} />
        <em>Visualizing</em>
      </span>

      <div className="sc__body">
        <span className="sc__stack" aria-hidden="true">
          <i style={{ "--t": "linear-gradient(140deg,#d4703f,#f0b98a)" }} />
          <i className="sc__stack-mark">
            <Mark size={18} />
          </i>
          <i style={{ "--t": "linear-gradient(140deg,#3f6ad4,#8aa9f0)" }} />
        </span>

        <h2 className="sc__title display" id="sc-title">
          Supercomputer
        </h2>
        <p className="sc__sub">One superagent for your entire creative stack</p>

        <Link to="/create" className="sc__cta">
          Try Supercomputer
        </Link>
      </div>
    </section>
  );
}
