# Graft

**The prompt is the artifact, not the image.**

Every image-generation product in this category shows you a finished picture and
throws the recipe away. Graft stores the *prompt* as the thing that matters; the
image is just what it produced this time.

That makes prompts forkable the way code is. Open a generation, change one line,
run it again — and the new image keeps the old one as its parent. Prompts form a
tree you can walk. **Lineage is the feature the category does not have**, and it
is the reason for the name: a graft is a branch joined onto an existing tree.

**Live:** https://higgsfield-rebuild.vercel.app

---

## The brief, and what I did with it

The assignment was to study [higgsfield.ai](https://higgsfield.ai) and build
something of my own — *"use the product as your reference, not your blueprint…
show us what you would change, what you would cut and how you would make it
better to use"* — with a real backend behind it: a working database and API, not
mock data or hardcoded responses.

So this is not a clone. An earlier version of this repo was one; it has been
deleted (44 components down to 14, 18 data files down to 8). What follows is
what I changed and why.

### What I cut, and why

| Cut | Why |
| --- | --- |
| **`/video`, `/audio`, face swap** | No free provider does these honestly. A video studio that cannot make video is the exact thing the brief rules out. They redirect rather than pretend. |
| **`/pricing`** | Graft cannot charge anyone — no billing, no paid inference. A page of plans and prices asserts a business that does not exist. Replaced by `/credits`, which explains the unit costs and the ledger rules instead. **There is no price or currency anywhere on this site.** |
| **The infinite feed as home page** | Higgsfield opens on a wall of output. That sells the images; this product's argument is about prompts, so the home page makes that argument instead. |
| **The model leaderboard** | Replaced by a spec sheet. Every figure in `src/data/modelspec.js` is a published architectural fact, not a vibe ranking. |

### What I added

**Lineage.** Every generation stores a `parent_id`. The composer's **Fork this**
button loads a result's prompt with its seed pinned, so the next image differs
by the words rather than by noise — and the child records what it came from. The
receipt on each result shows its depth in the tree.

That one column is the whole product. Without it this is a gallery, and the
category already has those.

---

## Is the backend real?

Yes, and it is checkable rather than claimed.

- **Images** come from Cloudflare Workers AI (FLUX-1-schnell), with keyless
  Pollinations as a fallback. **The response names which provider served it** —
  a silent fallback would hide exactly the thing a reviewer came to check.
- **Rows** go to Postgres on Supabase, reached only server-side with the
  service-role key. The browser never touches the database: a React app calling
  `supabase.from(...)` directly is a BaaS passthrough, not a backend.
- **Images** are stored in Supabase Storage and served publicly.
- **No mock branch, no canned image, no hardcoded response.** If both providers
  fail, the endpoint returns an error, because a fake success here is the one
  failure the brief says cannot be faked.

### API

| Endpoint | What it does |
| --- | --- |
| `POST /api/generate` | Text to image. Stateless — stores nothing. The try-it path, so experiments do not fill the feed with drafts nobody chose to publish. |
| `POST /api/fork` | **The product.** Generates, stores the row, and records `parent_id`. Costs a signed-in caller 10 credits; anonymous forks are free. Returns the generation, its lineage root first, and the balance after the charge. |
| `GET /api/feed` | Recent generations, newest first. |
| `POST /api/auth` | `signup`, `login`, `logout`. Sets the session cookie. |
| `GET /api/auth` | The current user and credit balance, or `{ user: null }`. |

Hand-written route handlers on Vercel. Supabase is reached over its REST API
with plain `fetch` — `@supabase/supabase-js` is a few hundred kilobytes to do
what four fetch calls do.

### Schema

One table. A generation is a prompt, the image it produced, and the generation
it descends from:

```sql
generations (
  id, prompt, image_path, seed, steps, model, provider,
  parent_id → generations(id) ON DELETE SET NULL,
  author, created_at
)
```

`ON DELETE SET NULL`, never cascade: deleting a parent must orphan its children,
not destroy them. Someone else's fork is their work, and a cascade would let one
deletion take a whole subtree of other people's prompts with it.

Two more tables carry accounts (`db/auth.sql`):

```sql
profiles (id → auth.users(id), email, name, handle, created_at)
credit_ledger (id, user_id → auth.users(id), delta, reason, generation_id, created_at)
```

A fork costs **10 credits** when the caller is signed in and nothing when they
are not — the try-it path is the front door, and pricing it would close it. The
charge lands *after* the image exists, so a generation that failed costs nothing
by construction rather than by a refund path, which would be a second way for
the ledger to be wrong.

The ledger is **append-only** and a balance is `sum(delta)`, never a stored
column: a cached balance is a second source of truth that can disagree with its
own entries, and it throws away the reason a balance moved. The 250-credit
signup grant is written by a trigger on `auth.users` rather than by the API, so
the grant is tied to the account existing.

Row-level security is on with no policy for the anon key, so the browser cannot
reach the table even if that key leaks. Reads are public because the whole claim
is that prompts are public and forkable; writes stay server-side. `credit_ledger`
has no public policy at all — a ledger is nobody's business but its owner's.

### Auth

Supabase Auth, reached server-side over the GoTrue REST API with plain `fetch`,
the same way `db.js` reaches Postgres. The browser never holds a token: the
access and refresh tokens are **httpOnly cookies**, so no script on the page can
read the session, and `src/lib/auth.js` holds only a cached copy of what the
server last said about the user.

That is why there is no `@supabase/supabase-js` and no `VITE_SUPABASE_ANON_KEY`.
A React app calling `supabase.auth` directly would put the session in
localStorage and make the browser a BaaS client, which is the pattern this
backend exists to avoid.

---

## Honest status

The parts a reviewer would reasonably expect that are **not** done:

- **Third-party sign-in is not enabled.** Google, Apple and Microsoft are not
  configured on the Supabase project, so the dialog offers email and password
  only and says so. Enabling them is dashboard work plus redirect URLs, not
  code.
- **Signup requires email confirmation.** The project has `mailer_autoconfirm`
  off, so a new account is created but cannot be used until the emailed link is
  clicked. The dialog reports that state rather than pretending the user is
  signed in.
- **Nothing meters `/api/generate`.** The stateless try-it endpoint is free and
  uncounted by design; only `/api/fork`, which keeps what it makes, costs
  credits.
- **`/explore`, `/lineage`, `/library`, `/models`** are honest placeholder
  pages. Forking works, but today only the person who ran it sees the chain —
  the feed that would make lineage public is designed, not built.
- **Generation latency is unpredictable.** Cloudflare's free tier swings roughly
  1.4–12.7s. The Storage upload was moved off the response path (a fork went
  from ~29s to 7–11s) and `maxDuration` is raised to 60s, but a slow run can
  still feel long.

---

## Running it

```bash
npm install
cp .env.example .env    # then fill it in — see below
npm run dev             # http://localhost:5173
npm run build           # -> dist/
npm run smoke           # server-renders every route, fails if one throws
```

`npm run dev` serves `/api` too: a small Vite middleware mounts the same handler
files Vercel runs, so the composer works locally without deploying.

### Environment

```
CLOUDFLARE_ACCOUNT_ID       # dashboard URL
CLOUDFLARE_API_TOKEN        # My Profile → API Tokens → Workers AI
SUPABASE_URL                # Project Settings → API
SUPABASE_SERVICE_ROLE_KEY   # secret; server-side only
```

None carry Vite's `VITE_` prefix, deliberately: anything so named is inlined
into the browser bundle, which would hand every visitor write access to the
database.

Run both SQL files in the Supabase SQL editor once, in order:

```
db/schema.sql   # generations
db/auth.sql     # profiles, credit_ledger, the signup-grant trigger
```

Without Cloudflare credentials the keyless fallback still answers, so the app
runs. Without Supabase, generation works and nothing is stored.

---

## Design

`DESIGN.md` is the authority. A dark instrument: cool near-black ground
(`#08090c`), one rationed neon orange (`#ff5c1a`), and prompts set in mono
because on this product a prompt is authored data, not a caption.

The accent marks exactly two things — the primary action, and the lineage thread
that is the product's whole idea. Every colour, space, radius, type step and
easing resolves to a variable in `src/styles/tokens.css`.

One consequence worth stating because it decides a rule rather than a value:
white on `#ff5c1a` sits at about 3.1:1, under the 4.5:1 floor. So filled accent
controls carry near-black ink, and orange type on dark uses a lightened cut.

---

## Layout

```
api/            serverless handlers; _lib/ holds the db and provider clients
db/schema.sql   the one table, and the reasoning for each column
src/pages/      one folder per route (jsx + css)
src/components/ shared UI, one folder each
src/data/       content whose numbers are sourced, not invented
src/styles/     design tokens + global reset
```

Each file in `src/data/` opens with a sourcing rule. Every number in them is
either a published architectural fact or a cost Graft itself sets; anything that
cannot honestly be a number is an ordinal instead.
