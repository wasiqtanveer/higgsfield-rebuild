# Surface brief — home hero

**Mode:** Persuade. **Route:** `/`. **Locked structure:** The Single Edit
(surface round `536fbc96`, code-led).

## What this surface must do

Make "every image is a fork of someone else's prompt" legible in one glance to
an 8x reviewer who will spend seconds signed-out, and hand them one action.

## The world (frozen, not decided here)

Cool near-black `#08090c`, one electric indigo `#5b4bf0`, glass chrome, Space
Grotesk display / Inter UI / JetBrains Mono data. The pill navbar is approved
and untouched.

## First viewport

Full-bleed dark. The headline holds the top-left. Below it, a single pane
divided by one vertical seam:

- **Left of the seam:** a real generation from the library, large, full-bleed in
  its frame.
- **Right of the seam:** that image's prompt, set in mono, as a block of lines.
  One line of it is the *active* line and carries the accent.
- **The seam itself** is the control. It is a real draggable divider.

Dragging the seam left reveals more prompt and less image; dragging right does
the inverse. At the extremes you get either the pure artifact or the pure
prompt — which is the product's whole argument rendered as a gesture: *these are
two views of the same thing.*

The prompt field sits under the pane as the single action. No competing CTA.

## The honest-content constraint

The library contains **no true lineage** — no two images are variations of one
prompt (see PRODUCT.md, Evidence on Hand). Therefore:

- The hero **never claims a parent/child pair it cannot show.** No staged "four
  forks" of unrelated photographs.
- The lineage idea is carried by **the prompt block being editable**, not by a
  second photograph. Changing the active line is the fork; the UI shows the diff
  in the text, and the frame responds by degree (the crop/treatment shifts),
  never by pretending to be a different generation.
- Fork *counts* and authorship shown are UI chrome on a real single artifact,
  not fabricated sibling images.

## Signature interaction (one authored moment)

**The seam drag.** Grabbing the divider and pulling it is the hero's one
gesture. It is:

- pointer-draggable, keyboard-operable (arrow keys on a focused separator with
  `role="separator"` and `aria-valuenow`), and touch-capable;
- driven by one CSS custom property written from a rAF loop, never React state
  per frame — the last build dropped frames doing exactly that;
- carrying **no CSS transition on the dragged property**, because easing a value
  rewritten every frame is what produced the lurching in earlier rounds;
- fully functional without the drag: it has a correct resting position and the
  page reads correctly if nothing is ever touched.

On arrival, the seam performs one short authored move from a closed position to
its resting split — exponential ease-out, once, never repeated on scroll, and
skipped entirely under `prefers-reduced-motion`.

## Motion grammar

One authored moment (the arrival split) plus response (the drag, hover, focus).
No scroll-linked choreography in the hero — scroll-driven motion is where the
previous eight rounds broke. Sections below keep the existing `Reveal`.

## Copy

Product's own voice, no eyebrow above the heading (banned). The headline argues;
the sub-line explains the gesture in one sentence.

## Risks accepted

- Shows a lineage of depth one rather than a tree. Depth is implied by the
  interaction and delivered for real on `/explore` and the image detail route.
- A draggable hero is uncommon; it must be obviously grabbable on first sight or
  it reads as a static split screen.
