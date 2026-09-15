import { Link } from "react-router-dom";
import { FEATURE_TAGS } from "../../data/site.js";
import "./FeatureCloud.css";

/**
 * The tail of the page: every surface the product has, as one flat set of
 * links. It is deliberately undifferentiated -- by this point the reader has
 * been sold to for a dozen screens, and what they need is an index, not
 * another pitch. White rather than lime for exactly that reason.
 */
export default function FeatureCloud() {
  return (
    <section className="fcloud" aria-labelledby="fcloud-title">
      <h2 className="fcloud__title display" id="fcloud-title">
        Explore more AI features
      </h2>

      <ul className="fcloud__list">
        {FEATURE_TAGS.map((t) => (
          <li key={t}>
            <Link to="/create" className="fcloud__tag">
              {t}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
