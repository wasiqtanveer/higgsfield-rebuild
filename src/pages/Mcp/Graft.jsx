import { useState } from "react";
import { Link } from "react-router-dom";
import Arrive from "../../components/Arrive/Arrive.jsx";
import { CLIENTS, FLOWS, TOOLS, WHY } from "../../data/graftmcp.js";
import "./Graft.css";

/**
 * The MCP page.
 *
 * Graft's claim is that the prompt is the artifact — and an artifact that only
 * exists inside one website is not much of one. The MCP server is that claim
 * followed through: the prompts, their lineage and the ability to fork them are
 * handed to whatever assistant you already work in.
 *
 * Everything on this page is the server's real contract. The tool list is read
 * from the same definition the handlers are built against, so a tool cannot be
 * advertised here without existing, and the install commands are the documented
 * form for each client rather than an invented one.
 */

export default function GraftMcp() {
  const [clientId, setClientId] = useState(CLIENTS[0].id);
  const [flowId, setFlowId] = useState(FLOWS[0].id);
  const [copied, setCopied] = useState(false);

  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];
  const flow = FLOWS.find((f) => f.id === flowId) ?? FLOWS[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(client.install);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be unavailable (insecure origin, denied permission). The
      // command is selectable text either way, so this fails quietly rather
      // than throwing a dialog at someone who can simply select it.
      setCopied(false);
    }
  };

  return (
    <div className="gm">
      {/* Head ------------------------------------------------------------- */}
      <Arrive as="section" className="gm__band gm__band--head">
        <div className="page">
          <h1 className="gm__h1">
            Fork prompts from inside your{" "}
            <span className="gm__serif">editor</span>.
          </h1>
          <p className="gm__lede">
            Graft ships a Model Context Protocol server. Your assistant can
            search published prompts, walk a lineage back to its root, fork one,
            and run it — without leaving the window you are already working in.
          </p>
        </div>
      </Arrive>

      {/* Install ---------------------------------------------------------- */}
      <Arrive as="section" className="gm__band" aria-labelledby="gm-install">
        <div className="page">
          <header className="gm__bandhead">
            <h2 className="gm__h2" id="gm-install">
              Connect it once
            </h2>
            <p className="gm__sub">
              One server, any client that speaks the protocol.
            </p>
          </header>

          <div className="gm__install">
            <div className="gm__rail" role="tablist" aria-label="Client">
              {CLIENTS.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  type="button"
                  aria-selected={c.id === clientId}
                  className="gm__client"
                  onClick={() => setClientId(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="gm__cmd">
              <div className="gm__cmd-head">
                <span className="gm__cmd-label label">
                  {client.kind === "cli" ? "Run this" : client.file}
                </span>
                <button type="button" className="gm__copy" onClick={copy}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <pre className="gm__pre mono">
                <code>{client.install}</code>
              </pre>

              <p className="gm__cmd-note">{client.note}</p>
            </div>
          </div>
        </div>
      </Arrive>

      {/* What it can do --------------------------------------------------- */}
      <Arrive as="section" className="gm__band" aria-labelledby="gm-tools">
        <div className="page">
          <header className="gm__bandhead">
            <h2 className="gm__h2" id="gm-tools">
              Five tools
            </h2>
            <p className="gm__sub">
              The whole surface. Three read, two write — and the two that write
              go through the same ledger and the same handlers the site does.
            </p>
          </header>

          <ul className="gm__tools">
            {TOOLS.map((t) => (
              <li className="gm__tool" key={t.id}>
                <div className="gm__tool-head">
                  <h3 className="gm__tool-name mono">{t.name}</h3>
                  <span className="gm__tool-tags">
                    <span className="gm__tag" data-kind={t.reads ? "read" : "write"}>
                      {t.reads ? "read" : "write"}
                    </span>
                    {t.costs && (
                      <span className="gm__tag" data-kind="cost">
                        spends credits
                      </span>
                    )}
                  </span>
                </div>

                <p className="gm__tool-blurb">{t.blurb}</p>

                <dl className="gm__sig mono">
                  <div>
                    <dt>args</dt>
                    <dd>
                      {t.args.length === 0
                        ? "none"
                        : t.args
                            .map(
                              (a) =>
                                `${a.name}: ${a.type}${a.required ? "" : "?"}`
                            )
                            .join(", ")}
                    </dd>
                  </div>
                  <div>
                    <dt>returns</dt>
                    <dd>{t.returns}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </Arrive>

      {/* A real exchange --------------------------------------------------- */}
      <Arrive as="section" className="gm__band" aria-labelledby="gm-flow">
        <div className="page">
          <header className="gm__bandhead">
            <h2 className="gm__h2" id="gm-flow">
              What it looks like
            </h2>
          </header>

          <div className="gm__flowtabs" role="tablist" aria-label="Example">
            {FLOWS.map((f) => (
              <button
                key={f.id}
                role="tab"
                type="button"
                aria-selected={f.id === flowId}
                className="gm__flowtab"
                onClick={() => setFlowId(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <p className="gm__flowblurb">{flow.blurb}</p>

          <ol className="gm__chat" key={flow.id}>
            {flow.turns.map((t, i) => (
              <li
                className="gm__turn"
                data-role={t.role}
                key={`${flow.id}-${i}`}
                style={{ "--i": i }}
              >
                <span className="gm__turn-who label">
                  {t.role === "you" ? "you" : t.role === "tool" ? "tool call" : "assistant"}
                </span>
                <span className={`gm__turn-text${t.role === "tool" ? " mono" : ""}`}>
                  {t.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Arrive>

      {/* Why --------------------------------------------------------------- */}
      <Arrive as="section" className="gm__band" aria-labelledby="gm-why">
        <div className="page">
          <header className="gm__bandhead">
            <h2 className="gm__h2" id="gm-why">
              Why a server and not a plugin
            </h2>
          </header>

          <ul className="gm__why">
            {WHY.map((w) => (
              <li className="gm__reason" key={w.id}>
                <h3 className="gm__reason-title">{w.title}</h3>
                <p className="gm__reason-body">{w.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Arrive>

      <Arrive as="section" className="gm__band gm__band--end">
        <div className="page gm__end">
          <h2 className="gm__h2">Runs cost credits, wherever you call from.</h2>
          <Link className="gm__cta" to="/credits">
            How credits work
          </Link>
        </div>
      </Arrive>
    </div>
  );
}
