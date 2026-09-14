/**
 * Generation pipeline.
 *
 * The UI talks to a provider interface, never to a specific backend. The default
 * is MockProvider: results are pre-rendered clips bundled with the app, selected
 * deterministically from the prompt. Real model APIs cost money per call and are
 * slow and rate-limited, which makes them a poor demo and a poor thing to hand a
 * reviewer who has no API key. Swapping in a live provider means implementing
 * this same shape -- see README.
 *
 *   generate(prompt, opts) -> job { id, status, url, ... }
 *   status: "queued" -> "generating" -> "done"
 */

import { CLIPS } from "../data/gallery.js";

/** djb2. Stable across reloads, so the same prompt always yields the same clip. */
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h;
}

let seq = 0;
const nextId = () => `job_${Date.now().toString(36)}_${(seq++).toString(36)}`;

export class MockProvider {
  name = "mock";

  /** Pick the clip deterministically, so a repeated prompt repeats its result. */
  resolveClip(prompt, modelId) {
    const i = hash(`${modelId}::${prompt.trim().toLowerCase()}`) % CLIPS.length;
    return CLIPS[i];
  }

  createJob(prompt, opts = {}) {
    const clip = this.resolveClip(prompt, opts.modelId ?? "");
    // Heavier models take longer. Keeps the wait legible rather than uniform.
    const base = 2600 + (hash(prompt) % 1800);
    const weight = { "veo-3.1": 1.6, "kling-3.0": 1.35, "sora-2": 1.2, "wan-2.7": 0.6 };
    return {
      id: nextId(),
      prompt,
      status: "queued",
      progress: 0,
      url: clip.src,
      src: clip.src,
      poster: clip.poster,
      title: clip.title,
      // Carried so the pending card can paint the eventual result's palette
      // while it generates -- the reveal then feels like the same object
      // resolving, not a placeholder being swapped out.
      tint: clip.tint,
      duration: Math.round(base * (weight[opts.modelId] ?? 1)),
      createdAt: Date.now(),
      ...opts,
    };
  }
}

export const provider = new MockProvider();

/**
 * Drives one job from queued to done, reporting progress.
 * Returns a cancel function -- a generate call the user abandons must not keep
 * ticking against an unmounted component.
 */
export function runJob(job, onUpdate) {
  let raf = 0;
  let cancelled = false;
  const started = performance.now();
  const QUEUE_MS = 420;

  function tick(now) {
    if (cancelled) return;
    const elapsed = now - started;

    if (elapsed < QUEUE_MS) {
      raf = requestAnimationFrame(tick);
      return;
    }

    const t = Math.min((elapsed - QUEUE_MS) / job.duration, 1);
    // Ease-out: fast early progress, a slower tail. Linear progress reads fake.
    const eased = 1 - Math.pow(1 - t, 2.2);

    if (t >= 1) {
      onUpdate({ ...job, status: "done", progress: 1 });
      return;
    }

    onUpdate({ ...job, status: "generating", progress: eased });
    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}
