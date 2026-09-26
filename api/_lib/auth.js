/**
 * Supabase Auth (GoTrue), over its REST API with plain fetch.
 *
 * Same posture as db.js, and for the same reason: the browser never talks to
 * Supabase. A React app holding an anon key and calling `supabase.auth` is a
 * BaaS passthrough, and it puts the session in localStorage where any script on
 * the page can read it.
 *
 * Here the browser only ever talks to /api. The access token lives in an
 * httpOnly cookie, so JavaScript cannot read it — which is the whole point, and
 * the reason this file exists rather than a two-line supabase-js call.
 */

const URL_ = () => must("SUPABASE_URL");
const KEY = () => must("SUPABASE_SERVICE_ROLE_KEY");

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}

function headers(extra = {}) {
  return { apikey: KEY(), "Content-Type": "application/json", ...extra };
}

/* --- cookies -------------------------------------------------------------
 * Two cookies, both httpOnly. The access token is short-lived and is what every
 * authenticated request carries; the refresh token outlives it and exists only
 * to mint a new one.
 *
 * SameSite=Lax rather than Strict: Strict would drop the cookie on any
 * navigation that arrives from another origin, which breaks an email
 * confirmation link — the one flow that is guaranteed to arrive that way.
 */
const ACCESS = "gr_at";
const REFRESH = "gr_rt";

function cookie(name, value, maxAge) {
  const bits = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  // Vercel terminates TLS, so Secure is correct in production and would make
  // the cookie undeliverable over plain http on localhost.
  if (process.env.NODE_ENV === "production") bits.push("Secure");
  return bits.join("; ");
}

export function setSessionCookies(res, session) {
  res.setHeader("Set-Cookie", [
    cookie(ACCESS, session.access_token, session.expires_in ?? 3600),
    cookie(REFRESH, session.refresh_token, 60 * 60 * 24 * 30),
  ]);
}

export function clearSessionCookies(res) {
  res.setHeader("Set-Cookie", [cookie(ACCESS, "", 0), cookie(REFRESH, "", 0)]);
}

/** Parse a Cookie header. Vercel populates req.cookies; the dev server does not. */
export function readCookies(req) {
  if (req.cookies) return req.cookies;
  const raw = req.headers?.cookie;
  if (!raw) return {};
  return Object.fromEntries(
    raw.split(";").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), decodeURIComponent(p.slice(i + 1))];
    })
  );
}

/* --- GoTrue --------------------------------------------------------------- */

async function gotrue(path, init) {
  const r = await fetch(`${URL_()}/auth/v1${path}`, init);
  const text = await r.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { message: text.slice(0, 300) };
  }
  return { ok: r.ok, status: r.status, body };
}

/**
 * Create an account.
 *
 * Returns `{ session: null }` when the project requires email confirmation,
 * which is not an error and must not be reported as one — the account exists,
 * it simply is not usable until the link is clicked. Callers have to tell the
 * user that rather than silently failing or pretending they are signed in.
 */
export async function signUp({ email, password, name }) {
  const { ok, status, body } = await gotrue("/signup", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, password, data: name ? { name } : undefined }),
  });

  if (!ok) throw httpError(status, body);

  // A confirmed-on-signup project returns a session; an unconfirmed one returns
  // the user with no tokens.
  return body.access_token
    ? { session: body, user: body.user ?? null, needsConfirmation: false }
    : { session: null, user: body.user ?? body, needsConfirmation: true };
}

