import { useState } from "react";
import * as Icons from "../Icon/Icon.jsx";
import AnimatedNumber from "../AnimatedNumber/AnimatedNumber.jsx";
import "./PlanCard.css";

const fmt = (n) => n.toLocaleString("en-US");

/** Check or cross, drawn at the same weight as the rest of the set so a row
 *  that is switched off reads as quiet rather than as an error. */
function Mark({ on }) {
  return on ? (
    <Icons.Check size={16} className="plan__mark plan__mark--on" />
  ) : (
    <Icons.Close size={16} className="plan__mark plan__mark--off" />
  );
}

function Badges({ items }) {
  if (!items?.length) return null;
  return items.map((b) => (
    <span
      key={b.label}
      className={`plan__pill plan__pill--${b.tone ?? "mute"}`}
    >
      {b.label}
    </span>
  ));
}

export default function PlanCard({ plan, annual }) {
  /* The credit slider is the card's one piece of state. Plans with a single
     tier skip it entirely rather than rendering a slider that cannot move --
     a dead control costs more trust than the space it saves. */
  const [tier, setTier] = useState(0);
  const business = plan.kind === "business";
  const steps = plan.credits.steps ?? [];
  const tiered = steps.length > 1;
  const credits = tiered ? steps[tier] : plan.credits.base;

  /* Business plans are sized by seats, not by a credit tier. The stepper is
     the control that replaces the slider, and it clamps rather than wrapping
     -- a team plan that silently jumps from 9 seats to 2 would be a bug the
     buyer only discovers at checkout. */
  const [seats, setSeats] = useState(plan.seats?.start ?? 1);
  const bumpSeats = (d) =>
    setSeats((n) => Math.min(plan.seats.max, Math.max(plan.seats.min, n + d)));

  const price = annual ? plan.annual : plan.monthly;
  const discounted = annual && plan.annual !== plan.monthly;
  const saving = (plan.monthly - plan.annual) * 12;

  return (
    <article className={`plan plan--${plan.tone}`}>
      <header className="plan__head">
        <h3 className="plan__name">
          {plan.name}
          {plan.badge && (
            <span className="plan__pill plan__pill--promo">{plan.badge}</span>
          )}
          {plan.flag && (
            <span className="plan__pill plan__pill--flag">
              <Icons.Diamond size={12} />
              {plan.flag}
            </span>
          )}
        </h3>
        <p className="plan__tagline">{plan.tagline}</p>
      </header>

      <div className="plan__credits">
        <p className="plan__creditline">
          <Icons.Sparkle size={16} />
          <strong>
            {business ? (
              plan.credits.headline
            ) : plan.custom ? (
              "Custom credits"
            ) : (
              <>
                <AnimatedNumber value={credits} /> credits/mo.
              </>
            )}
          </strong>
        </p>
        {plan.credits.lines.map((l) => (
          <p className="plan__creditsub" key={l}>
            {l}
          </p>
        ))}

        {business ? null : tiered ? (
          <div className="plan__slider">
            <input
              type="range"
              min={0}
              max={steps.length - 1}
              step={1}
              value={tier}
              onChange={(e) => setTier(Number(e.target.value))}
              aria-label={`${plan.name} monthly credits`}
              style={{ "--fill": `${(tier / (steps.length - 1)) * 100}%` }}
            />
            <div className="plan__ticks">
              {steps.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  className={"plan__tick " + (i === tier ? "is-active" : "")}
                  onClick={() => setTier(i)}
                >
                  <Icons.Coin size={13} />
                  {fmt(s)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          plan.credits.note && (
            <p className="plan__fixed">
              <Icons.Check size={14} />
              {plan.credits.note}
            </p>
          )
        )}
      </div>

      <div className="plan__price">
        {plan.custom ? (
          <strong className="plan__amount">
            {business ? "Let's talk" : "Custom"}
          </strong>
        ) : (
          <>
            {discounted && <s className="plan__was">${plan.monthly}</s>}
            <strong className="plan__amount">${price}</strong>
            <span className="plan__per">
              {business
                ? `per seat/mo · ${annual ? "annual" : "monthly"}`
                : `per month, billed ${annual ? "annually" : "monthly"}`}
            </span>
          </>
        )}
      </div>

      <a href="#plans" className={`plan__cta plan__cta--${plan.ctaVariant}`}>
        {plan.cta}
      </a>

      <p className="plan__saving">
        {plan.custom ? (
          (plan.note ?? "Priced to your volume")
        ) : annual && saving > 0 ? (
          <>
            <strong>Save ${saving}</strong> compared to monthly
          </>
        ) : (
          "No difference compared to monthly"
        )}
      </p>

      {business && plan.seats && (
        <div className="plan__seats">
          <button
            type="button"
            onClick={() => bumpSeats(-1)}
            disabled={seats <= plan.seats.min}
            aria-label="Remove a seat"
          >
            <Icons.Minus size={16} />
          </button>
          <span aria-live="polite">
            <AnimatedNumber value={seats} duration={200} /> seats
          </span>
          <button
            type="button"
            onClick={() => bumpSeats(1)}
            disabled={seats >= plan.seats.max}
            aria-label="Add a seat"
          >
            <Icons.Plus size={16} />
          </button>
        </div>
      )}

      {plan.secondaryCta && (
        <a href="#plans" className="plan__secondary">
          {plan.secondaryCta}
        </a>
      )}

      {business && (
        <ul className="plan__features plan__features--lead">
          {plan.features.map((f) => (
            <li key={f.label}>
              <Mark on={f.has} />
              <span className={f.link ? "plan__flink" : ""}>{f.label}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Unlimited block ------------------------------------------------- */}
      <section
        className={"plan__block " + (plan.unlimited.locked ? "is-locked" : "")}
      >
        <h4 className="plan__blocktitle">
          {(() => {
            const Glyph = Icons[plan.unlimited.icon] ?? Icons.Lock;
            return <Glyph size={15} />;
          })()}
          {plan.unlimited.title ?? "Unlimited & free gens"}
          {plan.unlimited.learnMore ? (
            <a href="#faq" className="plan__learn">
              Learn more
            </a>
          ) : (
            <Icons.Info size={15} className="plan__info" />
          )}
        </h4>
        {plan.unlimited.rows.map((r) => (
          <p className="plan__row" key={r.name}>
            <Mark on={r.has} />
            <span className="plan__rowname">{r.name}</span>
            <Badges items={r.badges} />
          </p>
        ))}
        {plan.unlimited.more && (
          <a href="#plans" className="plan__more">
            <span aria-hidden="true">+</span>
            {plan.unlimited.more}
            <Icons.Chevron size={15} className="plan__morechev" />
          </a>
        )}
      </section>

      {/* Seedance block -- individual plans only ------------------------- */}
      {plan.seedance && (
        <section
          className={`plan__seedance plan__seedance--${plan.seedance.tone}`}
        >
          <header className="plan__seedhead">
            <div>
              <h4 className="plan__seedtitle">
                {plan.seedance.tone === "blue" ? (
                  <>
                    Access to <em>Seedance models</em>
                  </>
                ) : (
                  plan.seedance.title
                )}
              </h4>
              <p className="plan__seedblurb">{plan.seedance.blurb}</p>
            </div>
            <span className="plan__seedglyph" aria-hidden="true">
              <Icons.Bars size={18} />
            </span>
          </header>
          <div className="plan__seedrows">
            {plan.seedance.rows.map((r) => (
              <p className="plan__row" key={r.name}>
                {r.has ? (
                  <Icons.Bars size={16} className="plan__mark" />
                ) : (
                  <Mark on={false} />
                )}
                <span className="plan__rowname">{r.name}</span>
                <Badges
                  items={r.badges ?? (r.badge ? [{ label: r.badge }] : null)}
                />
              </p>
            ))}
          </div>
        </section>
      )}

      {!business && (
        <ul className="plan__features">
          {plan.features.map((f) => (
            <li key={f.label} className={f.has ? "" : "is-off"}>
              <Mark on={f.has} />
              <span className={f.link ? "plan__flink" : ""}>{f.label}</span>
              {f.badge && (
                <span
                  className={`plan__pill plan__pill--${f.badgeTone ?? "promo"}`}
                >
                  {f.badge}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {business && plan.admin && (
        <section className="plan__admin">
          <h4 className="plan__adminlabel">Admin &amp; Control</h4>
          <ul className="plan__features">
            {plan.admin.map((f) => (
              <li key={f.label} className={f.has ? "" : "is-off"}>
                <Mark on={f.has} />
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
