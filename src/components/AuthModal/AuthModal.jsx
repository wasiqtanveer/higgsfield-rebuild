import { useEffect, useRef, useState } from "react";
import { Close, Diamond, Gift, Mail } from "../Icon/Icon.jsx";
import { signIn } from "../../lib/auth.js";
import "./AuthModal.css";

/**
 * Sign-in / sign-up dialog.
 *
 * Two halves that do different jobs: the left is a showcase reel that keeps
 * selling while the right collects the account. The reel is the reason this is
 * a dialog and not a route -- it advances on its own, so the panel has to own
 * a timer and hand it back when it closes.
 */

const SLIDES = [
  {
    id: "seedance",
    chip: "4K Resolution",
    title: "Seedance 2.0 4K",
    tab: "Seedance 2.0 4K",
    blurb: "The most reliable motion model, now at four times the resolution",
    poster: "/media/c04.jpg",
  },
  {
    id: "nano",
    chip: "4K Resolution",
    title: "Nano Banana Pro 4K",
    tab: "Nano Banana Pro",
    blurb: "The best image model, for the best price in the industry, only on Higgsfield",
    poster: "/media/c10.jpg",
  },
  {
    id: "soul",
    chip: "Photoreal",
    title: "Higgsfield Soul",
    tab: "Higgsfield Soul",
    blurb: "Character consistency that holds across every shot in a sequence",
    poster: "/media/c06.jpg",
  },
  {
    id: "cinema",
    chip: "iOS & Android",
    title: "Cinematic App",
    tab: "Cinematic App",
    blurb: "The whole studio in your pocket, shooting wherever you happen to be",
    poster: "/media/c02.jpg",
  },
];

const SLIDE_MS = 5200;

/* Provider marks. Drawn rather than pulled from a sprite so they sit on the
   same grid as the rest of the icon set -- but each keeps its own colours,
   because a monochrome Google G stops being recognisable. */
const Google = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" />
    <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21 7.6 23.5 12 23.5z" />
    <path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 010-4.4v-3H1.8a11.5 11.5 0 000 10.4l3.8-3z" />
    <path fill="#EA4335" d="M12 5.1c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.6 15.1.5 12 .5 7.6.5 3.7 3 1.8 6.8l3.8 3c.9-2.7 3.4-4.7 6.4-4.7z" />
  </svg>
);

const Apple = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
    <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.2 1.7 2.4 3 2.4 1.2 0 1.6-.8 3.1-.8 1.4 0 1.8.8 3.1.8 1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.6-1-2.7-4zM14.1 5.5c.7-.8 1.1-1.9 1-3-1 0-2.2.6-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.5z" />
  </svg>
);

const Microsoft = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <rect x="2" y="2" width="9" height="9" fill="#F25022" />
    <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
    <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
    <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
  </svg>
);