export async function signInWithPassword({ email, password }) {
  const { ok, status, body } = await gotrue("/token?grant_type=password", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  if (!ok) throw httpError(status, body);
  return { session: body, user: body.user ?? null };
}

/** Exchange a refresh token for a fresh access token. */
export async function refresh(refreshToken) {
  const { ok, body } = await gotrue("/token?grant_type=refresh_token", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return ok && body.access_token ? body : null;
}

/** The user behind an access token, or null if it is expired or forged. */
export async function userFromToken(accessToken) {
  if (!accessToken) return null;
  const { ok, body } = await gotrue("/user", {
    headers: headers({ Authorization: `Bearer ${accessToken}` }),
  });
  return ok ? body : null;
}

export async function signOutToken(accessToken) {
  if (!accessToken) return;
  // Best-effort: the cookies are cleared regardless, so a failure here cannot
  // leave the browser believing it is still signed in.
  await gotrue("/logout", {
    method: "POST",
    headers: headers({ Authorization: `Bearer ${accessToken}` }),
  }).catch(() => {});
}

/**
 * Hydrate a user we already hold: fetch the profile row and sum the ledger.
 *
 * Split out from currentUser because a just-issued session has no cookie on
 * the *request* -- it is on the response we are still writing. Reading it back
 * from `req` there would always miss, which is exactly the bug that made login
 * set its cookies and then answer `{ user: null }`.
 */
export async function hydrate(user) {
  if (!user) return null;
  const [profile, credits] = await Promise.all([
    getProfile(user.id),
    creditBalance(user.id),
  ]);
  return { user, profile, credits };
}

/**
 * Resolve the caller, refreshing the access token when it has expired.
 *
 * Returns `{ user, profile, credits }` or null. Every protected endpoint goes
 * through here, so the refresh is handled once rather than in each handler.
 */
export async function currentUser(req, res) {
  const jar = readCookies(req);
  let token = jar[ACCESS];
  let user = await userFromToken(token);

  if (!user && jar[REFRESH]) {
    const session = await refresh(jar[REFRESH]);
    if (session) {
      setSessionCookies(res, session);
      token = session.access_token;
      user = session.user ?? (await userFromToken(token));
    }
  }

  return hydrate(user);
}

/* --- profile and ledger ---------------------------------------------------
 * These read through PostgREST with the secret key, exactly as db.js does. */

function restHeaders(extra = {}) {
  const k = KEY();
  return { apikey: k, Authorization: `Bearer ${k}`, ...extra };
}

export async function getProfile(userId) {
  const r = await fetch(
    `${URL_()}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=*`,
    { headers: restHeaders() }
  );
  if (!r.ok) return null;
  const [row] = await r.json();
  return row ?? null;
}

/**
 * Sum the ledger.
 *
 * The balance is derived on every read rather than cached, because a cached
 * balance is a second source of truth that can disagree with its own entries.
 */
export async function creditBalance(userId) {
  const r = await fetch(
    `${URL_()}/rest/v1/credit_ledger?user_id=eq.${encodeURIComponent(userId)}&select=delta`,
    { headers: restHeaders() }
  );
  if (!r.ok) return 0;
  const rows = await r.json();
  return rows.reduce((n, row) => n + row.delta, 0);
}

/** Append one entry. Never updates: the ledger only ever grows. */
export async function addLedgerEntry({ userId, delta, reason, generationId = null }) {
  const r = await fetch(`${URL_()}/rest/v1/credit_ledger`, {
    method: "POST",
    headers: restHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify({
      user_id: userId,
      delta,
      reason,
      generation_id: generationId,
    }),
  });
  if (!r.ok) {
    throw new Error(`ledger write failed ${r.status}: ${(await r.text()).slice(0, 200)}`);
  }
  const [saved] = await r.json();
  return saved;
}

/* --- shaping --------------------------------------------------------------- */

function httpError(status, body) {
  const err = new Error(
    body?.msg || body?.error_description || body?.message || `auth failed (${status})`
  );
  err.status = status;
  return err;
}

/**
 * What the browser is allowed to know about the signed-in user.
 *
 * Explicitly constructed rather than spreading the GoTrue user: that object
 * carries provider tokens, confirmation state and raw metadata, and spreading
 * it would leak whatever Supabase adds to it next.
 */
export function publicUser({ user, profile, credits }) {
  const email = profile?.email ?? user.email ?? "";
  const name = profile?.name || email.split("@")[0] || "Creator";
  return {
    id: user.id,
    email,
    name,
    handle: profile?.handle ? `@${profile.handle}` : "",
    initials:
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("") || "C",
    credits,
    since: profile?.created_at ?? user.created_at ?? null,
  };
}
