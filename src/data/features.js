/** Hero carousel slides. Titles and taglines as the product words them. */
export const FEATURES = [
  {
    id: "motion-designer",
    title: "Higgsfield AI Motion Designer",
    tagline: "ChatGPT can now do motion design in After Effects.",
    clipId: "c07",
  },
  {
    id: "effects",
    title: "Higgsfield Effects",
    tagline: "Viral video presets now in ChatGPT, with free generations",
    clipId: "c02",
  },
  {
    id: "genjutsu",
    title: "Higgsfield Genjutsu",
    tagline: "One upload in. Endless new visions out.",
    clipId: "c12",
  },
  {
    id: "sunburst",
    title: "GPT Image 2.5 Sunburst",
    tagline: "Sharper edits with more natural light and texture",
    clipId: "c08",
  },
  {
    id: "astra",
    title: "Higgsfield × GPT-6 Astra",
    tagline: "Turn a single prompt into a playable 3D game",
    clipId: "c05",
  },
];

/**
 * The promotional block. `endsAt` is an offset rather than a fixed date so the
 * countdown is always mid-flight on a cold load -- a clock frozen at 00:00:00
 * is the fastest way to make a rebuild look abandoned.
 */
export const PROMO = {
  eyebrow: "Unlimited Nano Banana Pro",
  headline: "with personal 54% off",
  blurb: "7-day unlimited Nano Banana Pro, Nano Banana 2 and Kling 3.0",
  cta: "Get with 54% OFF",
  clipId: "c05",
  durationMs: 105 * 60 * 1000,
};

/**
 * The product tiles beside the promo block. `tone` colours the badge; `hue`
 * colours the glyph, which is how the real grid keeps six near-identical
 * cards distinguishable at a glance.
 */
export const PRODUCT_TILES = [
  {
    id: "seedance",
    icon: "Bars",
    kind: "Video",
    name: "Seedance 2.5",
    badge: "Top",
    tone: "promo",
    blurb: "The most advanced video model",
  },
  {
    id: "nano-banana",
    icon: "Wave",
    kind: "Image",
    name: "Nano Banana Pro",
    blurb: "Generate high-quality visuals",
  },
  {
    id: "genjutsu-tile",
    icon: "Mark",
    name: "Higgsfield Genjutsu",
    badge: "Free",
    tone: "accent",
    blurb: "One video, many versions",
  },
  {
    id: "mcp",
    icon: "Burst",
    hue: "#ff7a45",
    name: "MCP & CLI",
    blurb: "Turn Claude into a creative engine",
  },
  {
    id: "cinema",
    icon: "Film",
    name: "Cinema Studio 4.0",
    blurb: "Create cinematic scenes effortlessly",
  },
  {
    id: "supercomputer",
    icon: "Cube",
    name: "Supercomputer",
    blurb: "Agent powered by GPT-6 Astra",
  },
];
