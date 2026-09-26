import {
  signUp,
  signInWithPassword,
  hydrate,
  userFromToken,
  signOutToken,
  currentUser,
  setSessionCookies,
  clearSessionCookies,
  readCookies,
  publicUser,
} from "./_lib/auth.js";

/**
 * POST /api/auth  — { action: "signup" | "login" | "logout", email, password, name }
 * GET  /api/auth  — the current session, or { user: null }
 *
 * One endpoint rather than four files. These share the same cookie handling and
 * the same shaping of the response, and splitting them would mean four copies
 * of both.
 *
 * Nothing here trusts the client about who it is. The browser sends an email
 * and a password, or it sends a cookie it cannot read; the user is always
 * resolved from Supabase, never from the request body.
 */

/* Matches the client-side check in AuthModal. Duplicated deliberately: the
   client one is for a fast error message, this one is the one that counts,
   because a request can arrive without ever touching that form. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Supabase's own default floor. Stated here so the message names the rule
   rather than passing through a raw provider error. */
const MIN_PASSWORD = 6;

export default async function handler(req, res) {
  try {
    if (req.method === "GET") return await session(req, res);
    if (req.method === "POST") return await act(req, res);

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Use GET or POST." });
  } catch (err) {
    // An auth failure is a 401, not a 500: a wrong password is the endpoint
    // working correctly.
    const status = err.status && err.status < 500 ? err.status : 502;
    return res.status(status).json({ error: String(err.message || err).slice(0, 300) });
  }
}

async function session(req, res) {
  const found = await currentUser(req, res);
  return res.status(200).json({ user: found ? publicUser(found) : null });
}

async function act(req, res) {
  const body = typeof req.body === "string" ? safeParse(req.body) : req.body || {};
  const action = String(body.action || "").toLowerCase();

  if (action === "logout") {
    await signOutToken(readCookies(req)[ "gr_at" ]);
    clearSessionCookies(res);
    return res.status(200).json({ user: null });
  }

  /* Checked before the credentials are looked at, so an unrecognised action
     is reported as one rather than as whatever the empty fields fail first. */
  if (action !== "signup" && action !== "login") {
    return res.status(400).json({ error: "Unknown action." });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!EMAIL.test(email)) {
    return res.status(400).json({ error: "That does not look like an email address." });
  }
  if (password.length < MIN_PASSWORD) {
    return res
      .status(400)
      .json({ error: `Password must be at least ${MIN_PASSWORD} characters.` });
  }

  if (action === "signup") {
    const { session: s, needsConfirmation } = await signUp({
      email,
      password,
      name: String(body.name || "").trim() || undefined,
    });

    // The account exists but cannot be used yet. Reported as a success with a
    // flag rather than an error, because it is one -- and the UI has to say so
    // instead of leaving the user staring at a dialog that did nothing.
    if (needsConfirmation || !s) {
      return res.status(200).json({
        user: null,
        needsConfirmation: true,
        message: "Check your email to confirm the account, then log in.",
      });
    }

    setSessionCookies(res, s);
    const found = await hydrate(s.user ?? (await userFromToken(s.access_token)));
    return res.status(200).json({ user: found ? publicUser(found) : null });
  }

  if (action === "login") {
    const { session: s } = await signInWithPassword({ email, password });
    setSessionCookies(res, s);
    const found = await hydrate(s.user ?? (await userFromToken(s.access_token)));
    return res.status(200).json({ user: found ? publicUser(found) : null });
  }

}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
