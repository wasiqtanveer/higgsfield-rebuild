import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check, Chevron, Close, Doc, FolderSolid, Image as ImageIcon, Info, Bars,
  Minus, Plus, Speaker, Wave, Waveform,
} from "../../components/Icon/Icon.jsx";
import OfferDock from "../../components/OfferDock/OfferDock.jsx";
import {
  AUDIO_MODELS, DEFAULT_AUDIO_MODEL, getAudioModel, TTS_TABS, VOICES,
} from "../../data/audio.js";
import { runJob } from "../../lib/generation.js";
import "../Studio/Studio.css";
import "./Audio.css";

/* The audio surface is the same shell as the video studio -- composer rail,
   result pane, sticky action -- so it imports that stylesheet rather than
   restating it. What differs is the composer itself: a script instead of a
   prompt, a voice instead of a camera, and a batch of takes instead of one
   clip. Those parts, and only those, live in Audio.css. */

const MAX_SCRIPT = 500;
const MAX_MEDIA = 3;

/* djb2, as used by the generation lib -- a stable seed so a script always
   draws the same waveform rather than a new one on every render. */
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h;
}

/** 48 deterministic bar heights, shaped so the middle of a take is louder
 *  than its ends -- a flat noise field does not read as speech. */
function waveform(seed, n = 48) {
  let h = hash(seed);
  return Array.from({ length: n }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0;
    const envelope = Math.sin((i / (n - 1)) * Math.PI) * 0.65 + 0.35;
    return 0.18 + ((h % 1000) / 1000) * 0.82 * envelope;
  });
}

const Level = ({ tier = 3 }) => (
  <svg className="studio__level" viewBox="0 0 14 12" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <rect
        key={i}
        x={i * 5}
        y={10 - (i + 1) * 3}
        width="3.4"
        height={(i + 1) * 3}
        rx="1"
        opacity={i < tier ? 1 : 0.25}
      />
    ))}
  </svg>
);

/* One finished take. There is no audio file behind it -- the demo ships no
   voice assets -- so play scrubs the waveform in real time against the take's
   nominal length rather than pretending to decode something. */
function Take({ job }) {
  const bars = useMemo(() => waveform(job.id), [job.id]);
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const started = performance.now() - at * job.length * 1000;
    const tick = (now) => {
      const t = (now - started) / (job.length * 1000);
      if (t >= 1) {
        setAt(0);
        setPlaying(false);
        return;
      }
      setAt(t);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, job.length]);

  const pending = job.status !== "done";
  const played = pending ? job.progress ?? 0 : at;

  return (
    <article className={"take " + (pending ? "is-pending" : "")}>
      <button
        type="button"
        className="take__play"
        disabled={pending}
        aria-label={playing ? "Pause" : "Play"}
        onClick={() => setPlaying((v) => !v)}
        style={{ "--voice": job.tint }}
      >
        {playing ? (
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <rect x="3" y="2.5" width="3.6" height="11" rx="1.2" fill="currentColor" />
            <rect x="9.4" y="2.5" width="3.6" height="11" rx="1.2" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M4.5 2.6l8.2 5.4-8.2 5.4z" fill="currentColor" />
          </svg>
        )}
      </button>

      <div className="take__main">
        <header className="take__head">
          <span className="take__voice">{job.voiceName}</span>
          <span className="take__meta">
            {job.modelName} &middot; {job.length.toFixed(1)}s
          </span>
        </header>

        <div className="take__wave" aria-hidden="true">
          {bars.map((v, i) => (
            <span
              key={i}
              className={"take__bar " + (i / bars.length < played ? "is-played" : "")}
              style={{ height: `${Math.round(v * 100)}%`, "--voice": job.tint }}
            />
          ))}
        </div>

        <p className="take__script" title={job.script}>
          {pending
            ? job.status === "queued"
              ? "Queued…"
              : `Rendering · ${Math.round((job.progress ?? 0) * 100)}%`
            : job.script}
        </p>
      </div>
    </article>
  );
}

