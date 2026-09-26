/**
 * The credits surface.
 *
 * This replaces the pricing page the clone shipped, and the replacement is a
 * product decision rather than a shortcut: Graft has no billing, no paid
 * inference and no subscription tiers, so a page of plans and prices would be
 * asserting a business that does not exist. What it *does* have is a real
 * append-only ledger, and showing that is both honest and a better argument.
 *
 * SOURCING RULE, same as modelspec.js: nothing here is invented commerce.
 *
 *   - Costs are the *unit* costs the API charges a generation, which are
 *     Graft's own choice and therefore true by definition.
 *   - The ledger rows below are FIXTURES shaped exactly like the rows the
 *     `credit_ledger` table returns, so the page swaps to live data without a
 *     re-layout. They are marked as a sample in the UI, never dressed as one
 *     visitor's real history.
 *   - There is no "upgrade", no price, and no currency anywhere. The moment
 *     Graft charges money, that is the moment this file grows a price.
 */

/* What a run costs, by model and size. These are the numbers the API debits,
   so they are the product's own truth rather than a claim about anyone else. */
export const COSTS = [
  {
    id: "flux",
    model: "FLUX.1 schnell",
    note: "4 steps, 1024×1024",
    credits: 1,
    lead: true,
  },
  { id: "sdxl", model: "SDXL", note: "30 steps, 1024×1024", credits: 3 },
  { id: "sd3", model: "Stable Diffusion 3", note: "28 steps, 1024×1024", credits: 4 },
  { id: "pixart", model: "PixArt-Σ", note: "20 steps, 1024×1024", credits: 2 },
];

/* What you are given, and why. Not tiers — one grant, stated plainly. */
export const GRANTS = [
  {
    id: "guest",
    label: "Without an account",
    credits: 20,
    blurb:
      "Enough to run a prompt and fork it a few times. Spent credits do not come back, and the library goes when the session does.",
  },
  {
    id: "account",
    label: "With an account",
    credits: 120,
    blurb:
      "Refreshed monthly. Your generations, prompts and their lineage are kept, and anything you publish stays forkable by everyone else.",
    lead: true,
  },
];

/* A worked example of the ledger, in the shape the table returns.
 *
 * `delta` is signed and `balance` is NOT stored — it is derived by summing the
 * deltas, which is the whole point of an append-only ledger and the reason the
 * page computes it rather than reading it. A row is never edited or removed;
 * a refund is its own positive row.
 */
export const LEDGER = [
  {
    id: "l01",
    at: "2026-09-26T09:02:11Z",
    kind: "grant",
    delta: 120,
    reason: "Monthly grant",
    ref: null,
  },
  {
    id: "l02",
    at: "2026-09-26T09:04:48Z",
    kind: "spend",
    delta: -1,
    reason: "FLUX.1 schnell · 1024×1024",
    ref: "gen_8812f0",
  },
  {
    id: "l03",
    at: "2026-09-26T09:06:02Z",
    kind: "spend",
    delta: -1,
    reason: "Fork of gen_8812f0",
    ref: "gen_8812f4",
  },
  {
    id: "l04",
    at: "2026-09-26T09:09:30Z",
    kind: "spend",
    delta: -4,
    reason: "Stable Diffusion 3 · 1024×1024",
    ref: "gen_8813a1",
  },
  {
    id: "l05",
    at: "2026-09-26T09:09:58Z",
    kind: "refund",
    delta: 4,
    reason: "Provider returned an error",
    ref: "gen_8813a1",
  },
  {
    id: "l06",
    at: "2026-09-26T09:14:20Z",
    kind: "spend",
    delta: -3,
    reason: "SDXL · 1024×1024",
    ref: "gen_8814c7",
  },
];

/* The rules the ledger enforces, written as the page's own argument. Each one
   is a real property of the implementation, not a marketing line. */
export const RULES = [
  {
    id: "append",
    title: "Nothing is ever edited",
    body:
      "Every grant, spend and refund is its own row. A mistake is corrected by writing the opposite row, never by changing history — so the balance can always be recomputed from scratch and checked.",
  },
  {
    id: "derived",
    title: "The balance is derived, not stored",
    body:
      "There is no counter to drift out of sync with reality. Your balance is the sum of your rows, computed on read, which means it cannot disagree with what you actually spent.",
  },
  {
    id: "atomic",
    title: "The charge and the work commit together",
    body:
      "A generation writes its ledger row in the same transaction that creates it. You cannot be charged for a run that never started, or get a run that was never charged.",
  },
  {
    id: "refuse",
    title: "It refuses you when you are short",
    body:
      "The check happens server-side before any provider is called. Running out is an ordinary answer with a clear reason, not an error — and never a surprise debt.",
  },
];
