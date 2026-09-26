import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AnimatedNumber from "../AnimatedNumber/AnimatedNumber.jsx";
import Reveal from "../Reveal/Reveal.jsx";
import { AXES, MODELS, REFERENCE_PROMPT } from "../../data/modelspec.js";
import "./ModelSpec.css";

/**
 * #models — the spec sheet.
 *
 * WHY THIS IS NOT A LOGO ROW, which is the thing to preserve if this ever gets
 * edited: a row of four cards with a mark and two lines of blurb tells you that
 * four models exist. It does not tell you which one to pick, which is the only
 * question anybody arrives at this section with. So the section is built as the
 * back panel of an instrument instead — one prompt held still, four channels,
 * and the *differences* set as data. The comparison is the content.
 *
 * WHY THERE IS NO IMAGE HERE, which is the other thing not to undo: the honest
 * version of "here is how the four models differ" would be one prompt rendered
 * four times, and this product's library does not contain that. Putting any of
 * the eight unrelated stills beside a model name would read as that model's
 * output and assert something false in front of the one audience hired to
 * notice. Text and data can carry this; a photograph cannot carry it honestly.
 * If four genuine same-prompt renders ever exist, they belong in the readout
 * slot and nowhere else.
 *
 * WHY THE NUMBERS ARE WHAT THEY ARE: see the sourcing rule at the top of
 * src/data/modelspec.js. Published architectural facts only; everything softer
 * is a three-step ordinal or prose.
 */

const EASE = [0.22, 1, 0.36, 1];

/* The ladder's full width in ticks. SDXL's 30 steps is the longest run in the
   set, so it is the scale — every other model reads as a visibly shorter run
   against the same ruler, which is the whole comparison in one glance. */
const LADDER = 30;

/**
 * The step ladder — the section's spine.
 *
 * A model's step count is the most concrete published difference between these
 * four, so it gets drawn rather than tabulated: thirty tick marks, of which the
 * selected model's steps are lit. Selecting FLUX after SDXL extinguishes
 * twenty-six of them in a visible sweep, and that sweep IS the argument that
 * schnell is the one to iterate on.
 *
 * The ticks light in sequence rather than together because a simultaneous
 * change reads as a state swap; a sweep reads as a count being run out, which
 * is what an instrument does.
 */
function Ladder({ steps, reduced }) {
  return (
    <div className="ms-ladder" aria-hidden="true">
      {Array.from({ length: LADDER }, (_, i) => {
        const lit = i < steps;
        return (
          <motion.span
            key={i}
            className={`ms-ladder__tick${lit ? " is-lit" : ""}`}
            initial={false}
            animate={{
              /* Height carries the lit state as well as colour: on a near-black
                 ground a colour-only change at 2px wide is easy to miss, and
                 the taller run also reads as a longer bar from across a room. */
              scaleY: lit ? 1 : 0.34,
              opacity: lit ? 1 : 0.28,
            }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    duration: 0.34,
                    ease: EASE,
                    /* Staggered along the ruler so the run appears to be
                       counted out from the left. Capped by index so the far end
                       is not still settling a second later. */
                    delay: Math.min(i, LADDER) * 0.012,
                  }
            }
          />
        );
      })}
    </div>
  );
}

/**
 * One character axis, drawn as a three-segment meter.
 *
 * Three segments and not ten, because the underlying claim is ordinal: this
 * model needs fewer steps than that one. A ten-segment bar or a percentage
 * would imply a resolution of measurement that does not exist here, and
 * inventing one is the failure mode this section is most exposed to.
 */
function Axis({ axis, tier, reduced, delay }) {
  return (
    <div className="ms-axis">
      <span className="ms-axis__label">{axis.label}</span>
      <span className="ms-axis__meter">
        {[1, 2, 3].map((seg) => (
          <motion.span
            key={seg}
            className={`ms-axis__seg${seg <= tier ? " is-on" : ""}`}
            initial={false}
            animate={{ opacity: seg <= tier ? 1 : 0.16 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.28, ease: EASE, delay: delay + seg * 0.05 }
            }
          />
        ))}
      </span>
      <span className="ms-axis__hint">{axis.hint}</span>
    </div>
  );
}