const PROVIDERS = [
  { id: "google", label: "Continue with Google", Glyph: Google },
  { id: "apple", label: "Continue with Apple", Glyph: Apple },
  { id: "microsoft", label: "Continue with Microsoft", Glyph: Microsoft },
];

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function AuthModal({ mode = "signup", onClose, onAuth }) {
  const [slide, setSlide] = useState(1);
  const [step, setStep] = useState("choose");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const closeRef = useRef(null);
  const panelRef = useRef(null);
  const emailRef = useRef(null);

  const signup = mode !== "login";

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      /* A dialog that lets Tab wander back into the page behind it is not a
         dialog. Cycle within the panel instead. */
      if (e.key !== "Tab") return;
      const nodes = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* The reel advances on its own, and stops doing so for anyone who has asked
     the system for less motion -- the tabs still work by hand. */
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setSlide((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (step === "email") emailRef.current?.focus();
  }, [step]);

  const current = SLIDES[slide];

  const submitEmail = (e) => {
    e.preventDefault();
    if (!VALID_EMAIL.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setStep("sent");
  };

  return (
    <div className="auth" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="auth__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        ref={panelRef}
      >
        {/* ---- showcase ---- */}
        <aside className="auth__show" aria-label="What is new">
          {SLIDES.map((s, i) => (
            <img
              key={s.id}
              className={"auth__showimg " + (i === slide ? "is-on" : "")}
              src={s.poster}
              alt=""
              aria-hidden="true"
              loading={i === 1 ? "eager" : "lazy"}
            />
          ))}

          <div className="auth__showcopy">
            <span className="auth__chip">
              <Diamond size={14} />
              {current.chip}
            </span>
            <h3 className="auth__showtitle display">{current.title}</h3>
            <p className="auth__showblurb">{current.blurb}</p>
          </div>

          <div className="auth__tabs" role="tablist" aria-label="Highlights">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                type="button"
                aria-selected={i === slide}
                className={"auth__tab " + (i === slide ? "is-on" : "")}
                onClick={() => setSlide(i)}
              >
                <span className="auth__tabbar" aria-hidden="true">
                  <span className="auth__tabfill" />
                </span>
                {s.tab}
              </button>
            ))}
          </div>
        </aside>

        {/* ---- account ---- */}
        <div className="auth__form">
          <button
            type="button"
            className="auth__close"
            aria-label="Close"
            ref={closeRef}
            onClick={onClose}
          >
            <Close size={16} />
          </button>

          <span className="auth__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M7.4 16.6c-2.2-2.2-1.4-5.2.9-6.6 2.6-1.6 5.7-.4 7.4 1.3 1.7 1.7 2.3 4.4.6 6.1-1.7 1.7-4.2 1.2-5.6-.2"
                fill="none"
                stroke="#000"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <h2 className="auth__title" id="auth-title">
            {signup ? "Welcome to Higgsfield" : "Welcome back"}
          </h2>
          <p className="auth__sub">
            {signup ? "Sign up and generate for free" : "Sign in to pick up where you left off"}
          </p>

          {step === "sent" ? (
            <div className="auth__sent">
              <span className="auth__sentglyph" aria-hidden="true"><Mail size={22} /></span>
              <p className="auth__sentline">
                We sent a link to <b>{email.trim()}</b>.
              </p>
              <p className="auth__sentnote">
                This build has no mail server behind it &mdash; continue to see the
                signed-in product.
              </p>
              <button
                type="button"
                className="auth__primary"
                onClick={() => {
                  signIn({ provider: "email", email: email.trim() });
                  onAuth();
                }}
              >
                Continue
              </button>
              <button type="button" className="auth__back" onClick={() => setStep("choose")}>
                Use a different method
              </button>
            </div>
          ) : step === "email" ? (
            <form className="auth__emailform" onSubmit={submitEmail} noValidate>
              <label className="auth__label" htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                ref={emailRef}
                className={"auth__input " + (error ? "is-bad" : "")}
                type="email"
                autoComplete="email"
                placeholder="you@studio.com"
                value={email}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "auth-error" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
              />
              {error && (
                <p className="auth__error" id="auth-error" role="alert">{error}</p>
              )}
              <button type="submit" className="auth__primary">Continue</button>
              <button type="button" className="auth__back" onClick={() => setStep("choose")}>
                Back
              </button>
            </form>
          ) : (
            <>
              <button
                type="button"
                className="auth__biz"
                onClick={() => {
                  signIn({ provider: "business" });
                  onAuth();
                }}
              >
                <Gift size={17} />
                Sign in with business email &amp; Get 50 credits
              </button>

              {PROVIDERS.map(({ id, label, Glyph }) => (
                <button
                  key={id}
                  type="button"
                  className="auth__provider"
                  onClick={() => {
                    signIn({ provider: id });
                    onAuth();
                  }}
                >
                  <Glyph />
                  {label}
                </button>
              ))}

              <div className="auth__or" aria-hidden="true"><span>OR</span></div>

              <button
                type="button"
                className="auth__provider"
                onClick={() => setStep("email")}
              >
                <Mail size={18} />
                Continue with Email
              </button>

              <p className="auth__legal">
                By continuing you agree to the Terms of Service and Privacy Policy.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
