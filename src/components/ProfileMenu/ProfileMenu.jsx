import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as Icons from "../Icon/Icon.jsx";
import { ACCOUNT } from "../../data/account.js";
import { useAuth } from "../../lib/auth.js";
import "./ProfileMenu.css";

/* The credit meter is drawn as pips rather than a bar because that is what
   the product does -- and a pip count reads as "how many goes have I got
   left", which a continuous bar does not. */
const PIPS = 28;

export default function ProfileMenu({ onClose, onSignOut }) {
  const user = useAuth();
  const ref = useRef(null);
  const { credits } = ACCOUNT;
  const lit = Math.round(PIPS * (credits.left / credits.total));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const onDown = (e) => {
      if (ref.current?.contains(e.target)) return;
      /* The button that opened this panel handles its own toggle. */
      if (e.target.closest?.("[data-dock-trigger]")) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [onClose]);

  return (
    <div className="pmenu" ref={ref} role="menu" aria-label="Account">
      <header className="pmenu__head">
        <span className="pmenu__avatar" aria-hidden="true">
          <span />
        </span>
        <span className="pmenu__who">
          <strong>{user?.handle ?? ACCOUNT.handle}</strong>
          <span>{ACCOUNT.plan}</span>
        </span>
      </header>

      <section className="pmenu__credits">
        <p className="pmenu__creditrow">
          <span className="pmenu__creditlabel">
            Credits
            <Icons.Info size={14} />
          </span>
          <Link to="/pricing" className="pmenu__creditleft" onClick={onClose}>
            {credits.left} left
            <Icons.Chevron size={14} />
          </Link>
        </p>

        <p className="pmenu__pips" aria-hidden="true">
          {Array.from({ length: PIPS }, (_, i) => (
            <i key={i} className={i < lit ? "is-on" : ""} />
          ))}
        </p>

        <p className="pmenu__premium">
          <Icons.Crown size={18} />
          Go Premium
          <Link to="/pricing" className="pmenu__upgrade" onClick={onClose}>
            Upgrade
          </Link>
        </p>
      </section>

      <nav className="pmenu__links">
        {ACCOUNT.links.map((l) => {
          const Glyph = Icons[l.icon] ?? Icons.User;
          return (
            <Link key={l.id} to="/create" className="pmenu__link" role="menuitem" onClick={onClose}>
              <Glyph size={19} />
              {l.label}
              {l.badge && <span className="pmenu__badge">{l.badge}</span>}
            </Link>
          );
        })}

        <button type="button" className="pmenu__link" role="menuitem">
          <Icons.Translate size={19} />
          Language
          <span className="pmenu__value">
            {ACCOUNT.language}
            <Icons.Chevron size={14} />
          </span>
        </button>
      </nav>

      <button
        type="button"
        className="pmenu__link pmenu__signout"
        role="menuitem"
        onClick={() => {
          onSignOut?.();
          onClose();
        }}
      >
        <Icons.SignOut size={19} />
        Sign Out
      </button>
    </div>
  );
}
