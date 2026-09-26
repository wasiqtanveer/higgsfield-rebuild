/**
 * Auth client.
 *
 * The session lives in an httpOnly cookie that this file cannot read. That is
 * deliberate: a token in localStorage is readable by every script on the page,
 * and this module used to keep the whole user there. Now the browser holds no
 * credential at all — it holds a *copy* of what the server last said about the
 * user, and the server is the only thing that can answer who that is.
 *
 * Still an external store rather than context, for the reasons it always was:
 * the nav, the account menu and the studio all read it, and useSyncExternalStore
 * hands every subscriber the same snapshot without wrapping the tree.
 *
 * What changed is where the truth is. `current` is a cache; /api/auth is the
 * record.
 */

import { useSyncExternalStore } from "react";

let current = null;
let status = "idle"; // idle -> loading -> ready
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setUser(user) {
  current = user ?? null;
  status = "ready";
  emit();
}

/* --- the wire ------------------------------------------------------------- */

async function post(payload) {
  const r = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // The cookie is the session, so it has to ride along. Same-origin is the
    // default in modern browsers, but stating it means a future move to a
    // separate API origin fails loudly rather than silently signing everyone
    // out.
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });

  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.error || `Request failed (${r.status})`);
  return body;
}

/**
 * Ask the server who we are.
 *
 * Called once on boot. Until it answers, `status` is "loading" and the header
 * shows neither the pill nor the circle — flashing the signed-out state at
 * someone who is signed in is worse than showing nothing for 200ms.
 */
export async function loadSession() {
  if (status !== "idle") return current;
  status = "loading";
  emit();

  try {
    const r = await fetch("/api/auth", { credentials: "same-origin" });
    const body = await r.json().catch(() => ({}));
    setUser(body.user ?? null);
  } catch {
    // Offline, or /api not running. Signed out is the safe reading: it shows
    // the door rather than a menu whose every action would fail.
    setUser(null);
  }
  return current;
}

export async function signUp({ email, password, name }) {
  const body = await post({ action: "signup", email, password, name });
  // A project with email confirmation on returns no user: the account exists
  // but is not usable yet, and the caller has to say so.
  if (body.user) setUser(body.user);
  return body;
}

export async function signIn({ email, password }) {
  const body = await post({ action: "login", email, password });
  setUser(body.user ?? null);
  return body;
}

export async function signOut() {
  try {
    await post({ action: "logout" });
  } finally {
    // Cleared regardless. A failed logout request must not leave the UI
    // insisting the user is still signed in.
    setUser(null);
  }
}

/**
 * Re-read the balance from the server.
 *
 * Credits are a derived sum on Postgres, so the client cannot compute a new one
 * after a spend — it has to ask. Called after anything that costs credits.
 */
export async function refreshUser() {
  try {
    const r = await fetch("/api/auth", { credentials: "same-origin" });
    const body = await r.json().catch(() => ({}));
    setUser(body.user ?? null);
  } catch {
    /* leave the cached user in place; a failed refresh is not a sign-out */
  }
  return current;
}

export function getUser() {
  return current;
}

/** Null means signed out — but check `useAuthStatus` before drawing on that. */
export function useAuth() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

/** "idle" | "loading" | "ready". Lets the header hold still until we know. */
export function useAuthStatus() {
  return useSyncExternalStore(subscribe, () => status, () => "loading");
}
