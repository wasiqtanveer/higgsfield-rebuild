# Product

Graft — a generative image tool where the prompt, not the image, is the artifact.

## Platform

web

## Stack

React 18 + Vite 5, react-router-dom 6, plain per-file CSS with a token layer
(`src/styles/tokens.css`). No CSS framework, no component library, no motion
library. Planned backend: Vercel serverless functions under `/api` (hand-written
route handlers), Supabase Postgres + Storage reached only server-side with the
service-role key, Cloudflare Workers AI (FLUX-1-schnell) for inference with
Pollinations as a keyless fallback, own PBKDF2 + httpOnly-cookie sessions.

## Users

Two audiences, in this order:

1. **An 8x reviewer** grading an assignment on design taste, product judgement,
   and whether the backend is genuinely real. They arrive signed-out, spend
   seconds, and are explicitly looking for what the candidate *changed* about
   the reference product rather than what they copied.
2. **A person who makes images** and is tired of seeing finished output with the
   prompt hidden — they want to take someone's result and change one line.

## Product Purpose

Make the *history* of a prompt visible and forkable. Open any public image, see
the prompt that produced it and the chain it descends from, change one line, run
it again. Your version becomes a child, and the diff against its parent is
readable.

## Positioning

Higgsfield and its peers show you finished output and hide the prompt. Graft's
claim: **the prompt is the artifact, not the image.** Lineage is the feature the
category does not have.

## Operating Context

Signed-out desktop web is the surface that matters — the reviewer will not sign
up. Mobile must not be broken but is not where the decision happens.

## Capabilities and Constraints

- **Hard deadline: end of Saturday 26 September 2026.** Roughly one day.
- **No paid APIs.** Free tiers only.
- The brief explicitly forbids mock data and hardcoded responses in the backend;
  "real and connected" is the requirement that cannot be faked.
- Backend is at zero. Every hour spent on the frontend is an hour not spent on
  the requirement they said they would check first.
- Legacy Higgsfield-clone code still shares the repo and has already caused two
  real bugs through CSS class collisions.

## Brand Commitments

- Name: **Graft**. Mark: two strokes merging into one.
- The pill navbar in `src/components/Header/` is **approved and frozen** —
  floating pill, scroll-progress ring around the logo, collapsing wordmark, More
  mega-menu, separate auth pill. Do not redesign it.
- Visual world, approved after two rejected drafts: cool near-black ground
  (`#08090c`), a single neon orange accent (`#ff5c1a`), glass chrome, Space
  Grotesk display / Inter UI / JetBrains Mono data, Instrument Serif italic for
  one word per headline. The first rejected draft was warm paper + Instrument
  Serif — "too classic" for a tool that drives a model. The second was an
  electric indigo accent, replaced because on a cool near-black ground a cool
  accent sits in the ground rather than igniting off it.
  `src/styles/tokens.css` is the source of truth for every value.
- Colour is rationed: the accent marks the primary action and the lineage
  thread, nothing else.

## Evidence on Hand

Media library is `public/media/` — 12 stills with matching mp4s. Audited:

- **c01, c02, c03 are unusable.** They are Higgsfield own marketing banners,
  carrying the Higgsfield wordmark and a "Higgsfield + Gemini Omni" lockup. A
  competitor branding cannot appear on this product.
- **c08 and c11 are byte-identical duplicates** (same MD5), so the usable count
  is nine, not twelve.
- **Every remaining still is an unrelated photograph** - street fashion in
  Chinatown, a car chase, a car interior, a loading bay, an ice scene, a park
  portrait, a giant figure over the Flatiron.
- **The mp4s do not help.** Sampled frames across a clip are motion within one
  shot, identical in framing and treatment - not variations of a prompt.

Consequence: there is **no honest four-step lineage** in the existing assets. A
hero that stages unrelated photographs as forks of one prompt asserts something
the images visibly contradict, in front of the one audience hired to notice.

## Surface decisions

- **`/pricing` is replaced by `/credits`.** The clone's pricing page sold
  Higgsfield's plans, prices and model names — a business Graft has no way to
  operate (no billing, no paid inference, no video models). `/credits` shows the
  real append-only ledger instead: unit costs, the two grants, and the four
  guarantees the implementation enforces. The old path redirects. There is no
  price or currency anywhere on the product.
- **`/mcp` is a real server, not a brochure.** The tool list in
  `src/data/graftmcp.js` is the server's contract: each entry names the handler
  that backs it, so a tool cannot be advertised without existing.

## Product Principles

- Show the prompt, always. Hiding it is the thing being argued against.
- A lineage must stay readable. Order never reshuffles; if a chain cannot be
  read at a glance it has failed at its only job.
- Never claim in the UI what the data does not support.
- Signed-out visitors get a real door, not a signup wall.

## Accessibility & Inclusion

Keyboard operability throughout, visible focus rings, `prefers-reduced-motion`
honoured for every authored motion, text contrast at 4.5:1 on the dark ground
(orange-on-black uses the lightened `--c-accent-text` cut, which clears 4.5:1;
a *filled* accent button carries near-black ink, because white on `#ff5c1a`
sits at about 3.1:1 and fails).
