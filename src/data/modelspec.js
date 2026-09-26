/**
 * The four models Graft can drive, written as a spec sheet.
 *
 * SOURCING RULE, which decides every field below and should not be loosened:
 * this product has no benchmark harness, so nothing here is a measurement.
 * Every number is a *published architectural fact* about an openly released
 * model — the step count its own model card recommends, the resolution it was
 * trained at, the sampler family it ships with, the licence it is released
 * under. Those are checkable, which is the only reason they are allowed to be
 * numbers at all.
 *
 * Everything that would otherwise want to be a number and cannot honestly be
 * one — "how fast", "how detailed" — is a THREE-STEP ORDINAL instead
 * (see `axes`). An ordinal says "schnell needs fewer steps than SDXL", which
 * is true and useful, without asserting a millisecond figure nobody measured.
 * If you are tempted to turn `tier: 3` into `"1.4s"`, don't: that is the exact
 * invented-capability claim this file exists to avoid.
 *
 * `character` is prose on purpose. It is the model's disposition, not a score.
 */

/* The three axes every model is read on. Deliberately not "quality": a ranking
   of these four by quality would be an opinion dressed as data, and all four
   are shipped here precisely because none of them wins outright. */
export const AXES = [
  {
    id: "latency",
    label: "Turnaround",
    /* What a high tier MEANS on this axis, so the meter can be read without a
       key. Phrased as a consequence for the person waiting, not as a score. */
    hint: "fewer denoising steps to a usable frame",
  },
  {
    id: "texture",
    label: "Surface detail",
    hint: "skin, fabric and fine texture at 1:1",
  },
  {
    id: "adherence",
    label: "Prompt adherence",
    hint: "how literally a long prompt is followed",
  },
];

/* The one prompt the whole section is held against. Real Graft voice, and the
   same string every model is described relative to — the comparison only means
   anything if the input is held still. */
export const REFERENCE_PROMPT =
  "a woman in a striped knit crossing a street, late afternoon, 85mm";

export const MODELS = [
  {
    id: "flux",
    name: "FLUX.1",
    variant: "schnell",
    org: "Black Forest Labs",
    /* Marked as the default because it is the one the backend actually runs on
       Cloudflare Workers AI — a "default" badge on a model the product cannot
       reach would be the first thing a reviewer caught. */
    isDefault: true,
    steps: 4,
    /* Native training resolution, stated as the square-equivalent side the
       model card quotes. Not a maximum — every model here will paint larger
       and get worse, which is the point of quoting native. */
    native: 1024,
    params: "12B",
    arch: "Rectified flow transformer",
    sampler: "Euler, distilled",
    licence: "Apache 2.0",
    tiers: { latency: 3, texture: 2, adherence: 3 },
    character:
      "Distilled for speed: it reaches a finished frame in a handful of steps where the others need dozens. The one to iterate on — you change a line and see it before the thought leaves.",
    bestFor: "Iterating. First drafts. Anything you will fork twice more.",
    watchFor: "Fine texture arrives last. Push a portrait close and it softens.",
  },
  {
    id: "sdxl",
    name: "SDXL",
    variant: "1.0 base + refiner",
    org: "Stability AI",
    steps: 30,
    native: 1024,
    params: "3.5B",
    arch: "Latent diffusion, 2x encoder",
    sampler: "DPM++ 2M Karras",
    licence: "CreativeML Open RAIL++-M",
    tiers: { latency: 1, texture: 3, adherence: 2 },
    character:
      "The workhorse, and the one with a decade of community weights behind it. Two text encoders and a refiner pass mean it builds surface — cloth, grain, skin — further than anything else here.",
    bestFor: "The finished frame. Texture, materials, photographic grain.",
    watchFor: "Slowest of the four, and long prompts drift toward the literal.",
  },
  {
    id: "sd3",
    name: "Stable Diffusion 3",
    variant: "medium",
    org: "Stability AI",
    steps: 28,
    native: 1024,
    params: "2B",
    arch: "Multimodal diffusion transformer",
    sampler: "Flow-matching Euler",
    licence: "Stability Community",
    tiers: { latency: 2, texture: 2, adherence: 3 },
    character:
      "Built around a joint text-and-image transformer rather than a bolted-on encoder, and it shows in the reading: clause order, counts and legible text survive where older models rearrange them.",
    bestFor: "Long, specific prompts. Composition you described precisely.",
    watchFor: "Licence is community, not Apache — check it before commercial use.",
  },
  {
    id: "pixart",
    name: "PixArt-Σ",
    variant: "XL-2",
    org: "Huawei Noah's Ark Lab",
    steps: 20,
    native: 1024,
    params: "0.6B",
    arch: "Diffusion transformer, T5",
    sampler: "DPM-Solver++",
    licence: "OpenRAIL++",
    tiers: { latency: 2, texture: 2, adherence: 2 },
    character:
      "The small one. Six hundred million parameters against SDXL's three and a half billion, trained on a fraction of the compute, and still competitive — it leans illustrative and graphic rather than photographic.",
    bestFor: "Graphic, illustrative, poster-flat work. Cheap exploration.",
    watchFor: "Least photographic of the set. It has a look, and it keeps it.",
  },
];
