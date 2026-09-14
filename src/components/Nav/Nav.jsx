import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import Button from "../Button/Button.jsx";
import "./Nav.css";

const LINKS = [
  { to: "/create", label: "Create" },
  { to: "/explore", label: "Explore" },
  { to: "/#effects", label: "Effects" },
  { to: "/#pricing", label: "Pricing" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile sheet on navigation, or it stays open over the new page.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A sheet that traps the page behind it must not let that page scroll.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="nav__inner">
        <Link to="/" className="nav__brand" aria-label="Higgsfield home">
          <span className="nav__mark" aria-hidden="true" />
          Higgsfield
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `nav__link ${isActive && !l.to.includes("#") ? "is-active" : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav__actions">
          <Button variant="ghost" size="sm" className="nav__signin">Sign in</Button>
          <Button variant="primary" size="sm" to="/create">Start creating</Button>
        </div>

        <button
          className="nav__burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`nav__burger-box ${open ? "is-open" : ""}`} aria-hidden="true">
            <i /><i /><i />
          </span>
        </button>
      </div>

      <div className={`nav__sheet ${open ? "is-open" : ""}`} hidden={!open}>
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="nav__sheet-link">{l.label}</Link>
        ))}
        <div className="nav__sheet-actions">
          <Button variant="secondary" size="md">Sign in</Button>
          <Button variant="primary" size="md" to="/create">Start creating</Button>
        </div>
      </div>
    </header>
  );
}
