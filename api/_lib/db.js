/**
 * Supabase, over its REST API with plain fetch.
 *
 * No client library. `@supabase/supabase-js` is a couple of hundred kilobytes
 * to do what four fetch calls do here, and PRODUCT.md is explicit about keeping
 * the dependency list short.
 *
 * The service-role key bypasses row-level security by design, so it must never
 * leave the server. That is why nothing in this file carries Vite's `VITE_`
 * prefix — anything so named is inlined into the browser bundle, which would
 * hand every visitor write access to the database.
 */

const URL_ = () => must("SUPABASE_URL");
const KEY = () => must("SUPABASE_SERVICE_ROLE_KEY");

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}

function headers(extra = {}) {
  const k = KEY();
  return { apikey: k, Authorization: `Bearer ${k}`, ...extra };
}

/**
 * Insert a generation and return the stored row.
 *
 * `Prefer: return=representation` so the caller gets the database's own view —
 * the generated id, the defaulted timestamp — rather than echoing back what it
 * sent and hoping the two agree.
 */
export async function insertGeneration(row) {
  const r = await fetch(`${URL_()}/rest/v1/generations`, {
    method: "POST",
    headers: headers({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify(row),
  });

  if (!r.ok) {
    throw new Error(`insert failed ${r.status}: ${(await r.text()).slice(0, 300)}`);
  }
  const [saved] = await r.json();
  return saved;
}

/**
 * Upload the image bytes and return the public URL.
 *
 * The bucket is public, so the returned URL is stable and needs no signing —
 * these are published prompts and their published output, and a signed URL
 * that expires would break every link the moment it did.
 */
export async function uploadImage(path, buffer, contentType) {
  const r = await fetch(`${URL_()}/storage/v1/object/${path}`, {
    method: "POST",
    headers: headers({ "Content-Type": contentType, "x-upsert": "true" }),
    body: buffer,
  });

  if (!r.ok) {
    throw new Error(`upload failed ${r.status}: ${(await r.text()).slice(0, 300)}`);
  }
  return `${URL_()}/storage/v1/object/public/${path}`;
}

/** One generation by id, or null. */
export async function getGeneration(id) {
  const r = await fetch(
    `${URL_()}/rest/v1/generations?id=eq.${encodeURIComponent(id)}&select=*`,
    { headers: headers() }
  );
  if (!r.ok) return null;
  const [row] = await r.json();
  return row ?? null;
}

/**
 * A generation's ancestry, root first.
 *
 * Walked one row at a time rather than in a recursive CTE: this runs on a free
 * tier where a stored procedure is another thing to deploy and keep in sync,
 * and a chain deep enough for the round trips to matter is a chain nobody can
 * read anyway. `seen` guards against a cycle that a future write path might
 * introduce — the schema forbids self-parenting, not a longer loop.
 */
export async function lineageOf(id, limit = 24) {
  const chain = [];
  const seen = new Set();
  let cursor = id;

  while (cursor && chain.length < limit && !seen.has(cursor)) {
    seen.add(cursor);
    const row = await getGeneration(cursor);
    if (!row) break;
    chain.unshift(row);
    cursor = row.parent_id;
  }
  return chain;
}

/** The public feed, newest first. */
export async function recentGenerations(limit = 24) {
  const r = await fetch(
    `${URL_()}/rest/v1/generations?select=*&order=created_at.desc&limit=${limit}`,
    { headers: headers() }
  );
  if (!r.ok) return [];
  return r.json();
}
