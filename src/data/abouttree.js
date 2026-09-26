/**
 * The /about page's content, as a prompt tree.
 *
 * SOURCING RULE — read before editing, same rule as `modelspec.js`,
 * `credits.js` and `graftmcp.js`.
 *
 * Every node below is a real decision taken while building this product, and
 * every claim in one is either something that exists in this repository or is
 * explicitly marked as not built. There is no invented history here: no founding
 * date, no team, no funding, no user count, no "trusted by". The page's argument
 * is that Graft's position is load-bearing, and a fabricated fact anywhere in it
 * would make that argument worthless in front of the one audience hired to look
 * for exactly this.
 *
 * WHY THE CONTENT IS SHAPED LIKE A PROMPT TREE
 *
 * The product's claim is that the prompt is the artifact and that a claim gets
 * tested by forking it. An About page that states that claim in prose asserts
 * it; an About page whose own text is a forkable tree performs it. So each node
 * is written to work as a *statement under revision*: `line` is the claim as it
 * stands, and a child's `line` is its parent's with ONE clause replaced. The
 * diff between them is computed at runtime, never authored as marked-up spans,
 * for the same reason `ForkDiff` computes its own — a hand-marked diff is a lie
 * the moment anyone edits the text, and this text is meant to be edited.
 *
 * THE ONE-CLAUSE RULE (binding)
 *
 * A child must differ from its parent by approximately one clause. "Change one
 * line" is the entire product claim, so a diff that rewrites half the statement
 * demonstrates the opposite of the thing the page is arguing. If you edit a
 * `line`, diff it against its parent by eye before committing: two changed
 * clauses and the page is lying about its own mechanism.
 *
 * `body` is the reasoning behind the node — prose, set in the sans, because it
 * is commentary *about* the artifact rather than the artifact itself. `line` is
 * the artifact and is set in mono at reading size. That split is the whole
 * typographic argument of the product, and it is load-bearing here.
 *
 * `cost` is what the decision gave up. Every real decision has one, and a list
 * of decisions with no costs reads as a list of features.
 */

/**
 * The root claim. Every other node in the tree is a revision of this sentence
 * or of one of its revisions, which is why it is phrased as a claim about the
 * artifact rather than as a greeting.
 */
export const ROOT = {
  id: "root",
  label: "the claim",
  line: "a tool for making images, where the image is the artifact and the prompt is a caption",
  body:
    "That is the sentence every product in this category is built on, and it is the one Graft revises. Below is the revision, and then the revisions of the revision. Open any of them.",
  cost: null,
};

/**
 * The tree, keyed by node id. Flat rather than nested: the page walks it by id,
 * the same shape the `prompts` table uses (`parent_prompt_id`, `root_id`,
 * `depth`), so the page's structure and the schema's structure are the same
 * structure rather than two descriptions of one idea.
 */
