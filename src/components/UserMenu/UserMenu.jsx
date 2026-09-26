import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "../../lib/auth.js";
import "./UserMenu.css";

/**
 * The signed-in replacement for the auth pill.
 *
 * At rest it is a single circle carrying the user's initials -- the same height
 * as the pill it replaces, so the header does not reflow when you sign in. The
 * credit balance rides on the circle as a ring rather than sitting beside it as
 * a number: it is the one piece of account state worth showing at all times, and
 * a ring costs no header width.
 *
 * Initials rather than a generated avatar image. There is no uploaded photo
 * behind this build, and a random identicon tells the user nothing about
 * themselves -- their own initials do.
 */

/* The balance a full ring represents. New accounts start at 250 (see
   STARTING_CREDITS in lib/auth.js), so a fresh account reads as full. */
const RING_FULL = 250;

const ITEMS = [
  { to: "/library", label: "Your library", note: "Everything you have made" },
  { to: "/lineage", label: "Your lineage", note: "What you forked, and from whom" },
  { to: "/credits", label: "Credits", note: "Balance and ledger" },
];

export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);

  /* Escape closes and returns focus to the trigger; a click outside just
     closes. Without the focus return, dismissing by keyboard drops the caret
     at the top of the document. */
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      btnRef.current?.focus();
    };
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  /* r=15 in a 34-unit box, matching the brand ring's construction in the
     header: circumference drives the dash offset so the geometry is one truth
     rather than a magic number. */
  const R = 15;
  const C = 2 * Math.PI * R;
  const filled = Math.min(1, Math.max(0, (user.credits ?? 0) / RING_FULL));

  return (
    <div className={`usermenu${open ? " is-open" : ""}`} ref={wrapRef}>
      <button
        type="button"
        ref={btnRef}
        className="usermenu__circle"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Account — ${user.name}, ${user.credits} credits`}
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="usermenu__ring" viewBox="0 0 34 34" aria-hidden="true" focusable="false">
          <circle className="usermenu__ring-track" cx="17" cy="17" r={R} />
          <circle
            className="usermenu__ring-fill"
            cx="17"
            cy="17"
            r={R}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - filled)}
          />
        </svg>
        <span className="usermenu__initials" aria-hidden="true">
          {user.initials}
        </span>
      </button>

      {open && (
        <div className="usermenu__panel" role="menu">
          <div className="usermenu__id">
            <span className="usermenu__id-name">{user.name}</span>
            <span className="usermenu__id-mail">{user.email}</span>
          </div>

          <div className="usermenu__credits">
            <span className="usermenu__credits-n">{user.credits}</span>
            <span className="usermenu__credits-label">credits left</span>
          </div>

          <div className="usermenu__items">
            {ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="usermenu__item"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <span className="usermenu__item-label">{item.label}</span>
                <span className="usermenu__item-note">{item.note}</span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="usermenu__out"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
