---
name: Graft
description: A dark instrument — cool near-black ground, one rationed neon orange, and prompts set as the data they are.
colors:
  bg: "#08090c"
  bg-2: "#0d0f14"
  surface: "#14171f"
  surface-2: "#1c2029"
  surface-3: "#262b36"
  glass: "rgba(20, 23, 31, 0.72)"
  line: "rgba(255, 255, 255, 0.08)"
  line-strong: "rgba(255, 255, 255, 0.16)"
  line-lit: "rgba(255, 255, 255, 0.1)"
  text: "#f3f5fa"
  text-2: "#a4acbd"
  text-3: "#6b7486"
  text-on-accent: "#1a0d05"
  accent: "#ff5c1a"
  accent-hover: "#ff7a3d"
  accent-text: "#ff9a63"
  accent-wash: "rgba(255, 92, 26, 0.12)"
  accent-wash-strong: "rgba(255, 92, 26, 0.24)"
  accent-glow: "rgba(255, 92, 26, 0.5)"
  focus: "#ff8a50"
  danger: "#ff4d6d"
  danger-wash: "rgba(255, 77, 109, 0.14)"
  good: "#3ddc97"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6.4vw, 4.75rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  accent-word:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "1.1em"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontStyle: "italic"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  prompt:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
    fontFeature: "\"liga\" 0"
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.09em"
rounded:
  xs: "3px"
  sm: "6px"
  md: "10px"
  lg: "16px"
  pill: "999px"
spacing:
  s-1: "4px"
  s-2: "8px"
  s-3: "12px"
  s-4: "16px"
  s-5: "24px"
  s-6: "32px"
  s-7: "48px"
  s-8: "64px"
  s-9: "96px"
  s-10: "144px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text-on-accent}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "2.9rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.text-on-accent}"
  button-ghost:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "2.9rem"
  button-ghost-hover:
    backgroundColor: "{colors.accent-wash}"
    textColor: "{colors.text}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  chip-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text-on-accent}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  field-prompt:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "8px 8px 8px 16px"
    typography: "{typography.prompt}"
  field-prompt-armed:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "24px"
  nav-pill:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.pill}"
    height: "50px"
    padding: "0 8px"
  selector-channel:
    backgroundColor: "{colors.bg-2}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.md}"
    padding: "12px 16px 12px 24px"
  selector-channel-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "12px 16px 12px 24px"
---

# Design System: Graft

> **Scope, stated first because it decides what this file can be trusted for.**
> This system describes the `/` route only. `/explore`, `/create`, `/video`,
> `/audio`, `/mcp`, `/pricing` and `/landing` are still legacy
> Higgsfield-clone surfaces on the previous dark theme, and `src/App.jsx`
> carries the migration seam as `const REBUILT = ["/"]` — that list, not this
> document, is the authority on which routes are on this system. Do not read
> DESIGN.md as a description of the whole app, and do not "fix" a legacy route
> toward these rules as a side effect of another task. The legacy alias block at
> the bottom of `src/styles/tokens.css` (`--c-hairline`, `--c-text-dim`,
> `--c-accent-ink`, `--c-accent-deep`, `--c-light-deep`, `--c-promo`,
> `--e-bevel`) exists only to keep those routes viewable; it is a migration seam
> scheduled for deletion with the last legacy page, and nothing new may reference
> it.

`src/styles/tokens.css` is the source of truth for every value in this file. On
the home surface no hardcoded hex exists outside it.

## Overview

**Creative North Star: "The Lit Instrument"**

Graft looks like the machine it is. The ground is a cool, blue-shifted
near-black (`#08090c`) rather than a neutral grey, because a pure `#111` sitting
next to a saturated generation reads dusty while a blue-shifted black reads
*lit*. Onto that ground the system admits exactly one hot colour — a neon orange
(`#ff5c1a`) that is, by a wide margin, the brightest thing on any screen. Every
other surface is a step of the same cool near-black, separated from its
neighbours by luminance and a single lit edge. The effect is an instrument panel
in a dark room: you read it by where the light is.

The density is engineered rather than editorial. Type is a geometric display
face with real negative tracking, an invisible UI sans, and a monospace that is
not costume — on this product a prompt *is* the artifact, so prompts, seeds and
model identifiers are set as the authored data they are, at reading size, in the
wide column. One italic serif word per headline is the only ornament the system
allows, and it is allowed precisely because it is rare.

