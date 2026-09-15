import { Link } from "react-router-dom";
import { Chevron, Globe2 } from "../Icon/Icon.jsx";
import {
  FOOTER_ADDRESS,
  FOOTER_COLUMNS,
  FOOTER_LEGAL,
  FOOTER_SOCIAL,
} from "../../data/site.js";
import "./Footer.css";

/**
 * The footer is the one full-bleed lime surface in the product, and inverting
 * the whole palette there is the point: after a page of near-black it reads as
 * the end of the document rather than as one more section. The legal bar stays
 * dark underneath, which is what keeps the lime from feeling endless.
 */
export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot__main">
        <div className="page page--wide foot__inner">
          <h2 className="foot__wordmark display">
            AI-native
            <br />
            creative suite
          </h2>

          <nav className="foot__cols" aria-label="Footer">
            {FOOTER_COLUMNS.map((col, i) => (
              <div className="foot__col" key={i}>
                {col.groups.map((g) => (
                  <section className="foot__group" key={g.label}>
                    <h3 className="foot__label">{g.label}</h3>
                    <ul className="foot__links">
                      {g.links.map((l) => (
                        <li key={l}>
                          <Link to="/create" className="foot__link">
                            {l}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ))}
          </nav>

          <div className="foot__base">
            <address className="foot__address">{FOOTER_ADDRESS}</address>
            <ul className="foot__social">
              {FOOTER_SOCIAL.map((s) => (
                <li key={s}>
                  <a href="#" className="foot__link foot__link--strong">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="foot__legal">
        <div className="page page--wide foot__legal-inner">
          <small>&copy; 2026 Higgsfield, Inc. All rights reserved.</small>
          <ul className="foot__legal-links">
            <li>
              <button className="foot__lang">
                <Globe2 size={15} />
                English
                <Chevron size={13} className="foot__lang-chev" />
              </button>
            </li>
            {FOOTER_LEGAL.map((l) => (
              <li key={l}>
                <a href="#">{l}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
