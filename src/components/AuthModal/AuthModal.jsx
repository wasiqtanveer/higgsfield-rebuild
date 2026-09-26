import { useEffect, useRef, useState } from "react";
import { signIn, signUp } from "../../lib/auth.js";
import "./AuthModal.css";

/**
 * The sign-in dialog.
 *
 * One dialog serves both doors. Log in and sign up differ by copy and by one
 * extra field, not by a layout.
 *
 * There are no provider buttons. Google, Apple and Microsoft are not enabled on
 * the Supabase project, and a button that opens nothing is the exact defect
 * this dialog was built to fix -- so the third-party path is named as not ready
 * rather than drawn as if it works.
 */

/* A fast check for the common typo. The authoritative one is server-side in
   /api/auth, because a request can arrive without ever touching this form. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 6;

export default function AuthModal({ mode = "login", onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const panelRef = useRef(null);
  const firstRef = useRef(null);
  const signup = mode === "signup";

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  /* Escape closes, and Tab is trapped inside the panel: a dialog you can Tab
     out of leaves focus on controls the overlay is covering. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll(
        'button:not([disabled]), input, [href], [tabindex]:not([tabindex="-1"])'
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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;

    const address = email.trim();
    if (!EMAIL.test(address)) {
      setError("That does not look like an email address.");
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (signup) {
        const r = await signUp({ email: address, password, name: name.trim() });
        // The project requires email confirmation, so the account exists but is
        // not usable yet. Saying so is the whole point -- closing the dialog
        // here would look like a successful sign-in that did not happen.
        if (!r.user) {
          setNotice(r.message || "Check your email to confirm the account.");
          return;
        }
      } else {
        await signIn({ email: address, password });
      }
      onClose();
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="authmodal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="authmodal__panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="authmodal-title"
      >
        <button
          type="button"
          className="authmodal__x"
          onClick={onClose}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {notice ? (
          /* The confirmation state replaces the form rather than sitting above
             it. Leaving the fields on screen invites a second submit that would
             fail as "already registered". */
          <div className="authmodal__done">
            <h2 className="authmodal__title" id="authmodal-title">
              Check your email
            </h2>
            <p className="authmodal__sub">{notice}</p>
            <button type="button" className="authmodal__submit" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="authmodal__title" id="authmodal-title">
              {signup ? "Make something forkable" : "Welcome back"}
            </h2>
            <p className="authmodal__sub">
              {signup
                ? "New accounts start with 250 credits."
                : "Pick up where your lineage left off."}
            </p>

            <form className="authmodal__form" onSubmit={submit} noValidate>
              {signup && (
                <>
                  <label className="authmodal__label" htmlFor="authmodal-name">
                    Name <span className="authmodal__opt">optional</span>
                  </label>
                  <input
                    id="authmodal-name"
                    ref={signup ? firstRef : undefined}
                    className="authmodal__input"
                    type="text"
                    value={name}
                    placeholder="How forks should credit you"
                    autoComplete="name"
                    onChange={(e) => setName(e.target.value)}
                  />
                </>
              )}

              <label className="authmodal__label" htmlFor="authmodal-email">
                Email
              </label>
              <input
                id="authmodal-email"
                ref={signup ? undefined : firstRef}
                className="authmodal__input"
                type="email"
                value={email}
                placeholder="you@studio.com"
                autoComplete="email"
                aria-invalid={error ? "true" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
              />

              <label className="authmodal__label" htmlFor="authmodal-password">
                Password
              </label>
              <input
                id="authmodal-password"
                className="authmodal__input"
                type="password"
                value={password}
                placeholder={signup ? `At least ${MIN_PASSWORD} characters` : "••••••••"}
                autoComplete={signup ? "new-password" : "current-password"}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? "authmodal-error" : undefined}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
              />

              {error && (
                <p className="authmodal__error" id="authmodal-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="authmodal__submit" disabled={busy}>
                {busy ? (
                  <span className="authmodal__working">
                    <span className="authmodal__spinner" aria-hidden="true" />
                    {signup ? "Creating account…" : "Logging in…"}
                  </span>
                ) : signup ? (
                  "Create account"
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            <p className="authmodal__fine">
              Google, Apple and Microsoft sign-in are not enabled on this project
              yet — email and password is the only working path.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
