import { Link } from "react-router-dom";
import { ArrowUpRight } from "../Icon/Icon.jsx";
import "./WallReveal.css";

/**
 * A wall that fades out at its foot, with the "see everything" action sitting
 * in the fade.
 *
 * The fade is doing real work: it says the wall is a sample rather than the
 * whole library, which a hard bottom edge cannot. The gradient resolves to
 * `--fade-to`, set by whatever surface the wall sits on -- page ground for the
 * effects band, the raised card for the model band -- because a fade to the
 * wrong colour is more conspicuous than no fade at all.
 */
export default function WallReveal({ children, action }) {
  return (
    <div className="wreveal">
      {children}
      <div className="wreveal__fade" aria-hidden="true" />
      {action && (
        <Link to={action.to} className="wreveal__cta">
          {action.label}
          <ArrowUpRight size={18} />
        </Link>
      )}
    </div>
  );
}
