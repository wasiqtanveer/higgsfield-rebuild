---
version: 1
slug: "src-pages-about-about-jsx"
primary_target: "src/pages/About/About.jsx"
related_targets: []
---

# Surface brief — /about

**Mode:** Persuade. **Route:** `/about`. **Scope:** the whole route, replacing
the `Soon` placeholder `src/App.jsx` currently points at.

## Audience and job

The same 8x reviewer as `/`, arriving second. `/` already made them *use* the
mechanism once. `/about` has to answer the question the brief actually asked —
*what did you change, what did you cut, and why* — without becoming a page of
prose claims. Secondary: a maker who wants to know whether this product's
position is a real position or a tagline.

## Direction contract

**THESIS:** The About page is built out of the mechanism it describes. It refuses
the category arrangement — a prose column of mission copy with a team grid and a
timeline — and instead sets its own text as a prompt tree the visitor forks. To
read why Graft exists you perform Graft's one gesture on the sentence that
claims it. A claim you can fork is a claim under test; a paragraph is not.

**OWN-WORLD:** Inherited unchanged and frozen. Cool near-black `#08090c` in four
steps, depth by luminance plus a 1px lit top edge and never by drop shadow, neon
orange `#ff5c1a` rationed strictly to the primary action and the lineage thread.
Space Grotesk display, Inter for anything operated, JetBrains Mono at reading
size for every node body because on this product a prompt is authored data, one
Instrument Serif italic word per headline at `1.1em`. Recognisable with all
content removed by the mono blocks joined by 2px accent threads and the pill
silhouette on everything pressable.

**STORY:** The visitor reads one mono statement of what Graft is, sees a second
statement grow beneath it with one clause changed and the change computed as a
live word-diff, and understands that the page is demonstrating rather than
asserting. They walk the tree, and each node they open is another decision —
what was cut, what could not be honest, what the backend actually does. Depth
readout climbs as they go. They believe the position is load-bearing, and they
act by opening the composer at the tree's deepest node.

**FIRST VIEWPORT:** No hero image and no full-bleed photograph — `/` owns that,
and this page's subject is text. Top-left, the headline at display scale with its
one serif italic word. Centred under it at `~62ch`, the root node: a mono block
at `--t-lg` holding Graft's claim, with a mono `00` depth sigil and a lit left
rail. A 2px accent thread drops from its bottom edge and forks into three child
stubs. The first child opens itself once, unprompted, on arrival — the diff
strikes the changed clause and sets the replacement in accent — so the mechanism
is visible before any click. Primary action sits at the tree's terminus, not in
the first viewport: the page earns it.

**FORM:** Structure 4 of my seven ranked candidates ("the page as its own lineage
tree"), dealt by the roll at index 7 and locked by the user over the dealt lead.
Seed key `08626227`, scope surface, mode persuade. Code-led: no image generation
in the tool surface, so no comp round; the ambition rides in this block and in
the signature interaction below, which the finish reviewer audits in behavior.

**MOTION:** One grammar, inherited. Section level is `Arrive` only — bands own no
transform, filter or opacity of their own. Element level is the shared curve
`[0.22, 1, 0.36, 1]`, delay taken from index in reading order. The signature
interaction: promoting a node. On click the chosen child's thread lights from
parent to child, the child's diff resolves word by word (deletions collapsing
their width, insertions expanding into it), the node travels to root position and
its own children draw themselves in downward — one orchestrated move, not four
transitions firing at once. `prefers-reduced-motion` swaps the whole promotion
for an instant state change with no travel and no staggered diff, armed at source
in JS so no timer runs at all. Nothing is hidden that JS cannot reveal: every
node renders composed and readable with JS dead.

**HONESTY (binding):** Every node's content is a real decision from this project,
not invented lore. No dates that were not real, no team, no funding, no user
counts, no "founded in". The backend node describes only what exists or is
explicitly named as not yet built. Zero imagery of generated output on this route
— the library has no honest lineage pair and this page would be the worst place
to stage one. No prices, no plans, no currency, consistent with `/credits`.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.

## Anti-goals

No mission-statement prose column. No team grid, no founder photo, no timeline
rail of dates. No metric tiles ("10k prompts forked") — the product has no users.
No logo wall. No second CTA competing with the terminus action. No kicker or
eyebrow above any heading. No stock photography.

## Untouched

The Header pill is approved and frozen — not touched. `src/styles/tokens.css`
gains nothing; every value on this page resolves to a token that already exists.
`Arrive`, `Reveal` and `Magnetic` are reused as-is, not forked. Every new class
is namespaced `.abt__` per the project's collision rule.

## Unresolved

Whether `/about` should link the deepest node to `/create` (built) or to the
`Soon` page for `/explore`. Built on `/create`, since that route exists.
