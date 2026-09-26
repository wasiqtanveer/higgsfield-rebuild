/**
 * The forkable prompts on the home feed.
 *
 * One entry is one real still, the prompt that describes it, and — for the one
 * line a visitor would actually change — three real alternatives.
 *
 * The alternatives are the content of this section, not decoration. Each one has
 * to be a phrasing somebody would genuinely try, and each carries a `look`: how
 * the *same photograph* is re-read under that line. That is the honest part.
 * PRODUCT.md is explicit that no two stills in this library are variations of
 * one prompt, so the section never swaps the image — it re-frames and re-grades
 * the single artifact by degree, which is a claim the picture supports.
 *
 * `look` values are multipliers and offsets, not CSS: the component composes
 * them into one transform and one filter so the response stays on the
 * compositor. `scale`/`x`/`y` move the crop, `warm` tints, `dim` and `contrast`
 * change the light.
 *
 * Usable stills only: c01–c03 carry Higgsfield's own wordmark and c08 is
 * byte-identical to c11.
 */

export const FORKABLE = [
  {
    id: "c11",
    author: "mira",
    forks: 214,
    depth: 3,
    alt: "A figure many storeys tall walking down a Manhattan avenue between taxis",
    /* The line at index `edit` is the one that carries the accent and the one
       the chips replace. Everything else stays fixed, because "change one line"
       is the product's claim and a section that rewrites the whole prompt is
       demonstrating something else. */
    edit: 1,
    lines: [
      "a woman walking down a manhattan avenue,",
      "at her true scale,",
      "midday, taxis for reference",
    ],
    options: [
      {
        text: "at her true scale,",
        look: { scale: 1, x: 0, y: 0, warm: 0, dim: 1, contrast: 1, sat: 1 },
      },
      {
        text: "as a miniature on the kerb,",
        /* Pushed in hard and warmed: a miniature is a close read, and the
           tighter crop is what sells the change of scale. */
        look: { scale: 1.42, x: -6, y: 8, warm: 0.18, dim: 1.04, contrast: 1.06, sat: 1.08 },
      },
      {
        text: "lit from below by the traffic,",
        /* Darker and harder. Uplight is a contrast event, not a colour one. */
        look: { scale: 1.12, x: 2, y: -4, warm: 0.08, dim: 0.82, contrast: 1.28, sat: 0.92 },
      },
    ],
  },
  {
    id: "c04",
    author: "koji",
    forks: 86,
    depth: 2,
    alt: "A model in a printed tube top on a Chinatown street under awnings",
    edit: 2,
    lines: [
      "street style, printed silk,",
      "chinatown awnings,",
      "late afternoon, hard sun",
    ],
    options: [
      {
        text: "late afternoon, hard sun",
        look: { scale: 1, x: 0, y: 0, warm: 0, dim: 1, contrast: 1, sat: 1 },
      },
      {
        text: "overcast, no shadow at all",
        /* Flat light: contrast and saturation both come down, and the crop
           opens up because there is no shadow shape left to frame with. */
        look: { scale: 1.04, x: 0, y: 2, warm: -0.1, dim: 1.06, contrast: 0.82, sat: 0.84 },
      },
      {
        text: "shot on flash after dark",
        look: { scale: 1.2, x: 4, y: 6, warm: -0.06, dim: 0.72, contrast: 1.34, sat: 1.12 },
      },
    ],
  },
  {
    id: "c09",
    author: "ade",
    forks: 149,
    depth: 4,
    alt: "A figure in a blue jacket holding a tiny person on an open palm, ice behind",
    edit: 1,
    lines: [
      "a giant cradling a traveller on one palm,",
      "glacier light,",
      "shot on a long lens",
    ],
    options: [
      {
        text: "glacier light,",
        look: { scale: 1, x: 0, y: 0, warm: 0, dim: 1, contrast: 1, sat: 1 },
      },
      {
        text: "low sun, the ice going gold,",
        look: { scale: 1.1, x: -3, y: 4, warm: 0.26, dim: 1.02, contrast: 1.1, sat: 1.16 },
      },
      {
        text: "whiteout, the horizon gone,",
        /* Lifted and desaturated almost to nothing: a whiteout is the absence
           of the separation every other option is adding. */
        look: { scale: 1.06, x: 0, y: -2, warm: -0.14, dim: 1.14, contrast: 0.74, sat: 0.6 },
      },
    ],
  },
];