Two drafts were rejected on the way here and both rejections are load-bearing.
Warm paper with Instrument Serif throughout read as a print catalogue — "too
classic" for a tool that drives a model. An electric indigo accent was replaced
because on a cool near-black ground a cool accent sits *in* the ground instead
of igniting off it. Do not reintroduce either: not warm paper, not a cool accent.

**Key Characteristics:**

- Cool near-black ground in four steps; depth by light, never by shadow.
- One accent, rationed to the primary action and the lineage thread.
- Prompts set in mono at reading size — the artifact, not a caption.
- Three type voices with jobs, plus one serif italic word per headline.
- Glass chrome that the work scrolls through, not over.
- One motion grammar: scroll-linked section arrival, one shared curve, staggers
  that carry meaning.

## Colors

A four-step cool near-black ramp, white-alpha hairlines, a blue-tinged off-white
for text, and a single hot orange held in reserve.

### Primary

- **Ignition Orange** (`#ff5c1a`): the one hot colour. It marks the primary
  action on a screen and the lineage thread that is the product's whole idea —
  the header's scroll-progress ring, the forkable prompt line and its caret, the
  selected fork chip, the lit rail on the model selector, the lit run of ladder
  ticks, the armed submit, the focus rail down the band you are reading. Nothing
  else.
- **Ignition Hover** (`#ff7a3d`): hover only, on a surface already filled with
  the accent.
- **Lit Orange** (`#ff9a63`): the lightened cut, for orange *type on the dark
  ground* — prose links, the section counter, the forkable line, the ticking
  count. It clears 4.5:1 where the raw accent does not.
- **Ember Ink** (`#1a0d05`): near-black ink carried by anything *filled* with
  the accent.

### Neutral

- **Cool Void** (`#08090c`): the page. Blue-shifted, never neutral grey.
- **Void Step** (`#0d0f14`): the faintest lift — the footer, an unselected
  channel in a selector.
- **Panel** (`#14171f`): a panel on the page; a chip or field at rest.
- **Control** (`#1c2029`): a control inside a panel; a hovered chip.
- **Raised Control** (`#262b36`): the topmost step — a disarmed well, a hovered
  ghost button. Anything needing a fifth step is nested too deep.
- **Chrome Glass** (`rgba(20, 23, 31, 0.72)`): the translucent chrome. Blurred
  and saturated (`blur(18px) saturate(1.4)`) so generations scroll *through* the
  pill rather than behind an opaque bar.
- **Hairline** (`rgba(255,255,255,0.08)`) / **Strong Hairline**
  (`rgba(255,255,255,0.16)`) / **Lit Edge** (`rgba(255,255,255,0.1)`): always
  white at low alpha, never a fixed grey. A grey hairline stops tracking
  whatever surface it lands on and separates into a visible band.
- **Instrument White** (`#f3f5fa`): primary text. Never pure white — `#fff` on
  near-black blooms and vibrates at text sizes; a hair of blue sits still.
- **Dimmed** (`#a4acbd`) / **Faint** (`#6b7486`): secondary prose and the prompt
  body; labels, meta, unlit ladder ticks and ghost placeholders.

### Tertiary

- **Focus Orange** (`#ff8a50`): the keyboard focus ring.
- **Alarm Rose** (`#ff4d6d`) and its wash: pulled toward red and away from the
  accent on purpose. A danger colour that reads as a shade of the brand accent
  stops warning anybody.
- **Signal Green** (`#3ddc97`): status affirmation only, never decoration.

### Named Rules

**The Rationed Accent Rule.** The accent marks the primary action and the
lineage thread. Two uses per section is the observed ceiling — ModelSpec spends
its entire budget on the lit selector rail and the lit run of ticks, and SiteFoot
spends its whole budget on one stroke of the mark. Before adding an accent,
name which of the two things it is; if it is neither, it gets a neutral step.

**The Ink-On-Fire Rule.** Anything *filled* with `#ff5c1a` carries near-black
ink (`#1a0d05`), never white: white on the accent sits at about 3.1:1 and fails
the 4.5:1 floor. Orange *type* on the dark ground uses the lightened `#ff9a63`
cut. A filled accent control also overrides the focus ring to the ink colour,
because the default focus orange is invisible against the accent it sits on.

**The Earned Glow Rule.** The accent arrives when there is something to
acknowledge, not at rest. The closing field is a neutral pill until the visitor
types; then the border takes the accent, the submit fills, and the sigil lights.
A field glowing orange over an empty box has spent the page's loudest colour on
nothing.

## Typography

