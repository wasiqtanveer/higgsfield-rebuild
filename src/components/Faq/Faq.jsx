import { useState } from "react";
import { Chevron } from "../Icon/Icon.jsx";
import "./Faq.css";

/**
 * Accordion. One panel open at a time, and every panel starts closed -- the
 * list is scannable only while it is a list of questions.
 */
export default function Faq({ items }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="faq">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div className={"faq__item " + (isOpen ? "is-open" : "")} key={it.q}>
            <h3>
              <button
                type="button"
                className="faq__q"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-btn-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {it.q}
                <Chevron size={18} className="faq__chev" />
              </button>
            </h3>
            <div
              className="faq__panel"
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-btn-${i}`}
              hidden={!isOpen}
            >
              <p>{it.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
