import { useState } from "react";
import PlanCard from "../../components/PlanCard/PlanCard.jsx";
import PlanFinder from "../../components/PlanFinder/PlanFinder.jsx";
import CompareTable from "../../components/CompareTable/CompareTable.jsx";
import Faq from "../../components/Faq/Faq.jsx";
import OfferDock from "../../components/OfferDock/OfferDock.jsx";
import * as Icons from "../../components/Icon/Icon.jsx";
import {
  AUDIENCE_HEADERS,
  BUSINESS_PLANS,
  FAQS,
  PLANS,
} from "../../data/pricing.js";
import "./Pricing.css";

export default function Pricing() {
  const [audience, setAudience] = useState("individual");
  const [annual, setAnnual] = useState(true);

  const plans = audience === "individual" ? PLANS : BUSINESS_PLANS;
  const header = AUDIENCE_HEADERS[audience];
  const promo = header.promo;

  return (
    <div className="pricing">
      <div className="page">
        {/* Promo ---------------------------------------------------------- */}
        <aside className={`pricing__promo pricing__promo--${promo.tone}`}>
          <span className="pricing__promo-badges">
            {promo.badges.map((b) => {
              const Glyph = b.icon ? Icons[b.icon] : null;
              return (
                <span
                  key={b.label}
                  className={`pricing__promo-badge is-${b.tone}`}
                >
                  {Glyph && <Glyph size={12} />}
                  {b.label}
                </span>
              );
            })}
          </span>
          <h2 className="pricing__promo-title">
            <em>{promo.lead}</em>
            <br />
            {promo.rest}
          </h2>
          <p className="pricing__promo-blurb">{promo.blurb}</p>
          {promo.cta && (
            <a href="#plans" className="pricing__promo-cta">
              {promo.cta}
            </a>
          )}
        </aside>

        {/* Plans ---------------------------------------------------------- */}
        <section className="pricing__section" id="plans">
          <h1 className="pricing__h1">{header.title}</h1>
          <p className="pricing__lede">{header.lede}</p>

          <div className="pricing__controls">
            <div className="pricing__seg" role="tablist" aria-label="Audience">
              {[
                { id: "individual", label: "Individual plans" },
                { id: "business", label: "Business plans" },
              ].map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={audience === t.id}
                  className={
                    "pricing__segbtn " + (audience === t.id ? "is-on" : "")
                  }
                  onClick={() => setAudience(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="pricing__controls-right">
              {audience === "individual" && (
                <a href="#finder" className="pricing__unsure">
                  <Icons.Compass size={16} />
                  Not sure which plan?
                </a>
              )}

              <div className="pricing__billing">
                <span className={annual ? "is-dim" : ""}>Monthly</span>
                <button
                  type="button"
                  aria-label="Bill annually"
                  aria-pressed={annual}
                  onClick={() => setAnnual((v) => !v)}
                >
                  <span
                    className={"pricing__toggle " + (annual ? "is-on" : "")}
                    aria-hidden="true"
                  >
                    <i />
                  </span>
                </button>
                <span className={annual ? "" : "is-dim"}>Annual</span>
              </div>
            </div>
          </div>

          <div className="pricing__grid" key={audience}>
            {plans.map((p) => (
              <PlanCard key={p.id} plan={p} annual={annual} />
            ))}
          </div>

          <p className="pricing__links">
            <a href="#faq">
              How do Higgsfield plans work? <Icons.ArrowUpRight size={14} />
            </a>
            <a href="#faq">
              What are Unlimited models? <Icons.ArrowUpRight size={14} />
            </a>
          </p>
        </section>

        {/* Finder -- individual ladder only -------------------------------- */}
        {audience === "individual" && (
          <section className="pricing__section" id="finder">
            <h2 className="pricing__h2">Find the best plan for you</h2>
            <p className="pricing__lede">
              Choose what you want to create and get what you need
            </p>
            <PlanFinder />
          </section>
        )}

        {/* Compare -------------------------------------------------------- */}
        <section className="pricing__section" id="compare">
          <h2 className="pricing__h2">Compare features</h2>
          <p className="pricing__lede">
            See in details what plan suits you best
          </p>
          <CompareTable
            annual={annual}
            onToggleAnnual={() => setAnnual((v) => !v)}
          />
        </section>

        {/* FAQ ------------------------------------------------------------ */}
        <section className="pricing__section pricing__section--faq" id="faq">
          <h2 className="pricing__h2 pricing__h2--center">
            Frequently Asked Questions
          </h2>
          <Faq items={FAQS} />

          <p className="pricing__ready">
            Are you ready?
            <a href="#plans" className="pricing__choose">
              Choose your plan
            </a>
          </p>
        </section>
      </div>

      {/* Corner offer ----------------------------------------------------- */}
      <OfferDock />
    </div>
  );
}
