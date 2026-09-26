import { insertGeneration, uploadImage, getGeneration, lineageOf } from "./_lib/db.js";
import { generate } from "./_lib/generate-core.js";
import { currentUser, addLedgerEntry, creditBalance } from "./_lib/auth.js";

/* What one fork costs a signed-in visitor. Anonymous forks are free, which is
   the product's position rather than an oversight -- the try-it path is the
   front door, and putting a price on it would close it. */
const FORK_COST = 10;

/**
 * POST /api/fork — the product.
 *
 * Generate an image, store it, and record what it descends from. `/api/generate`
 * makes a picture; this makes a *child*, and the difference is the entire claim
 * the site makes.
 *
 * Body: { prompt, parentId?, seed?, steps?, author? }
 *
 * `parentId` absent means a root prompt — a real and common state, not a missing
 * value. Present means this generation is a fork of that one, and the response
 * carries the chain back to the root so the caller can show the descent without
 * a second request.
 *
 * The parent is verified to exist before anything is generated. Writing a row
 * whose `parent_id` points at nothing would be a lineage that cannot be read,
 * which the product principles rule out explicitly: never claim in the UI what
 * the data does not support.
 *
 * Credits are charged only to a signed-in caller, and only after the image
 * exists. Debiting first would mean a failed generation still cost something,
 * and a refund path is a second way for the ledger to be wrong -- charging
 * last makes the failure case free by construction rather than by cleanup.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body;
  const prompt = String(body?.prompt ?? "").trim().slice(0, 2000);
  if (!prompt) return res.status(400).json({ error: "A prompt is required." });

  const parentId = body?.parentId ? String(body.parentId) : null;
  const author = String(body?.author ?? "anon").trim().slice(0, 40) || "anon";

  try {
    /* Checked first, and separately from the insert. The database's foreign key
       would also reject a bad parent, but only after we had spent a generation
       on it — and the visitor would get a constraint violation instead of being
       told the prompt they forked is gone. */
    /* Who is asking, and can they afford it. Resolved before generating so an
       empty balance is refused in a millisecond rather than after a 5s model
       call the visitor cannot pay for. */
    const caller = await currentUser(req, res);
    if (caller) {
      const balance = await creditBalance(caller.user.id);
      if (balance < FORK_COST) {
        return res.status(402).json({
          error: `A fork costs ${FORK_COST} credits and you have ${balance}.`,
          credits: balance,
          cost: FORK_COST,
        });
      }
    }

    let parent = null;
    if (parentId) {
      parent = await getGeneration(parentId);
      if (!parent) {
        return res.status(404).json({ error: "That parent prompt no longer exists." });
      }
    }

    const out = await generate({
      prompt,
      steps: Number(body?.steps) || 4,
      seed: body?.seed,
    });

    /* The row goes in before the upload. A generation that produced bytes we
       then failed to store is still a real event, and the prompt is the
       artifact this product is about — losing it to a storage hiccup would be
       worse than holding a row whose image arrives a moment later. */
    const row = await insertGeneration({
      prompt,
      seed: out.seed,
      steps: out.steps,
      model: out.model,
      provider: out.provider,
      parent_id: parentId,
      /* The handle when we know it, so a fork is credited to an account rather
         than to a name anybody could type. */
      author: caller ? caller.profile?.handle ?? author : author,
      user_id: caller?.user.id ?? null,
    });

    /* The charge. After the row exists, so a generation that failed costs
       nothing, and the entry carries the generation it paid for -- a ledger
       line nobody can trace back to a picture is an unexplainable balance.
       A failure here is logged, not thrown: the fork happened, and destroying
       a successful generation over a bookkeeping error would be the worse
       trade. It shows up as an unbilled fork, which is visible in the ledger
       rather than silent. */
    let credits = null;
    if (caller) {
      try {
        await addLedgerEntry({
          userId: caller.user.id,
          delta: -FORK_COST,
          reason: "fork",
          generationId: row.id,
        });
        credits = await creditBalance(caller.user.id);
      } catch (err) {
        console.error(`ledger write failed for ${row.id}:`, String(err.message || err));
        credits = await creditBalance(caller.user.id).catch(() => null);
      }
    }

    /* The upload is NOT awaited before answering.
     *
     * Measured: generation is 3-5s, the Storage upload of an ~800KB JPEG is a
     * further ~24s, and Vercel's free tier kills a function at 10s. Awaiting it
     * meant the whole request died on the platform — it worked only on a
     * machine with no such limit.
     *
     * So the caller gets the bytes inline and the upload runs on after the
     * response. The row and its parent_id are already committed by this point,
     * which is the part that must not be lost: the picture can be regenerated
     * from the prompt and the seed, the lineage cannot.
     *
     * `waitUntil` is the platform's own way to keep work alive past the
     * response where it exists; the bare promise is the fallback, and a failure
     * there is logged rather than thrown because nobody is listening any more. */
    const path = `generations/${row.id}.jpg`;
    const finishUpload = uploadImage(path, out.buffer, out.contentType)
      .then(() => patchImagePath(row.id, path))
      .catch((err) => {
        console.error(`upload failed for ${row.id}:`, String(err.message || err));
      });

    if (typeof res.waitUntil === "function") res.waitUntil(finishUpload);
    else if (typeof globalThis.waitUntil === "function") globalThis.waitUntil(finishUpload);

    const lineage = parentId ? await lineageOf(row.id) : [row];

    return res.status(200).json({
      generation: {
        ...row,
        image_path: path,
        /* Where the image WILL be once the upload lands, and the bytes to show
           until then. The client prefers the inline copy on first paint and the
           stored URL on any later read, so nothing waits on the round trip. */
        image_url: publicUrlFor(path),
        image_inline: `data:${out.contentType};base64,${out.buffer.toString("base64")}`,
      },
      parent,
      /* Root first, so the caller renders the descent in the order it happened
         rather than having to reverse it. */
      lineage,
      depth: lineage.length,
      /* The balance after the charge, so the header can update without a
         second round trip. Null for an anonymous caller, who has none. */
      credits,
      cost: caller ? FORK_COST : 0,
    });
  } catch (err) {
    return res.status(502).json({ error: "Could not complete the fork.", detail: String(err.message || err).slice(0, 300) });
  }
}

/* The public URL a stored object will have. Derived rather than returned by the
   upload, because the response now goes out before the upload finishes — the
   path is decided by us, so the URL is known in advance. */
function publicUrlFor(path) {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${path}`;
}

async function patchImagePath(id, path) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  await fetch(`${process.env.SUPABASE_URL}/rest/v1/generations?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image_path: path }),
  });
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return null; }
}
