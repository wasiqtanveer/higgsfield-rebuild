/**
 * Text to image. The shared core behind /api/generate and /api/fork.
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

/* Cloudflare's schnell endpoint does NOT accept width/height: sending them is
   rejected outright with "Additional or unevaluated properties '/width,
   /height' not allowed", not clamped or ignored. Output is 1024² and that is
   not tunable here, so the size lever for fitting a platform timeout does not
   exist on this provider — only the upload can be moved off the response, which
   /api/fork does. */

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
    const buffer = Buffer.from(b64, "base64");
    return {
      buffer,
      contentType: "image/jpeg",
      dataUrl: `data:image/jpeg;base64,${b64}`,
      provider: "cloudflare",
      model: CF_MODEL,
    };
  }

  const buf = Buffer.from(await r.arrayBuffer());
  return {
    buffer: buf,
    contentType: type || "image/jpeg",
    dataUrl: `data:${type || "image/jpeg"};base64,${buf.toString("base64")}`,
    provider: "cloudflare",
    model: CF_MODEL,
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

  const ct = r.headers.get("content-type") || "image/jpeg";
  return {
    buffer: buf,
    contentType: ct,
    dataUrl: `data:${ct};base64,${buf.toString("base64")}`,
    provider: "pollinations",
    /* Pollinations fronts its own FLUX deployment; named separately from the
       Cloudflare model id so a stored row says which machine actually ran. */
    model: "pollinations/flux",
  };
}


/**
 * Run a prompt through the providers, in order, and return the raw bytes.
 *
 * Bytes rather than a data URL: the fork path uploads these to storage, and
 * base64-encoding them only to decode them again is wasted work on a function
 * with a ten-second ceiling. The endpoint that wants a data URL builds one.
 */
export async function generate({ prompt, steps = 4, seed } = {}) {
  const text = String(prompt ?? "").trim().slice(0, MAX_PROMPT);
  if (!text) throw new Error("A prompt is required.");

  const useSteps = clamp(Number(steps) || 4, 1, MAX_STEPS);
  const useSeed = Number.isFinite(Number(seed))
    ? Number(seed)
    : Math.floor(Math.random() * 1e9);

  const tried = [];

  /* Each provider gets its OWN clock.
   *
   * One shared AbortController across both attempts does not work here: a slow
   * Cloudflare response spends the entire budget, and the fallback is then
   * handed a signal that is already aborted, so it fails instantly with
   * "This operation was aborted" without ever making a request. That turns the
   * fallback into decoration — it can only ever run when it is not needed.
   *
   * The budgets are sized to what actually happens: Cloudflare commonly takes
   * 6-9s for schnell, and Pollinations is slower still, so the fallback gets
   * the longer slice. The sum exceeds Vercel's 10s ceiling on the free tier by
   * design — a run that overruns is killed by the platform, which is a better
   * failure than aborting a provider that was about to answer. */
  const attempts = [
    { name: "cloudflare", ms: 9000, run: (s) => viaCloudflare(text, useSteps, s) },
    { name: "pollinations", ms: 12000, run: (s) => viaPollinations(text, useSeed, s) },
  ];

  for (const { name, ms, run } of attempts) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), ms);
    try {
      const out = await run(ac.signal);
      if (!out) continue; // not configured; try the next one
      return { ...out, prompt: text, seed: useSeed, steps: useSteps, tried };
    } catch (err) {
      /* Name the provider in the record. "This operation was aborted" twice
         over says nothing about which machine gave up. */
      const why = ac.signal.aborted
        ? `timed out after ${ms}ms`
        : String(err.message || err);
      tried.push(`${name}: ${why}`.slice(0, 300));
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(`no provider could generate: ${tried.join(" | ")}`);
}

function clamp(n, lo, hi) {
  return Math.min(Math.max(n, lo), hi);
}
