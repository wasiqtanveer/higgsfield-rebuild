import { useEffect, useRef, useState } from "react";
import { MODELS, getModel } from "../../data/models.js";
import "./ModelPicker.css";

/**
 * Model selector with an Auto mode.
 *
 * Auto is not a no-op: it reads the prompt and routes to the model that suits it
 * (see autoSelect in data/models.js), and the trigger shows which model it
 * landed on. A toggle that claims to choose for you and always picks the same
 * thing is worse than no toggle.
 */
export default function ModelPicker({ value, onChange, auto, onAutoChange, resolvedId }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const shown = getModel(auto ? resolvedId : value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="mp" ref={rootRef}>
      <button
        type="button"
        className="mp__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mp__dot" data-kind={shown.kind} aria-hidden="true" />
        <span className="mp__name">{shown.name}</span>
        {auto && <span className="mp__autotag">Auto</span>}
        <svg className={`mp__chev ${open ? "is-open" : ""}`} viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      {open && (
        <div className="mp__menu" role="listbox" aria-label="Model">
          <button
            type="button"
            className={`mp__auto ${auto ? "is-on" : ""}`}
            onClick={() => { onAutoChange(!auto); setOpen(false); }}
          >
            <span>
              <strong>Auto</strong>
              <em>Pick the best model for the prompt</em>
            </span>
            <span className={`mp__switch ${auto ? "is-on" : ""}`} aria-hidden="true"><i /></span>
          </button>

          <div className="mp__sep" />

          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="option"
              aria-selected={!auto && m.id === value}
              className={`mp__item ${!auto && m.id === value ? "is-sel" : ""}`}
              onClick={() => { onChange(m.id); onAutoChange(false); setOpen(false); }}
            >
              <span className="mp__dot" data-kind={m.kind} aria-hidden="true" />
              <span className="mp__item-body">
                <span className="mp__item-head">
                  {m.name}
                  {m.badge && <span className="mp__badge">{m.badge}</span>}
                </span>
                <span className="mp__blurb">{m.blurb}</span>
              </span>
              <span className="mp__credits">{m.credits}cr</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
