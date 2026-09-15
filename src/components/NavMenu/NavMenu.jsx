import { Link } from "react-router-dom";
import * as Icons from "../Icon/Icon.jsx";
import { MENUS } from "../../data/menus.js";
import "./NavMenu.css";

/**
 * The mega-menu panel for a nav trigger.
 *
 * Rendered only while open -- these panels carry up to 33 rows each, and
 * keeping three of them mounted and hidden would put ~100 icons in the tree on
 * every page for the sake of a transition.
 */
export default function NavMenu({ name, onNavigate }) {
  const groups = MENUS[name];
  /* Video and Audio have real surfaces of their own; the remaining panels
     still funnel into the generic composer. */
  const SURFACES = { Video: "/video", Audio: "/audio" };
  const to = SURFACES[name] ?? "/create";
  if (!groups) return null;

  return (
    <div className="navmenu" role="menu" aria-label={name}>
      <div className="navmenu__cols">
        {groups.map((g) => (
          <section className="navmenu__group" key={g.label}>
            <h3 className="navmenu__label">{g.label}</h3>
            <ul className="navmenu__list">
              {g.items.map((it) => {
                const Glyph = Icons[it.icon] ?? Icons.Burst;
                return (
                  <li key={`${g.label}-${it.name}`}>
                    <Link
                      to={to}
                      className="navmenu__item"
                      role="menuitem"
                      onClick={onNavigate}
                    >
                      <span className="navmenu__tile">
                        <Glyph size={22} />
                        {it.badge && (
                          <span className={`navmenu__badge navmenu__badge--${it.tone ?? "accent"}`}>
                            {it.badge}
                          </span>
                        )}
                      </span>
                      <span className="navmenu__text">
                        <span className="navmenu__name">{it.name}</span>
                        <span className="navmenu__blurb">{it.blurb}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
