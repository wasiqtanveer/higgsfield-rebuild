/**
 * Audio catalogue.
 *
 * Kept separate from the video models rather than bent into their shape: a
 * speech model has no aspect ratio and no frame rate, and a list where half the
 * capability fields are empty is how a clone starts contradicting itself.
 */

export const AUDIO_MODELS = [
  {
    id: "seed-audio-1.0",
    name: "Seed Audio 1.0",
    vendor: "Higgsfield",
    badge: "Top",
    blurb: "Most natural delivery. Best for long scripts.",
    tier: 3,
    credits: 4,
    languages: 29,
  },
  {
    id: "eleven-v3",
    name: "Eleven v3",
    vendor: "ElevenLabs",
    blurb: "Widest voice library and the strongest cloning.",
    tier: 3,
    credits: 6,
    languages: 32,
  },
  {
    id: "minimax-speech",
    name: "MiniMax Speech 02",
    vendor: "MiniMax",
    blurb: "Fast and cheap. Good for drafts and scratch reads.",
    tier: 1,
    credits: 2,
    languages: 17,
  },
  {
    id: "seed-dialogue",
    name: "Seed Dialogue",
    vendor: "Higgsfield",
    badge: "New",
    blurb: "Two-speaker conversations from one script.",
    tier: 2,
    credits: 5,
    languages: 12,
  },
];

export const DEFAULT_AUDIO_MODEL = "seed-audio-1.0";

export function getAudioModel(id) {
  return AUDIO_MODELS.find((m) => m.id === id) ?? AUDIO_MODELS[0];
}

/* Preset voices. The tint is what the avatar ring is drawn in, so the picker
   stays legible before any portrait has loaded. */
export const VOICES = [
  { id: "anna",   name: "Anna",   role: "Female Voice", tint: "#f0764e", accent: "American" },
  { id: "kobbie", name: "Kobbie", role: "Male Voice",   tint: "#2f6bff", accent: "British" },
  { id: "josh",   name: "Josh",   role: "Male Voice",   tint: "#ff2d78", accent: "American" },
  { id: "chidi",  name: "Chidi",  role: "Male Voice",   tint: "#22b3c6", accent: "Nigerian" },
  { id: "wilder", name: "Wilder", role: "Male Voice",   tint: "#e0a33c", accent: "Australian" },
  { id: "mira",   name: "Mira",   role: "Female Voice", tint: "#9b6bff", accent: "Irish" },
];

export const TTS_TABS = [
  { id: "tts", label: "Text to Speech" },
  { id: "change", label: "Voice Change" },
  { id: "translate", label: "Translate" },
];