**Display Font:** Space Grotesk (fallback Inter, system-ui, sans-serif)
**Body Font:** Inter (fallback -apple-system, Segoe UI, Roboto, Helvetica, Arial)
**Data Font:** JetBrains Mono (fallback ui-monospace, SFMono-Regular, Menlo)
**Accent Font:** Instrument Serif, italic only (fallback Georgia, serif)

**Character:** Geometric, slightly mechanical, tight. Space Grotesk is the face
this category actually speaks in; Inter is invisible on purpose so that
everything you *operate* recedes; JetBrains Mono is used as data rather than as
costume; the serif italic exists solely to be the one soft thing on the screen.

### Hierarchy

- **Display** (600, `clamp(2.5rem, 6.4vw, 4.75rem)`, line-height 1.04,
  tracking -0.035em): the page's opening claim. `h1` gets this by default —
  choosing one display face means it is the normal voice for a heading, not a
  special case a component opts into. Weight 600 because 400 is not among the
  cuts loaded and the browser would synthesise it.
- **Headline** (700, `clamp(1.875rem, 4vw, 3rem)`, line-height 1.02): every
  band title. Sections set 700 rather than the global 600 — a geometric sans
  needs the extra weight to hold at band scale against the dark ground.
- **Title** (600, 1.625rem): `h3`, sub-heads inside a band.
- **Body** (400, 0.9375rem, line-height 1.6): all running prose. Capped at
  `68ch` by the `.prose` helper; footer claims and band ledes cap tighter
  (38–62ch).
- **Prompt** (400, up to 1.25rem, line-height 1.45, ligatures off, tabular
  figures): mono at reading size. The largest mono on the page is the forkable
  prompt in `#feed`, and that is deliberate.
- **Label** (600, 0.75rem, tracking 0.09em, uppercase, faint): field labels and
  meta rows. The one place tracking opens up.

### Named Rules

**The One Word Rule.** Exactly one word per headline is Instrument Serif italic,
never a whole line and never two. It is set at `1.1em` of its line because the
serif's italic sits optically small next to a 700-weight geometric sans — match
by eye, not by number. The contrast is the point, and it stops being a contrast
the moment it becomes the voice.

**The Prompt-Is-Data Rule.** Prompts, seeds and model identifiers are set in
JetBrains Mono, at reading size when they are the subject of a section. A prompt
is never styled as a caption about a picture. Numbers that tick or sit in a
column carry `font-variant-numeric: tabular-nums` so the row does not shuffle
its own width.

**The Label-Is-Not-An-Eyebrow Rule.** The tracked uppercase label is for field
labels and meta rows. It is not an eyebrow or kicker above a heading. Where a
band genuinely needs to say where you are in the page, it uses a mono section
*counter* (`03`) — a counter tells you your position, which a decorative word
above a headline does not.

## Layout

A centred single column with two widths: `1240px` standard, `1640px` wide, both
via the `.page` helper with a gutter of `32px` collapsing to `16px` at 720px.
The page never scrolls sideways; a wide child opts into its own horizontally
scrollable container instead.

Spacing is a 4px base in ten steps (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 /
144). Band rhythm is `96px` block padding, dropping to `64px` under 720px — but
a section that brings its own vertical rhythm (or claims a viewport height) gets
`0` from the band, because `96px` stacked on a section that already claims its
own rhythm is 192px of nothing between the rail lighting up and the heading it
belongs to.

Composition per band is decided by content, and the ratios argue: `#feed` gives
the prompt `1.34fr` against the photograph's `0.66fr`, because an equal split
reads as two peers and these are not peers. The hero runs three columns
(`1fr / 1.05fr / 0.92fr`). The footer gives the brand blurb `0.95fr` against the
nav's `2fr` so the blurb is not set too wide to read.

The header is `fixed` at 50px (46px under 720px) and floats over content, so
every surface that is not a full-bleed hero adds its own top padding, and
anything reachable by anchor carries
`scroll-margin-top: calc(var(--h-header) + 32px)`.

Breakpoints observed: 860px (wordmark and divider drop), 760px (mega panel
becomes one scrolling column), 720px (gutter and header shrink), 700px (nav
links fold into More).

### Named Rules

**The Content-Decides-Composition Rule.** Band composition is derived from what
the band has to say, not from a house grid. When a ratio carries an argument,
the ratio is part of the design and may not be normalised to 50/50.

**The Own-Your-Rhythm Rule.** A section either owns its vertical rhythm or
inherits the band's `96px`. Never both.

## Elevation & Depth

