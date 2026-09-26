/**
 * Does /api/generate actually produce an image with the credentials on this
 * machine? Runs the handler directly, so the answer is about the endpoint and
 * the keys rather than about a dev server that does not serve /api.
 *
 * Prints which provider served and how many bytes came back. Never prints a
 * key or the image itself.
 */
import { readFileSync } from "node:fs";
import handler from "../api/generate.js";

// Load .env into process.env without echoing any value.
try {
  for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  console.log("no .env found — testing the keyless fallback only");
}

console.log(
  "cloudflare configured:",
  Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN)
);

const res = {
  _status: 200,
  status(s) { this._status = s; return this; },
  setHeader() { return this; },
  json(payload) {
    if (payload.dataUrl) {
      const bytes = Math.round((payload.dataUrl.length * 3) / 4 / 1024);
      console.log(`HTTP ${this._status}`);
      console.log("provider :", payload.provider);
      console.log("seed     :", payload.seed);
      console.log("steps    :", payload.steps);
      console.log("image    :", bytes, "KB");
      console.log("fallbacks:", payload.tried?.length ? payload.tried : "none — first provider served");
    } else {
      console.log(`HTTP ${this._status}`, JSON.stringify(payload, null, 1));
    }
    return this;
  },
};

await handler(
  { method: "POST", body: { prompt: "an empty tram stop at 6am, sodium light, wet asphalt", steps: 4, seed: 12345 } },
  res
);
