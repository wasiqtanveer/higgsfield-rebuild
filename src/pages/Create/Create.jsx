import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PromptBar from "../../components/PromptBar/PromptBar.jsx";
import JobCard from "../../components/JobCard/JobCard.jsx";
import { autoSelect, getModel, DEFAULT_MODEL_ID } from "../../data/models.js";
import { getPreset, PRESETS } from "../../data/presets.js";
import { provider, runJob } from "../../lib/generation.js";
import "./Create.css";

const STARTERS = PRESETS.slice(0, 4);

export default function Create() {
  const [params, setParams] = useSearchParams();

  const [prompt, setPrompt] = useState("");
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [auto, setAuto] = useState(true);
  const [ratio, setRatio] = useState("16:9");
  const [seconds, setSeconds] = useState(8);
  const [resolution, setResolution] = useState("1080p");
  const [jobs, setJobs] = useState([]);

  const cancels = useRef(new Map());
  const resolvedId = useMemo(
    () => (auto ? autoSelect(prompt) : modelId),
    [auto, prompt, modelId]
  );
  const model = getModel(resolvedId);

  /* A preset arriving from the landing page pre-fills the whole composer --
     that handoff is what makes the two pages feel like one product. */
  useEffect(() => {
    const p = getPreset(params.get("preset"));
    if (!p) return;
    setPrompt(p.prompt);
    setModelId(p.model);
    setAuto(false);
    setParams({}, { replace: true });
  }, [params, setParams]);

  /* Keep settings legal for the selected model. Veo is 8s/16:9 only, so a
     duration carried over from Seedance has to snap back into range. */
  useEffect(() => {
    if (model.ratios.length && !model.ratios.includes(ratio)) setRatio(model.ratios[0]);
    if (model.durations.length && !model.durations.includes(seconds)) setSeconds(model.durations[0]);
    if (model.resolutions.length && !model.resolutions.includes(resolution)) {
      setResolution(model.resolutions[0]);
    }
  }, [model, ratio, seconds, resolution]);

  // Abandoned jobs must stop ticking against an unmounted component.
  useEffect(() => () => {
    cancels.current.forEach((fn) => fn());
    cancels.current.clear();
  }, []);

  const submit = useCallback(() => {
    const job = provider.createJob(prompt.trim(), {
      modelId: resolvedId,
      modelName: model.name,
      ratio,
      seconds,
      resolution,
    });

    setJobs((prev) => [job, ...prev]);

    const cancel = runJob(job, (next) => {
      setJobs((prev) => prev.map((j) => (j.id === next.id ? { ...j, ...next } : j)));
      if (next.status === "done") cancels.current.delete(next.id);
    });
    cancels.current.set(job.id, cancel);
  }, [prompt, resolvedId, model.name, ratio, seconds, resolution]);

  const busy = jobs.some((j) => j.status !== "done");

  const applyPreset = (p) => {
    setPrompt(p.prompt);
    setModelId(p.model);
    setAuto(false);
  };

  const clearAll = () => {
    cancels.current.forEach((fn) => fn());
    cancels.current.clear();
    setJobs([]);
  };

  return (
    <div className="create">
      <div className="page create__inner">
        <header className="create__head">
          <h1 className="create__title">Create</h1>
          <p className="create__sub">
            Describe a shot, pick a model, generate. Results are pre-rendered
            samples &mdash; this is a demo build.
          </p>
        </header>

        <PromptBar
          prompt={prompt}
          onPromptChange={setPrompt}
          modelId={modelId}
          onModelChange={setModelId}
          auto={auto}
          onAutoChange={setAuto}
          resolvedId={resolvedId}
          ratio={ratio}
          onRatioChange={setRatio}
          seconds={seconds}
          onSecondsChange={setSeconds}
          resolution={resolution}
          onResolutionChange={setResolution}
          onSubmit={submit}
          busy={busy}
        />

        {jobs.length === 0 ? (
          <section className="create__empty">
            <h2 className="create__empty-title">Start from a preset</h2>
            <p className="create__empty-sub">
              Or write your own above. Enter to generate, Shift+Enter for a new line.
            </p>
            <div className="create__starters">
              {STARTERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="create__starter"
                  onClick={() => applyPreset(p)}
                >
                  <span className="create__starter-name">{p.name}</span>
                  <span className="create__starter-prompt">{p.prompt}</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="create__results" aria-label="Generations">
            <div className="create__results-head">
              <h2 className="create__results-title">This session &middot; {jobs.length}</h2>
              <button type="button" className="create__clear" onClick={clearAll}>
                Clear
              </button>
            </div>
            <div className="create__grid">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
