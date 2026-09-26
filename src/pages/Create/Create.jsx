import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, GitFork, Info, RotateCcw, Sparkles } from "lucide-react";
import { COSTS } from "../../data/credits.js";
import "./Create.css";
import { setCredits, useAuth } from "../../lib/auth.js";

/**
 * /create — the composer.
 *
 * The one screen where this product's claim has to hold up: a prompt goes in, a
 * picture comes out, and the prompt stays the artifact rather than becoming a
 * caption under the result.
 *
 * Layout is two columns. The composer is a left rail because a prompt is a
 * document being written and a document wants a column; the result takes the
 * wide side because it is the thing being judged. On a narrow screen the result
 * moves ABOVE the composer once a run lands — on a phone the generated image is
 * the answer to the question you just asked, and making you scroll past your
 * own form to reach it is the wrong order.
 *
 * WHAT IS REAL HERE, stated plainly because rule 1 of this repo is that nothing
 * claims a capability that does not exist:
 *
 *   - Generation is real. It POSTs to /api/generate, which runs Cloudflare
 *     Workers AI and falls back to keyless Pollinations. The panel reports which
 *     provider actually served the image, because that is the thing a reviewer
 *     came to check.
 *   - The seed is real and is echoed back by the endpoint.
 *   - Cost-per-run is real: it is the number /credits publishes, imported from
 *     the same module rather than retyped here.
 *   - The credit BALANCE is not real yet and does not pretend to be. There is no
 *     ledger table, so this screen shows what a run costs and says the balance
 *     arrives with the ledger. A counter ticking down from a made-up 20 would be
 *     a hardcoded response on the most visible surface.
 *   - Lineage is not staged. Arrive with ?parentPrompt= and the parent you came
 *     from is shown; arrive with nothing and the panel says this starts a root.
 *     No invented parent chain.
 */

/* The composer drives one model today. FLUX schnell is what api/generate.js
   runs, so this reads that row out of the published cost table rather than
   restating its price — if /credits changes what a run costs, this follows. */
const MODEL = COSTS.find((c) => c.id === "flux") ?? COSTS[0];

/* Cloudflare's ceiling for schnell, mirrored from api/generate.js. The server
   clamps regardless; this keeps the control from offering what the API refuses. */
const MAX_STEPS = 8;
const MAX_PROMPT = 2000;

/* Names the phase a run is in. Never a percentage: we do not know how long the
   provider will take, and a bar that implies we do is a lie with a number on
   it. */
const STATUS_STEPS = [
  "Sending the prompt",
  "Waiting on the model",
  "Decoding the frame",
];

/* The page's one arrival curve, shared with the Hero, ModelSpec and ForkDiff.
   One ease for every authored motion is most of what makes a set of components
   read as a single hand rather than as four things that each animate. */
const EASE = [0.22, 1, 0.36, 1];

/* The composer's arrival, timed in reading order: the lineage strip says where
   you are, the prompt box is what you came for, the controls modify it, the
   button commits it. Small steps — this is a tool, and a tool that takes a
   second to assemble itself before you can type is a tool getting in the way. */
