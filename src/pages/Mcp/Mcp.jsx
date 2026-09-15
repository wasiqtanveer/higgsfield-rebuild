import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as Icons from "../../components/Icon/Icon.jsx";
import MediaCard from "../../components/MediaCard/MediaCard.jsx";
import Faq from "../../components/Faq/Faq.jsx";
import { getClip } from "../../data/gallery.js";
import {
  CLIENTS,
  CLI_NOTE,
  FAN,
  MCP_FAQS,
  MCP_MODELS,
  SKILLS,
  SKILL_CATEGORIES,
  TRANSPORTS,
  WORKFLOWS,
} from "../../data/mcp.js";
import "./Mcp.css";

/* Icons are named in data so the catalogue stays declarative; this resolves a
   name to a component and never throws on a name that has gone stale. */
function Glyph({ name, size = 16, className }) {
  const Cmp = Icons[name];
  return Cmp ? <Cmp size={size} className={className} /> : null;
}

/** The copy-to-clipboard command line shown on the CLI tab. */
function CommandLine({ command }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      /* Clipboard access can be denied outright. The command is on screen and
         selectable either way, so the only thing to suppress is the throw. */
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mcpp__cmd">
      <code className="mcpp__cmd-text">
        <span className="mcpp__cmd-caret" aria-hidden="true">
          $
        </span>
        {command}
      </code>
      <button type="button" className="mcpp__cmd-copy" onClick={copy}>
        <Glyph name={copied ? "Check" : "Layers"} size={15} />
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export default function Mcp() {
  const [clientId, setClientId] = useState(CLIENTS[0].id);
  const [transport, setTransport] = useState("mcp");
  const [flow, setFlow] = useState(WORKFLOWS[0].id);
  const [cat, setCat] = useState("featured");
  const [query, setQuery] = useState("");

  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];
  const workflow = WORKFLOWS.find((w) => w.id === flow) ?? WORKFLOWS[0];

  /* Not every client offers both paths. Picking one that only speaks MCP while
     the CLI tab is showing would otherwise leave the panel empty. */
  const canCli = Boolean(client.cli) && client.transports.includes("cli");
  const mode = transport === "cli" && !canCli ? "mcp" : transport;

  const skills = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inCat =
      cat === "featured"
        ? SKILLS.filter((s) => s.featured)
        : SKILLS.filter((s) => s.cats.includes(cat));
    /* Search reaches past the open category -- looking for a skill by name
       should not require knowing which shelf it was filed on. */
    const pool = q ? SKILLS : inCat;
    return q ? pool.filter((s) => s.name.toLowerCase().includes(q)) : pool;
  }, [cat, query]);

  return (
    <div className="mcpp">
      {/* Hero ------------------------------------------------------------ */}
      <section className="mcpp__hero">
        <div className="mcpp__hero-glow" aria-hidden="true" />

        <div className="page">
          <div className="mcpp__fan" aria-hidden="true">
            {FAN.map((f, i) => (
              <span
                key={i}
                className={"mcpp__fan-tile " + (f.lead ? "is-lead" : "")}
                style={{
                  "--tint": f.tint,
                  "--ink": f.ink ?? "#ffffff",
                  "--i": i - (FAN.length - 1) / 2,
                  "--lift": Math.abs(i - (FAN.length - 1) / 2),
                }}
              >
                <Glyph name={f.icon} size={f.lead ? 46 : 30} />
              </span>
            ))}
          </div>

          <h1 className="mcpp__title display">
            Higgsfield plugin for {client.name}
          </h1>
          <p className="mcpp__lede">
            Create stunning images and videos without leaving {client.name}
          </p>

          {/* Setup card ------------------------------------------------- */}
          <div className="mcpp__setup">
            <div className="mcpp__clients">
              <div className="mcpp__rail" role="tablist" aria-label="Client">
                {CLIENTS.map((c) => (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={c.id === clientId}
                    className={"mcpp__client " + (c.id === clientId ? "is-on" : "")}
                    onClick={() => setClientId(c.id)}
                  >
                    <Glyph name={c.icon} size={17} />
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="mcpp__transport" role="tablist" aria-label="Install method">
                {TRANSPORTS.map((t) => {
                  const off = t.id === "cli" && !canCli;
                  return (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={mode === t.id}
                      disabled={off}
                      title={off ? `${client.name} has no CLI installer` : undefined}
                      className={"mcpp__transport-btn " + (mode === t.id ? "is-on" : "")}
                      onClick={() => setTransport(t.id)}
                    >
                      <Glyph name={t.icon} size={15} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {mode === "mcp" ? (
              <ol className="mcpp__steps">
                {client.steps.map((s, i) => (
                  <li className="mcpp__step" key={s.title}>
                    <span className="mcpp__step-n" aria-hidden="true">
                      {i + 1}
                    </span>
                    <h2 className="mcpp__step-title">{s.title}</h2>
                    <p className="mcpp__step-body">{s.body}</p>
                    <button
                      type="button"
                      className={
                        "mcpp__step-btn mcpp__step-btn--" + (s.action.tone ?? "dark")
                      }
                    >
                      <Glyph name={s.action.icon} size={16} />
                      {s.action.label}
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mcpp__cli">
                <p className="mcpp__cli-note">
                  {CLI_NOTE}
                  <a href="#" onClick={(e) => e.preventDefault()} className="mcpp__cli-link">
                    <Glyph name="ArrowUpRight" size={14} />
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()} className="mcpp__cli-repo">
                    <Glyph name="Terminal" size={15} />
                    GitHub
                  </a>
                </p>
                <CommandLine command={client.cli.command} />
                <p className="mcpp__cli-sub">{client.cli.note}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works ------------------------------------------------- */}
      <section className="mcpp__section page" aria-labelledby="mcp-how">
        <h2 className="mcpp__h2 display" id="mcp-how">
          How does MCP work?
        </h2>

        <div className="mcpp__flowtabs" role="tablist" aria-label="Workflow">
          {WORKFLOWS.map((w) => (
            <button
              key={w.id}
              role="tab"
              aria-selected={w.id === flow}
              className={"mcpp__flowtab " + (w.id === flow ? "is-on" : "")}
              onClick={() => setFlow(w.id)}
            >
              <Glyph name={w.icon} size={15} />
              {w.label}
            </button>
          ))}
        </div>

        <div className="mcpp__demo">
          <article className="mcpp__chat">
            <header className="mcpp__pane-head">
              <Glyph name={client.icon} size={18} />
              {client.name}
            </header>

            {workflow.turns.map((t) => (
              <p className="mcpp__turn" key={t}>
                {t}
              </p>
            ))}

            <div className="mcpp__call">
              <header className="mcpp__call-head">
                <span className="mcpp__call-mark" aria-hidden="true">
                  <Glyph name="Mark" size={14} />
                </span>
                Higgsfield
              </header>

              <div className="mcpp__call-body">
                <div className="mcpp__call-thumbs" aria-hidden="true">
                  {workflow.results.map((id) => {
                    const clip = getClip(id);
                    return (
                      <span
                        key={id}
                        className="mcpp__call-thumb"
                        style={{ background: clip?.tint }}
                      />
                    );
                  })}
                </div>
                <p className="mcpp__call-prompt">{workflow.job.prompt}</p>
              </div>

              <ul className="mcpp__chips">
                {workflow.job.chips.map((c) => (
                  <li className="mcpp__chip" key={c.label}>
                    <Glyph name={c.icon} size={14} />
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="mcpp__result">
            <header className="mcpp__pane-head">
              <Glyph name="Check" size={18} />
              Result
            </header>

            <div className="mcpp__result-grid">
              {workflow.results.map((id) => {
                const clip = getClip(id);
                return clip ? (
                  <MediaCard key={id} clip={clip} ratio="9 / 16" showMeta={false} />
                ) : null;
              })}
            </div>
          </article>
        </div>
      </section>

      {/* Skills ------------------------------------------------------- */}
      <section className="mcpp__section page page--wide" aria-labelledby="mcp-skills">
        <h2 className="mcpp__h2 display" id="mcp-skills">
          Create with Higgsfield skills in {client.name}
        </h2>
        <p className="mcpp__sub">
          Give your {client.name} access to the most powerful image and video models
        </p>

        <div className="mcpp__skills">
          <aside className="mcpp__cats">
            <label className="mcpp__search">
              <Glyph name="Search" size={16} />
              <input
                type="search"
                value={query}
                placeholder="Search"
                aria-label="Search skills"
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            <ul className="mcpp__catlist">
              {SKILL_CATEGORIES.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={
                      "mcpp__cat " + (c.id === cat && !query.trim() ? "is-on" : "")
                    }
                    aria-pressed={c.id === cat}
                    onClick={() => {
                      setCat(c.id);
                      setQuery("");
                    }}
                  >
                    <span
                      className={"mcpp__cat-icon " + (c.lead ? "is-lead" : "")}
                      aria-hidden="true"
                    >
                      <Glyph name={c.icon} size={16} />
                    </span>
                    <span className="mcpp__cat-text">
                      <strong>{c.label}</strong>
                      <em>{c.sub}</em>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="mcpp__skillgrid">
            {skills.map((s) => {
              const clip = getClip(s.clipId);
              return (
                <article className="mcpp__skill" key={s.id}>
                  <div className="mcpp__skill-media">
                    {clip && (
                      <MediaCard clip={clip} ratio="16 / 10" showMeta={false}>
                        {s.overline && (
                          <span className="mcpp__skill-overline">{s.overline}</span>
                        )}
                      </MediaCard>
                    )}
                  </div>
                  <footer className="mcpp__skill-foot">
                    <span className="mcpp__skill-icon" aria-hidden="true">
                      <Glyph name={s.icon} size={15} />
                    </span>
                    <span className="mcpp__skill-name">{s.name}</span>
                    <span className="mcpp__skill-tag">
                      <Glyph name="Bolt" size={13} />
                      Skill
                    </span>
                  </footer>
                </article>
              );
            })}

            {skills.length === 0 && (
              <p className="mcpp__empty">No skill matches “{query.trim()}”.</p>
            )}
          </div>
        </div>
      </section>

      {/* Model wall ---------------------------------------------------- */}
      <section className="mcpp__section page page--wide" aria-labelledby="mcp-models">
        <h2 className="mcpp__h2 display" id="mcp-models">
          Every creative model, inside {client.name}
        </h2>
        <p className="mcpp__sub">
          Give your {client.name} access to the most powerful image and video models.
        </p>

        <div className="mcpp__models">
          {MCP_MODELS.map((m) => {
            const clip = getClip(m.clipId);
            return (
              <article
                className="mcpp__model"
                key={m.name}
                style={{ "--tint": clip?.tint }}
              >
                {clip && (
                  <MediaCard clip={clip} ratio="1 / 1" showMeta={false}>
                    {/* The label sits inside the frame, over a scrim that is
                        part of the tile -- the real wall reads as one object
                        per model, not a picture with a caption under it. */}
                    <footer className="mcpp__model-foot">
                      <Glyph name={m.icon} size={16} />
                      <span className="mcpp__model-name">{m.name}</span>
                    </footer>
                  </MediaCard>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Close --------------------------------------------------------- */}
      <section className="mcpp__section page" aria-labelledby="mcp-faq">
        <h2 className="mcpp__h2 mcpp__h2--left display" id="mcp-faq">
          Questions
        </h2>
        <Faq items={MCP_FAQS} />

        <div className="mcpp__cta">
          <h3 className="mcpp__cta-title display">Connect it once</h3>
          <p className="mcpp__cta-sub">
            Every model, every skill, in the chat window you already have open.
          </p>
          <div className="mcpp__cta-row">
            <button type="button" className="mcpp__step-btn mcpp__step-btn--accent">
              <Glyph name={client.icon} size={16} />
              Connect {client.name}
            </button>
            <Link to="/pricing" className="mcpp__step-btn mcpp__step-btn--dark">
              <Glyph name="Diamond" size={16} />
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
