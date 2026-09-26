/**
 * The Graft MCP server.
 *
 * SOURCING RULE, inherited from modelspec.js and credits.js: everything here is
 * either a fact about MCP itself (a published open protocol), or a fact about
 * Graft's own API, which is Graft's to define and therefore true by
 * construction. Nothing claims a capability the backend will not have.
 *
 * The tool list below IS the server's contract. It is written here first
 * deliberately: the page and the implementation read from one definition, so a
 * tool cannot appear on the page without existing, and its arguments cannot
 * drift from what the handler accepts.
 */

/* The clients that speak MCP. Install shapes are the documented ones for each
   client, not invented — the config-file form is the protocol's own standard. */
export const CLIENTS = [
  {
    id: "claude-code",
    name: "Claude Code",
    kind: "cli",
    install: "claude mcp add graft -- npx -y @graft/mcp",
    note: "Adds the server to this project. Run it in the repo you want Graft available in.",
  },
  {
    id: "claude",
    name: "Claude Desktop",
    kind: "config",
    file: "claude_desktop_config.json",
    install: `{
  "mcpServers": {
    "graft": {
      "command": "npx",
      "args": ["-y", "@graft/mcp"],
      "env": { "GRAFT_TOKEN": "your-token" }
    }
  }
}`,
    note: "Settings → Developer → Edit Config, then restart Claude.",
  },
  {
    id: "cursor",
    name: "Cursor",
    kind: "config",
    file: ".cursor/mcp.json",
    install: `{
  "mcpServers": {
    "graft": {
      "command": "npx",
      "args": ["-y", "@graft/mcp"],
      "env": { "GRAFT_TOKEN": "your-token" }
    }
  }
}`,
    note: "Project-scoped. Commit it and everyone on the repo gets the same tools.",
  },
  {
    id: "vscode",
    name: "VS Code",
    kind: "cli",
    install: "code --add-mcp '{\"name\":\"graft\",\"command\":\"npx\",\"args\":[\"-y\",\"@graft/mcp\"]}'",
    note: "Requires the GitHub Copilot extension with MCP support enabled.",
  },
];

/* The tools the server exposes. This is the contract: each entry names the
   handler that backs it, so a tool on this page without a handler is a build
   error rather than a marketing claim. */
export const TOOLS = [
  {
    id: "search",
    name: "graft_search_prompts",
    handler: "api/mcp/search.js",
    blurb: "Find published prompts by what they describe, and get back the prompt text with its lineage.",
    args: [
      { name: "query", type: "string", required: true },
      { name: "limit", type: "number", required: false },
    ],
    returns: "prompt[] — id, text, author, depth, fork_count",
    reads: true,
  },
  {
    id: "lineage",
    name: "graft_get_lineage",
    handler: "api/mcp/lineage.js",
    blurb: "Walk a prompt back to its root: every parent, and the single line each author changed.",
    args: [{ name: "prompt_id", type: "string", required: true }],
    returns: "node[] — id, text, diff_from_parent, author",
    reads: true,
  },
  {
    id: "fork",
    name: "graft_fork_prompt",
    handler: "api/mcp/fork.js",
    blurb: "Take a published prompt, change one line, and write the result as its child.",
    args: [
      { name: "parent_id", type: "string", required: true },
      { name: "text", type: "string", required: true },
    ],
    returns: "prompt — id, parent_id, depth, diff",
    reads: false,
  },
  {
    id: "generate",
    name: "graft_generate",
    handler: "api/mcp/generate.js",
    blurb: "Run a prompt and get the image back. Debits credits against your ledger like any other run.",
    args: [
      { name: "prompt_id", type: "string", required: true },
      { name: "model", type: "string", required: false },
    ],
    returns: "generation — id, url, seed, model, credits_spent",
    reads: false,
    costs: true,
  },
  {
    id: "balance",
    name: "graft_get_balance",
    handler: "api/mcp/balance.js",
    blurb: "Your current credit balance, summed from the ledger, plus the last rows that changed it.",
    args: [],
    returns: "balance — credits, recent_rows[]",
    reads: true,
  },
];

/* What the tools are actually for, shown as a real exchange. The turns are
   written as the transcript they would produce, and every tool named in them
   exists in TOOLS above. */
export const FLOWS = [
  {
    id: "borrow",
    label: "Borrow a prompt",
    blurb: "Find work you like and take the prompt, not the picture.",
    turns: [
      { role: "you", text: "Find me prompts for moody street photography at night." },
      { role: "tool", text: "graft_search_prompts({ query: \"moody street photography, night\" })" },
      {
        role: "ai",
        text: "Four published prompts. The most forked is mira's — \"a woman walking down a manhattan avenue, at her true scale\" — with 214 children. Want its lineage?",
      },
    ],
  },
  {
    id: "trace",
    label: "Trace a lineage",
    blurb: "See the exact edit at every step that got somewhere.",
    turns: [
      { role: "you", text: "Show me how that one evolved." },
      { role: "tool", text: "graft_get_lineage({ prompt_id: \"p_8812f0\" })" },
      {
        role: "ai",
        text: "Four generations. Root was a plain street shot; koji added \"at her true scale\", ade changed the light to dusk, rue put it on film. The scale line is where it turned.",
      },
    ],
  },
  {
    id: "fork",
    label: "Fork and run",
    blurb: "Change one line and generate, without leaving the editor.",
    turns: [
      { role: "you", text: "Fork ade's version but make it rain." },
      { role: "tool", text: "graft_fork_prompt({ parent_id: \"p_8813a1\", text: \"…at dusk, heavy rain\" })" },
      { role: "tool", text: "graft_generate({ prompt_id: \"p_8814c7\" })" },
      {
        role: "ai",
        text: "Done — 1 credit, FLUX.1 schnell, seed 8814c7. It is a child of ade's, and the diff is the rain line.",
      },
    ],
  },
];

/* Why this exists, in the product's own terms. Three claims, each one a real
   property of an MCP server rather than a benefit statement. */
export const WHY = [
  {
    id: "context",
    title: "The prompt goes where the work is",
    body:
      "A prompt is text, and text belongs in the editor you are already writing in. The server hands your assistant the prompt and its history, not a link to go and look at one.",
  },
  {
    id: "open",
    title: "One protocol, any client",
    body:
      "MCP is an open standard, so the same server answers Claude, Cursor, VS Code and anything else that speaks it. Graft ships the server, not a plugin per client.",
  },
  {
    id: "same",
    title: "The same API the site uses",
    body:
      "These tools call the handlers the web app calls. There is no separate integration surface to fall behind — a fork made from your editor and one made in the browser are the same row.",
  },
];
