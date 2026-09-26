import { Link } from "react-router-dom";
import { SF_COLUMNS, SF_LEGAL } from "../../data/sitefoot.js";
import "./SiteFoot.css";

/**
 * The site footer, rebuilt for the dark world.
 *
 * Three decisions, all of them subtraction:
 *
 * 1. **It is not a surface any more.** The old footer was a full-bleed lime
 *    panel — the one inverted band in the product, which worked as a full stop
 *    when the page above it was near-black and there was nothing else asking for
 *    attention. On the rebuilt home the section directly above this is a single
 *    accent-lit prompt field, and a saturated panel underneath it would win that
 *    fight. So this recedes: the same ground, a hairline, and type. The footer's
 *    job here is to end the page, not to be the last thing you look at.
 *
 * 2. **It is four columns, not five with nine groups.** Same inventory, audited
 *    (see `data/sitefoot.js`) — the reference product's video models and studios
 *    are gone, because they describe someone else's product.
 *
 * 3. **Unbuilt surfaces admit it.** A row with a `soon` tag rather than a link,
 *    the same contract as the header's mega-menu. The old footer rendered all
 *    fifty of its labels as links to `/create`; a sitemap where every road leads
 *    to the same room is worse than a shorter one that is true.
 */
export default function SiteFoot() {
  return (
    <footer className="sf">
      <div className="page sf__inner">
        {/* The mark and the claim. One line, because the argument was made by
            the page and a footer restating it is a page that did not trust
            itself. */}
        <div className="sf__brand">
          <Link to="/" className="sf__mark" aria-label="Graft, home">
            {/* The approved mark, geometry copied verbatim from
                `Header/Header.jsx`: two strokes running in from the left that
                merge into one leaving to the right. Drawn rather than imported
                because the header's `Mark` is inside a frozen component and
                exporting from it would mean editing it — and a second,
                slightly-different glyph in the footer is the kind of drift that
                makes a brand look assembled. The merged stroke takes the accent,
                which is the section's entire accent budget. */}
            <svg
              className="sf__glyph"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6.5c4.4 0 5.6 5.5 10 5.5" />
                <path d="M4 17.5c4.4 0 5.6-5.5 10-5.5" />
                <path d="M14 12h6" stroke="var(--c-accent)" />
              </g>
            </svg>
            <span className="sf__word">Graft</span>
          </Link>

          <p className="sf__claim">
            The prompt is the artifact. Open any image, read the prompt that made
            it, change one line.
          </p>
        </div>

        <nav className="sf__nav" aria-label="Footer">
          {SF_COLUMNS.map((col) => (
            <section className="sf__col" key={col.label}>
              <h2 className="sf__label label">{col.label}</h2>
              <ul className="sf__links">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link to={l.to} className="sf__link">
                        {l.label}
                      </Link>
                    ) : (
                      /* Not a link and not a disabled link: plain text with a
                         tag. A disabled control still invites a click and then
                         refuses it, which is the worst of both. */
                      <span className="sf__soon">
                        {l.label}
                        <span className="sf__tag">Soon</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </div>

      <div className="page sf__base">
        <small className="sf__copy">
          &copy; {new Date().getFullYear()} Graft
        </small>
        <ul className="sf__legal">
          {SF_LEGAL.map((l) => (
            <li key={l}>
              {/* Listed but not linked: these documents are owed and are not
                  written, and the old footer's `href="#"` with the click
                  prevented is the version of this that wastes a click to say
                  so. Same contract as the `soon` rows above. */}
              <span className="sf__legal-item">{l}</span>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
