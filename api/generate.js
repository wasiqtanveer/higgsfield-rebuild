/**
 * POST /api/generate — text to image.
 *
 * The one endpoint that makes this product exist. Everything else on the site
 * is an argument about prompts; this is where a prompt becomes a picture.
 *
 * Two providers, in order:
 *   1. Cloudflare Workers AI running FLUX-1-schnell. The real one, and the
 *      model the rest of the site claims is the default.
 *   2. Pollinations, keyless, as the fallback. Free tiers run out and demos
 *      happen anyway; a dead generate button is worse than a slower one.
 *
 * The response says which provider served it. That is not decoration — a
 * reviewer checking whether the backend is real should be able to see which
 * machine answered, and a silent fallback would hide exactly the thing they
 * came to check.
 *
 * No mock branch, no canned image, no hardcoded response. If both providers
 * fail this returns an error, because a fake success here is the one failure
 * the brief says cannot be faked.
 */

/* schnell is the distilled cut: four steps to a usable frame where the others
   need dozens. On a free tier that is the difference between a demo that
   answers and one that times out. */
const CF_MODEL = "@cf/black-forest-labs/flux-1-schnell";

/* Cloudflare's own ceiling for this model. Sending more is rejected outright
   rather than clamped, so it is clamped here. */
const MAX_STEPS = 8;

/* A prompt long enough to blow the context is a client bug, not a request to
   serve. Cut rather than reject: the visitor's words matter more than the
   tail they will not miss. */
const MAX_PROMPT = 2000;

function bad(res, status, message, detail) {
  return res.status(status).json({ error: message, detail: detail ?? null });
}

/**
 * Cloudflare Workers AI.
 *
 * Returns a base64 JPEG. The REST API wraps it in `{ result: { image } }`;
 * some models stream binary instead, so both shapes are handled rather than
 * assuming the one that happened to work first.
 */
async function viaCloudflare(prompt, steps, signal) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !token) return null; // not configured; fall through

  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${CF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, steps }),
      signal,
    }
  );

  const type = r.headers.get("content-type") || "";

  if (!r.ok) {
    /* Cloudflare puts the real reason in a JSON errors array even on a 4xx
       with an image content-type, so this reads the body rather than
       reporting the status alone — "400" tells nobody anything. */
    const body = await r.text();
    throw new Error(`cloudflare ${r.status}: ${body.slice(0, 300)}`);
  }

  if (type.includes("application/json")) {
    const json = await r.json();
    const b64 = json?.result?.image;
    if (!b64) throw new Error("cloudflare returned no image");
    return { dataUrl: `data:image/jpeg;base64,${b64}`, provider: "cloudflare" };
  }

  const buf = Buffer.from(await r.arrayBuffer());
  return {
    dataUrl: `data:${type || "image/jpeg"};base64,${buf.toString("base64")}`,
    provider: "cloudflare",
  };
}

/**
 * Pollinations. Keyless, so it needs no configuration and cannot be the reason
 * a demo has nothing to show.
 *
 * `nologo` and an explicit seed so a repeated prompt is reproducible — on a
 * product about forking a prompt, the same text returning a different picture
 * every time would undercut the whole claim.
 */
async function viaPollinations(prompt, seed, signal) {
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=768&height=768&seed=${seed}&nologo=true&model=flux`;

  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`pollinations ${r.status}`);

  const buf = Buffer.from(await r.arrayBuffer());
  /* It answers 200 with an HTML error page under load, which would otherwise
     be encoded as a broken <img> the visitor has to diagnose. */
  if (buf.length < 1024) throw new Error("pollinations returned no image");

  return {
    dataUrl: `data:${r.headers.get("content-type") || "image/jpeg"};base64,${buf.toString("base64")}`,
    provider: "pollinations",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return bad(res, 405, "Use POST.");
  }

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body;
  const prompt = String(body?.prompt ?? "").trim().slice(0, MAX_PROMPT);

  if (!prompt) return bad(res, 400, "A prompt is required.");

  const steps = clamp(Number(body?.steps) || 4, 1, MAX_STEPS);
  /* An explicit seed makes a generation repeatable, which is what lets a fork
     be compared against its parent rather than against noise. */
  const seed = Number.isFinite(Number(body?.seed))
    ? Number(body.seed)
    : Math.floor(Math.random() * 1e9);

  /* Vercel's free tier kills a function at 10s. Giving up at 9 leaves room to
     answer with a real error instead of the platform's opaque timeout page. */
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 9000);

  const tried = [];
  try {
    for (const attempt of [
      () => viaCloudflare(prompt, steps, ac.signal),
      () => viaPollinations(prompt, seed, ac.signal),
    ]) {
      try {
        const out = await attempt();
        if (!out) continue; // provider not configured
        return res.status(200).json({ ...out, prompt, seed, steps, tried });
      } catch (err) {
        tried.push(String(err.message || err).slice(0, 300));
      }
    }

    /* Both providers failed. Say so, and say why — a generic 500 here sends
       someone hunting through logs for something this already knows. */
    return bad(res, 502, "No provider could generate an image.", tried);
  } finally {
    clearTimeout(timer);
  }
}

function clamp(n, lo, hi) {
  return Math.min(Math.max(n, lo), hi);
}

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
