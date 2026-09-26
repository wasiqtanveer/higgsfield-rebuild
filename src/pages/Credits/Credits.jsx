import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Arrive from "../../components/Arrive/Arrive.jsx";
import { COSTS, GRANTS, LEDGER, RULES } from "../../data/credits.js";
import "./Credits.css";

/**
 * Credits.
 *
 * This is the page that replaces the clone's pricing table, and the swap is the
 * product argument: Graft does not sell plans, it meters compute against an
 * append-only ledger. So instead of three tiers and a toggle, the page shows
 * the ledger itself — what a run costs, what you are given, and the four rules
 * the implementation actually enforces.
 *
 * The one interactive idea: the ledger is *replayed*. You step through the rows
 * and the balance recomputes in front of you, because a balance derived from
 * its rows rather than stored in a counter is the thing worth demonstrating and
 * a static table cannot demonstrate it.
 */

/* Running balance after each row. Derived exactly the way the API derives it —
   by summing deltas in order — rather than read from a stored figure, which is
   the property the page exists to show. */
function runningBalance(rows) {
  let sum = 0;
  return rows.map((row) => {
    sum += row.delta;
    return sum;
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Credits() {
  /* How many ledger rows have been applied. Starts at the full set so the page
     is complete and readable before anything is touched — the replay is an
     affordance, not a gate. */
  const [applied, setApplied] = useState(LEDGER.length);

  const balances = useMemo(() => runningBalance(LEDGER), []);
  const balance = applied === 0 ? 0 : balances[applied - 1];

  return (
    <div className="cr">
      <Arrive as="section" className="cr__band cr__band--head">
        <div className="page">
          <h1 className="cr__h1">
            Credits, not <span className="cr__serif">plans</span>.
          </h1>
          <p className="cr__lede">
            Graft runs on open models and meters what they cost. There is no
            subscription, no card, and no tier to pick — a run debits the
            credits it takes, and every debit is a row you can read.
          </p>
        </div>
      </Arrive>

      {/* The ledger, replayable -------------------------------------------- */}
      <Arrive as="section" className="cr__band" aria-labelledby="cr-ledger">
        <div className="page cr__ledgerwrap">
          <header className="cr__bandhead">
            <h2 className="cr__h2" id="cr-ledger">
              The balance is the sum of its rows
            </h2>
            <p className="cr__sub">
              Step through a sample ledger and watch the balance recompute.
              Nothing here is stored as a total — it is added up from the rows
              every time it is read, which is why it cannot drift.
            </p>
          </header>

          <div className="cr__ledger">
            <div className="cr__balance">
              <p className="cr__balance-label label">Balance</p>
              <p className="cr__balance-num" data-numeric>
                {balance}
              </p>
              <p className="cr__balance-sum mono">
                {applied === 0
                  ? "no rows applied"
                  : LEDGER.slice(0, applied)
                      .map((r) => (r.delta > 0 ? `+${r.delta}` : r.delta))
                      .join(" ")}
              </p>

              <div className="cr__replay">
                <button
                  type="button"
                  className="cr__step"
                  onClick={() => setApplied((n) => Math.max(0, n - 1))}
                  disabled={applied === 0}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="cr__step cr__step--go"
                  onClick={() =>
                    setApplied((n) => Math.min(LEDGER.length, n + 1))
                  }
                  disabled={applied === LEDGER.length}
                >
                  Apply next row
                </button>
              </div>
            </div>

            <ol className="cr__rows">
              {LEDGER.map((row, i) => (
                <li
                  key={row.id}
                  className="cr__row"
                  data-kind={row.kind}
                  data-on={i < applied ? "" : undefined}
                >
                  <span className="cr__row-time mono">{formatTime(row.at)}</span>
                  <span className="cr__row-reason">
                    {row.reason}
                    {row.ref && (
                      <span className="cr__row-ref mono">{row.ref}</span>
                    )}
                  </span>
                  <span className="cr__row-delta mono" data-numeric>
                    {row.delta > 0 ? `+${row.delta}` : row.delta}
                  </span>
                  <span className="cr__row-bal mono" data-numeric>
                    {i < applied ? balances[i] : "—"}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <p className="cr__note">
            A sample ledger, in the shape the API returns. Your own rows appear
            here once you have run something.
          </p>
        </div>
      </Arrive>

      {/* What a run costs --------------------------------------------------- */}
      <Arrive as="section" className="cr__band" aria-labelledby="cr-costs">
        <div className="page">
          <header className="cr__bandhead">
            <h2 className="cr__h2" id="cr-costs">
              What a run costs
            </h2>
            <p className="cr__sub">
              Priced by the work the model does, not by what it is worth. A
              four-step model costs a quarter of a twenty-eight-step one because
              that is the ratio of the compute.
            </p>
          </header>

          <ul className="cr__costs">
            {COSTS.map((c) => (
              <li className="cr__cost" key={c.id} data-lead={c.lead ? "" : undefined}>
                <span className="cr__cost-model">{c.model}</span>
                <span className="cr__cost-note mono">{c.note}</span>
                <span className="cr__cost-num" data-numeric>
                  {c.credits}
                  <span className="cr__cost-unit">
                    {c.credits === 1 ? "credit" : "credits"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Arrive>

      {/* What you get ------------------------------------------------------- */}
      <Arrive as="section" className="cr__band" aria-labelledby="cr-grants">
        <div className="page">
          <header className="cr__bandhead">
            <h2 className="cr__h2" id="cr-grants">
              What you are given
            </h2>
            <p className="cr__sub">
              Two states, not a ladder. An account is worth having because your
              lineage survives, not because it unlocks a better model.
            </p>
          </header>

          <div className="cr__grants">
            {GRANTS.map((g) => (
              <article
                className="cr__grant"
                key={g.id}
                data-lead={g.lead ? "" : undefined}
              >
                <p className="cr__grant-label label">{g.label}</p>
                <p className="cr__grant-num" data-numeric>
                  {g.credits}
                  <span className="cr__grant-unit">credits</span>
                </p>
                <p className="cr__grant-blurb">{g.blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </Arrive>

      {/* The rules ---------------------------------------------------------- */}
      <Arrive as="section" className="cr__band" aria-labelledby="cr-rules">
        <div className="page">
          <header className="cr__bandhead">
            <h2 className="cr__h2" id="cr-rules">
              Four things the ledger guarantees
            </h2>
          </header>

          <ul className="cr__rules">
            {RULES.map((r) => (
              <li className="cr__rule" key={r.id}>
                <h3 className="cr__rule-title">{r.title}</h3>
                <p className="cr__rule-body">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Arrive>

      <Arrive as="section" className="cr__band cr__band--end">
        <div className="page cr__end">
          <h2 className="cr__h2">Run one and watch it debit.</h2>
          <Link className="cr__cta" to="/create">
            Start generating
          </Link>
        </div>
      </Arrive>
    </div>
  );
}
