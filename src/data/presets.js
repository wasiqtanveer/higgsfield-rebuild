/**
 * Visual Effects presets, named from the live product's preset gallery.
 *
 * Each carries the prompt it injects into the composer. That is the detail that
 * makes the landing page and the create page feel like one product rather than
 * two disconnected screens: "Recreate" is not decorative, it routes into
 * /create with this prompt and model already filled in.
 */

export const PRESETS = [
  { id: "floating-fall",  name: "Floating Fall",   model: "seedance-2.5", prompt: "Subject falls backwards in slow motion, weightless, debris rising around them, shallow depth of field" },
  { id: "high-flip",      name: "High Flip",       model: "seedance-2.5", prompt: "Camera flips 180 degrees over the subject in one continuous take, horizon rotating" },
  { id: "burning-man",    name: "Burning Man",     model: "sora-2",       prompt: "Desert dusk, dust haze, figure silhouetted against fire, embers drifting upward" },
  { id: "studio-slide",   name: "Studio Slide",    model: "kling-3.0",    prompt: "Smooth lateral dolly across a seamless studio backdrop, hard key light, product hero shot" },
  { id: "incline",        name: "Incline",         model: "seedance-2.5", prompt: "Low angle push-in up a steep incline, subject cresting the ridge against open sky" },
  { id: "act-natural",    name: "Act Natural",     model: "veo-3.1",      prompt: "Handheld documentary framing, subject speaking candidly to camera, natural window light" },
  { id: "eyes-in",        name: "Eyes In",         model: "seedance-2.5", prompt: "Extreme close-up push into the subject's eye, reflection resolving into a new scene" },
  { id: "street-colossus",name: "Street Colossus", model: "sora-2",       prompt: "Giant figure striding between city blocks, scale exaggerated, pedestrians looking up" },
  { id: "melting",        name: "Melting",         model: "sora-2",       prompt: "Solid object slowly melting into liquid, surface tension rippling, macro lens" },
  { id: "wild-ride",      name: "Wild Ride",       model: "wan-2.7",      prompt: "POV rushing through a tunnel at speed, motion blur streaking, lights smearing past" },
  { id: "cutout",         name: "Cutout",          model: "nano-banana-pro", prompt: "Subject cleanly cut from background, hard paper-collage edges, flat colour field behind" },
  { id: "world-morphing", name: "World Morphing",  model: "sora-2",       prompt: "Environment continuously transforming around a static subject, seasons and architecture shifting" },
  { id: "smash-and-grab", name: "Smash and Grab",  model: "wan-2.7",      prompt: "Fast whip-pan into glass shattering, shards suspended mid-air, high shutter speed" },
  { id: "selfception",    name: "Selfception",     model: "seedance-2.5", prompt: "Subject filming themselves filming themselves, recursive frames receding infinitely" },
  { id: "lacewalker",     name: "Lacewalker",      model: "kling-3.0",    prompt: "Figure walking across a suspended lace structure high above cloud, slow tracking shot" },
  { id: "afterglow",      name: "Afterglow",       model: "veo-3.1",      prompt: "Golden hour backlight, lens flare blooming, subject turning slowly toward camera" },
];

export function getPreset(id) {
  return PRESETS.find((p) => p.id === id) ?? null;
}
