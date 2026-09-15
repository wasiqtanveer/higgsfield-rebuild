import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import * as Icons from "../Icon/Icon.jsx";
import {
  SEARCH_POPULAR,
  SEARCH_RECENTS,
  SEARCH_SCOPES,
  SEARCH_TRENDING,
} from "../../data/search.js";
import "./SearchModal.css";

/** One shared row shape across recents, trending and results, so filtering
 *  never has to care which section a thing came from. */
function Row({ item, onNavigate }) {
  const Glyph = Icons[item.icon] ?? Icons.Burst;
  return (
    <Link to="/create" className="smodal__row" onClick={onNavigate}>
      <span className="smodal__tile" aria-hidden="true">
        <Glyph size={22} />
      </span>
      <span className="smodal__rowtext">
        <span className="smodal__rowname">
          {item.name}
          {item.badge && (
            <span className={`smodal__badge smodal__badge--${item.tone ?? "accent"}`}>
              {item.badge}
            </span>
          )}
        </span>
        <span className="smodal__rowblurb">{item.blurb}</span>
      </span>
    </Link>
  );
}

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const inputRef = useRef(null);

  /* Opening is the only moment the field should claim focus -- refocusing on
     every render would fight the user the instant they tab to a chip. */
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setScope("all");
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  /* Page scroll is locked by the header, which owns the other overlay too --
     two components writing body.overflow is how you end up with a page that
     cannot scroll after the second one closes. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  const q = query.trim().toLowerCase();

  const match = useMemo(
    () => (item) => {
      if (scope !== "all" && item.scope !== scope) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.blurb ?? "").toLowerCase().includes(q)
      );
    },
    [q, scope]
  );

  const recents = SEARCH_RECENTS.filter(match);
  const popular = SEARCH_POPULAR.filter(match);
  const trending = SEARCH_TRENDING.filter(match);

  /* Typing collapses the launcher into a single list. Keeping three labelled
     sections alive under a query would leave two of them reading as empty far
     more often than not. */
  const searching = q.length > 0;
  const results = [];
  if (searching) {
    const seen = new Set();
    for (const it of [...recents, ...popular, ...trending]) {
      if (seen.has(it.name)) continue;
      seen.add(it.name);
      results.push(it);
    }
  }

  if (!open) return null;

  const empty = searching
    ? results.length === 0
    : recents.length + popular.length + trending.length === 0;

  /* Portalled to the body on purpose. The header is sticky, carries a z-index
     and picks up a backdrop-filter once condensed -- and a filtered ancestor
     becomes the containing block for position:fixed, which would pin this
     overlay inside a 58px-tall header the moment the page is scrolled. */
  return createPortal(
    <div
      className="smodal"
      role="dialog"
      aria-modal="true"
      aria-label="Search Higgsfield"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="smodal__panel">
        <div className="smodal__head">
          <div className="smodal__field">
            <Icons.Search size={22} className="smodal__fieldicon" />
            <input
              ref={inputRef}
              className="smodal__input"
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search"
            />
          </div>
          <button className="smodal__close" onClick={onClose} aria-label="Close search">
            <Icons.Close size={22} />
          </button>
        </div>

        <div className="smodal__scopes" role="tablist" aria-label="Filter results">
          {SEARCH_SCOPES.map((s) => {
            const Glyph = s.icon && !s.external ? Icons[s.icon] : null;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={scope === s.id}
                className={"smodal__scope " + (scope === s.id ? "is-active" : "")}
                onClick={() => setScope(s.id)}
              >
                {Glyph && <Glyph size={16} />}
                {s.label}
                {s.external && <Icons.ArrowUpRight size={14} />}
              </button>
            );
          })}
        </div>

        <div className="smodal__body">
          {empty && (
            <p className="smodal__empty">
              Nothing here matches <strong>{query || "that filter"}</strong>.
            </p>
          )}

          {searching && results.length > 0 && (
            <section className="smodal__section">
              <h2 className="smodal__label">Results</h2>
              <div className="smodal__rows">
                {results.map((it) => (
                  <Row key={it.name} item={it} onNavigate={onClose} />
                ))}
              </div>
            </section>
          )}

          {!searching && recents.length > 0 && (
            <section className="smodal__section">
              <h2 className="smodal__label">Recents</h2>
              <div className="smodal__rows">
                {recents.map((it) => (
                  <Row key={it.name} item={it} onNavigate={onClose} />
                ))}
              </div>
            </section>
          )}

          {!searching && popular.length > 0 && (
            <section className="smodal__section">
              <div className="smodal__labelrow">
                <h2 className="smodal__label">Popular products</h2>
                <Link to="/create" className="smodal__seeall" onClick={onClose}>
                  See all
                </Link>
              </div>
              <div className="smodal__cards">
                {popular.map((p) => {
                  const Kicker = Icons[p.kickerIcon] ?? Icons.Burst;
                  return (
                    <Link
                      key={p.name}
                      to="/create"
                      className={`smodal__card smodal__card--${p.hue}`}
                      onClick={onClose}
                    >
                      <span className="smodal__cardtop">
                        <span className="smodal__kicker">
                          <Kicker size={14} />
                          {p.kicker}
                        </span>
                        {p.badge && <span className="smodal__cardbadge">{p.badge}</span>}
                      </span>
                      <span className="smodal__cardfoot">
                        <span className="smodal__cardname">
                          {p.name}
                          <Icons.ArrowUpRight size={18} />
                        </span>
                        <span className="smodal__cardblurb">{p.blurb}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {!searching && trending.length > 0 && (
            <section className="smodal__section">
              <h2 className="smodal__label">Trending</h2>
              <div className="smodal__grid">
                {trending.map((it) => (
                  <Row key={it.name} item={it} onNavigate={onClose} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