export const NODES = {
  root: {
    ...ROOT,
    children: ["thesis"],
  },

  /* Depth 1 — the single clause swap that is the whole product. */
  thesis: {
    id: "thesis",
    parent: "root",
    label: "the swap",
    line: "a tool for making images, where the prompt is the artifact and the image is its output",
    body:
      "One clause moved and the product changed. If the prompt is the artifact then it has a history, it can be revised, and a revision has a parent. Everything under this node follows from that sentence, including the things it forced out of the product.",
    cost:
      "It stops being a gallery. A wall of finished pictures is the most persuasive surface this category has, and Graft cannot lead with one.",
    children: ["lineage", "cut", "real"],
  },

  /* Depth 2 — the three consequences. */
  lineage: {
    id: "lineage",
    parent: "thesis",
    label: "lineage",
    line:
      "a tool for making images, where the prompt is the artifact and every artifact carries its parent",
    body:
      "An artifact with a history is a tree. Open a public image, change one line, run it again, and your version is a child whose diff against its parent stays readable. The category shows you finished output and hides the prompt, so the chain does not exist to be shown. That chain is the feature nobody else has, and it is why the accent colour on this product marks exactly two things: the primary action, and the lineage thread.",
    cost:
      "Lineage needs data that a new product does not have. The media library here holds no two images that are variations of one prompt, so no surface on this site stages a parent/child image pair — the claim is delivered in text until the database can deliver it in pictures.",
    children: ["depth", "diff"],
  },

  cut: {
    id: "cut",
    parent: "thesis",
    label: "what was cut",
    line:
      "a tool for making images, where the prompt is the artifact and nothing claims a capability it lacks",
    body:
      "Video, audio and face swap are gone, not deferred — no free provider does them honestly, so a studio for them would be a screen pretending to be a product. Prices and plans are gone with them: Graft cannot charge anyone, so there is no currency anywhere on this site. The pricing page was deleted and replaced with a credits page that documents the real ledger instead of selling a plan.",
    cost:
      "Three route names that a reviewer expects to find, and the single most impressive-looking screen in the category. A fake video studio would have photographed better than anything that shipped.",
    children: ["ledger"],
  },

  real: {
    id: "real",
    parent: "thesis",
    label: "what is real",
    line:
      "a tool for making images, where the prompt is the artifact and the server is the product",
    body:
      "A React app calling a hosted database directly is a passthrough, not a backend. So Supabase is reached only server-side with the service-role key, the browser never holds it, and the API is hand-written route handlers under /api rather than a generated layer. Generation runs on Cloudflare Workers AI with a keyless fallback, and the response names which provider actually served it.",
    cost:
      "Every hour spent on the interface is an hour not spent here, and this is the part that cannot be faked. Some of the schema above is built and some of it is not; the credits page states which guarantees are enforced rather than implying all of them are.",
    children: ["mcp"],
  },

  /* Depth 3 — the mechanics, for the reader who is still going. */
  depth: {
    id: "depth",
    parent: "lineage",
    label: "stored, not derived",
    /* One clause from its parent ("every artifact carries its parent" →
       "every artifact knows its own depth"), per the one-clause rule above. An
       earlier draft replaced the whole tail and the diff rewrote six tokens,
       which demonstrated the opposite of what this page argues. */
    line:
      "a tool for making images, where the prompt is the artifact and every artifact knows its own depth",
    body:
      "Depth is stored, not derived on read: each prompt row carries a parent id, a root id and a depth. That is what makes a chain cheap enough to show on a feed rather than something you assemble with recursive queries every time somebody scrolls. Counts on this site describe prompts and their descendants — text artifacts — never pictures.",
    cost:
      "Denormalised columns have to be maintained, and a wrong depth is a visible lie rather than a slow query.",
    children: [],
  },

  diff: {
    id: "diff",
    parent: "lineage",
    label: "the diff",
    line:
      "a tool for making images, where the prompt is the artifact and the change between two is computed",
    body:
      "Every diff on this site is a real word-level diff, run in the browser over whitespace-split tokens with a longest-common-subsequence table. Pre-marked spans would look identical and cost nothing — and would be wrong the first time anyone edited the text. The diff you are reading right now, at the top of this node, was computed the same way.",
    cost:
      "A quadratic table per diff. At prompt length that is free; on a paragraph it would not be, which is why the artifact stays a line and the reasoning stays prose.",
    children: [],
  },

  ledger: {
    id: "ledger",
    parent: "cut",
    label: "the ledger",
    line:
      "a tool for making images, where the prompt is the artifact and the balance is never stored",
    body:
      "Credits are an append-only ledger. Nothing is ever edited — a correction is an opposite row — and the balance is summed on read rather than kept in a counter that can drift away from its own history. The ledger row and the generation commit together, and a refusal for insufficient credit happens before any provider is called, as an ordinary answer with a reason.",
    cost:
      "Reads cost a sum instead of a lookup, and the credits page had to make those four guarantees in public before the code enforced them.",
    children: [],
  },

  mcp: {
    id: "mcp",
    parent: "real",
    label: "the server",
    line:
      "a tool for making images, where the prompt is the artifact and the tool list is the contract",
    body:
      "The MCP page is not a brochure. Each tool in it names the handler that backs it, so a tool cannot be advertised without existing — search, lineage, fork, generate, balance. An agent that can fork a prompt is the same product as a person who can, which is the point of the prompt being the artifact rather than the picture.",
    cost:
      "The list can only grow as fast as the handlers do, so it is shorter than the ones it sits beside.",
    children: [],
  },
};

/** The action at the tree's terminus. It is the only one on the page. */
export const TERMINUS = {
  label: "Write your own",
  href: "/create",
  note: "The composer takes a prompt and gives it a parent.",
};
