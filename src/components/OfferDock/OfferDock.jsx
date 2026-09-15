import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Chevron } from "../Icon/Icon.jsx";
import "./OfferDock.css";

const TASKS = [
  {
    id: "nbp",
    title: "Try Nano Banana Pro",
    blurb: "The best image model",
    cta: "Try it",
  },
  {
    id: "seed",
    title: "Explore Seedance 2.0",
    blurb: "The best AI video model",
    cta: "Explore",
  },
  {
    id: "mkt",
    title: "Explore Marketing Studio",
    blurb: "From prompt to campaign",
    cta: "Explore",
  },
];

const OFFER_MS = (21 * 60 * 60 + 8 * 60 + 46) * 1000;

const pad = (n) => String(n).padStart(2, "0");

/** An expiry offset rather than a fixed date, so the clock is always mid-flight
 *  on a cold load. A countdown frozen at 00h 00m 00s is the fastest way to make
 *  a rebuild look abandoned. */
function useCountdown(ms) {
  const deadline = useRef(Date.now() + ms);
  const [left, setLeft] = useState(ms);

  useEffect(() => {
    const id = setInterval(() => {
      setLeft(Math.max(0, deadline.current - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const s = Math.floor(left / 1000);
  return `${pad(Math.floor(s / 3600))}h ${pad(Math.floor((s % 3600) / 60))}m ${pad(s % 60)}s`;
}

export default function OfferDock() {
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState([]);
  const clock = useCountdown(OFFER_MS);

  const toggleTask = (id) =>
    setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  return (
    <aside
      className={"dock " + (open ? "is-open" : "")}
      aria-label="Personal offer"
    >
      <div className="dock__head">
        <span className="dock__accent" aria-hidden="true" />
        <div className="dock__headtext">
          <strong>Get personal 55% OFF</strong>
          <span className="dock__clock">
            Expires in <em>{clock}</em>
          </span>
        </div>
        <button
          type="button"
          className="dock__toggle"
          aria-expanded={open}
          aria-controls="dock-tasks"
          aria-label={open ? "Collapse offer" : "Expand offer"}
          onClick={() => setOpen((v) => !v)}
        >
          <Chevron size={16} />
        </button>
      </div>

      {/* Unmounted rather than hidden. `.dock__tasks { display: grid }` is a
          class selector, so it outranks the user agent's `[hidden] { display:
          none }` -- with the hidden attribute the state flipped, the chevron
          turned, and the list stayed exactly where it was. */}
      {open && (
        <ul className="dock__tasks" id="dock-tasks">
          {TASKS.map((t) => {
            const checked = done.includes(t.id);
            return (
              <li key={t.id} className={checked ? "is-done" : ""}>
                <button
                  type="button"
                  className="dock__ring"
                  aria-pressed={checked}
                  aria-label={`Mark "${t.title}" as done`}
                  onClick={() => toggleTask(t.id)}
                >
                  {checked && <Check size={13} />}
                </button>
                <span className="dock__tasktext">
                  <strong>{t.title}</strong>
                  <span>{t.blurb}</span>
                </span>
                <Link to="/create" className="dock__cta">
                  {t.cta}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
