import { Link } from "react-router-dom";
import { Mark } from "../Icon/Icon.jsx";
import "./BandHead.css";

/**
 * The heading block shared by the effects and model bands: lime display title,
 * a dim line of copy, and the actions pushed to the far edge. Shared because
 * the two bands must agree -- two near-identical headers drifting apart is the
 * usual way a page stops looking designed.
 */
export default function BandHead({ badge, title, sub, actions = [], id }) {
  return (
    <header className="bhead">
      <div className="bhead__text">
        {badge && (
          <span className="bhead__badge">
            <Mark size={16} />
            {badge}
          </span>
        )}
        <h2 className="bhead__title display" id={id}>
          {title}
        </h2>
        {sub && <p className="bhead__sub">{sub}</p>}
      </div>

      {actions.length > 0 && (
        <div className="bhead__actions">
          {actions.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className={`bhead__btn bhead__btn--${a.tone ?? "accent"}`}
            >
              {a.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
