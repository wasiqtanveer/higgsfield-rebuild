# Higgsfield — rebuild

A rebuild of [higgsfield.ai](https://higgsfield.ai): the feed, the generation
flow, the studio, and the surrounding marketing surfaces, built from scratch in
React + Vite.

**Live:** _(add deployed URL)_

## What's in it

| Route | What it is |
| --- | --- |
| `/` · `/explore` | The feed. Masonry wall of generations with hover-to-play video, filters, and infinite reveal. This is the landing page, as on the original. |
| `/create` | Image generation: prompt composer, model picker, preset grid, aspect/quality controls, and a job queue that streams results in. |
| `/video` | The video studio — a full app shell with its own scrolling panes, project rail, and timeline-style composer. |
| `/audio` | Voice and audio generation with voice selection and playback. |
| `/mcp` | The MCP / API surface. |
| `/pricing` | Plans, a plan finder, and a comparison table. |
| `/landing` | The marketing page, kept as its own route. |

Plus: auth modal, search modal (⌘K), notifications panel, profile menu, and a
nav that adapts per surface.

## Product decisions

- **The feed is the home page.** Higgsfield puts the wall first and the
  marketing page second, so this does too.
- **Generation is simulated, not stubbed.** `src/lib/generation.js` runs a real
  queue with staged progress, so the create flow behaves like the product —
  submit, watch jobs fill, open results — without a backend.
- **Auth is local.** `src/lib/auth.js` persists a session so gated surfaces and
  the profile menu are exercisable by anyone opening the live link.
- **Design tokens over ad-hoc CSS.** `src/styles/tokens.css` holds the type
  scale, colour ramp, and spacing; components are plain CSS files beside them.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

## Deploying

Static SPA. Build command `npm run build`, output `dist`. Client-side routing
fallbacks ship for both hosts: `vercel.json` (rewrites) and `public/_redirects`
(Netlify).

## Layout

```
src/
  pages/        one folder per route (jsx + css)
  components/   shared UI, one folder each
  data/         all fixture content — gallery, models, presets, pricing, ...
  lib/          generation queue, auth
  styles/       design tokens + global reset
public/media/   video and poster stills used by the feed
.agent-logs/    captured agent prompts and responses
```