**This system does not use drop shadows to convey depth.** On a near-black
ground a drop shadow is invisible — there is nothing darker for it to be darker
than. Depth is carried by **luminance plus a single lit top edge**: a surface
separates from the one beneath it by getting *lighter* (one step up the
near-black ramp) and by a 1px highlight along its top border, which is what
gives a raised control its thickness. A full border draws a ring; the lit edge
makes an object.

Shadows do exist, but their job is atmosphere and containment rather than
separation: they are near-opaque black, pushed further and softer than a light
theme needs, and they sit under floating chrome and overlays. The accent's own
light (`--sh-glow`) is a third mechanism, used only on primary controls and
lineage marks.

### Shadow Vocabulary

- **Hairline lift** (`0 1px 2px rgba(0,0,0,0.5)`): the smallest seat.
- **Floating** (`0 8px 24px -8px rgba(0,0,0,0.7)`): the header pills, the
  closing field — something genuinely off the page.
- **Overlay** (`0 28px 70px -20px rgba(0,0,0,0.85)`): mega panels, modals, and
  the condensed header once content runs beneath it.
- **Accent glow** (`0 0 0 1px var(--c-accent-wash-strong), 0 8px 28px -10px
  var(--c-accent-glow)`): the accent's own light on a primary control. Also
  appears as a one-off rim animation when a frame acknowledges a fork, and as a
  soft bloom on the lit selector rail and ladder run.
- **Lit inset** (`inset 0 1px 0 rgba(255,255,255,0.05)`): the top highlight
  *under* the border. The border draws the edge; this gives it thickness.
- **Bloom** (large radial gradient of `accent-wash` fading to transparent): not
  a shadow but the same job. On a near-black ground a dark photograph has
  nothing to be lit against, so a warm pool sits behind it.

### Named Rules

**The Light-Not-Shadow Rule.** To separate two surfaces, lighten the upper one
and give it a 1px lit top edge. Do not reach for a drop shadow — on `#08090c` it
does nothing, and reviewers reading this file have tried.

**The Two-Property Rule.** A state change animates at least two properties
together. One property at small scale is invisible on near-black: a hue shift on
a single 10px glyph is the easiest change on the page to miss, so the sigil
shifts colour *and* scales; the submit fills *and* grows; a fork chip changes
text, border and background at once.

## Shapes

Corners are soft but never round-by-default: `3px` for the smallest marks, `6px`
for focus rings, `10px` for a channel in a selector, `16px` for a panel or an
image frame, and a full pill (`999px`) for anything that is pressed, typed into,
or navigated by. The pill is the system's signature silhouette — the header is
two pills with a real gap between them, buttons are pills, chips are pills, and
the prompt field is a pill at two sizes (hero and close) so the page reads as a
loop returning to its first control.

Borders are always white at low alpha with the top edge lifted one step. A
circular submit (`50%`) is the one exception to the pill, because it holds a
single glyph and a pill around one character reads as a mistake.

Image frames are `16px`-radius, `4/5` aspect, capped at `46vh`: the photograph
is evidence, and evidence does not need to be enormous.

### Named Rules

**The Pill Rule.** Interactive things are pills. A rectangle with a small radius
is a panel or a channel — something you read or select within, not something you
press.

## Components

Character: engineered and quiet at rest, decisive when they have something to
say. Nothing announces itself until it carries state.

### Buttons

- **Shape:** full pill (`999px`), height `2.9rem` for the two page-level
  actions.
- **Primary:** accent fill (`#ff5c1a`) with near-black ink (`#1a0d05`), 600
  weight, `24px` inline padding, and the accent's own glow beneath
  (`0 8px 30px -10px accent-glow`).
- **Hover / Focus:** background to `#ff7a3d` and the glow deepens and travels
  (`0 12px 40px -10px`); colour transitions at `130ms`, the glow at `240ms`, so
  the light lags the fill a little. Focus ring is overridden to the ink colour —
  the default focus orange would sit invisibly on the accent.
- **Ghost:** glass background with `blur(14px)`, strong hairline border with a
  lit top edge, `#f3f5fa` text at 500. On hover the border takes the accent and
  the background takes the faint accent wash — the accent arrives as an edge,
  never as a second fill competing with the primary.
- **Active:** `scale(0.975)` where a press is meaningful.

### Chips

- **Style:** pill, `Panel` background, `8px 16px` padding, dimmed text, hairline
  border with `inset 0 1px 0` lit edge — raised by light, not shadow.
