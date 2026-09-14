/**
 * Seeded media used for generation results and the community grid.
 *
 * Every clip carries a `tint` gradient. That is not decoration -- it is the
 * poster fallback. Cards paint the tint immediately, layer the poster image over
 * it when one loads, and only fetch the video on hover. So the grid is never
 * empty, never janks, and degrades cleanly if a media file is missing.
 */

export const CLIPS = [
  { id: "c01", title: "Ridge Line",        author: "avaline",    model: "Seedance 2.5", tint: "linear-gradient(135deg,#2b1b3d,#6d3b5e 50%,#c56f57)",  poster: "/media/c01.jpg", src: "/media/c01.mp4" },
  { id: "c02", title: "Neon Transit",      author: "kdoyle",     model: "Kling 3.0",    tint: "linear-gradient(135deg,#08203e,#1f6f8b 55%,#48c9b0)",  poster: "/media/c02.jpg", src: "/media/c02.mp4" },
  { id: "c03", title: "Paper Cities",      author: "m.oyelaran", model: "Sora 2",       tint: "linear-gradient(135deg,#3d2c1b,#8a6b3f 50%,#e0c58f)",  poster: "/media/c03.jpg", src: "/media/c03.mp4" },
  { id: "c04", title: "Undertow",          author: "sena",       model: "Seedance 2.5", tint: "linear-gradient(135deg,#04141c,#0b4f6c 55%,#2e8f9e)",  poster: "/media/c04.jpg", src: "/media/c04.mp4" },
  { id: "c05", title: "Glasshouse",        author: "r.iqbal",    model: "Veo 3.1",      tint: "linear-gradient(135deg,#1b2d1f,#3f6b45 50%,#9ec78f)",  poster: "/media/c05.jpg", src: "/media/c05.mp4" },
  { id: "c06", title: "Slow Collapse",     author: "tvn",        model: "Sora 2",       tint: "linear-gradient(135deg,#2a0f14,#7a2436 55%,#d4746b)",  poster: "/media/c06.jpg", src: "/media/c06.mp4" },
  { id: "c07", title: "Signal Drift",      author: "haruki.f",   model: "Wan 2.7",      tint: "linear-gradient(135deg,#171728,#3b3b66 50%,#7d7dc4)",  poster: "/media/c07.jpg", src: "/media/c07.mp4" },
  { id: "c08", title: "Dust Hymn",         author: "aminata",    model: "Kling 3.0",    tint: "linear-gradient(135deg,#2e2011,#7d5a24 55%,#d8ab54)",  poster: "/media/c08.jpg", src: "/media/c08.mp4" },
  { id: "c09", title: "Cold Open",         author: "j.mercer",   model: "Seedance 2.5", tint: "linear-gradient(135deg,#0d1117,#2b3a4a 55%,#6f8fa8)",  poster: "/media/c09.jpg", src: "/media/c09.mp4" },
  { id: "c10", title: "Bloom State",       author: "lux",        model: "Nano Banana Pro", tint: "linear-gradient(135deg,#2b1030,#75236b 50%,#d17cc6)", poster: "/media/c10.jpg", src: "/media/c10.mp4" },
  { id: "c11", title: "Threshold",         author: "obi.k",      model: "Veo 3.1",      tint: "linear-gradient(135deg,#101820,#34495e 55%,#7f8c8d)",  poster: "/media/c11.jpg", src: "/media/c11.mp4" },
  { id: "c12", title: "Afterimage",        author: "nour",       model: "Sora 2",       tint: "linear-gradient(135deg,#1a1a2e,#4a2c6b 50%,#b07cc6)",  poster: "/media/c12.jpg", src: "/media/c12.mp4" },
];

export function getClip(id) {
  return CLIPS.find((c) => c.id === id) ?? null;
}
