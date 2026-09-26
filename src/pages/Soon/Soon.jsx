import { Link, useLocation } from "react-router-dom";
import Arrive from "../../components/Arrive/Arrive.jsx";
import "./Soon.css";

/**
 * Two honest dead ends: a surface that is planned but not built, and a URL that
 * is simply wrong.
 *
 * This exists because the previous catch-all sent every unknown path to the
 * feed, which meant a dead link looked like a working one that went somewhere
 * unexpected — the worst of both, and exactly how the old clone's pages kept
 * reappearing under the new nav. A route that does not exist should say so.
 */

/* What each planned surface will be, so the page says something more useful
   than "coming soon". Anything not listed falls back to the not-found copy. */
const PLANNED = {
  "/lineage": {
    title: "Lineage",
    body:
      "Browse prompts by descent rather than by date — roots, their children, and the single edit at each step.",
  },
  "/library": {
    title: "Library",
    body:
      "Everything you have generated and forked, kept with the prompts that made it.",
  },
  "/models": {
    title: "Models",
    body:
      "The models Graft can drive, read as a spec sheet rather than a leaderboard.",
  },
  "/about": {
    title: "About",
    body: "What Graft is, what it refuses to do, and who is building it.",
  },
};

export default function Soon() {
  const { pathname } = useLocation();
  const planned = PLANNED[pathname];

  return (
    <div className="soon">
      <Arrive as="section" className="soon__band">
        <div className="page soon__inner">
          <p className="soon__path mono">{pathname}</p>

          {planned ? (
            <>
              <h1 className="soon__h1">
                {planned.title} is <span className="soon__serif">next</span>.
              </h1>
              <p className="soon__body">{planned.body}</p>
              <p className="soon__note">
                Designed, not built. It is in the nav because it is real work in
                progress, not to pad the menu.
              </p>
            </>
          ) : (
            <>
              <h1 className="soon__h1">
                Nothing lives <span className="soon__serif">here</span>.
              </h1>
              <p className="soon__body">
                This URL does not match anything on Graft. It may be from an
                older version of the site.
              </p>
            </>
          )}

          <div className="soon__actions">
            <Link className="soon__cta" to="/">
              Back to the start
            </Link>
            <Link className="soon__ghost" to="/create">
              Write a prompt
            </Link>
          </div>
        </div>
      </Arrive>
    </div>
  );
}