- **Hover:** text to full white, border to strong hairline, background one step
  lighter (`Control`).
- **Selected:** the only filled accent in its section — accent background and
  border with near-black ink at 600. A chip may carry a small uppercase tag
  inside it at 0.6 opacity.

### Cards / Containers

- **Corner Style:** `16px` for a panel, `10px` for a channel inside a selector.
- **Background:** one step up the near-black ramp from whatever it sits on.
- **Shadow Strategy:** none for separation — see **The Light-Not-Shadow Rule**.
  Floating chrome and overlays take the Floating and Overlay shadows.
- **Border:** hairline with `border-top-color` lifted to the lit edge.
- **Internal Padding:** `24px`, tightening to `16px` at small sizes.

### Inputs / Fields

- **Style:** pill, `Panel` background, strong hairline with a lit top edge,
  Floating shadow, `8px` padding with `16px` on the leading side. Text is mono
  at body size. The input and its ghost placeholder share one grid cell so the
  ghost sits at exactly the typed text's metrics — a placeholder a pixel off its
  own input is the tell that it was drawn rather than native. Caret is the
  accent.
- **Focused:** the field is *listening* — background lifts one step, a 1px
  accent-wash ring appears. No accent fill yet.
- **Armed** (has content): the accent arrives — border to `#ff5c1a`, a strong
  accent-wash ring plus a deep accent glow, the sigil lights and scales to
  1.18, the submit fills and grows to 1.04.
- **Focus ring:** moved, never removed. A 2px rectangle drawn inside a pill
  reads as a second broken control, so the indicator is redrawn on the container
  at `2px solid focus-orange` with `3px` offset. Suppressing the inner outline
  without the container rule is an accessibility regression.

### Navigation

- **Style:** a floating glass pill, `fixed` at `16px` from the top, `50px` tall,
  `blur(18px) saturate(1.4)`, hairline border with lit top edge, Floating shadow
  plus a lit inset. The strip spans the viewport so the pills stay centred but
  only the pills take pointer events — otherwise the strip swallows clicks on
  the work beneath.
- **Two objects, not one bar:** the nav pill and a separate auth pill with a
  real gap between them. Sign-in is not a destination, so it does not share a
  container with the destinations.
- **Condensed** (past the first screen): the glass takes on body
  (`rgba(16,18,24,0.86)`) and the Overlay shadow, so links stay legible over a
  bright image; the wordmark collapses its `max-width` to 0 and gives its width
  to the links; the divider collapses with it, since a divider earns its place
  only while there is a wordmark to divide from.
- **Active state:** a 3px accent dot beneath the label, not an underline — an
  underline inside a pill fights the pill's own curve.
- **Mobile:** links fold into the existing More menu at 700px; the mega panel
  becomes one anchored scrolling column at 760px; the auth pill resolves both
  options outright under `(hover: none)`, because a pill that only opens on
  hover never opens on a touch screen.

### Signature: the lineage thread

A 2px accent line with a soft glow, used wherever the product's idea needs to be
visible as a line: down the left of every band (hairline when unread, accent
with an 18px glow for the band in focus), as the sliding rail on the model
selector, as the lit run of a 30-tick ladder, and as the thread drawn up the
edge of a reframed photograph. It is the same idea as the header's progress
ring, and the two are meant to read as one system. It is always accent and it is
always 2px.

### Signature: motion grammar

One grammar for the whole surface. Break any part of it and the page stops
reading as one page.

- **Section level:** `Arrive` drives a `--arrive` custom property from the
  section's own scroll position (IntersectionObserver ratio against a 0.42
  settle point), moving lift (64px, 40px for the closing band), a `0.982→1`
  scale from the band's *top* origin, a `6px→0` blur and a `0.28→1` opacity
  together. Four properties, each reading the driver through its own curve so
  they do not all finish on the same frame — the blur clearing slightly early is
  what stops the arrival reading as one mechanical move. No transition on these
  properties: the driver is already continuous, and a transition on top of a
  continuous driver adds lag between the wheel and the picture. Scale from the
  top, never the bottom. It settles once and stays settled.
- **Element level:** one shared curve, `[0.22, 1, 0.36, 1]`, declared in all
  five band components. Per-element delay comes from the element's index in
  reading order, and stagger *direction* carries meaning: ticks count from the
  left, beats count downward, prompt lines run top-down, and the action always
  lands last.
- **Band transform boundary:** a band owns no transform, filter or opacity of
  its own. Those belong to `Arrive`. A second section-level transform multiplies
  with it — the band travels further than its `lift` says, and a `filter` on
  both creates a second containing block that breaks any sticky child. Element
  staggers compose with the band; they never fight it.