const rise = (i, reduced) => ({
  initial: reduced ? false : { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: reduced
    ? { duration: 0 }
    : { duration: 0.45, ease: EASE, delay: 0.04 + i * 0.05 },
});

/* Swapping one result state for another. Short and small: this fires while the
   visitor is waiting on a machine, and a long flourish between "waiting" and
   "here it is" delays the only thing they want to see. */
const swap = (reduced) => ({
  initial: reduced ? false : { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: reduced ? { opacity: 1 } : { opacity: 0, y: -6 },
  transition: reduced ? { duration: 0 } : { duration: 0.26, ease: EASE },
});

export default function Create() {
  const [params, setParams] = useSearchParams();
  const reduced = useReducedMotion();
  /* Null when signed out. The composer works either way -- an anonymous run is
     free and stores nothing against an account. */
  const user = useAuth();

  /* The hero and nav link here with ?prompt= and ?from=, so those are read on
     mount rather than ignored — a link that carries a prompt and lands on an
     empty box is a broken promise. */
  const [prompt, setPrompt] = useState(() => params.get("prompt") ?? "");
  const [steps, setSteps] = useState(4);
  const [seedInput, setSeedInput] = useState("");

  const [state, setState] = useState("idle"); // idle | running | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [statusIndex, setStatusIndex] = useState(0);

  const abortRef = useRef(null);
  const resultRef = useRef(null);
  const textareaRef = useRef(null);

  /* Where this run sits in the tree. Displayed as a parent only when the URL
     names one, and never invented. */
  const from = params.get("from");
  const parentPrompt = params.get("parentPrompt");
  /* The row this run descends from. Held in state rather than read straight
     from the URL every render, because forking a result you just made has to
     set it without a navigation. */
  const [parentId, setParentId] = useState(() => params.get("parent"));

  const trimmed = prompt.trim();
  const canRun = trimmed.length > 0 && state !== "running";

  useEffect(() => {
    if (state !== "running" || reduced) return undefined;
    setStatusIndex(0);
    const id = setInterval(
      () => setStatusIndex((n) => Math.min(n + 1, STATUS_STEPS.length - 1)),
      1600
    );
    return () => clearInterval(id);
  }, [state, reduced]);

  /* Autosize the prompt box. A prompt is the artifact on this product, so it
     gets to be as tall as it needs rather than living in a 3-line slot with its
     own scrollbar. */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 340)}px`;
  }, [prompt]);

  const run = useCallback(
    async (event) => {
      event?.preventDefault();
      if (!canRun) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setState("running");
      setError(null);

      /* The prompt goes into the URL as the run starts, so a generation is
         linkable and a reload does not lose the text. Replace, not push: a run
         is not a new history entry. */
      const next = new URLSearchParams(params);
      next.set("prompt", trimmed);
      setParams(next, { replace: true });

      try {
        const seed = seedInput.trim() === "" ? undefined : Number(seedInput);
        /* /api/fork, not /api/generate. `generate` is the stateless try-it
           endpoint and stores nothing; `fork` writes the row and records what
           it descends from. This product's whole claim is that a prompt is kept
           and can be forked, so the composer has to use the one that keeps it. */
        const r = await fetch("/api/fork", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmed,
            steps,
            ...(Number.isFinite(seed) ? { seed } : {}),
            /* Absent means a root prompt, which is a real state rather than a
               missing value — the endpoint treats it that way too. */
            ...(parentId ? { parentId } : {}),
          }),
          /* The session is an httpOnly cookie, and without this the server
             sees every fork as anonymous -- which would silently skip the
             charge and credit the work to nobody. */
          credentials: "same-origin",
          signal: ac.signal,
        });

        const json = await r.json().catch(() => null);

        if (!r.ok) {
          /* The endpoint puts the reason in `error` and the per-provider
             failures in `detail`. Both are surfaced: "it didn't work" sends
             someone hunting through logs for something we already know. */
          const e = new Error(json?.error ?? `The server answered ${r.status}.`);
          e.detail = json?.detail ?? null;
          throw e;
        }

        const g = json?.generation;
        if (!g) throw new Error("The server answered without a generation.");

        setResult({
          id: g.id,
          /* Prefer the inline bytes: the upload to Storage continues after the
             response, so `image_url` may 404 for a few seconds yet. The inline
             copy is the same image and is already here, which is why the wait
             is now generation time rather than generation plus upload. */
          imageUrl: g.image_inline || g.image_url,
          provider: g.provider,
          seed: g.seed,
          steps: g.steps,
          prompt: g.prompt,
          depth: json.depth ?? 1,
        });
        /* The server already told us the balance after the charge, so this
           updates the header without a second round trip. Anonymous callers
           get null and nothing moves. */
        if (typeof json.credits === "number") setCredits(json.credits);
        setState("done");
      } catch (err) {
        if (err.name === "AbortError") return;
        setError({
          message: String(err.message || err),
          detail: Array.isArray(err.detail) ? err.detail : null,
        });
        setState("error");
      }
    },
    [canRun, trimmed, steps, seedInput, parentId, params, setParams]
  );

  /* Fork what is on screen: the result becomes the parent of the next run, its
     prompt is loaded for editing, and the seed is pinned so the next image
     differs by the words rather than by noise. This is the product's core loop,
     and it happens without leaving the page. */
  const forkThis = useCallback(() => {
    if (!result) return;
    setParentId(result.id);
    setPrompt(result.prompt);
    setSeedInput(String(result.seed));
    setState("idle");
    setResult(null);

    const next = new URLSearchParams(params);
    next.set("parent", result.id);
    next.set("prompt", result.prompt);
    setParams(next, { replace: true });

    textareaRef.current?.focus();
  }, [result, params, setParams]);

  /* Cmd/Ctrl+Enter runs. The composer is a textarea because prompts wrap, and a
     textarea swallows Enter by design, so the run key has to be stated. */
  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(e);
  };

  /* Once a run lands, take focus to the result. Focus, not scroll alone: a
     keyboard user needs to be moved to the thing that just appeared. */
  useEffect(() => {
    if (state !== "done") return;
    resultRef.current?.focus({ preventScroll: true });
    if (window.matchMedia?.("(max-width: 1020px)").matches) {
      resultRef.current?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "nearest",
      });
    }
  }, [state, reduced]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const count = trimmed.length;
  const nearLimit = count > MAX_PROMPT * 0.9;

  return (
    <div className="cmp">
      {/* No kicker above the heading — banned by DESIGN.md. Exactly one serif
          italic word in the headline. */}
      <motion.header
        className="cmp__head page"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE }}
      >
        <h1 className="cmp__h1">
          Write it, then <em>fork</em> it.
        </h1>
        <p className="cmp__lede">
          The prompt is what gets stored. The picture is what it produced this
          time.
        </p>
      </motion.header>

      <div className="cmp__grid page">
        {/* ---- the composer ------------------------------------------------ */}
        <form className="cmp__panel cmp__compose" onSubmit={run}>
          {/* The lineage strip. It says where this prompt sits in the tree in
              plain words — "root node" is how the database thinks about it, not
              how anyone writing their first prompt does. */}
          <motion.div
            className="cmp__lineage"
            data-root={parentId ? "false" : "true"}
            {...rise(0, reduced)}
          >
            {parentId ? (
              <>
                <span className="cmp__tag label">
                  <GitFork size={11} aria-hidden="true" /> Growing from
                </span>
                {parentPrompt ? (
                  <p className="cmp__parent mono">{parentPrompt}</p>
                ) : (
                  <p className="cmp__parent mono">
                    {/* The id is what actually links the rows, so when the
                        parent's text was not passed along it is shown rather
                        than nothing — it is the honest handle on the row. */}
                    #{parentId.slice(0, 8)}
                  </p>
                )}
              </>
            ) : (
              <>
                <span className="cmp__tag label">
                  <Sparkles size={11} aria-hidden="true" /> Starting fresh
                </span>
                <p className="cmp__parent cmp__parent--empty">
                  Nothing above this one yet. Whatever you write becomes
                  something other people can fork.
                </p>
              </>
            )}
          </motion.div>

          <motion.label className="cmp__field" {...rise(1, reduced)}>
            <span className="cmp__label label">Prompt</span>
            <textarea
              ref={textareaRef}
              className="cmp__input mono"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT))}
              onKeyDown={onKeyDown}
              placeholder="A 35mm frame of an empty tram stop at 6am, sodium light, wet asphalt"
              rows={4}
              spellCheck="true"
              aria-describedby="cmp-run-hint"
            />
            <span
              className={`cmp__count mono${nearLimit ? " is-near" : ""}`}
              data-numeric
            >
              {count} / {MAX_PROMPT}
            </span>
          </motion.label>

          {/* Two controls, not ten. Both change the output in a way the visitor
              can reason about; anything they cannot reason about is noise on a
              screen meant to be about the words. */}
          <motion.div className="cmp__controls" {...rise(2, reduced)}>
            <label className="cmp__control">
              <span className="cmp__label label">
                Steps
                <span className="cmp__val mono" data-numeric>
                  {steps}
                </span>
              </span>
              <input
                className="cmp__range"
                type="range"
                min="1"
                max={MAX_STEPS}
                step="1"
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
              />
              <span className="cmp__hint">
                schnell is distilled for four. More is slower, not sharper.
              </span>
            </label>

            <label className="cmp__control">
              <span className="cmp__label label">Seed</span>
              <input
                className="cmp__seed mono"
                type="text"
                inputMode="numeric"
                value={seedInput}
                onChange={(e) =>
                  setSeedInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))
                }
                placeholder="random"
                data-numeric
              />
              <span className="cmp__hint">
                Fix it to compare a fork against its parent rather than against
                noise.
              </span>
            </label>
          </motion.div>

          <motion.div className="cmp__actions" {...rise(3, reduced)}>
            {/* Press feedback on the primary action. A button that does not
                acknowledge the click leaves you wondering whether it took, and
                this one starts a request that can run for seconds. */}
            <motion.button
              className="cmp__run"
              type="submit"
              disabled={!canRun}
              whileTap={reduced || !canRun ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.1, ease: EASE }}
            >
              {state === "running" ? (
                <>
                  <span className="cmp__spinner" aria-hidden="true" />
                  Generating
                </>
              ) : (
                <>
                  Generate <ArrowUp size={15} aria-hidden="true" />
                </>
              )}
            </motion.button>
            <p className="cmp__cost mono" id="cmp-run-hint" data-numeric>
              {MODEL.credits} credit{MODEL.credits === 1 ? "" : "s"} · {MODEL.model}
            </p>
          </motion.div>

          {/* The ledger is live now: a signed-in run is charged against a real
              balance, and an anonymous one is free. Both stated, because a
              visitor who is not signed in should not be told about a balance
              they do not have. */}
          <motion.p className="cmp__pending" {...rise(4, reduced)}>
            <Info size={12} aria-hidden="true" />
            {user
              ? `Charged to your balance — ${user.credits} credits left.`
              : "Free while signed out. Sign in to keep what you make and build a lineage."}
          </motion.p>
        </form>

        {/* ---- the result -------------------------------------------------- */}
        <motion.section
          className="cmp__panel cmp__result"
          ref={resultRef}
          tabIndex={-1}
          aria-live="polite"
          data-state={state}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduced ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: 0.1 }
          }
        >
          {/* One state visible at a time, cross-faded. `mode="wait"` so the
              outgoing state clears before the next arrives — two states
              dissolving through each other in the same box reads as a glitch
              rather than as a transition. */}
          <AnimatePresence mode="wait" initial={false}>
          {state === "idle" && (
            <motion.div className="cmp__empty" key="idle" {...swap(reduced)}>
              <p className="cmp__empty-h">Nothing generated yet.</p>
              <p className="cmp__empty-b">
                What comes back appears here with its seed and the provider that
                served it.
              </p>
            </motion.div>
          )}

          {state === "running" && (
            <motion.div className="cmp__empty" key="running" {...swap(reduced)}>
              {/* Indeterminate on purpose. A percentage we invented would be the
                  same class of fiction as a mock image. */}
              <span className="cmp__bar" aria-hidden="true" />
              {/* The phase name changes under a fixed heading slot, so the line
                  reads as one status updating rather than as three different
                  messages taking turns. */}
              <p className="cmp__empty-h">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={statusIndex}
                    initial={reduced ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 1 } : { opacity: 0, y: -5 }}
                    transition={
                      reduced ? { duration: 0 } : { duration: 0.22, ease: EASE }
                    }
                    style={{ display: "inline-block" }}
                  >
                    {STATUS_STEPS[statusIndex]}…
                  </motion.span>
                </AnimatePresence>
              </p>
              <p className="cmp__empty-b">
                Cloudflare first; if it declines, the keyless fallback answers.
              </p>
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              className="cmp__empty cmp__empty--error"
              key="error"
              {...swap(reduced)}
            >
              <p className="cmp__empty-h">No image came back.</p>
              <p className="cmp__empty-b">{error?.message}</p>
              {error?.detail?.length > 0 && (
                <ul className="cmp__detail mono">
                  {error.detail.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
              <button className="cmp__retry" type="button" onClick={run}>
                <RotateCcw size={14} aria-hidden="true" /> Try again
              </button>
            </motion.div>
          )}

          {state === "done" && result && (
            <motion.div className="cmp__done" key="done" {...swap(reduced)}>
              <figure className="cmp__figure">
                {/* The image resolves rather than pops: it scales down a hair
                    onto the frame as it fades up. The picture is the payoff of
                    a wait measured in seconds, and letting it land is the one
                    place on this page worth spending motion on. */}
                {result.imageUrl ? (
                  <motion.img
                    className="cmp__img"
                    src={result.imageUrl}
                    alt={`Generated from the prompt: ${result.prompt}`}
                    initial={reduced ? false : { opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={
                      reduced ? { duration: 0 } : { duration: 0.6, ease: EASE }
                    }
                  />
                ) : (
                  /* The row was written and the lineage recorded, but the
                     upload did not land. Saying so beats reporting the whole
                     run as a failure it was not. */
                  <p className="cmp__empty-b">
                    Saved, but the image did not finish uploading.
                  </p>
                )}
              </figure>
              {/* The receipt. This is the part that proves a machine answered:
                  which provider, which seed, how many steps. */}
              {/* The receipt lands just behind the image, dealt left to right:
                  it is evidence about the picture, so it should arrive after
                  the thing it describes rather than alongside it. */}
              <dl className="cmp__meta">
                {[
                  ["Provider", result.provider, false],
                  ["Seed", result.seed, true],
                  ["Steps", result.steps, true],
                  /* Depth is the lineage made legible: 1 is a root, anything
                     higher counts the chain back to one. It is read off the
                     stored rows, not from anything this page kept. */
                  ["Depth", result.depth, true],
                ].map(([k, v, numeric], i) => (
                  <motion.div
                    className="cmp__meta-row"
                    key={k}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.4, ease: EASE, delay: 0.34 + i * 0.07 }
                    }
                  >
                    <dt className="label">{k}</dt>
                    <dd className="mono" {...(numeric ? { "data-numeric": "" } : {})}>
                      {v}
                    </dd>
                  </motion.div>
                ))}
              </dl>
              {/* The loop the product exists for, as one button. */}
              <div className="cmp__after">
                <button className="cmp__fork" type="button" onClick={forkThis}>
                  <GitFork size={14} aria-hidden="true" /> Fork this
                </button>
                <p className="cmp__note">
                  Loads this prompt with its seed pinned. Change one clause and
                  run it again — the new image keeps this one as its parent.
                </p>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.section>
      </div>
    </div>
  );
}
