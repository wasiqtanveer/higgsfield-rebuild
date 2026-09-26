import { currentUser } from "./_lib/auth.js";

/**
 * GET /api/library — the signed-in visitor's own generations.
 *
 * Separate from /api/feed rather than a `?mine=1` flag on it. The feed is
 * public and deliberately unauthenticated — the product's claim is that prompts
 * are public — and bolting a private mode onto a public endpoint is how a feed
 * accidentally starts leaking one person's rows to another.
 *
 * The user is resolved from the session cookie, never from a query parameter.
 * `?user=<id>` would let anyone read anyone's library by guessing a uuid.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Use GET." });
  }

  try {
    const caller = await currentUser(req, res);
    // 200 with an empty body rather than 401: being signed out is a normal
    // state for this page, not an error it should report as one.
    if (!caller) {
      return res.status(200).json({ user: null, generations: [], count: 0 });
    }

    const base = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const limit = Math.min(Number(req.query?.limit) || 48, 100);

    const r = await fetch(
      `${base}/rest/v1/generations?user_id=eq.${encodeURIComponent(caller.user.id)}` +
        `&select=*&order=created_at.desc&limit=${limit}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!r.ok) throw new Error(`read failed ${r.status}`);

    const rows = await r.json();
    const withUrl = rows.map((row) => ({
      ...row,
      image_url: row.image_path
        ? `${base}/storage/v1/object/public/${row.image_path}`
        : null,
    }));

    return res.status(200).json({
      user: { id: caller.user.id, credits: caller.credits },
      generations: withUrl,
      count: withUrl.length,
      /* Counted server-side: the client cannot derive "how many of mine were
         forked by other people" from its own rows alone. */
      forked: withUrl.filter((g) => g.parent_id).length,
    });
  } catch (err) {
    return res.status(502).json({
      error: "Could not read your library.",
      detail: String(err.message || err).slice(0, 300),
    });
  }
}
