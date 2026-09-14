#!/usr/bin/env node
/**
 * 8x assignment capture hook.
 *
 * Invoked automatically by Claude Code:
 *   UserPromptSubmit -> node capture.mjs prompt
 *   Stop             -> node capture.mjs response
 *
 * Reads the hook payload as JSON on stdin and appends one LOG_ENTRY to the
 * session's file in .agent-logs/. Captures the prompt and the final assistant
 * message only -- no thinking, no tool calls, no intermediate steps.
 */
import fs from "node:fs";
import path from "node:path";

const KIND = process.argv[2]; // "prompt" | "response"

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function fail(msg) {
  // Never break the session because logging failed; surface it instead.
  process.stderr.write(`[capture] ${msg}\n`);
  process.exit(0);
}

const raw = readStdin();
let payload = {};
try {
  payload = JSON.parse(raw || "{}");
} catch {
  fail("could not parse hook payload as JSON");
}

const sessionId = payload.session_id || "unknown-session";
const short = sessionId.slice(0, 8);

// Project root: the hook payload's cwd, else this script's grandparent.
const projectDir =
  payload.cwd || path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

const logsDir = path.join(projectDir, ".agent-logs");
const indexDir = path.join(projectDir, ".claude", ".session-index");
fs.mkdirSync(logsDir, { recursive: true });
fs.mkdirSync(indexDir, { recursive: true });

const statePath = path.join(indexDir, `${sessionId}.json`);

/** Latest model seen in the transcript, so a mid-build model switch is visible. */
function modelFromTranscript(p) {
  if (!p || !fs.existsSync(p)) return null;
  try {
    const lines = fs.readFileSync(p, "utf8").trim().split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const o = JSON.parse(lines[i]);
        if (o?.message?.model) return o.message.model;
      } catch {}
    }
  } catch {}
  return null;
}

function resolveAuthor() {
  const f = path.join(projectDir, ".claude", "hooks", "author.txt");
  if (fs.existsSync(f)) {
    const v = fs.readFileSync(f, "utf8").trim();
    if (v) return v;
  }
  return process.env.AGENT_LOG_AUTHOR || "unknown";
}

const stamp = new Date().toISOString();
const model =
  payload.model || modelFromTranscript(payload.transcript_path) || "unknown";

function loadState() {
  if (fs.existsSync(statePath)) {
    try {
      return JSON.parse(fs.readFileSync(statePath, "utf8"));
    } catch {}
  }
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const name =
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `_${pad(d.getUTCHours())}-${pad(d.getUTCMinutes())}-${pad(d.getUTCSeconds())}` +
    `_${sessionId}.md`;
  return {
    session_id: sessionId,
    file: name,
    date: stamp.slice(0, 10),
    author: resolveAuthor(),
    model,
    tool: "claude-code",
    project: path.basename(projectDir).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    total_exchanges: 0,
    first_prompt_time: stamp,
    last_prompt_time: stamp,
    num: 0,
  };
}

const state = loadState();
const logPath = path.join(logsDir, state.file);

function frontmatter(s) {
  return [
    "---",
    `session_id: ${s.session_id}`,
    `date: ${s.date}`,
    `author: ${s.author}`,
    `model: ${s.model}`,
    `tool: ${s.tool}`,
    `project: ${s.project}`,
    `total_exchanges: ${s.total_exchanges}`,
    `first_prompt_time: ${s.first_prompt_time}`,
    `last_prompt_time: ${s.last_prompt_time}`,
    "---",
    "",
    `# Session Log - ${s.date}`,
    "",
    `Session: \`${short}\` | Project: \`${s.project}\` | Author: \`${s.author}\``,
    "",
    "---",
    "",
  ].join("\n");
}

/**
 * Body = every existing entry, verbatim. Split on the first LOG_ENTRY token:
 * the header above it is regenerated (counters change), entries themselves are
 * never rewritten, reordered, or removed.
 */
function readBody() {
  if (!fs.existsSync(logPath)) return "";
  const txt = fs.readFileSync(logPath, "utf8");
  const i = txt.indexOf("[LOG_ENTRY");
  return i === -1 ? "" : txt.slice(i);
}

let text;
if (KIND === "prompt") {
  text = payload.prompt ?? "";
  state.num += 1;
  state.total_exchanges = state.num;
  state.last_prompt_time = stamp;
} else {
  text = payload.last_assistant_message ?? "";
  if (!text) fail("Stop payload carried no last_assistant_message; nothing logged");
  // A Stop can arrive before any prompt has been counted -- the hook going live
  // mid-turn, or a resumed session. Keep numbering 1-based rather than emitting
  // a num=0 entry.
  if (state.num === 0) {
    state.num = 1;
    state.total_exchanges = 1;
  }
}

state.model = model;

const entry =
  `[LOG_ENTRY type=${KIND === "prompt" ? "PROMPT" : "RESPONSE"} num=${state.num} session=${short}]\n` +
  `timestamp: ${stamp}\n` +
  `model: ${model}\n\n` +
  `${text}\n\n\n`;

fs.writeFileSync(logPath, frontmatter(state) + readBody() + entry, "utf8");
fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
process.exit(0);
