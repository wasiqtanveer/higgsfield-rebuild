import { useEffect, useRef } from "react";
import ModelPicker from "../ModelPicker/ModelPicker.jsx";
import Button from "../Button/Button.jsx";
import { getModel } from "../../data/models.js";
import "./PromptBar.css";

/**
 * The composer. Prompt, model, and the settings the chosen model actually
 * supports -- the ratio/duration/resolution options are read off the model, so
 * selecting Veo (which is 8s, 16:9 only) visibly collapses the choices rather
 * than offering settings that would be ignored.
 */
export default function PromptBar({
  prompt, onPromptChange,
  modelId, onModelChange,
  auto, onAutoChange, resolvedId,
  ratio, onRatioChange,
  seconds, onSecondsChange,
  resolution, onResolutionChange,
  onSubmit, busy,
}) {
  const taRef = useRef(null);
  const model = getModel(auto ? resolvedId : modelId);

  // Grow with content, up to a ceiling. A fixed-height box for a paragraph of
  // creative direction is the single most common mistake in these UIs.
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 190)}px`;
  }, [prompt]);

  const canSubmit = prompt.trim().length > 0 && !busy;

  const onKeyDown = (e) => {
    // Enter sends, Shift+Enter breaks the line. Cmd/Ctrl+Enter also sends.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) onSubmit();
    }
  };

  return (
    <form
      className="pb"
      onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit(); }}
    >
      <label htmlFor="pb-input" className="sr-only">Describe what to generate</label>
      <textarea
        id="pb-input"
        ref={taRef}
        className="pb__input"
        rows={1}
        value={prompt}
        placeholder="Describe your vision in words and watch it come to life…"
        onChange={(e) => onPromptChange(e.target.value)}
        onKeyDown={onKeyDown}
      />

      <div className="pb__controls">
        <div className="pb__left">
          <ModelPicker
            value={modelId}
            onChange={onModelChange}
            auto={auto}
            onAutoChange={onAutoChange}
            resolvedId={resolvedId}
          />

          {model.ratios.length > 1 && (
            <Segmented label="Aspect ratio" value={ratio} options={model.ratios} onChange={onRatioChange} />
          )}

          {model.durations.length > 0 && (
            <Segmented
              label="Duration"
              value={String(seconds)}
              options={model.durations.map(String)}
              format={(v) => `${v}s`}
              onChange={(v) => onSecondsChange(Number(v))}
            />
          )}

          {model.resolutions.length > 1 && (
            <Segmented label="Resolution" value={resolution} options={model.resolutions} onChange={onResolutionChange} />
          )}
        </div>

        <div className="pb__right">
          <span className="pb__cost" title="Credits this generation would cost">
            {model.credits} cr
          </span>
          <Button type="submit" variant="primary" size="md" disabled={!canSubmit}>
            {busy ? "Generating…" : "Generate"}
          </Button>
        </div>
      </div>
    </form>
  );
}

/** Small inline radio group styled as a segmented control. */
function Segmented({ label, value, options, onChange, format = (v) => v }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`seg__opt ${o === value ? "is-on" : ""}`}
          aria-pressed={o === value}
          onClick={() => onChange(o)}
        >
          {format(o)}
        </button>
      ))}
    </div>
  );
}
