# Graft — what's left

Written for: the next agent picking this up. Read this before touching anything.

---

## The situation

This is an assignment for **8x**. The original brief was "clone higgsfield.ai
in 24 hours" and that was submitted. 8x then **changed the brief** and asked for
a resubmission:

> 1. An interface you designed yourself. Keep your idea and your backend, and
>    rebuild the frontend with your own layout and visual design. **The backend
>    has to be real and connected: a working database and API, not mock data or
>    hardcoded responses.**
> 2. A one-minute intro video. Something about yourself that isn't on your CV.
>    Loom or Google Drive with link sharing on.

> Use the product as your reference, not your blueprint. A pixel-for-pixel copy
> tells us very little. Show us what you would change, what you would cut and
> how you would make it better to use.

**The deadline was end of Saturday 26 September 2026 and has passed.** Confirm
the current status with the user before assuming there is still time.

---

## The product

**Graft.** The claim: *the prompt is the artifact, not the image.*

Every image carries the prompt that made it. Prompts form a tree — open any
public image, change one line, run it again, and your version becomes a child
whose diff against its parent is visible. Higgsfield shows finished output and
hides the prompt; lineage is the feature the category does not have.

**Name:** Graft. Mark: two strokes merging into one.

---

## Rules that are not negotiable

These were each decided for a reason and reversing one silently will cost the
submission.

### 1. Nothing claims a capability that does not exist

The brief bans mock data and hardcoded responses, and it is the one requirement
that cannot be faked. Consequences already baked in:

- **No prices, no plans, no currency anywhere.** Graft cannot charge anyone.
  `/pricing` was deleted and replaced by `/credits`.
- **No video, no audio, no face swap.** No free provider does these honestly.
- `src/data/modelspec.js`, `credits.js` and `graftmcp.js` each open with a
  sourcing rule. **Read it before editing those files.** Every number in them
  is a published architectural fact or a cost Graft itself sets. Anything that
  cannot honestly be a number is an ordinal instead.
- The MCP tool list *is* the server's contract: each entry names the handler
  backing it, so a tool cannot be advertised without existing.

### 2. c01, c02 and c03 must never appear on the site

They are **Higgsfield's own marketing banners**, carrying the Higgsfield
wordmark and a "Higgsfield + Gemini Omni" lockup. A competitor's branding
cannot ship on this product. `c08` is byte-identical to `c11`.

Usable stills: **c04, c05, c06, c07, c09, c10, c11, c12**. Wall thumbnails are
pre-scaled in `public/media/thumb/`.

### 3. There is no honest lineage in the media library

No two images are variations of one prompt. The hero therefore shows **five
separate works that rotate**, never a staged "fork chain". Presenting unrelated
photographs as forks asserts something the images visibly contradict, in front
of the one audience hired to notice. The lineage claim gets delivered for real
on the routes that will have the data.

### 4. The design system is documented — extend it, don't fork it

`DESIGN.md` is the authority. Highlights that get broken most often:

- Cool near-black ground `#08090c`, one neon orange accent `#ff5c1a`.
- **White on the accent fails contrast (~3.1:1).** Filled accent controls carry
  near-black ink (`--c-text-on-accent`). Orange type on dark uses
  `--c-accent-text`.
- The accent marks the primary action and the lineage thread. Nothing else.
- Exactly **one Instrument Serif italic word per headline**, at `1.1em`.
- **No kicker or eyebrow above a heading.** Banned outright.
- `Arrive` owns section-level motion. Do not give a band its own transform,
  filter or opacity — it multiplies with `Arrive`'s.
- Every colour, space, radius, type step and easing resolves to a variable in
  `src/styles/tokens.css`. No hardcoded hex outside that file.
- Honour `prefers-reduced-motion` in both CSS and the JS that arms the motion.

Run the detector after UI edits:

```
.claude/skills/impeccable/scripts/impeccable.cmd detect --json <files>
```

### 5. Namespace every new CSS class

This has caused **four** real bugs. The clone's components shared one global
namespace, and a generic class name silently loses to theirs by import order:

- `.composer` — made the hero's Generate button enormous
- `<img height="400">` — beat `aspect-ratio`, overflowed the hero
- `.wall` — `width: 100%` pinned a scrim, caused a bright leak down the page edge
- `.hero` / `.pricing` / `.mcpp` — all previously taken

The clone is now deleted so the hazard is much reduced, but keep prefixing
(`.cr__`, `.gm__`, `.pwall__`, `.hdr__`).

---

## What is built and working

Verified: `npm run build` passes, `npm run smoke` renders all 10 routes.

| Route | State |
|---|---|
| `/` | **Done.** Hero + sections by another agent. |
| `/credits` | **Done.** Replaces `/pricing`. |
| `/mcp` | **Done.** Real server contract. |
| `/create` `/explore` `/lineage` `/library` `/models` `/about` | `Soon` page — honest placeholder |
| `/pricing` `/api` `/landing` `/video` `/audio` | Redirect to what replaced them |
| `*` | `Soon` page, **not** the feed |

**The clone is purged.** 44 components → 12, 10 pages → 4, 18 data files → 7.
Legacy alias tokens removed. Two commits: `71abd25` (pages) and `81b2190`
(purge) — both reversible.