export default function Audio() {
  const [tab, setTab] = useState("tts");
  const [pane, setPane] = useState("how");
  const [script, setScript] = useState("");
  const [details, setDetails] = useState("");
  const [modelId, setModelId] = useState(DEFAULT_AUDIO_MODEL);
  const [picker, setPicker] = useState(null);
  const [voice, setVoice] = useState(VOICES[0].id);
  const [batch, setBatch] = useState(1);
  const [advanced, setAdvanced] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1.2);
  const [media, setMedia] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [jobs, setJobs] = useState([]);

  const fileRef = useRef(null);
  const cancels = useRef(new Map());
  const live = useRef(media);
  live.current = media;

  const model = getAudioModel(modelId);
  const picked = VOICES.find((v) => v.id === voice) ?? VOICES[0];
  const cost = model.credits * batch;

  useEffect(() => {
    if (!picker) return;
    const onDown = (e) => {
      if (!e.target.closest?.(".studio__picker, .studio__modelrow, .aud__voicebtn")) {
        setPicker(null);
      }
    };
    const onKey = (e) => e.key === "Escape" && setPicker(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [picker]);

  useEffect(() => {
    const running = cancels.current;
    return () => {
      live.current.forEach((m) => URL.revokeObjectURL(m.url));
      running.forEach((fn) => fn());
      running.clear();
    };
  }, []);

  const addFiles = useCallback((incoming) => {
    const files = Array.from(incoming || []);
    if (!files.length) return;
    setMedia((prev) => {
      const room = Math.max(0, MAX_MEDIA - prev.length);
      return [
        ...prev,
        ...files.slice(0, room).map((f, i) => ({
          id: `${Date.now()}_${i}`,
          name: f.name,
          kind: f.type.startsWith("image") ? "image" : "audio",
          url: URL.createObjectURL(f),
        })),
      ];
    });
  }, []);

  const removeMedia = (id) =>
    setMedia((prev) => {
      const hit = prev.find((m) => m.id === id);
      if (hit) URL.revokeObjectURL(hit.url);
      return prev.filter((m) => m.id !== id);
    });

  /* A batch is n takes of the same script, not one job that returns n files --
     each gets its own progress, because that is what the user is waiting on. */
  const submit = () => {
    const text = script.trim();
    if (!text) return;
    setPane("history");

    const seed = hash(text);
    for (let i = 0; i < batch; i++) {
      const job = {
        id: `tts_${Date.now().toString(36)}_${i}`,
        status: "queued",
        progress: 0,
        script: text,
        voiceName: picked.name,
        tint: picked.tint,
        modelName: model.name,
        /* Read time at ~14 characters a second, scaled by the speed control --
           a take whose length ignores the script is the tell. */
        length: Math.max(1.5, (text.length / 14) / speed),
        duration: 1400 + ((seed + i * 977) % 1600),
      };

      setJobs((prev) => [job, ...prev]);
      const cancel = runJob(job, (next) => {
        setJobs((prev) => prev.map((j) => (j.id === next.id ? { ...j, ...next } : j)));
        if (next.status === "done") cancels.current.delete(next.id);
      });
      cancels.current.set(job.id, cancel);
    }
  };

  const busy = jobs.some((j) => j.status !== "done");
  const canGenerate = script.trim().length > 0;

  const scriptHint = useMemo(() => {
    if (tab === "change") return "Paste the line you want re-voiced, or upload the take above.";
    if (tab === "translate") return "Write the script in any language — the voice keeps its identity.";
    return "Write exactly what the voice will read out loud.\nType @ to reference attachments";
  }, [tab]);

  const modelList = (
    <div className="studio__picker" role="listbox" aria-label="Model">
      {AUDIO_MODELS.map((m) => (
        <button
          key={m.id}
          type="button"
          role="option"
          aria-selected={m.id === modelId}
          className={"studio__pick " + (m.id === modelId ? "is-on" : "")}
          onClick={() => {
            setModelId(m.id);
            setPicker(null);
          }}
        >
          <span className="studio__pick-main">
            <span className="studio__pick-name">
              {m.name}
              {m.badge && <span className="studio__pick-badge">{m.badge}</span>}
            </span>
            <span className="studio__pick-blurb">{m.blurb}</span>
          </span>
          <span className="studio__pick-cost">{m.credits}</span>
          {m.id === modelId && <Check size={14} />}
        </button>
      ))}
    </div>
  );

  return (
    <div className="studio">
      {/* ---------------- composer rail ---------------- */}
      <aside className="studio__rail" aria-label="Composer">
        <div className="studio__tabs" role="tablist" aria-label="Mode">
          {TTS_TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              className={"studio__tab " + (tab === t.id ? "is-on" : "")}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="studio__rail-body">
          <div
            className={"studio__drop aud__upload " + (dragging ? "is-drag" : "")}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            <span className="aud__optional">Optional</span>

            {media.length === 0 ? (
              <button
                type="button"
                className="studio__drop-cta"
                onClick={() => fileRef.current?.click()}
              >
                <span className="studio__chips" aria-hidden="true">
                  <span className="studio__chip"><Waveform size={16} /></span>
                  <span className="studio__chip"><Wave size={16} /></span>
                  <span className="studio__chip"><ImageIcon size={16} /></span>
                </span>
                {/* Here the action is the bright line and the limit the dim one
                    -- the reverse of the video rail, and the reverse of how the
                    reference sets it would be wrong. */}
                <span className="studio__drop-kinds">Upload media</span>
                <span className="studio__drop-lead">
                  Up to {MAX_MEDIA} Voices/Audios or Image
                </span>
              </button>
            ) : (
              <div className="studio__refs">
                {media.map((m) => (
                  <div key={m.id} className="studio__ref" data-kind={m.kind}>
                    {m.kind === "image" ? (
                      <img src={m.url} alt={m.name} />
                    ) : (
                      <span className="studio__ref-glyph"><Waveform size={18} /></span>
                    )}
                    <button
                      type="button"
                      className="studio__ref-x"
                      aria-label={"Remove " + m.name}
                      onClick={() => removeMedia(m.id)}
                    >
                      <Close size={11} />
                    </button>
                  </div>
                ))}
                {media.length < MAX_MEDIA && (
                  <button
                    type="button"
                    className="studio__ref studio__ref--add"
                    aria-label="Add media"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              multiple
              accept="audio/*,image/*"
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <div className="studio__prompt">
            <div className="aud__labelrow">
              <label className="studio__prompt-label" htmlFor="aud-script">Script</label>
              <span className="aud__info" title={scriptHint}>
                <Info size={15} />
              </span>
            </div>
            <textarea
              id="aud-script"
              className="studio__prompt-input aud__script"
              value={script}
              placeholder={scriptHint}
              maxLength={2000}
              onChange={(e) => setScript(e.target.value)}
            />
          </div>

          <div className="studio__modelrow">
            <button
              type="button"
              className="studio__modelrow-btn"
              aria-haspopup="listbox"
              aria-expanded={picker === "model"}
              onClick={() => setPicker((v) => (v === "model" ? null : "model"))}
            >
              <span className="studio__modelrow-copy">
                <span className="studio__modelrow-label">Model</span>
                <span className="studio__modelrow-name">
                  {model.name}
                  <Level tier={model.tier} />
                </span>
              </span>
              <Chevron size={16} className="studio__modelrow-chev" />
            </button>
            {picker === "model" && modelList}
          </div>

          {/* Voice is the audio equivalent of the video model card: the single
              choice that decides what comes out. */}
          <div className="aud__voice">
            <button
              type="button"
              className="aud__voicebtn"
              aria-haspopup="listbox"
              aria-expanded={picker === "voice"}
              onClick={() => setPicker((v) => (v === "voice" ? null : "voice"))}
            >
              <span className="aud__avatar" style={{ "--voice": picked.tint }} aria-hidden="true">
                <Waveform size={16} />
              </span>
              <span className="aud__voicecopy">
                <span className="aud__voicename">{picked.name}</span>
                <span className="aud__voicerole">{picked.role} &middot; {picked.accent}</span>
              </span>
              <Chevron size={16} className="studio__modelrow-chev" />
            </button>

            {picker === "voice" && (
              <div className="studio__picker aud__voices" role="listbox" aria-label="Voice">
                {VOICES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    role="option"
                    aria-selected={v.id === voice}
                    className={"studio__pick " + (v.id === voice ? "is-on" : "")}
                    onClick={() => {
                      setVoice(v.id);
                      setPicker(null);
                    }}
                  >
                    <span className="aud__avatar aud__avatar--sm" style={{ "--voice": v.tint }} aria-hidden="true">
                      <Waveform size={13} />
                    </span>
                    <span className="studio__pick-main">
                      <span className="studio__pick-name">{v.name}</span>
                      <span className="studio__pick-blurb">{v.role} &middot; {v.accent}</span>
                    </span>
                    {v.id === voice && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="aud__row">
            <span className="aud__row-label">Batch size</span>
            <div className="aud__stepper">
              <button
                type="button"
                aria-label="Fewer takes"
                disabled={batch <= 1}
                onClick={() => setBatch((b) => Math.max(1, b - 1))}
              >
                <Minus size={14} />
              </button>
              <span className="aud__count">{batch}/4</span>
              <button
                type="button"
                aria-label="More takes"
                disabled={batch >= 4}
                onClick={() => setBatch((b) => Math.min(4, b + 1))}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="studio__prompt aud__details">
            <div className="aud__labelrow">
              <label className="studio__prompt-label" htmlFor="aud-details">Voice details</label>
              <span className="aud__optional aud__optional--inline">Optional</span>
            </div>
            <textarea
              id="aud-details"
              className="studio__prompt-input aud__detailsinput"
              value={details}
              maxLength={MAX_SCRIPT}
              placeholder="e.g. Young female voice with british accent, soft and loud. Excited, giggling"
              onChange={(e) => setDetails(e.target.value)}
            />
            <span className="aud__counter">{details.length}/{MAX_SCRIPT}</span>
          </div>

          <div className="aud__adv">
            <button
              type="button"
              className="aud__advbtn"
              aria-expanded={advanced}
              onClick={() => setAdvanced((v) => !v)}
            >
              <Bars size={16} className="aud__advglyph" />
              Advanced settings
              <Chevron size={16} className={"aud__advchev " + (advanced ? "is-open" : "")} />
            </button>

            {advanced && (
              <div className="aud__sliders">
                {[
                  { label: "Speed", value: speed, set: setSpeed, min: 0.5, max: 2 },
                  { label: "Pitch", value: pitch, set: setPitch, min: 0.5, max: 2 },
                  { label: "Volume", value: volume, set: setVolume, min: 0.5, max: 2 },
                ].map((s) => (
                  <label key={s.label} className="aud__slider">
                    <span className="aud__slider-label">{s.label}</span>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step="0.1"
                      value={s.value}
                      onChange={(e) => s.set(Number(e.target.value))}
                    />
                    <output>{s.value.toFixed(1)}</output>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="studio__action">
          <button
            type="button"
            className="studio__generate"
            disabled={!canGenerate}
            onClick={submit}
          >
            {busy ? "Generating…" : "Generate"}
            <span className="studio__price">
              <Speaker size={14} />
              {cost}
            </span>
          </button>
        </div>
      </aside>

      {/* ---------------- result pane ---------------- */}
      <section className="studio__pane" aria-label="Results">
        <div className="studio__panetabs">
          <button
            type="button"
            className={"studio__panetab " + (pane === "history" ? "is-on" : "")}
            aria-pressed={pane === "history"}
            onClick={() => setPane("history")}
          >
            <FolderSolid size={16} />
            History
            {jobs.length > 0 && <span className="studio__count">{jobs.length}</span>}
          </button>
          <button
            type="button"
            className={"studio__panetab " + (pane === "how" ? "is-on" : "")}
            aria-pressed={pane === "how"}
            onClick={() => setPane("how")}
          >
            <Doc size={16} />
            How it works
          </button>

          <button type="button" className="aud__filters">
            <Bars size={15} />
            Filters
          </button>
        </div>

        <div className="studio__pane-body">
          {pane === "how" ? (
            <div className="studio__how aud__how">
              <h1 className="studio__headline display">Turn text into speech</h1>
              <p className="studio__lede">
                Lifelike speech from any script &mdash; ready for your projects.
              </p>

              <ol className="aud__steps">
                <li className="aud__step">
                  <h2 className="aud__step-title">Pick or clone a voice</h2>
                  <p className="aud__step-blurb">
                    Choose a preset, clone your own, or pick a model
                  </p>
                  <div className="aud__art aud__art--voices" aria-hidden="true">
                    {VOICES.slice(0, 3).map((v, i) => (
                      <span
                        key={v.id}
                        className={"aud__pill aud__pill--" + i}
                        style={{ "--voice": v.tint }}
                      >
                        <span className="aud__avatar"><Waveform size={16} /></span>
                        <span className="aud__pillcopy">
                          <b>{v.name}</b>
                          <i>{v.role}</i>
                        </span>
                      </span>
                    ))}
                    <span className="aud__artchip">
                      <Level tier={3} />
                      Seed Audio 1.0
                    </span>
                  </div>
                </li>

                <li className="aud__step">
                  <h2 className="aud__step-title">Write, describe and generate</h2>
                  <p className="aud__step-blurb">
                    Type your script, describe how it sounds, and create
                  </p>
                  <div className="aud__art aud__art--panel" aria-hidden="true">
                    <div className="aud__mock">
                      <p className="aud__mock-label">Prompt:</p>
                      <p className="aud__mock-text">
                        Warm, calm male voice, unhurried pace, slight gravel &mdash; like a
                        late-night nature documentary narrator. Thoughtful pauses between
                        sentences.
                      </p>
                      <div className="aud__mock-row">
                        <span>
                          <i>Model</i>
                          <b>Seed Audio 1.0 <Level tier={3} /></b>
                        </span>
                        <Chevron size={14} className="studio__modelrow-chev" />
                      </div>
                      <div className="aud__mock-grid">
                        <span><i>Speed</i><b>1.0</b></span>
                        <span><i>Pitch</i><b>1.7</b></span>
                        <span><i>Volume</i><b>1.6</b></span>
                        <span><i>Emotion</i><b>Calm</b></span>
                      </div>
                    </div>
                  </div>
                </li>
              </ol>
            </div>
          ) : jobs.length === 0 ? (
            <div className="studio__empty">
              <span className="studio__empty-glyph" aria-hidden="true"><Waveform size={26} /></span>
              <h2 className="studio__empty-title display">No takes yet</h2>
              <p className="studio__empty-sub">
                Write a script on the left and generate. Every take lands here.
              </p>
            </div>
          ) : (
            <div className="aud__takes">
              {jobs.map((j) => (
                <Take key={j.id} job={j} />
              ))}
            </div>
          )}
        </div>
      </section>

      <OfferDock />
    </div>
  );
}
