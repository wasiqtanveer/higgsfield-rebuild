import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Composer from "../../components/Composer/Composer.jsx";
import JobCard from "../../components/JobCard/JobCard.jsx";
import { getModel, MODE_DEFAULT_MODEL } from "../../data/models.js";
import { getPreset } from "../../data/presets.js";
import { CLIPS } from "../../data/gallery.js";
import { provider, runJob } from "../../lib/generation.js";
import "./Create.css";

/* Each surface in the nav lands here with its own pitch. The page is the same
   machine underneath -- what changes is the model it opens on and the promise
   at the top of it. */
const MODES = {
  image: {
    lead: "Start creating with",
    name: "Higgsfield Soul Cinema",
    sub: "Describe a scene, character, mood, or style — and watch it come to life",
  },
  video: {
    lead: "Start creating with",
    name: "Higgsfield Motion",
    sub: "Describe a shot, a camera move, a mood — and watch it come to life",
  },
  audio: {
    lead: "Start creating with",
    name: "Higgsfield Voice",
    sub: "Describe a voice, a delivery, a room — and hear it come to life",
  },
};

/* Authored rather than random: the overlap order has to stay readable, and a
   fan that reshuffles on every render stops reading as one gesture. */
const FAN = [
  { clip: "c02", rot: -7, x: -196, y: 10, z: 1 },
  { clip: "c05", rot: -3, x: -66, y: -2, z: 2 },
  { clip: "c09", rot: 2, x: 62, y: 4, z: 3 },
  { clip: "c11", rot: 7, x: 190, y: 12, z: 2 },
];

export default function Create() {
  const [params, setParams] = useSearchParams();
  const mode = MODES[params.get("mode")] ? params.get("mode") : "image";
  const copy = MODES[mode];

  const [prompt, setPrompt] = useState("");
  const [modelId, setModelId] = useState(MODE_DEFAULT_MODEL[mode]);
  const [ratio, setRatio] = useState("Auto");
  const [quality, setQuality] = useState("High");
  const [resolution, setResolution] = useState("2K");
  const [style, setStyle] = useState("Auto");
  const [count, setCount] = useState(1);
  const [jobs, setJobs] = useState([]);

  const cancels = useRef(new Map());
  const model = getModel(modelId);

  /* Switching surfaces switches the model with it, but never overwrites a
     model the user picked by hand on this visit. */
  const touched = useRef(false);
  useEffect(() => {
    if (touched.current) return;
    setModelId(MODE_DEFAULT_MODEL[mode]);
  }, [mode]);

  /* Two handoffs from elsewhere in the app, and both must survive the trip:
       ?preset=<id>  a preset tile -- fills the prompt and pins its model
       ?seed=<text>  the hero input -- fills the prompt only
     The param is cleared afterwards so a refresh does not silently re-apply it
     over whatever has since been typed. */
  useEffect(() => {
    const preset = getPreset(params.get("preset"));
    const seed = params.get("seed");
    if (!preset && !seed) return;

    if (preset) {
      setPrompt(preset.prompt);
      setModelId(preset.model);
      touched.current = true;
    } else {
      setPrompt(seed);
    }
    const next = new URLSearchParams(params);
    next.delete("preset");
    next.delete("seed");
    setParams(next, { replace: true });
  }, [params, setParams]);

  /* Keep settings legal for the selected model -- a resolution carried over
     from an image model has to snap back into range on a video one. */
  useEffect(() => {
    if (model.resolutions.length && !model.resolutions.includes(resolution)) {
      setResolution(model.resolutions[0]);
    }
    if (ratio !== "Auto" && model.ratios.length && !model.ratios.includes(ratio)) {
      setRatio("Auto");
    }
  }, [model, resolution, ratio]);

  // Abandoned jobs must stop ticking against an unmounted component.
  useEffect(
    () => () => {
      cancels.current.forEach((fn) => fn());
      cancels.current.clear();
    },
    []
  );

  const start = useCallback(
    (job) => {
      const cancel = runJob(job, (next) => {
        setJobs((prev) => prev.map((j) => (j.id === next.id ? { ...j, ...next } : j)));
        if (next.status === "done") cancels.current.delete(next.id);
      });
      cancels.current.set(job.id, cancel);
    },
    []
  );

  const submit = useCallback(() => {
    const text = prompt.trim();
    if (!text) return;

    /* One job per requested frame, each with its own seed so a run of four
       returns four different results rather than the same one four times. */
    const batch = Array.from({ length: count }, (_, i) =>
      provider.createJob(text, {
        modelId,
        modelName: model.name,
        ratio: ratio === "Auto" ? model.ratios[0] : ratio,
        resolution,
        quality,
        style,
        seed: i,
      })
    );

    setJobs((prev) => [...batch, ...prev]);
    batch.forEach(start);
  }, [prompt, modelId, model.name, model.ratios, ratio, resolution, quality, style, count, start]);

  const busy = jobs.some((j) => j.status !== "done");

  const clearAll = () => {
    cancels.current.forEach((fn) => fn());
    cancels.current.clear();
    setJobs([]);
  };

  const fan = useMemo(
    () => FAN.map((f) => ({ ...f, poster: CLIPS.find((c) => c.id === f.clip)?.poster })),
    []
  );

  return (
    <div className="create">
      <div className="create__stage">
        {jobs.length === 0 ? (
          <section className="create__hero">
            <div className="create__fan" aria-hidden="true">
              {fan.map((f) => (
                <span
                  key={f.clip}
                  className="create__fancard"
                  style={{
                    "--rot": `${f.rot}deg`,
                    "--x": `${f.x}px`,
                    "--y": `${f.y}px`,
                    zIndex: f.z,
                  }}
                >
                  <img src={f.poster} alt="" loading="lazy" decoding="async" />
                </span>
              ))}
            </div>

            <h1 className="create__title display">
              {copy.lead}
              <br />
              <em>{copy.name}</em>
            </h1>
            <p className="create__sub">{copy.sub}</p>
          </section>
        ) : (
          <section className="create__results" aria-label="Generations">
            <div className="create__results-head">
              <h2 className="create__results-title">
                This session &middot; {jobs.length}
              </h2>
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

      <div className="create__bar">
        <div className="create__barinner">
          <Composer
            prompt={prompt}
            onPromptChange={setPrompt}
            modelId={modelId}
            onModelChange={(id) => {
              touched.current = true;
              setModelId(id);
            }}
            ratio={ratio}
            onRatioChange={setRatio}
            quality={quality}
            onQualityChange={setQuality}
            resolution={resolution}
            onResolutionChange={setResolution}
            style={style}
            onStyleChange={setStyle}
            count={count}
            onCountChange={setCount}
            onSubmit={submit}
            busy={busy}
          />
        </div>
      </div>
    </div>
  );
}
