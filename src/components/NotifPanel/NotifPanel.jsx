import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as Icons from "../Icon/Icon.jsx";
import { NOTIFICATIONS, NOTIF_CATEGORIES } from "../../data/account.js";
import "./NotifPanel.css";

const TABS = ["All", "Requests", "Unread"];

export default function NotifPanel({ onClose }) {
  /* One list, three filters. Keeping three hand-written lists would let the
     "Unread (1)" count drift from what the Unread tab actually shows the
     moment anything is read. */
  const [items, setItems] = useState(NOTIFICATIONS);
  const [tab, setTab] = useState("All");
  const [category, setCategory] = useState("All");
  const [catOpen, setCatOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (catOpen) setCatOpen(false);
      else onClose();
    };
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      /* The button that opened this panel handles its own toggle. */
      if (e.target.closest?.("[data-dock-trigger]")) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [onClose, catOpen]);

  const inCategory = items.filter(
    (n) => category === "All" || n.kind === category
  );
  const unreadCount = inCategory.filter((n) => !n.read).length;

  const shown =
    tab === "Unread"
      ? inCategory.filter((n) => !n.read)
      : tab === "Requests"
        ? inCategory.filter((n) => n.kind === "Request")
        : inCategory;

  const markAllRead = () =>
    setItems((list) => list.map((n) => ({ ...n, read: true })));

  const dismiss = (id) => setItems((list) => list.filter((n) => n.id !== id));

  /* Dates label a run of notifications, so each one is printed once at the
     top of its run rather than on every row. */
  let lastDate = null;

  return (
    <div className="notif" ref={panelRef} role="dialog" aria-label="Notifications">
      <header className="notif__head">
        <div className="notif__cat">
          <button
            type="button"
            className="notif__cattrigger"
            aria-expanded={catOpen}
            onClick={() => setCatOpen((v) => !v)}
          >
            {category === "All" ? "All notifications" : category}
            <Icons.Chevron size={14} className={catOpen ? "is-open" : ""} />
          </button>

          {catOpen && (
            <ul className="notif__catmenu" role="listbox">
              {NOTIF_CATEGORIES.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={category === c}
                    className={category === c ? "is-on" : ""}
                    onClick={() => {
                      setCategory(c);
                      setCatOpen(false);
                    }}
                  >
                    {c}
                    {category === c && <Icons.Check size={14} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="notif__close" onClick={onClose} aria-label="Close notifications">
          <Icons.Close size={17} />
        </button>
      </header>

      <div className="notif__tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={"notif__tab " + (tab === t ? "is-on" : "")}
            onClick={() => setTab(t)}
          >
            {t === "Unread" ? `Unread (${unreadCount})` : t}
          </button>
        ))}
        <button
          type="button"
          className="notif__markall"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      <div className="notif__body">
        {shown.length === 0 ? (
          <div className="notif__empty">
            <span className="notif__emptyglyph" aria-hidden="true">
              <Icons.BellSnooze size={22} />
            </span>
            No notifications yet
          </div>
        ) : (
          shown.map((n) => {
            const Glyph = Icons[n.glyph] ?? Icons.Burst;
            const showDate = n.date !== lastDate;
            lastDate = n.date;
            return (
              <div key={n.id}>
                {showDate && <p className="notif__date">{n.date}</p>}
                <article className={"notif__item " + (n.read ? "is-read" : "")}>
                  <span className="notif__avatar" aria-hidden="true">
                    <Glyph size={18} />
                  </span>

                  <div className="notif__text">
                    <h3>{n.title}</h3>
                    <p>{n.blurb}</p>
                    {n.cta && (
                      <Link to="/pricing" className="notif__cta" onClick={onClose}>
                        {n.cta}
                      </Link>
                    )}
                  </div>

                  <div className="notif__meta">
                    <span className="notif__age">{n.age}</span>
                    {!n.read && <span className="notif__dot" aria-label="Unread" />}
                    <button
                      type="button"
                      className="notif__dismiss"
                      aria-label={`Dismiss "${n.title}"`}
                      onClick={() => dismiss(n.id)}
                    >
                      <Icons.Close size={12} />
                    </button>
                  </div>
                </article>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
