---
version: 1
slug: "src-pages-home-home-jsx"
primary_target: "src/pages/Home/Home.jsx"
related_targets: ["src/components/ForkLive/ForkLive.jsx","src/components/ForkDiff/ForkDiff.jsx","src/components/ModelSpec/ModelSpec.jsx","src/components/CloseCall/CloseCall.jsx"]
---

# Surface brief — home, below the hero

**Mode:** Persuade. **Route:** `/`. **Scope:** the four bands under the approved
hero — `#feed`, `#how`, `#models`, `#close` — plus the rebuilt site foot.

## Audience and job

An 8x reviewer, signed out, on desktop, spending seconds, looking for what this
candidate *changed* about the reference product rather than what they copied.
The page has to make "the prompt is the artifact, not the image" something they
did with their hands, not something they read.

## Direction contract

**THESIS:** One prompt you can change beats a grid of finished pictures. The
page refuses the category arrangement — a masonry wall of output with the prompt
hidden behind a hover — and replaces it with four bands that each hand over a
control. The image is never the hero of a composition; the text that made it is.

**OWN-WORLD:** Cool near-black `#08090c` ground, neon orange `#ff5c1a` rationed
to the primary action and the lineage thread only, glass chrome. Space Grotesk
display, Inter UI, JetBrains Mono for every prompt (a prompt is authored data,
so it is set as data), Instrument Serif italic for exactly one word per
headline. Depth comes from light, never shadow: surfaces separate by getting
lighter and by a 1px lit top edge. Recognisable with all content removed by the
mono-at-reading-size prompt blocks and the single orange thread.

**STORY:** The visitor sees a prompt with one line lit, changes it, and watches
the same photograph re-read itself. Then they see the mechanism as a real
word-diff, then the instrument they would drive it with, then a field to write
their own. They believe lineage is a feature this category does not have, and
they act by opening the composer.

**FIRST VIEWPORT (per band):** `#feed` — prompt left at 1.34fr in mono at
reading size, one line accented with a caret, three alternative chips beneath,
photograph right at 0.66fr; the ratio is the argument. `#how` — argument and
fork rail left, three beats down an accent lineage thread right. `#models` —
held-constant prompt pinned above, four channels as positions on one selector
left, one spec readout right with a 30-tick ladder. `#close` — centred, headline
then the hero's own field, single action, no competitor.

**FORM:** Extension of an established surface (new-work §3), not a concept
tournament: the hero's world was already built and approved, so every band
inherits it. Composition per band was decided from the content. No seed key —
the roll does not apply to a local extension.

**MOTION:** One grammar. Section level: `Arrive` drives a `--arrive` custom
property from each band's own scroll position — lift, scale, unblur — so a band
comes up out of the page tied to the wheel rather than playing a clip. Element
level: one shared curve `[0.22, 1, 0.36, 1]`, per-element delay taken from the
element's index in reading order, stagger direction carrying meaning (ticks
counted from the left, beats counted downward, prompt lines top-down, the action
always landing last). State changes animate two properties together, because one
property at small scale is invisible on near-black. Bands own no transform of
their own; element staggers compose with the band, never fight it.

**HONESTY (binding):** The library holds 8 usable stills and no two are
variations of one prompt. No band may stage a parent/child image pair. `#feed`
re-frames and re-grades a single photograph; `#how` carries lineage in text
only; `#models` ships zero imagery because any still beside a model name would
read as that model's output. Counts and depths describe prompts, never pictures.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.

## Anti-goals

No masonry grid. No second full-bleed photo wall (the hero owns that). No
carousel. No logo row for the models. No competing CTA in `#close`. No invented
benchmarks, latencies or capabilities anywhere.

## Untouched

Header pill, Hero, `tokens.css`, `global.css`, the legacy `Footer` component
(suppressed on `/`, not deleted).