**Hero:** three columns over a tilted marquee of Graft's own output. Word-by-word
masked headline, rotating generation frame (click / dots / hover-pause), model
chips in orbit, oversized wordmark as ground. Measured 60fps idle.

**Backend started:** `api/generate.js` exists — Cloudflare Workers AI
(FLUX-1-schnell) with a keyless Pollinations fallback, and the response reports
which provider served it. `.env.example` and `vercel.json` are in place.

---

## What is left, in priority order

### 1. The backend — this is the whole grade

Nothing else matters as much. `api/generate.js` is a start; the rest is unbuilt.

**Blocked on credentials the user must create.** Ask for them explicitly:

- **Supabase**: project URL, **service-role** key, connection string
  (Settings → Database). Free tier.
- **Cloudflare**: account ID + API token with `Workers AI: Read`. Free tier.

If Cloudflare is a problem, **Pollinations needs no key** — slower and lower
quality, but legitimate, and `api/generate.js` already falls back to it. Supabase
is not optional: "a working database" is the requirement.

**Architecture already decided:**

- Vercel serverless functions in `/api` — **hand-written route handlers**.
- Supabase is Postgres + Storage **reached only server-side with the
  service-role key**. The browser must never touch it. A React app calling
  `supabase.from(...)` directly is a BaaS passthrough, not a backend, and a
  reviewer looking for "a working database and API" will see that.
- Own auth: PBKDF2 + httpOnly cookie + `sessions` table.
- Keep React + Vite. Do **not** migrate to Next.js.

**Schema:**

```
users, sessions, models
prompts        -- parent_prompt_id self-reference, root_id, depth
generations    -- status, image path, seed, provider, timings, errors
credit_ledger  -- APPEND-ONLY. Balance is derived, never stored.
likes, styles
```

**The ledger is the part `/credits` already promises publicly**, so it must
behave exactly as that page says:

1. Nothing is ever edited — a correction is an opposite row.
2. Balance is derived by summing rows on read, never stored in a counter.
3. The ledger row and the generation commit in the **same transaction**.
4. Insufficient credits is refused **server-side before any provider call**, as
   an ordinary answer with a clear reason.

**Unit costs `/credits` states:** FLUX 1, PixArt 2, SDXL 3, SD3 4.
**Grants:** 20 without an account, 120 with one.

**Five MCP handlers `/mcp` promises**, defined in `src/data/graftmcp.js`:

| Tool | Handler |
|---|---|
| `graft_search_prompts` | `api/mcp/search.js` |
| `graft_get_lineage` | `api/mcp/lineage.js` |
| `graft_fork_prompt` | `api/mcp/fork.js` |
| `graft_generate` | `api/mcp/generate.js` |
| `graft_get_balance` | `api/mcp/balance.js` |

### 2. `/create` and `/explore`

The two routes the product actually needs, currently `Soon` pages.

- **`/create`** — the composer. Prompt in, generation out, credits debited.
  Should accept `?prompt=` and `?from=remix` (the hero and nav already link
  with those).
- **`/explore`** — the feed, and where **lineage gets shown for real**: prompts
  with their children, the diff at each step, a Remix button that loads a parent
  into the composer.

### 3. `/video` and `/audio` — decide, don't build

Currently redirects to `/`. **There is no free provider that does these
honestly**, so they cannot be real the way `/credits` and `/mcp` are. The user
asked to "make up the audio video stuff" — raise the options rather than
inventing capability:

- a designed `Soon` surface saying what they would be, or
- cut them from the nav entirely and say so in the README as a product decision.

Building a fake video studio would break rule 1 on the most visible surface.

### 4. Polish and ship

- **`/credits` styling** — the user said the pricing tab "isn't styled well".
  It has been rebuilt as `/credits` and is on-theme, but **get their eyes on it**;
  they may still want changes.
- **Per-route `<title>` and meta.** Missing everywhere.
- **README rewrite.** Must state what was cut and why — that is the "show us
  what you would change" part of the brief, and it is currently a clone's README.
- **Rename the GitHub repo.** Still `higgsfield-rebuild`, which now misdescribes
  it. Old URLs auto-redirect so the earlier submission link will not break.
- **The 1-minute intro video.** Nothing technical blocks it and it is the
  cheapest point in the whole submission. Check whether it has been recorded.

---

## Practical notes

- **Dev server serves stale CSS.** This has wasted two debugging rounds — a file
  was correct on disk and the browser showed something else. If a change seems
  not to apply, **restart the server before debugging the code.**
- **Playwright is installed but its browser is not.** Launch with the system
  Chrome instead:
  ```js
  chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
  ```
  Scripts in `.shots/` already do this — `shot.mjs` (screenshot + measure),
  `perf.mjs` (frame timings), `edges.mjs` (edge luminance).
- **Measure, don't assert.** Claims about framerate and contrast in this repo
  were measured. Keep doing that; "it looks smooth" has been wrong here twice.
- **Ask before deciding for the user.** Several calls in this project (drop the
  pricing page, don't stage a fake lineage) were put to them explicitly. When
  honesty and completeness conflict, raise it rather than picking quietly.
