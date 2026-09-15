import { useState } from "react";
import * as Icons from "../Icon/Icon.jsx";
import { COMPARE_GROUPS, PLANS } from "../../data/pricing.js";
import "./CompareTable.css";

function Cell({ value }) {
  if (value === true) return <Icons.Check size={17} className="cmp__yes" />;
  if (value === false) return <Icons.Close size={17} className="cmp__no" />;
  return <span>{value}</span>;
}

export default function CompareTable({ annual, onToggleAnnual }) {
  /* Collapsed by default. The full matrix is forty rows tall, and a visitor
     who wants that detail will ask for it -- everyone else is here for the
     three cards above and should not have to scroll past a spreadsheet. */
  const [open, setOpen] = useState(false);

  return (
    <div className="cmp">
      <div className={"cmp__frame " + (open ? "is-open" : "")}>
        <table className="cmp__table">
          <thead>
            <tr>
              <th scope="row">
                <button
                  type="button"
                  className="cmp__annual"
                  aria-pressed={annual}
                  onClick={onToggleAnnual}
                >
                  Annual <em>30% off</em>
                  <span className={"cmp__toggle " + (annual ? "is-on" : "")} aria-hidden="true">
                    <i />
                  </span>
                </button>
              </th>
              {PLANS.map((p) => (
                <th key={p.id} scope="col">
                  <span className="cmp__plan">{p.name}</span>
                  {p.flag && <span className="cmp__flag">{p.flag}</span>}
                  <span className="cmp__price">${annual ? p.annual : p.monthly}/month</span>
                  <span className="cmp__billed">
                    Billed {annual ? "annually" : "monthly"}
                  </span>
                  <a
                    href="#plans"
                    className={"cmp__cta " + (p.id === "max" ? "is-primary" : "")}
                  >
                    Get Plan
                  </a>
                </th>
              ))}
            </tr>
          </thead>

          {COMPARE_GROUPS.map((g) => (
            <tbody key={g.label}>
              <tr className="cmp__grouprow">
                <th scope="colgroup" colSpan={4}>
                  {g.label}
                </th>
              </tr>
              {g.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">
                    <span className="cmp__rowlabel">{r.label}</span>
                    {r.sub && <span className="cmp__rowsub">{r.sub}</span>}
                  </th>
                  {r.values.map((v, i) => (
                    <td key={PLANS[i].id}>
                      <Cell value={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>

        {!open && <div className="cmp__fade" aria-hidden="true" />}
      </div>

      <button type="button" className="cmp__expand" onClick={() => setOpen((v) => !v)}>
        {open ? "Hide features" : "Compare Features"}
      </button>
    </div>
  );
}
