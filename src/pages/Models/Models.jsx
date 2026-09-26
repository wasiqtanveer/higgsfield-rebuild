import { Link } from "react-router-dom";
import ModelSpec from "../../components/ModelSpec/ModelSpec.jsx";
import { AXES, MODELS } from "../../data/modelspec.js";
import { COSTS } from "../../data/credits.js";
import "./Models.css";

/**
 * /models — what Graft can drive.
 *
 * The page does NOT re-implement the spec sheet. `ModelSpec` already exists,
 * already owns `#models`, and is already the considered version of "how do
 * these four differ" — duplicating it here would mean two components making
 * the same argument and drifting apart the first time one is edited.
 *
 * What a dedicated page adds is the two things the home-page section cannot
 * carry without derailing itself:
 *
 * 1. **The matrix.** Four models against three axes and their published facts,
 *    read across rather than down. On the home page that is a table nobody
 *    scrolled to a landing page for; here it is the reason you came.
 *
 * 2. **What actually runs.** Exactly one of these four is wired to the
 *    backend. A models page that lists four and implies all four are available
 *    is the invented-capability claim PRODUCT.md rules out, so the page says
 *    which one serves a request and what the other three are doing here.
 */

/* Cost per run, by model id, from the same table `/credits` publishes. Imported
   rather than restated: if the price list changes, this follows instead of
   quietly disagreeing with it. */
const COST_BY_ID = Object.fromEntries(COSTS.filter((c) => c.model).map((c) => [c.id, c.credits]));

const TIER_WORD = ["", "low", "mid", "high"];

/* The ladder, flattened to three ticks. ModelSpec animates a longer one; this
   is a table cell, and a cell that animates while you read across it is a cell
   fighting the reading. */
function Tier({ value, axis }) {
  return (
    <span
      className="mp__tier"
      title={`${axis.label}: ${TIER_WORD[value]} — ${axis.hint}`}
    >
      <span className="sr-only">
        {axis.label}: {TIER_WORD[value]} of three
      </span>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`mp__tick${n <= value ? " is-lit" : ""}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function Models() {
  const runs = MODELS.find((m) => m.isDefault);

  return (
    <div className="mp">
      <header className="mp__head">
        <div className="page">
          <h1 className="mp__h1">
            Four models, one <span className="mp__serif">prompt</span>.
          </h1>
          <p className="mp__lede">
            Every number below is a published architectural fact — the step
            count a model card recommends, the resolution it trained at, the
            licence it ships under. Nothing here is a benchmark, because this
            product does not run one.
          </p>
        </div>
      </header>

      {/* The considered comparison, unchanged. It owns its own heading. */}
      <ModelSpec />

      <section className="page mp__matrix-wrap" aria-labelledby="mp-matrix">
        <h2 className="mp__h2" id="mp-matrix">
          The whole set, read across
        </h2>
        <p className="mp__note">
          Ordinals, not measurements: “high” means this model needs fewer steps
          than the others, not that it takes some number of milliseconds.
        </p>

        <div className="mp__scroll">
          <table className="mp__table">
            <thead>
              <tr>
                <th scope="col">Model</th>
                {AXES.map((a) => (
                  <th scope="col" key={a.id}>
                    {a.label}
                  </th>
                ))}
                <th scope="col">Steps</th>
                <th scope="col">Params</th>
                <th scope="col">Licence</th>
                <th scope="col">Per run</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => (
                <tr key={m.id} className={m.isDefault ? "is-default" : undefined}>
                  <th scope="row">
                    <span className="mp__name">
                      {m.name}
                      {m.isDefault && <span className="mp__badge">runs here</span>}
                    </span>
                    <span className="mp__org">
                      {m.variant} · {m.org}
                    </span>
                  </th>
                  {AXES.map((a) => (
                    <td key={a.id}>
                      <Tier value={m.tiers[a.id]} axis={a} />
                    </td>
                  ))}
                  <td className="mp__num mono">{m.steps}</td>
                  <td className="mp__num mono">{m.params}</td>
                  <td className="mp__licence">{m.licence}</td>
                  <td className="mp__num mono">
                    {COST_BY_ID[m.id] != null ? (
                      `${COST_BY_ID[m.id]}cr`
                    ) : (
                      <span className="mp__dash">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* The honest part, and the reason this page is not a brochure. */}
      <section className="page mp__truth-wrap" aria-labelledby="mp-truth">
        <div className="mp__truth">
          <h2 className="mp__h2" id="mp-truth">
            What actually serves a request
          </h2>
          <p className="mp__truth-p">
            One of the four. <strong>{runs.name} {runs.variant}</strong> runs on
            Cloudflare Workers AI and is what every generation on this site is
            produced by; a keyless fallback covers it when that is rate-limited,
            and the response names whichever one served it. The other three are
            specified, not wired — they are here because choosing between them
            is the question this page exists to answer, not because clicking one
            would do anything.
          </p>
          <p className="mp__truth-p">
            Listing four and implying four are available would be the one kind
            of claim this product refuses to make.
          </p>
          <Link className="mp__cta" to="/create">
            Run a prompt on {runs.name}
          </Link>
        </div>
      </section>
    </div>
  );
}
