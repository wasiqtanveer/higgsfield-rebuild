/**
 * Model catalogue.
 *
 * Names and positioning are taken from the live product's public surface. Each
 * model declares its own capabilities, and the settings row reflects only what
 * the selected model actually supports -- picking a model that can't do 4K and
 * still being offered 4K is the kind of detail that makes a clone feel fake.
 */

export const MODELS = [
  {
    id: "seedance-2.5",
    name: "Seedance 2.5",
    vendor: "Higgsfield",
    kind: "video",
    badge: "Top",
    blurb: "Best all-round motion. Strong physics, reliable faces.",
    durations: [4, 8, 12],
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p", "1080p"],
    credits: 12,
  },
  {
    id: "kling-3.0",
    name: "Kling 3.0",
    vendor: "Kuaishou",
    kind: "video",
    blurb: "Long shots and camera moves. Slower, more cinematic.",
    durations: [5, 10],
    ratios: ["16:9", "9:16"],
    resolutions: ["1080p"],
    credits: 18,
  },
  {
    id: "veo-3.1",
    name: "Veo 3.1",
    vendor: "Google",
    kind: "video",
    blurb: "Native audio. Best prompt adherence of the set.",
    durations: [8],
    ratios: ["16:9"],
    resolutions: ["1080p", "4K"],
    credits: 32,
  },
  {
    id: "sora-2",
    name: "Sora 2",
    vendor: "OpenAI",
    kind: "video",
    blurb: "Surreal and stylised work. Less literal.",
    durations: [4, 8, 12],
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p", "1080p"],
    credits: 24,
  },
  {
    id: "wan-2.7",
    name: "Wan 2.7",
    vendor: "Alibaba",
    kind: "video",
    blurb: "Fastest turnaround. Good for iterating on an idea.",
    durations: [4, 6],
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p"],
    credits: 6,
  },
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    vendor: "Higgsfield",
    kind: "image",
    badge: "New",
    blurb: "Stills and edits. Sharper light and texture.",
    durations: [],
    ratios: ["16:9", "9:16", "1:1", "4:5"],
    resolutions: ["1K", "2K", "4K"],
    credits: 4,
  },
  {
    id: "gpt-image-2",
    name: "GPT Image 2",
    vendor: "OpenAI",
    kind: "image",
    blurb: "Natural light and texture, strong at text in frame.",
    durations: [],
    ratios: ["16:9", "9:16", "1:1", "4:5"],
    resolutions: ["1K", "2K", "4K"],
    credits: 6.5,
    listCredits: 8.5,
  },
  {
    id: "seedream-5",
    name: "Seedream 5",
    vendor: "ByteDance",
    kind: "image",
    blurb: "Painterly stills with deep colour.",
    durations: [],
    ratios: ["16:9", "9:16", "1:1", "4:5"],
    resolutions: ["1K", "2K"],
    credits: 4,
  },
];

export const DEFAULT_MODEL_ID = "seedance-2.5";

/** The composer opens on a model that matches the surface you arrived from. */
export const MODE_DEFAULT_MODEL = {
  image: "gpt-image-2",
  video: "seedance-2.5",
  audio: "veo-3.1",
};

export function getModel(id) {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}

/**
 * "Auto" picks the model that best matches the prompt rather than always
 * returning the same one, so the toggle visibly does something.
 */
export function autoSelect(prompt = "") {
  const p = prompt.toLowerCase();
  if (/\b(photo|still|image|poster|logo|portrait)\b/.test(p)) return "nano-banana-pro";
  if (/\b(dialogue|speaks|voice|says|audio|sound)\b/.test(p)) return "veo-3.1";
  if (/\b(dream|surreal|impossible|melting|abstract)\b/.test(p)) return "sora-2";
  if (/\b(long|slow|drone|sweeping|cinematic)\b/.test(p)) return "kling-3.0";
  return DEFAULT_MODEL_ID;
}
