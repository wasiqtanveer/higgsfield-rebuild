/**
 * Local auth store.
 *
 * There is no server in this build, so "signed in" is a record in
 * localStorage. It is kept here rather than in a component's state for three
 * reasons: the nav, the profile menu and the studio all need to read it; it has
 * to survive a reload, because being logged out by a refresh is the one thing
 * no real product does; and two tabs of the same app should not disagree about
 * who is signed in.
 *
 * Exposed as an external store rather than context -- useSyncExternalStore
 * gives every subscriber the same snapshot without wrapping the tree in a
 * provider, and it is what keeps the cross-tab `storage` event honest.
 */

import { useSyncExternalStore } from "react";

const KEY = "hf.auth";
const STARTING_CREDITS = 250;

/* Every read and write is guarded. Private windows and blocked site data both
   throw on access, and an app that will not render because storage is
   unavailable is worse than one that forgets who you are. */
function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && typeof user.email === "string" ? user : null;
  } catch {
    return null;
  }
}

function write(user) {
  try {
    if (user) localStorage.setItem(KEY, JSON.stringify(user));
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore -- the session still works, it just will not outlive the tab */
  }
}

let current = read();
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* A sign-in in one tab is a sign-in in all of them. The storage event fires
   only in the *other* tabs, which is exactly what is wanted here. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    current = read();
    emit();
  });
}

/** Derives the display fields a server would normally return. */
function profile(email, provider) {
  const handle = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  const name = handle
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

  return {
    email,
    provider,
    name: name || "Creator",
    handle: "@" + email.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, ""),
    initials: (name || "C")
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join(""),
    credits: STARTING_CREDITS,
    since: new Date().toISOString(),
  };
}

/* Providers hand back an address in real life, so they do here too -- a
   signed-in state with no identity behind it has nothing to show the user. */
const PLACEHOLDER = {
  google: "creator@gmail.com",
  apple: "creator@icloud.com",
  microsoft: "creator@outlook.com",
  business: "you@studio.com",
  email: "you@studio.com",
};

export function signIn({ provider = "email", email } = {}) {
  const address = (email || PLACEHOLDER[provider] || PLACEHOLDER.email).trim();
  current = profile(address, provider);
  write(current);
  emit();
  return current;
}

export function signOut() {
  current = null;
  write(null);
  emit();
}

/** Spend or refund credits. Returns false when the balance cannot cover it. */
export function spendCredits(n) {
  if (!current || n > current.credits) return false;
  current = { ...current, credits: current.credits - n };
  write(current);
  emit();
  return true;
}

export function getUser() {
  return current;
}

/** The hook every component should use. Null means signed out. */
export function useAuth() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
