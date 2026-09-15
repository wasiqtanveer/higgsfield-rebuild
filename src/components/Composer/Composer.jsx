import { useEffect, useRef, useState } from "react";
import * as Icons from "../Icon/Icon.jsx";
import { MODELS, getModel } from "../../data/models.js";
import "./Composer.css";

/** One control pill. Every option list on this bar behaves the same way, so
 *  they share an implementation rather than four near-identical menus. */
function Pill({ icon, value, options, onChange, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const Glyph = icon ? Icons[icon] : null;

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="composer__pillwrap" ref={ref}>
      <button
        type="button"
        className={"composer__pill " + (open ? "is-open" : "")}
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        {Glyph && <Glyph size={16} />}
        {value}
      </button>

      {open && (
        <ul className="composer__menu" role="listbox">
          {options.map((o) => (
            <li key={o}>
              <button
                type="button"
                role="option"
                aria-selected={o === value}
                className={o === value ? "is-on" : ""}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
              >
                {o}
                {o === value && <Icons.Check size={14} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Composer({
  prompt,
  onPromptChange,
  modelId,
  onModelChange,
  ratio,
  onRatioChange,
  quality,
  onQualityChange,
  resolution,
  onResolutionChange,
  style,
  onStyleChange,
  count,
  onCountChange,
  onSubmit,
  busy,
}) {
  const [modelOpen, setModelOpen] = useState(false);
  const modelRef = useRef(null);
  const model = getModel(modelId);

  /* Cost scales with how many frames you asked for, so the number on the
     button is what the run actually costs -- a flat price beside a count
     stepper is a promise the backend would immediately break. */
  const unit = model.credits ?? 4;
  const list = model.listCredits ? model.listCredits * count : null;
  const cost = unit * count;

  useEffect(() => {
    if (!modelOpen) return;
    const onDown = (e) => {
      if (!modelRef.current?.contains(e.target)) setModelOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [modelOpen]);

  const send = (e) => {
    e?.preventDefault();
    if (!prompt.trim() || busy) return;
    onSubmit();
  };

  return (
    <form className="composer" onSubmit={send}>
      <div className="composer__row">
        <button type="button" className="composer__add" aria-label="Add a reference">
          <Icons.Plus size={18} />
        </button>

        <input
          className="composer__input"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe the scene you imagine"
          aria-label="Prompt"
        />
      </div>

      <div className="composer__controls">
        {/* Model gets its own control: it carries a vendor mark and a blurb,
            which the plain option lists do not. */}
        <div className="composer__pillwrap" ref={modelRef}>
          <button
            type="button"
            className={"composer__pill composer__pill--model " + (modelOpen ? "is-open" : "")}
            aria-expanded={modelOpen}
            onClick={() => setModelOpen((v) => !v)}
          >
            <span className="composer__vendor" aria-hidden="true">
              <Icons.Burst size={15} />
            </span>
            {model.name}
            <Icons.Chevron size={15} className="composer__pillchev" />
          </button>

          {modelOpen && (
            <ul className="composer__menu composer__menu--wide" role="listbox">
              {MODELS.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={m.id === modelId}
                    className={m.id === modelId ? "is-on" : ""}
                    onClick={() => {
                      onModelChange(m.id);
                      setModelOpen(false);
                    }}
                  >
                    <span className="composer__opt">
                      <strong>
                        {m.name}
                        {m.badge && <em>{m.badge}</em>}
                      </strong>
                      <span>{m.blurb}</span>
                    </span>
                    {m.id === modelId && <Icons.Check size={14} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Pill
          icon="Frame"
          label="Aspect ratio"
          value={ratio}
          options={["Auto", ...model.ratios]}
          onChange={onRatioChange}
        />
        <Pill
          icon="Diamond"
          label="Quality"
          value={quality}
          options={["Draft", "High", "Ultra"]}
          onChange={onQualityChange}
        />
        <Pill
          icon="Diamond"
          label="Resolution"
          value={resolution}
          options={model.resolutions}
          onChange={onResolutionChange}
        />
        <Pill
          icon="Aperture"
          label="Style"
          value={style}
          options={["Auto", "Cinematic", "Editorial", "Documentary"]}
          onChange={onStyleChange}
        />

        <div className="composer__count">
          <button
            type="button"
            aria-label="Fewer results"
            disabled={count <= 1}
            onClick={() => onCountChange(count - 1)}
          >
            <Icons.Minus size={15} />
          </button>
          <span>{count}/4</span>
          <button
            type="button"
            aria-label="More results"
            disabled={count >= 4}
            onClick={() => onCountChange(count + 1)}
          >
            <Icons.Plus size={15} />
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="composer__go"
        disabled={!prompt.trim() || busy}
      >
        {busy ? "Generating…" : "Generate"}
        <span className="composer__cost">
          <Icons.Sparkle size={15} />
          {list && <s>{list}</s>}
          {cost}
        </span>
      </button>
    </form>
  );
}
