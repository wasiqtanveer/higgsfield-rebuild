import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, useAuthStatus } from "../../lib/auth.js";
import UserMenu from "../UserMenu/UserMenu.jsx";
import "./Header.css";

/**
 * The header is a floating pill, not a full-width bar.
 *
 * Four decisions worth naming:
 *
 * 1. It floats over the page rather than sitting above it. The hero starts at
 *    the top of the viewport and runs underneath the pill, so the opening shot
 *    is a full screen instead of a screen minus a header.
 *
 * 2. The reading-progress ring is drawn around the logo rather than as a bar
 *    across the top of the viewport. The usual 3px bar is chrome nobody looks
 *    at; wrapped around the mark it lands where the eye already goes, and it
 *    costs no additional space.
 *
 * 3. Past the first screen the wordmark collapses and gives its width back to
 *    the links. You only need to be told what product you are in once.
 *
 * 4. Auth is a separate pill. Sign-in is not a navigation item — it is the one
 *    thing up here that changes what you are, so it does not belong in the same
 *    container as the destinations. Once signed in that slot becomes the account
 *    circle: same footprint, so the header does not reflow on sign-in.
 */

const PRIMARY = [
  { to: "/create", label: "Create" },
  { to: "/explore", label: "Explore" },
  { to: "/lineage", label: "Lineage" },
  { to: "/library", label: "Library" },
  { to: "/models", label: "Models" },
];

/**
 * Everything the old rail carried, kept rather than dropped — but grouped, and
 * re-pointed at what this product actually is.
 *
 * The original nav was nineteen items in one flat line, which is a density that
 * reads as capability right up until you need to find something in it. Same
 * inventory, three columns, each with a verb at the top.
 *
 * `soon` marks a surface that is designed but not built. It renders as a row
 * with a tag rather than a link, because a menu item that navigates nowhere is
 * worse than one that admits it is not ready.
 */
const MENU = [
  {
    title: "Make",
    items: [
      { to: "/create", label: "Image", note: "Prompt to image" },
      { to: "/create?from=remix", label: "Remix", note: "Fork someone else's prompt" },
      { label: "Edit", note: "Change one thing, keep the rest", soon: true },
      { label: "Canvas", note: "Several prompts on one board", soon: true },
      { label: "Effects", note: "Saved prompt fragments", soon: true },
    ],
  },
  {
    title: "Find",
    items: [
      { to: "/explore", label: "Explore", note: "Everything public, newest first" },
      { to: "/lineage", label: "Lineage", note: "Browse prompts by descent" },
      { label: "Originals", note: "Prompts nothing was forked from", soon: true },
      { label: "Contests", note: "One brief, one week", soon: true },
      { label: "Community", note: "Who is forking whom", soon: true },
    ],
  },
  {
    title: "Learn & account",
    items: [
      { to: "/models", label: "Models", note: "What you can generate with" },
      { to: "/credits", label: "Credits", note: "Your balance and ledger" },
      { to: "/mcp", label: "API & MCP", note: "Drive Graft from your own tools" },
      { label: "Academy", note: "How to write a prompt worth forking", soon: true },
      { to: "/about", label: "About", note: "What this is and what it isn't" },
    ],
  },
];

/* How far down the page the wordmark gives up its space. */
const CONDENSE_AT = 48;
const CYCLE_MS = 3400;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/* The mark: two strokes running in from the left that merge into one leaving to
   the right. That is what a graft is, and it is the product in one glyph. */
function Mark() {
  return (
    <svg className="hdr__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6.5c4.4 0 5.6 5.5 10 5.5" />
        <path d="M4 17.5c4.4 0 5.6-5.5 10-5.5" />
        <path d="M14 12h6" />
      </g>
    </svg>
  );
}

