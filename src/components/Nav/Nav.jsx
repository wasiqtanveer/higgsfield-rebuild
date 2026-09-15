import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Bell, Chevron, Diamond, FolderSolid, Globe, Mark, Search, Sparkle } from "../Icon/Icon.jsx";
import NavMenu from "../NavMenu/NavMenu.jsx";
import SearchModal from "../SearchModal/SearchModal.jsx";
import NotifPanel from "../NotifPanel/NotifPanel.jsx";
import ProfileMenu from "../ProfileMenu/ProfileMenu.jsx";
import AuthModal from "../AuthModal/AuthModal.jsx";
import { useAuth, signOut } from "../../lib/auth.js";
import { MENUS } from "../../data/menus.js";
import "./Nav.css";

/* The real nav is a dense rail of product surfaces, not a tidy five-item menu.
   That density is part of the identity -- trimming it to look calmer would be
   redesigning the thing rather than rebuilding it. */
const LINKS = [
  { to: "/", label: "Explore" },
  { to: "/create?mode=image", label: "Image", menu: "Image" },
  { to: "/video", label: "Video", menu: "Video" },
  { to: "/audio", label: "Audio", menu: "Audio" },
  { to: "/mcp", label: "MCP" },
  { divider: true },
  { to: "/mcp", label: "ChatGPT Plugin", badge: "New", tone: "promo" },
  { to: "/create", label: "Genjutsu", badge: "Free", tone: "accent" },
  { to: "/create", label: "Effects", badge: "Free", tone: "accent" },
  { to: "/create", label: "Cinema Studio" },
  { to: "/create", label: "Marketing Studio" },
  { to: "/create", label: "Supercomputer" },
  { to: "/create", label: "3D Jutsu", badge: "New", tone: "accent" },
  { to: "/create", label: "Edit" },
  { to: "/create", label: "Academy" },
  { to: "/create", label: "Community" },
  { to: "/create", label: "Contests" },
  { to: "/create", label: "Plugins" },
  { to: "/create", label: "Canvas" },
  { to: "/create", label: "Originals" },
];

const SHEET_LINKS = LINKS.filter((l) => !l.divider);

