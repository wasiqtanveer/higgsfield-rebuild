import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button.jsx";
import MediaCard from "../../components/MediaCard/MediaCard.jsx";
import PresetGrid from "../../components/PresetGrid/PresetGrid.jsx";
import { MODELS } from "../../data/models.js";
import { CLIPS } from "../../data/gallery.js";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const [seed, setSeed] = useState("");

  /* The hero input is a real entry point, not a decorative field: whatever is
     typed here is handed to the composer. Nothing is more deflating on a
     product landing page than a prompt box that turns out to be a picture of
     a prompt box. */
  const launch = (e) => {
    e.preventDefault();
    const q = seed.trim();
    navigate(q ? `/create?seed=${encodeURIComponent(q)}` : "/create");
  };

  return (
    <div className="landing">
      {/* Hero ------------------------------------------------------------ */}
      <section className="landing__hero">
        <div className="landing__hero-glow" aria-hidden="true" />
        <div className="page landing__hero-inner">
          <span className="landing__eyebrow">AI-native creative suite</span>
          <h1 className="landing__h1">
            From a single prompt
            <br />
            to a finished shot.
          </h1>
          <p className="landing__lede">
            Generate video, images and voice from text or a reference. Pick the
            model, or let it pick for you.
          </p>

          <form className="landing__seed" onSubmit={launch}>
            <label htmlFor="seed" className="sr-only">
              Describe what to generate
            </label>
            <input
              id="seed"
              className="landing__seed-input"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="A figure walking across cloud, slow tracking shot…"
            />
            <Button type="submit" variant="primary" size="md">
              Generate
            </Button>
          </form>

          <p className="landing__note">
            Demo build &mdash; results are pre-rendered samples.
          </p>
        </div>

        <div className="page landing__strip">
          {CLIPS.slice(0, 6).map((c) => (
            <MediaCard key={c.id} clip={c} ratio="3 / 4" showMeta={false} />
          ))}
        </div>
      </section>

      {/* Effects ---------------------------------------------------------- */}
      <section className="section page" id="effects">
        <div className="section__head">
          <div>
            <h2 className="section__title">Visual Effects</h2>
            <p className="landing__section-sub">
              Big-budget looks as one-click presets. Each one loads straight
              into the composer.
            </p>
          </div>
          <Link className="section__link" to="/create">
            Start generating &rarr;
          </Link>
        </div>
        <PresetGrid limit={8} />
      </section>

      {/* Models ----------------------------------------------------------- */}
      <section className="section page" id="models">
        <div className="section__head">
          <div>
            <h2 className="section__title">Every model, one workspace</h2>
            <p className="landing__section-sub">
              Switch between them mid-project without leaving the page.
            </p>
          </div>
        </div>

        <div className="landing__models">
          {MODELS.map((m) => (
            <article className="landing__model" key={m.id}>
              <header className="landing__model-head">
                <span className="landing__model-dot" data-kind={m.kind} aria-hidden="true" />
                <h3 className="landing__model-name">{m.name}</h3>
                {m.badge && <span className="landing__model-badge">{m.badge}</span>}
              </header>
              <p className="landing__model-blurb">{m.blurb}</p>
              <footer className="landing__model-foot">
                <span>{m.vendor}</span>
                <span>{m.credits} cr</span>
              </footer>
            </article>
          ))}
        </div>
      </section>

      {/* Community --------------------------------------------------------- */}
      <section className="section page" id="community">
        <div className="section__head">
          <h2 className="section__title">Made with Higgsfield</h2>
          <Link className="section__link" to="/explore">
            Explore community &rarr;
          </Link>
        </div>
        <div className="landing__community">
          {CLIPS.slice(0, 8).map((c) => (
            <MediaCard key={c.id} clip={c} ratio="16 / 9" />
          ))}
        </div>
      </section>

      {/* Close -------------------------------------------------------------- */}
      <section className="section page" id="pricing">
        <div className="landing__cta">
          <h2 className="landing__cta-title">Start with the free tier.</h2>
          <p className="landing__cta-sub">
            No card. Enough credits to find out whether this fits how you work.
          </p>
          <div className="landing__cta-row">
            <Button variant="primary" size="lg" to="/create">
              Start creating
            </Button>
            <Button variant="secondary" size="lg" to="/explore">
              See what others made
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