function Chevron({ open }) {
  return (
    <svg
      className={`hdr__chev${open ? " is-open" : ""}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 9.5l6 5.5 6-5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Reading progress, 0–1, plus whether we are past the top of the page.
   Throttled to one read per frame: a raw scroll handler that reads scrollHeight
   fires layout on every event and makes the ring the most expensive thing on
   the page. */
function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      const doc = document.documentElement;
      const travel = doc.scrollHeight - doc.clientHeight;
      // A page shorter than the viewport has no progress to report, and
      // dividing by zero here would paint a full ring on every short page.
      setProgress(travel > 0 ? Math.min(1, Math.max(0, doc.scrollTop / travel)) : 0);
      // Hysteresis: collapsing and expanding at the same pixel makes the pill
      // flicker when a trackpad hovers the threshold.
      setCondensed((was) =>
        was ? doc.scrollTop > CONDENSE_AT - 16 : doc.scrollTop > CONDENSE_AT
      );
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { progress, condensed };
}

/**
 * The auth pill.
 *
 * At rest it shows one label, alternating between Log in and Sign up, because a
 * pill that only ever says "Sign up" hides the door for people who already have
 * an account. On hover or keyboard focus it widens and shows both, so the
 * ambiguity resolves the moment you reach for it.
 *
 * Both buttons are always in the DOM and always reachable by keyboard — the
 * rotating label is decorative and hidden from assistive tech.
 */
function AuthPill({ onAuth }) {
  const [index, setIndex] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const labels = ["Log in", "Sign up"];

  useEffect(() => {
    // Engaged means the pill is already showing both labels, so cycling would
    // animate something nobody is looking at. Reduced motion stops the timer
    // outright rather than letting CSS pause a still-running interval.
    if (engaged || prefersReducedMotion()) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % labels.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [engaged, labels.length]);

  return (
    <div
      className={`authpill${engaged ? " is-engaged" : ""}`}
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setEngaged(false);
      }}
    >
      <span className="authpill__cycle" aria-hidden="true">
        {labels.map((label, i) => (
          <span
            key={label}
            className={`authpill__cycle-item${i === index ? " is-current" : ""}`}
          >
            {label}
          </span>
        ))}
      </span>

      <span className="authpill__split">
        <button type="button" className="authpill__btn" onClick={() => onAuth("login")}>
          Log in
        </button>
        <span className="authpill__div" aria-hidden="true" />
        <button
          type="button"
          className="authpill__btn authpill__btn--primary"
          onClick={() => onAuth("signup")}
        >
          Sign up
        </button>
      </span>
    </div>
  );
}

export default function Header({ onAuth = () => {} }) {
  const { pathname } = useLocation();
  const { progress, condensed } = useScrollProgress();
  const user = useAuth();
  const authStatus = useAuthStatus();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Any navigation closes the overflow menu. Without this it survives the route
  // change and hangs over the new page.
  useEffect(() => setMoreOpen(false), [pathname]);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMoreOpen(false);
    const onDown = (e) => {
      if (!moreRef.current?.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [moreOpen]);

  // r=17 in a 40-unit box. Circumference drives the dash offset directly so the
  // ring is one geometric truth rather than a magic number per state.
  const R = 17;
  const C = 2 * Math.PI * R;

  return (
    <header className="hdr">
      <nav
        className={`hdr__pill${condensed ? " is-condensed" : ""}`}
        aria-label="Primary"
      >
        <Link
          to="/"
          className="hdr__brand"
          aria-label="Graft — home"
          title={`${Math.round(progress * 100)}% read`}
        >
          <span className="hdr__mark">
            <svg className="hdr__ring" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
              <circle className="hdr__ring-track" cx="20" cy="20" r={R} />
              <circle
                className="hdr__ring-fill"
                cx="20"
                cy="20"
                r={R}
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
              />
            </svg>
            <Mark />
          </span>
          <span className="hdr__word">Graft</span>
        </Link>

        <span className="hdr__rule" aria-hidden="true" />

        <ul className="hdr__links">
          {PRIMARY.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`hdr__link${pathname === item.to ? " is-active" : ""}`}
                aria-current={pathname === item.to ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hdr__more" ref={moreRef}>
          <button
            type="button"
            className={`hdr__link hdr__more-btn${moreOpen ? " is-open" : ""}`}
            aria-expanded={moreOpen}
            aria-haspopup="true"
            onClick={() => setMoreOpen((v) => !v)}
          >
            More
            <Chevron open={moreOpen} />
          </button>

          {moreOpen && (
            <div className="hdr__menu" role="menu">
              <div className="hdr__menu-cols">
                {MENU.map((col) => (
                  <div className="hdr__col" key={col.title}>
                    <p className="hdr__col-title label">{col.title}</p>
                    {col.items.map((item) =>
                      item.soon ? (
                        <span className="hdr__menu-item is-soon" key={item.label}>
                          <span className="hdr__menu-label">
                            {item.label}
                            <span className="hdr__soon">Soon</span>
                          </span>
                          <span className="hdr__menu-note">{item.note}</span>
                        </span>
                      ) : (
                        <Link
                          key={item.label}
                          to={item.to}
                          className="hdr__menu-item"
                          role="menuitem"
                        >
                          <span className="hdr__menu-label">{item.label}</span>
                          <span className="hdr__menu-note">{item.note}</span>
                        </Link>
                      )
                    )}
                  </div>
                ))}
              </div>

              {/* The old nav kept pricing and language in a utility cluster on
                  the right. Neither is a destination you reach for often enough
                  to spend header width on, so they live at the foot of the
                  menu. */}
              <div className="hdr__menu-foot">
                <Link to="/credits" className="hdr__foot-link">
                  Pricing &amp; credits
                </Link>
                <span className="hdr__foot-note">English · More languages soon</span>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Until the server answers, neither control is drawn. Flashing the
          signed-out pill at someone who is signed in is worse than a blank
          slot for a moment, and the slot holds its width either way. */}
      {authStatus !== "ready" ? (
        <div className="hdr__authslot" aria-hidden="true" />
      ) : user ? (
        <UserMenu user={user} />
      ) : (
        <AuthPill onAuth={onAuth} />
      )}
    </header>
  );
}