const LOCALES = [
  { code: "EN", label: "English" },
  { code: "ES", label: "Espanol" },
  { code: "JA", label: "Japanese" },
  { code: "KO", label: "Korean" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(null);
  const [condensed, setCondensed] = useState(false);
  const [search, setSearch] = useState(false);
  /* Signed-out is the state a first visit lands in. Who is signed in lives in
     the auth store, not here -- the profile menu and the studio read the same
     record, and it survives a reload and a second tab. */
  const user = useAuth();
  const authed = Boolean(user);
  const [lang, setLang] = useState(false);
  const [locale, setLocale] = useState("EN");
  /* null, "signup" or "login" -- the dialog needs to know which pitch it
     opened with, not merely that it is open. */
  const [auth, setAuth] = useState(null);
  /* Only one of these can be open at a time -- two panels hanging off the same
     header would overlap and both would look broken. */
  const [dock, setDock] = useState(null);
  const closeTimer = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    setDock(null);
    setLang(false);
  }, [pathname]);

  /* Both the mobile sheet and the search overlay lock the page. They are
     tracked together so closing one while the other is open does not hand
     scrolling back to a page nobody can see. */
  useEffect(() => {
    const locked = open || search || Boolean(auth);
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, search, auth]);

  useEffect(() => {
    const onKey = (e) => {
      /* The palette answers to the shortcut every launcher uses. Escape is
         handled by the overlay itself once it is open. */
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
        setOpen(false);
        setMenu(null);
        return;
      }
      if (e.key !== "Escape") return;
      setOpen(false);
      setMenu(null);
      setLang(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  /* The header gives height back once the page leaves the top. Read on a
     passive listener and written only on a change, so a fast scroll does not
     queue a render per frame. The threshold sits above zero to keep a
     rubber-band bounce from flipping it. */
  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      setCondensed((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* A short grace period on leave: without it the panel snaps shut while the
     pointer crosses the gap between the trigger and the panel below it. */
  const openMenu = (name) => {
    clearTimeout(closeTimer.current);
    setMenu(name ?? null);
  };

  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 140);
  };

  return (
    <header
      className={"nav " + (condensed ? "is-condensed" : "")}
      onMouseLeave={scheduleClose}
    >
      <div className="nav__inner">
        <Link to="/" className="nav__brand" aria-label="Higgsfield home">
          <span className="nav__mark">
            <Mark size={17} />
          </span>
        </Link>

        <nav className="nav__rail" aria-label="Primary">
          {LINKS.map((l, i) =>
            l.divider ? (
              <span className="nav__divider" key={"d" + i} aria-hidden="true" />
            ) : (
              <NavLink
                key={l.label}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  [
                    "nav__link",
                    /* Most rail items share the /create route, so a plain
                       isActive test would light up a dozen of them at once.
                       Only a link with its own route can claim the state. */
                    isActive && l.to !== "/create" ? "is-active" : "",
                    menu && menu === l.menu ? "is-peeking" : "",
                  ].join(" ")
                }
                onMouseEnter={() => openMenu(l.menu)}
                onFocus={() => openMenu(l.menu)}
                aria-haspopup={l.menu ? "true" : undefined}
                aria-expanded={l.menu ? menu === l.menu : undefined}
              >
                {l.label}
                {l.badge && (
                  <span className={"nav__badge nav__badge--" + l.tone}>{l.badge}</span>
                )}
              </NavLink>
            )
          )}
        </nav>

        <div className="nav__utils" onMouseEnter={scheduleClose}>
          <span className="nav__divider nav__divider--util" aria-hidden="true" />

          {/* Search belongs to the signed-in row -- a visitor with no library
              to search does not get the affordance. The shortcut still works. */}
          {authed && (
            <button
              className="nav__icon nav__icon--filled"
              aria-label="Search"
              aria-haspopup="dialog"
              aria-expanded={search}
              onClick={() => setSearch(true)}
            >
              <Search size={17} />
            </button>
          )}

          <Link to="/pricing" className="nav__pricing">
            <Diamond size={16} />
            Pricing
            <span className="nav__pricing-badge">54% OFF</span>
          </Link>

          <a href="#" className="nav__util-link">
            <Sparkle size={16} />
            Enterprise
          </a>

          {authed ? (
            <>
              <a href="#" className="nav__util-link nav__assets">
                <FolderSolid size={17} />
                Assets
              </a>

              <span className="nav__divider nav__divider--util" aria-hidden="true" />

              <button
                className={"nav__icon " + (dock === "notif" ? "is-on" : "")}
                data-dock-trigger=""
                aria-label="Notifications"
                aria-haspopup="dialog"
                aria-expanded={dock === "notif"}
                onClick={() => setDock((d) => (d === "notif" ? null : "notif"))}
              >
                <Bell size={17} />
                <span className="nav__dot" aria-hidden="true" />
              </button>

              <button
                className="nav__avatar"
                data-dock-trigger=""
                aria-label="Account"
                aria-haspopup="menu"
                aria-expanded={dock === "profile"}
                onClick={() => setDock((d) => (d === "profile" ? null : "profile"))}
                onMouseEnter={() => setDock("profile")}
              >
                <span className="nav__avatar-face" aria-hidden="true">
                  {user?.initials}
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Signed out: no library, no notifications, no avatar. The
                  locale switcher takes the slot the account cluster held. */}
              <div className="nav__lang">
                <button
                  className={"nav__icon " + (lang ? "is-on" : "")}
                  aria-label="Language"
                  aria-haspopup="menu"
                  aria-expanded={lang}
                  onClick={() => setLang((v) => !v)}
                >
                  <Globe size={17} />
                </button>

                {lang && (
                  <ul className="nav__langmenu" role="menu" aria-label="Language">
                    {LOCALES.map((l) => (
                      <li key={l.code}>
                        <button
                          role="menuitem"
                          className={"nav__langitem " + (l.code === locale ? "is-on" : "")}
                          onClick={() => {
                            setLocale(l.code);
                            setLang(false);
                          }}
                        >
                          <span className="nav__langcode">{l.code}</span>
                          {l.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <span className="nav__divider nav__divider--util" aria-hidden="true" />

              <button
                type="button"
                className="nav__login"
                aria-haspopup="dialog"
                onClick={() => setAuth("login")}
              >
                Login
              </button>

              <button
                type="button"
                className="nav__signup"
                aria-haspopup="dialog"
                onClick={() => setAuth("signup")}
              >
                Sign up
              </button>
            </>
          )}
        </div>

        <button
          className="nav__burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={"nav__burger-box " + (open ? "is-open" : "")} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>

      {menu && <NavMenu name={menu} onNavigate={() => setMenu(null)} />}

      <SearchModal open={search} onClose={() => setSearch(false)} />

      {auth && (
        <AuthModal
          mode={auth}
          onClose={() => setAuth(null)}
          onAuth={() => setAuth(null)}
        />
      )}

      {dock === "notif" && <NotifPanel onClose={() => setDock(null)} />}
      {dock === "profile" && (
        <ProfileMenu onClose={() => setDock(null)} onSignOut={signOut} />
      )}

      <div className={"nav__sheet " + (open ? "is-open" : "")} hidden={!open}>
        {SHEET_LINKS.map((l) => {
          const groups = l.menu ? MENUS[l.menu] : null;
          const expanded = sheetOpen === l.label;

          /* Touch has no hover, so the panel contents fold into the row itself
             rather than being unreachable. */
          if (groups) {
            return (
              <div className="nav__sheet-block" key={l.label}>
                <button
                  className="nav__sheet-link nav__sheet-toggle"
                  aria-expanded={expanded}
                  onClick={() => setSheetOpen(expanded ? null : l.label)}
                >
                  {l.label}
                  {l.badge && (
                    <span className={"nav__badge nav__badge--" + l.tone}>{l.badge}</span>
                  )}
                  <Chevron
                    size={16}
                    className={"nav__sheet-chev " + (expanded ? "is-open" : "")}
                  />
                </button>
                {expanded && (
                  <div className="nav__sheet-sub">
                    {groups.map((g) => (
                      <div key={g.label}>
                        <h3 className="nav__sheet-sublabel">{g.label}</h3>
                        {g.items.map((it) => (
                          <Link
                            key={it.name}
                            to={l.to}
                            className="nav__sheet-subitem"
                            onClick={() => setOpen(false)}
                          >
                            {it.name}
                            {it.badge && (
                              <span
                                className={"nav__badge nav__badge--" + (it.tone || "accent")}
                              >
                                {it.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link key={l.label} to={l.to} className="nav__sheet-link">
              {l.label}
              {l.badge && (
                <span className={"nav__badge nav__badge--" + l.tone}>{l.badge}</span>
              )}
              <Chevron size={16} className="nav__sheet-chev" />
            </Link>
          );
        })}
        <div className="nav__sheet-actions">
          {authed ? (
            <button
              type="button"
              className="nav__sheet-login"
              onClick={() => {
                signOut();
                setOpen(false);
              }}
            >
              Log out
            </button>
          ) : (
            <>
              <button
                type="button"
                className="nav__sheet-login"
                onClick={() => {
                  setAuth("login");
                  setOpen(false);
                }}
              >
                Login
              </button>
              <button
                type="button"
                className="nav__signup nav__signup--block"
                onClick={() => {
                  setAuth("signup");
                  setOpen(false);
                }}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
