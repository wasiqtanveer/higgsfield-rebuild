import { Link } from "react-router-dom";
import { Globe2, Mark } from "../Icon/Icon.jsx";
import { PROJECTS } from "../../data/projects.js";
import { getClip } from "../../data/gallery.js";
import "./ProjectGrid.css";

/**
 * Community projects.
 *
 * The footer bar is the point of this card: it names who made the thing and
 * whether it is public. That is what makes the band read as other people's
 * work rather than as more marketing art, so it stays visible at rest instead
 * of hiding behind a hover.
 */
export default function ProjectGrid({ projects = PROJECTS }) {
  return (
    <div className="pgrid">
      {projects.map((p) => {
        const clip = p.clipId ? getClip(p.clipId) : null;
        return (
        <article className="pcard" key={p.id} style={{ "--tint": p.tint }}>
          <Link to="/explore" className="pcard__link">
            <div className="pcard__art" aria-hidden="true">
              {/* The tint stays underneath rather than being replaced, so the
                  tile is never blank while the thumbnail decodes and never
                  broken if the file is missing. */}
              {clip && (
                <img src={clip.poster} alt="" loading="lazy" decoding="async" />
              )}
            </div>

            <footer className="pcard__foot">
              <span className="pcard__avatar" aria-hidden="true">
                <Mark size={14} />
              </span>
              <span className="pcard__title">
                {p.title}
                <span className="pcard__by"> by {p.author}</span>
              </span>
              <span className="pcard__vis">
                <Globe2 size={13} />
                {p.visibility}
              </span>
            </footer>
          </Link>
        </article>
        );
      })}
    </div>
  );
}