export default function ModelSpec() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const tabsRef = useRef(null);

  const model = MODELS[active];

  /* Roving-tabindex arrow keys, because this is a tablist and a tablist that
     needs four tab stops to get through is a worse keyboard experience than the
     radio group it is imitating. Left/Right wrap; Home/End jump. */
  const onKeyDown = (e) => {
    const last = MODELS.length - 1;
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    /* Focus follows selection inside a tablist — the panel below has already
       changed, so leaving focus on the old channel desynchronises what is
       selected from what is focused. */
    tabsRef.current?.querySelectorAll("[role='tab']")[next]?.focus();
  };

  return (
    <section className="ms" id="models" aria-labelledby="ms-title">
      <div className="ms__grain" aria-hidden="true" />

      <div className="page ms__inner">
        {/* --- head: the constant, stated once ---------------------------- */}
        <Reveal className="ms-head" variant="rise">          <h2 className="ms-title" id="ms-title">
            One prompt. Four <em>engines</em>.
          </h2>
          <p className="ms-head__lede">
            The same prompt runs on any of four open models, and they disagree —
            about how many steps a frame takes, how literally a clause is read,
            how far the surface is built. Pick a channel.
          </p>
        </Reveal>

        {/* The prompt being held still. It is the control variable of the
            whole comparison, so it is set once, at the top, in mono — and it
            does not change when you switch models, which is the point. */}
        <Reveal className="ms-const" variant="rise" delay={1}>
          <span className="label ms-const__tag">Held constant</span>
          <code className="ms-const__prompt">
            <span className="ms-const__sigil">›</span>
            {REFERENCE_PROMPT}
          </code>
        </Reveal>

        {/* --- the channel selector --------------------------------------- */}
        <Reveal className="ms-bank" variant="rise" delay={2}>
          <div
            className="ms-tabs"
            role="tablist"
            aria-label="Model"
            aria-orientation="horizontal"
            ref={tabsRef}
            onKeyDown={onKeyDown}
          >
            {MODELS.map((m, i) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                id={`ms-tab-${m.id}`}
                className="ms-tab"
                aria-selected={i === active}
                aria-controls="ms-readout"
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
              >
                {/* The lit rail is the selection, shared between the four tabs
                    and slid by layoutId — so the indicator travels to the new
                    channel instead of blinking out and in somewhere else.
                    That travel is what makes this feel switched rather than
                    re-rendered. */}
                {i === active && (
                  <motion.span
                    layoutId="ms-rail"
                    className="ms-tab__rail"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                    aria-hidden="true"
                  />
                )}
                <span className="ms-tab__name">{m.name}</span>
                <span className="ms-tab__variant">{m.variant}</span>
                {m.isDefault && (
                  <span className="ms-tab__default">Default</span>
                )}
              </button>
            ))}
          </div>

          {/* --- the readout ---------------------------------------------- */}
          {/* aria-live is deliberately absent: the panel is wired to the tablist
              by aria-controls, so a screen reader is already taken here on
              select, and announcing the whole spec sheet again on top of that
              is noise. */}
          <div
            className="ms-read"
            id="ms-readout"
            role="tabpanel"
            aria-labelledby={`ms-tab-${model.id}`}
            tabIndex={-1}
          >
            {/* Row 1 — the step ladder, the headline difference. */}
            <div className="ms-read__steps">
              <div className="ms-steps__figure">
                <AnimatedNumber
                  className="ms-steps__num"
                  value={model.steps}
                  duration={reduced ? 0 : 520}
                />
                <span className="ms-steps__unit">
                  denoising steps
                  <span className="ms-steps__scale">of 30 on this scale</span>
                </span>
              </div>
              <Ladder steps={model.steps} reduced={reduced} />
            </div>

            {/* Row 2 — character, as ordinals. Not scores. */}
            <div className="ms-read__axes">
              {AXES.map((axis, i) => (
                <Axis
                  key={axis.id}
                  axis={axis}
                  tier={model.tiers[axis.id]}
                  reduced={reduced}
                  delay={i * 0.06}
                />
              ))}
            </div>

            {/* Row 3 — the hard spec. A definition list, because that is what
                it is: each row is a term and its value, and a table here would
                promise columns the layout does not have. */}
            <dl className="ms-spec">
              <div className="ms-spec__row">
                <dt>Native</dt>
                <dd data-numeric>
                  <AnimatedNumber
                    value={model.native}
                    duration={reduced ? 0 : 520}
                    format={(n) => `${Math.round(n)}`}
                  />
                  <span className="ms-spec__dim">
                    &times;
                    <AnimatedNumber
                      value={model.native}
                      duration={reduced ? 0 : 520}
                      format={(n) => `${Math.round(n)}`}
                    />
                  </span>
                </dd>
              </div>
              <div className="ms-spec__row">
                <dt>Params</dt>
                <dd>{model.params}</dd>
              </div>
              {/* title on the values that could in principle outgrow their
                  row: the spec rows are a fixed height so the panel does not
                  resize between models, and a value that ellipsises should
                  still be recoverable rather than simply lost. */}
              <div className="ms-spec__row">
                <dt>Sampler</dt>
                <dd title={model.sampler}>{model.sampler}</dd>
              </div>
              <div className="ms-spec__row">
                <dt>Architecture</dt>
                <dd title={model.arch}>{model.arch}</dd>
              </div>
              <div className="ms-spec__row">
                <dt>Licence</dt>
                <dd title={model.licence}>{model.licence}</dd>
              </div>
              <div className="ms-spec__row">
                <dt>Published by</dt>
                <dd title={model.org}>{model.org}</dd>
              </div>
            </dl>

            {/* Row 4 — the verdict. Keyed on the model so it re-enters rather
                than mutating in place: the three rows above resolve, and this
                one arrives, which keeps the eye's order of reading intact.

                The `character` paragraph that used to sit beside this pair is
                gone, on measurement rather than taste: the section ran 284px
                over its one-viewport budget, and that block was both the
                least-read thing here and largely a longer restatement of
                `bestFor`. Two short labelled lines answer "what is this one
                for" faster than a paragraph plus two lines did. `character` is
                still in the data file for a detail view that has room for it —
                do not reinstate it here without re-measuring. */}
            <motion.div
              className="ms-read__prose"
              key={model.id}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.08 }}
            >
              <p className="ms-verdict__item ms-verdict__item--for">
                <span className="label">Reach for it</span>
                {model.bestFor}
              </p>
              <p className="ms-verdict__item">
                <span className="label">Watch for</span>
                {model.watchFor}
              </p>
            </motion.div>
          </div>
        </Reveal>

        {/* The honesty note, on the page rather than only in a comment. A
            reviewer asking "where did these numbers come from" should find the
            answer in the section, not have to assume. */}
        <Reveal className="ms-foot" variant="rise" delay={3}>
          <p className="ms-foot__note">
            Figures are each model&rsquo;s own published spec — steps, training
            resolution, sampler, licence. The three axes are ranked relative to
            each other on this set, not benchmarked.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
