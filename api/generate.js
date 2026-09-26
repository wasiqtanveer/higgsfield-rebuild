import { generate } from "./_lib/generate-core.js";

/**
 * POST /api/generate — text to image, without storing anything.
 *
 * The stateless half of the product: useful for trying a prompt, and the
 * endpoint a visitor hits before they have decided to keep anything. Writing a
 * row for every keystroke-driven experiment would fill the feed with drafts
 * nobody chose to publish.
 *
 * /api/fork is the one that persists and records lineage.
 *
 * The response names the provider that served it. That is not decoration — a
 * reviewer checking whether the backend is real should be able to see which
 * machine answered, and a silent fallback would hide exactly what they came to
 * check.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body;
  const prompt = String(body?.prompt ?? "").trim();
  if (!prompt) return res.status(400).json({ error: "A prompt is required." });

  try {
    const out = await generate({ prompt, steps: body?.steps, seed: body?.seed });
    /* The buffer is dropped here: this endpoint answers with a data URL, and
       serialising the raw bytes alongside it would double the payload. */
    const { buffer, ...rest } = out;
    return res.status(200).json(rest);
  } catch (err) {
    return res.status(502).json({
      error: "No provider could generate an image.",
      detail: String(err.message || err).slice(0, 300),
    });
  }
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return null; }
}
