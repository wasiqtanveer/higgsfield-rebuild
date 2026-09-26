import { recentGenerations, lineageOf, getGeneration } from "./_lib/db.js";

/**
 * GET /api/feed — what has been made, newest first.
 * GET /api/feed?id=<uuid> — one generation and its ancestry, root first.
 *
 * Read-only and public, which is the product's position rather than an
 * oversight: the claim is that prompts are public and forkable, so the feed
 * that proves it cannot sit behind a session.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Use GET." });
  }

  const base = process.env.SUPABASE_URL;
  const withUrl = (r) => ({
    ...r,
    image_url: r.image_path
      ? `${base}/storage/v1/object/public/${r.image_path}`
      : null,
  });

  try {
    const id = req.query?.id;
    if (id) {
      const row = await getGeneration(String(id));
      if (!row) return res.status(404).json({ error: "No such generation." });
      const lineage = await lineageOf(row.id);
      return res.status(200).json({
        generation: withUrl(row),
        lineage: lineage.map(withUrl),
        depth: lineage.length,
      });
    }

    const limit = Math.min(Number(req.query?.limit) || 24, 60);
    const rows = await recentGenerations(limit);
    return res.status(200).json({ generations: rows.map(withUrl), count: rows.length });
  } catch (err) {
    return res.status(502).json({ error: "Could not read the feed.", detail: String(err.message || err).slice(0, 300) });
  }
}
