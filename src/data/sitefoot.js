/**
 * Footer inventory for the rebuilt surfaces.
 *
 * This is the old `FOOTER_COLUMNS` in `site.js` carried forward rather than a
 * new sitemap invented from scratch — but audited against two things the old
 * one ignored:
 *
 * 1. **What the product is.** The old footer advertised a video suite: Sora 2
 *    Upscale, Kling 3.0, Veo 3.1, Lipsync Studio, Soul ID Character, Fashion
 *    Factory, Higgsfield Popcorn. Those are the reference product's features and
 *    several of them carry its wordmark. Graft generates images from prompts and
 *    keeps their lineage; the inventory is re-pointed at that.
 *
 * 2. **What exists.** The old footer rendered every one of its ~50 labels as a
 *    link to `/create`, which is a sitemap that lies fifty times. Here a row is
 *    either a real route or it is tagged `soon` and rendered as plain text —
 *    matching `MENU` in `Header/Header.jsx`, which is the honest list. The two
 *    must agree: a footer promising a surface the menu admits is unbuilt is the
 *    same lie told twice.
 *
 * Dropped outright, not re-pointed: the video models, the studios, Soul, the
 * supercomputer, Games, Collab, the reference extension, Creator Partners, Trust,
 * Enterprise, Careers, and the San Francisco address — none of them describe
 * anything this product has or is.
 */

/* `to` is a real route. `soon` is designed but unbuilt, and renders as a row
   with a tag instead of a link. Nothing here is both. */
export const SF_COLUMNS = [
  {
    label: "Make",
    links: [
      { to: "/create", label: "Generate" },
      { to: "/create?from=remix", label: "Remix a prompt" },
      { label: "Edit", soon: true },
      { label: "Canvas", soon: true },
    ],
  },
  {
    label: "Find",
    links: [
      { to: "/explore", label: "Explore" },
      { to: "/lineage", label: "Lineage" },
      { label: "Originals", soon: true },
      { label: "Contests", soon: true },
    ],
  },
  {
    label: "Build with",
    links: [
      { to: "/models", label: "Models" },
      { to: "/api", label: "API & MCP" },
      { to: "/credits", label: "Credits" },
      /* No "Pricing" row. `/pricing` redirects to `/credits`, so the two were
         one destination listed twice — and the label promised a price on a
         product that has no currency anywhere in it. */
    ],
  },
  {
    label: "About",
    links: [
      { to: "/about", label: "What Graft is" },
      { label: "Academy", soon: true },
      { label: "Help", soon: true },
      { label: "Changelog", soon: true },
    ],
  },
];

/* The social row is gone rather than rebuilt. The old footer listed X, YouTube,
   LinkedIn and TikTok, every one of them `href="#"` with the click prevented —
   four dead links dressed as a presence. There are no accounts, so there is no
   row: an empty social bar is more honest than a full one that goes nowhere, and
   it is one fewer thing competing with the closing prompt field above it.

   Kept because a product does need these, and cut down to the ones that are not
   theatre: the old bar carried a language switcher for a single-locale product
   and separate Cookie Notice / Cookie Settings entries for a site that sets no
   tracking cookies. */
export const SF_LEGAL = ["Terms", "Privacy"];
