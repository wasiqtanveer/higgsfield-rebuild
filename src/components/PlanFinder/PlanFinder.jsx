import { useMemo, useState } from "react";
import * as Icons from "../Icon/Icon.jsx";
import AnimatedNumber from "../AnimatedNumber/AnimatedNumber.jsx";
import {
  FINDER_FEATURES,
  FINDER_GOALS,
  FINDER_RATES,
  PLANS,
} from "../../data/pricing.js";
import "./PlanFinder.css";

const fmt = (n) => Math.round(n).toLocaleString("en-US");

/* Capacity per plan at its top credit tier -- the recommendation is the
   cheapest plan that still covers the month the visitor just described. */
const CAPACITY = PLANS.map((p) => ({
  plan: p,
  max: p.credits.steps[p.credits.steps.length - 1] ?? p.credits.base,
}));

export default function PlanFinder() {
  const [goals, setGoals] = useState(["social"]);
  const [videos, setVideos] = useState(50);
  const [images, setImages] = useState(60);
  const [features, setFeatures] = useState(FINDER_FEATURES.map((f) => f.id));
  const [annual, setAnnual] = useState(true);
  const [premium, setPremium] = useState(false);
  const [why, setWhy] = useState(false);

  const toggle = (list, set, id) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const videoCredits = videos * FINDER_RATES.video.per * (premium ? 2 : 1);
  const imageCredits = images * FINDER_RATES.image.per;
  const need = videoCredits + imageCredits;

  /* Falls through to the largest plan rather than returning nothing: a
     configurator that recommends nothing at the top of its own range reads as
     broken, not as honest. */
  const pick = useMemo(
    () => CAPACITY.find((c) => c.max >= need) ?? CAPACITY[CAPACITY.length - 1],
    [need]
  );
  const plan = pick.plan;

  /* The recommended tier is the smallest one on that plan that still fits. */
  const steps = plan.credits.steps.length ? plan.credits.steps : [plan.credits.base];
  const tier = steps.find((s) => s >= need) ?? steps[steps.length - 1];
  const tierIndex = steps.indexOf(tier);

  /* Price scales with the tier: the headline number on a plan card is its
     entry tier, and quoting that for a top-tier allowance would be a lie the
     checkout would immediately contradict. */
  const mult = tier / steps[0];
  const monthly = Math.floor(plan.monthly * mult);
  const annualPrice = Math.floor(plan.annual * mult);
  const price = annual ? annualPrice : monthly;
  const saving = (monthly - annualPrice) * 12;
  const usage = Math.min(100, (need / tier) * 100);

  return (
    <div className="finder">
      {/* Left: the questions ---------------------------------------------- */}
      <div className="finder__form">
        <section className="finder__step">
          <span className="finder__num">1</span>
          <div>
            <h3 className="finder__q">What are you here to make?</h3>
            <p className="finder__hint">Multiple options can be selected</p>
            <div className="finder__goals">
              {FINDER_GOALS.map((g) => {
                const Glyph = Icons[g.icon] ?? Icons.Sparkle;
                const on = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    className={"finder__goal " + (on ? "is-on" : "")}
                    aria-pressed={on}
                    onClick={() => toggle(goals, setGoals, g.id)}
                  >
                    <Glyph size={17} />
                    <span>{g.label}</span>
                    <span className="finder__box" aria-hidden="true">
                      {on && <Icons.Check size={13} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="finder__step">
          <span className="finder__num">2</span>
          <div>
            <h3 className="finder__q">
              How many content items per month?
              <Icons.Info size={15} className="finder__info" />
            </h3>
            <p className="finder__hint">
              &asymp; {FINDER_RATES.video.per} credits each &middot; {FINDER_RATES.video.note}
              <br />= {FINDER_RATES.image.per} credits each &middot; {FINDER_RATES.image.note}
            </p>

            <div className="finder__sliders">
              <Slider
                label={`~${videos} ${FINDER_RATES.video.label}`}
                credits={videoCredits}
                value={videos}
                max={FINDER_RATES.video.max}
                step={FINDER_RATES.video.step}
                onChange={setVideos}
              />
              <Slider
                label={`~${images} ${FINDER_RATES.image.label}`}
                credits={imageCredits}
                value={images}
                max={FINDER_RATES.image.max}
                step={FINDER_RATES.image.step}
                onChange={setImages}
              />
            </div>
          </div>
        </section>

        <section className="finder__step">
          <span className="finder__num">3</span>
          <div>
            <div className="finder__qrow">
              <div>
                <h3 className="finder__q">Features &amp; capabilities</h3>
                <p className="finder__hint">Add anything else you&rsquo;ll need</p>
              </div>
              <button
                type="button"
                className="finder__add"
                onClick={() => setFeatures(FINDER_FEATURES.map((f) => f.id))}
              >
                <span aria-hidden="true">+</span> Add features
                <span className="finder__count">{features.length}</span>
              </button>
            </div>

            <div className="finder__chips">
              {FINDER_FEATURES.filter((f) => features.includes(f.id)).map((f) => (
                <span className="finder__chip" key={f.id}>
                  {f.tier && <span className="finder__tier">{f.tier}</span>}
                  {f.label}
                  <button
                    type="button"
                    aria-label={`Remove ${f.label}`}
                    onClick={() => toggle(features, setFeatures, f.id)}
                  >
                    <Icons.Close size={12} />
                  </button>
                </span>
              ))}
              {features.length === 0 && (
                <p className="finder__hint">Nothing added &mdash; any plan will do.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Right: the answer ------------------------------------------------ */}
      <div className="finder__result">
        <p className="finder__reco">We recommend {plan.name} plan</p>
        <button
          type="button"
          className="finder__why"
          aria-expanded={why}
          onClick={() => setWhy((v) => !v)}
        >
          See why
          <Icons.Info size={14} />
        </button>

        {why && (
          <p className="finder__whytext">
            Your month comes to about {fmt(need)} credits. {plan.name} at{" "}
            {fmt(tier)} credits is the cheapest tier that covers it with headroom.
          </p>
        )}

        <article className={`finder__card finder__card--${plan.tone}`}>
          <h4 className="finder__cardname">
            {plan.name}
            {plan.badge && <span className="finder__badge">{plan.badge}</span>}
          </h4>
          <p className="finder__cardtag">{plan.tagline}</p>

          <div className="finder__creditbox">
            <p className="finder__creditline">
              <Icons.Sparkle size={15} />
              <strong>
                <AnimatedNumber value={tier} /> credits/mo
              </strong>
            </p>
            <div
              className="finder__track"
              style={{ "--fill": `${steps.length > 1 ? (tierIndex / (steps.length - 1)) * 100 : 100}%` }}
              aria-hidden="true"
            >
              <span className="finder__knob" />
            </div>
            <div className="finder__tierrow">
              {steps.map((s) => (
                <span key={s} className={s === tier ? "is-on" : ""}>
                  <Icons.Coin size={13} />
                  {fmt(s)}
                </span>
              ))}
            </div>
          </div>

          <p className="finder__usage">
            <span>Expected monthly usage</span>
            <strong>
              <AnimatedNumber value={need} />/<AnimatedNumber value={tier} /> credits
            </strong>
          </p>
          <div className="finder__bar" aria-hidden="true">
            <span style={{ width: `${usage}%` }} />
          </div>

          <ul className="finder__perks">
            <li>
              <Icons.Check size={15} /> 7-Day Unlimited Kling 3.0 + Nano Banana 2
            </li>
            <li>
              <Icons.Check size={15} /> Access to all models &amp; features
            </li>
            <li>
              <Icons.Check size={15} /> 5,000 free Soul 2.0 &amp; Cinema generation
            </li>
          </ul>

          <p className="finder__price">
            {annual && (
              <s>
                $<AnimatedNumber value={monthly} />
              </s>
            )}
            <strong>
              $<AnimatedNumber value={price} />
            </strong>
            <span>/month, billed {annual ? "annually" : "monthly"}</span>
          </p>

          <a href="#plans" className={`finder__cta finder__cta--${plan.ctaVariant}`}>
            {plan.cta}
          </a>

          <p className="finder__save">
            {annual && saving > 0 ? (
              <>
                <strong>
                  Save $<AnimatedNumber value={saving} />
                </strong>{" "}
                compared to monthly
              </>
            ) : (
              "Billed every month"
            )}
          </p>
        </article>

        <div className="finder__switches">
          <button
            type="button"
            className="finder__switch"
            aria-pressed={premium}
            onClick={() => setPremium((v) => !v)}
          >
            <span className={"finder__toggle " + (premium ? "is-on" : "")} aria-hidden="true">
              <i />
            </span>
            Premium quality
            <Icons.Info size={14} className="finder__info" />
          </button>

          <div className="finder__switch">
            <span className={annual ? "is-dim" : ""}>Monthly</span>
            <button
              type="button"
              aria-label="Bill annually"
              aria-pressed={annual}
              onClick={() => setAnnual((v) => !v)}
            >
              <span className={"finder__toggle " + (annual ? "is-on" : "")} aria-hidden="true">
                <i />
              </span>
            </button>
            <span className={annual ? "" : "is-dim"}>Annual</span>
            <span className="finder__off">30% off</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Slider with the tick comb behind it. The comb is decoration, so it is
 *  drawn once as a repeating gradient rather than as 40 elements. */
function Slider({ label, credits, value, max, step, onChange }) {
  const pct = (value / max) * 100;
  return (
    <div className="finder__slider">
      <div className="finder__comb" style={{ "--fill": `${pct}%` }} aria-hidden="true" />
      <input
        type="range"
        min={step}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        style={{ "--fill": `${pct}%` }}
      />
      <p className="finder__readout">
        <span>{label}</span>
        <strong>
          <AnimatedNumber value={credits} duration={260} /> credits
        </strong>
        <span className="finder__max">
          <Icons.Chevron size={12} className="finder__maxchev" />
          {max}+
        </span>
      </p>
    </div>
  );
}
