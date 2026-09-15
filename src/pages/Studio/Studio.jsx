import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Brush, Check, Chevron, Close, Doc, Film, FolderSolid, Image as ImageIcon,
  Nodes, Plus, Sparkle, Speaker, Wave,
} from "../../components/Icon/Icon.jsx";
import JobCard from "../../components/JobCard/JobCard.jsx";
import OfferDock from "../../components/OfferDock/OfferDock.jsx";
import { MODELS, getModel, DEFAULT_MODEL_ID } from "../../data/models.js";
import { PRESETS } from "../../data/presets.js";
import { provider, runJob } from "../../lib/generation.js";
import "./Studio.css";

/* The studio is the product's working surface, not a marketing page: a fixed
   composer rail on the left and a result pane on the right, both filling the
   viewport under the header. Nothing here scrolls the document -- each pane
   owns its own overflow, which is what keeps the Generate button parked at the
   bottom of the rail no matter how long the prompt gets. */

const TABS = [
  { id: "create", label: "Create Video" },
  { id: "edit", label: "Edit Video" },
  { id: "motion", label: "Motion Control" },
];

const VIDEO_MODELS = MODELS.filter((m) => m.kind === "video");

/* The three how-it-works panels. Each carries its own illustration variant --
   they are built from the bundled posters rather than flat icons, because the
   real page sells the product with product imagery. */
const STEPS = [
  { id: "image",  title: "Add image",     blurb: "Upload or generate an image to start your animation" },
  { id: "preset", title: "Choose preset", blurb: "Pick a preset to control your image movement" },
  { id: "video",  title: "Get video",     blurb: "Click generate and get your animated video" },
];

/* Camera moves for the Motion Control tab, named from the preset gallery. */
const MOVES = PRESETS.slice(0, 9);

const kindOf = (type = "") =>
  type.startsWith("video") ? "video" : type.startsWith("audio") ? "audio" : "image";

/* A three-bar level meter beside the model name -- the product marks the
   heavier models with it, so it reads as a tier, not as decoration. */
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