- **Easing and duration tokens:** `--e-out` for arrivals and anything that
  should decelerate into place, `--e-standard` for colour and background state,
  `--e-in` for exits. `130ms` for colour, `240ms` for state, `420ms` and `720ms`
  for arrival.
- **Magnetic** pulls a control toward the pointer proportionally to the distance
  from its own centre, so it leans rather than chases. Pointer-only by nature:
  it adds affordance and never carries behaviour.

### Named Rules

**The Never-Hide-What-You-Cannot-Reveal Rule.** Every reveal applies its hidden
state from JavaScript on mount. With JS broken or IntersectionObserver missing,
content is simply there, composed and readable. The failure mode is "no
animation", never "no page".

**The Fires-Once Rule.** A reveal fires once and stays revealed. Re-reading
something must never cost a wait, and scrolling back up must not turn the page
into a light show.

**The Reduced-Motion-At-Source Rule.** `prefers-reduced-motion` is honoured at
source for every authored motion — in CSS *and* in the JS that arms it, because
a CSS-paused animation still runs its JS timer, and a reveal that merely runs
instantly still starts from a transformed state, which is a visible jump on a
slow paint. Under the setting, nothing is armed at all. Every animating
component on this surface carries this check.

**The Nothing-Hidden Rule.** Attention is directed by adding light, never by
removing legibility. The band you are reading gets a lamp and a lit rail; the
others simply do not. An earlier build dimmed unread sections to 44% opacity —
asking someone to read a prompt through a veil is worse than a page where every
band is legible at once. Never dim content to focus other content.

## Do's and Don'ts

### Do:

- **Do** resolve every colour, space, radius, type step, easing and duration to
  a variable in `src/styles/tokens.css`. No hardcoded hex outside that file.
- **Do** separate surfaces by stepping *up* the near-black ramp and adding a 1px
  lit top edge (`--c-line-lit`).
- **Do** carry near-black ink (`--c-text-on-accent`) on anything filled with the
  accent, and use the lightened `--c-accent-text` cut for orange type on the
  dark ground.
- **Do** set prompts, seeds and model ids in JetBrains Mono — at reading size
  when the prompt is the subject.
- **Do** use exactly one Instrument Serif italic word per headline, at `1.1em`.
- **Do** use the shared element curve `[0.22, 1, 0.36, 1]` and take each
  element's delay from its index in reading order.
- **Do** animate at least two properties on any state change.
- **Do** honour `prefers-reduced-motion` in both CSS and the JS that arms the
  motion.
- **Do** keep hairlines as white at low alpha, never a fixed grey.
- **Do** move a focus indicator when the default rectangle fights a pill —
  redraw it on the container, larger and higher contrast.
- **Do** use tabular figures for any number that ticks or sits in a column.

### Don't:

- **Don't** use a drop shadow to separate surfaces on the near-black ground. It
  is invisible there.
- **Don't** spend the accent on anything that is not the primary action or the
  lineage thread — not a footer hover, not a heading, not a tag, not a decorative
  rule.
- **Don't** put white type on `#ff5c1a`. It measures about 3.1:1 and fails.
- **Don't** let the accent fill a control at rest. It arrives when there is
  something to acknowledge.
- **Don't** reintroduce a cool accent (the rejected electric indigo) or a warm
  paper ground (the rejected first draft).
- **Don't** set the serif for a whole line, or use it anywhere but the one
  headline word.
- **Don't** give a band its own transform, filter or opacity — `Arrive` owns
  section-level motion, and a second one multiplies with it.
- **Don't** dim or hide content to direct attention. Add light to the thing you
  want read.
- **Don't** re-fire a reveal on re-entry, or hide content behind a reveal that
  JavaScript may fail to un-hide.
- **Don't** use pure white (`#fff`) for text; it blooms on near-black.
- **Don't** add a fifth step to the surface ramp. Anything that needs one is
  nested too deep.
- **Don't** reference the legacy alias tokens (`--c-hairline`, `--c-text-dim`,
  `--c-accent-ink`, `--c-accent-deep`, `--c-light-deep`, `--c-promo`,
  `--e-bevel`) in new work. They exist to keep unmigrated routes viewable and
  are deleted with the last of them.
- **Don't** put a tracked uppercase label above a heading as an eyebrow or
  kicker. Use a mono section counter if the reader genuinely needs to know where
  they are.