export default function Studio() {
  const [tab, setTab] = useState("create");
  const [pane, setPane] = useState("how");
  const [source, setSource] = useState("references");
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  /* Two triggers open the same list -- the card's Change button and the model
     row at the foot of the composer -- so the open state names which one it
     hangs off rather than being a plain boolean. */
  const [picker, setPicker] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [sound, setSound] = useState(true);
  const [refs, setRefs] = useState([]);
  const [move, setMove] = useState(MOVES[0].id);
  const [dragging, setDragging] = useState(false);
  const [jobs, setJobs] = useState([]);

  const fileRef = useRef(null);
  const promptRef = useRef(null);
  const cancels = useRef(new Map());
  const live = useRef(refs);
  live.current = refs;

  const model = getModel(modelId);
  const seconds = model.durations[0] ?? 8;
  const tier = model.credits >= 24 ? 3 : model.credits >= 12 ? 2 : 1;

  /* Price scales with the model and the clip length, and the struck-through
     figure is the list price the running promo discounts. A cost that never
     moves when you switch models reads as decoration. */
  const cost = Math.round((model.credits * seconds) / 2);
  const list = cost * 2;

  useEffect(() => {
    if (!picker) return;
    /* Closest-match rather than a container ref: the list can hang off either
       trigger, and both must count as inside. */
    const onDown = (e) => {
      if (!e.target.closest?.(".studio__picker, .studio__change, .studio__modelrow")) {
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

  /* Object URLs and in-flight jobs both outlive the component unless they are
     handed back explicitly. */
  useEffect(() => {
    const running = cancels.current;
    return () => {
      live.current.forEach((r) => URL.revokeObjectURL(r.url));
      running.forEach((fn) => fn());
      running.clear();
    };
  }, []);

  const addFiles = useCallback((incoming) => {
    const files = Array.from(incoming || []);
    if (!files.length) return;
    setRefs((prev) => {
      const room = Math.max(0, 4 - prev.length);
      const next = files.slice(0, room).map((f, i) => ({
        id: `${Date.now()}_${i}`,
        name: f.name,
        kind: kindOf(f.type),
        url: URL.createObjectURL(f),
      }));
      return [...prev, ...next];
    });
  }, []);

  const removeRef = (id) =>
    setRefs((prev) => {
      const hit = prev.find((r) => r.id === id);
      if (hit) URL.revokeObjectURL(hit.url);
      return prev.filter((r) => r.id !== id);
    });

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const submit = () => {
    const text =
      tab === "motion"
        ? MOVES.find((m) => m.id === move)?.prompt ?? prompt
        : prompt.trim();
    if (!text) return;

    const job = provider.createJob(text, {
      modelId,
      modelName: model.name,
      ratio: model.ratios[0],
      seconds,
      resolution: model.resolutions[0],
    });

    setJobs((prev) => [job, ...prev]);
    setPane("history");

    const cancel = runJob(job, (next) => {
      setJobs((prev) => prev.map((j) => (j.id === next.id ? { ...j, ...next } : j)));
      if (next.status === "done") cancels.current.delete(next.id);
    });
    cancels.current.set(job.id, cancel);
  };

  const busy = jobs.some((j) => j.status !== "done");
  const canGenerate = tab === "motion" || prompt.trim().length > 0;

  const placeholder = useMemo(() => {
    if (tab === "edit") {
      return "Describe the edit — e.g. “remove the background” or “make it night”. Add reference clips or elements using @…";
    }
    if (tab === "motion") {
      return "Optional — add detail on top of the selected camera move.";
    }
    return "Describe the visual change you want — e.g. “Make it snow” or “Make it nighttime”. Add reference images or elements using @…";
  }, [tab]);

  /* One list, two anchors. Rendering it from a single place keeps the two
     triggers from drifting apart as the catalogue changes. */
  const modelList = (
    <div className="studio__picker" role="listbox" aria-label="Model">
      {VIDEO_MODELS.map((m) => (
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
          <span className="studio__pick-cost">{Math.round((m.credits * (m.durations[0] ?? 8)) / 2)}</span>
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
          {TABS.map((t) => (
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
          <div className="studio__model">
            <div className="studio__model-art" aria-hidden="true">
              <img src="/media/c04.jpg" alt="" loading="lazy" />
            </div>
            <div className="studio__model-copy">
              <p className="studio__model-kind display">General</p>
              <p className="studio__model-name">{model.name}</p>
            </div>
            <button
              type="button"
              className="studio__change"
              aria-haspopup="listbox"
              aria-expanded={picker === "card"}
              onClick={() => setPicker((v) => (v === "card" ? null : "card"))}
            >
              <Brush size={14} />
              Change
            </button>

            {picker === "card" && modelList}
          </div>

          <div className="studio__seg" role="tablist" aria-label="Source">
            {[
              { id: "references", label: tab === "edit" ? "Upload Video" : "References" },
              { id: "extend", label: "Extend Video" },
            ].map((s) => (
              <button
                key={s.id}
                role="tab"
                type="button"
                aria-selected={source === s.id}
                className={"studio__seg-btn " + (source === s.id ? "is-on" : "")}
                onClick={() => setSource(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {tab === "motion" ? (
            <div className="studio__moves" role="radiogroup" aria-label="Camera move">
              {MOVES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={move === m.id}
                  className={"studio__move " + (move === m.id ? "is-on" : "")}
                  onClick={() => setMove(m.id)}
                >
                  <Nodes size={15} />
                  {m.name}
                </button>
              ))}
            </div>
          ) : (
            <div
              className={"studio__drop " + (dragging ? "is-drag" : "")}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              {refs.length === 0 ? (
                <button
                  type="button"
                  className="studio__drop-cta"
                  onClick={() => fileRef.current?.click()}
                >
                  <span className="studio__chips" aria-hidden="true">
                    <span className="studio__chip"><ImageIcon size={16} /></span>
                    <span className="studio__chip"><Film size={16} /></span>
                    <span className="studio__chip"><Wave size={16} /></span>
                  </span>
                  {/* The dim line names the action, the bright line names what
                      it accepts -- that is the order the product uses, and it
                      is the half a user actually needs before dropping. */}
                  <span className="studio__drop-lead">
                    {source === "extend" ? "Add a clip to extend" : "Add references"}
                  </span>
                  <span className="studio__drop-kinds">Image, Video or Audio</span>
                </button>
              ) : (
                <div className="studio__refs">
                  {refs.map((r) => (
                    <div key={r.id} className="studio__ref" data-kind={r.kind}>
                      {r.kind === "image" ? (
                        <img src={r.url} alt={r.name} />
                      ) : r.kind === "video" ? (
                        <video src={r.url} muted playsInline />
                      ) : (
                        <span className="studio__ref-glyph"><Wave size={18} /></span>
                      )}
                      <button
                        type="button"
                        className="studio__ref-x"
                        aria-label={"Remove " + r.name}
                        onClick={() => removeRef(r.id)}
                      >
                        <Close size={11} />
                      </button>
                    </div>
                  ))}
                  {refs.length < 4 && (
                    <button
                      type="button"
                      className="studio__ref studio__ref--add"
                      aria-label="Add another reference"
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
                accept="image/*,video/*,audio/*"
                className="sr-only"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          <div className="studio__prompt">
            <label className="studio__prompt-label" htmlFor="studio-prompt">
              Prompt
            </label>
            <textarea
              id="studio-prompt"
              ref={promptRef}
              className="studio__prompt-input"
              value={prompt}
              placeholder={placeholder}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canGenerate) submit();
                }
              }}
            />

            {/* The two affordances that live inside the prompt itself: the
                element mention, and whether the model generates sound. */}
            <div className="studio__prompt-tools">
              <button
                type="button"
                className="studio__tool"
                onClick={() => {
                  setPrompt((p) => (p.endsWith("@") ? p : p + (p && !p.endsWith(" ") ? " @" : "@")));
                  promptRef.current?.focus();
                }}
              >
                <span className="studio__tool-at" aria-hidden="true">@</span>
                Elements
              </button>
              <button
                type="button"
                className={"studio__tool " + (sound ? "is-on" : "")}
                aria-pressed={sound}
                onClick={() => setSound((v) => !v)}
              >
                <Speaker size={14} />
                {sound ? "On" : "Off"}
              </button>
            </div>
          </div>

          {/* The model is settable from the card up top, but it is also the
              last thing checked before generating, so it repeats here as a
              row -- the same list, anchored at the point of decision. */}
          <div className="studio__modelrow">
            <button
              type="button"
              className="studio__modelrow-btn"
              aria-haspopup="listbox"
              aria-expanded={picker === "row"}
              onClick={() => setPicker((v) => (v === "row" ? null : "row"))}
            >
              <span className="studio__modelrow-copy">
                <span className="studio__modelrow-label">Model</span>
                <span className="studio__modelrow-name">
                  {model.name}
                  <Level tier={tier} />
                </span>
              </span>
              <Chevron size={16} className="studio__modelrow-chev" />
            </button>
            {picker === "row" && modelList}
          </div>
        </div>

        {/* Parked over the end of the composer, exactly as the product does it:
            the rail scrolls under it and the action never leaves the view. */}
        <div className="studio__action">
          <button
            type="button"
            className="studio__generate"
            disabled={!canGenerate}
            onClick={submit}
          >
            {busy ? "Generating…" : "Generate"}
            <span className="studio__price">
              <Sparkle size={14} />
              <s>{list}</s>
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
        </div>

        <div className="studio__pane-body">
          {pane === "how" ? (
            <div className="studio__how">
              <h1 className="studio__headline display">Make videos in one click</h1>
              <p className="studio__lede">
                250+ presets for camera control, framing, and high-quality VFX &mdash;
                or use the general preset for manual control.
              </p>

              <ol className="studio__steps">
                {STEPS.map((s, i) => (
                  <li className="studio__step" key={s.id}>
                    <div className={"studio__art studio__art--" + s.id} aria-hidden="true">
                      {s.id === "image" && (
                        <>
                          <div className="studio__art-drop">
                            <ImageIcon size={26} />
                            <span className="studio__art-strong">Upload image</span>
                            <span className="studio__art-dim">Paste from clipboard</span>
                          </div>
                          <img className="studio__art-photo" src="/media/c02.jpg" alt="" loading="lazy" />
                        </>
                      )}
                      {s.id === "preset" && (
                        <div className="studio__art-rail">
                          <figure className="studio__art-tile">
                            <img src="/media/c08.jpg" alt="" loading="lazy" />
                            <figcaption>Tracking</figcaption>
                          </figure>
                          <figure className="studio__art-tile is-picked">
                            <img src="/media/c06.jpg" alt="" loading="lazy" />
                            <figcaption>Floating fall</figcaption>
                          </figure>
                          <figure className="studio__art-tile">
                            <img src="/media/c03.jpg" alt="" loading="lazy" />
                            <figcaption>Minimalism</figcaption>
                          </figure>
                        </div>
                      )}
                      {s.id === "video" && (
                        <div className="studio__art-frame">
                          <img src="/media/c02.jpg" alt="" loading="lazy" />
                        </div>
                      )}
                    </div>
                    <h2 className="studio__step-title display">{s.title}</h2>
                    <p className="studio__step-blurb">{s.blurb}</p>
                    <span className="studio__step-n" aria-hidden="true">{i + 1}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : jobs.length === 0 ? (
            <div className="studio__empty">
              <span className="studio__empty-glyph" aria-hidden="true"><Film size={26} /></span>
              <h2 className="studio__empty-title display">Nothing here yet</h2>
              <p className="studio__empty-sub">
                Your generations land here. Write a prompt on the left and hit generate.
              </p>
            </div>
          ) : (
            <div className="studio__grid">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          )}
        </div>
      </section>

      <OfferDock />
    </div>
  );
}
