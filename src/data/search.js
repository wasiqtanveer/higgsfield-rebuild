/**
 * Contents of the search overlay.
 *
 * The real palette is not a plain result list: it is a launcher, and most
 * sessions never type anything into it. So the resting state -- recents, three
 * promoted products, a trending grid -- is the feature, and typing filters
 * across all of it at once. Every row carries a `scope` so the filter chips can
 * narrow without a second data shape.
 */

export const SEARCH_SCOPES = [
  { id: "all", label: "All" },
  { id: "models", label: "Models", icon: "Sparkle" },
  { id: "products", label: "Products", icon: "Burst" },
  { id: "characters", label: "Characters", icon: "Portrait" },
  { id: "community", label: "Community", icon: "Users" },
  { id: "apps", label: "Apps", icon: "ArrowUpRight", external: true },
  { id: "originals", label: "Originals", icon: "ArrowUpRight", external: true },
];

export const SEARCH_RECENTS = [
  {
    name: "Nano Banana Pro",
    blurb: "Google's flagship generation model",
    icon: "Burst",
    scope: "models",
  },
  {
    name: "Canvas",
    blurb: "Full workflow on one canvas",
    icon: "Nodes",
    scope: "products",
  },
];

/* The three promoted cards. `hue` drives the card wash -- the real grid leans
   on colour to tell three identically-shaped cards apart at a glance. */
export const SEARCH_POPULAR = [
  {
    name: "Supercomputer",
    blurb: "AI that acts, not just answers",
    kicker: "Agents",
    kickerIcon: "Robot",
    badge: "New",
    hue: "lime",
    scope: "products",
  },
  {
    name: "MCP & CLI",
    blurb: "Turn your terminal into a creative engine",
    kicker: "Developers",
    kickerIcon: "Terminal",
    badge: "New",
    hue: "mono",
    scope: "products",
  },
  {
    name: "Cinema Studio 4.0",
    blurb: "Complete AI production studio",
    kicker: "Locations",
    kickerIcon: "Pin",
    badge: "New",
    hue: "azure",
    scope: "products",
  },
];

export const SEARCH_TRENDING = [
  {
    name: "MCP & CLI",
    blurb: "Automate your production",
    icon: "Terminal",
    badge: "New",
    tone: "accent",
    scope: "products",
  },
  {
    name: "Seedance 2.0 4K",
    blurb: "Next-gen multi-modal video generation",
    icon: "Bars",
    scope: "models",
  },
  {
    name: "AI Influencer",
    blurb: "Create and manage your AI influencer",
    icon: "Head",
    badge: "Trending",
    tone: "promo",
    scope: "characters",
  },
  {
    name: "Cinema Studio",
    blurb: "Versatile image styles by xAI",
    icon: "Film",
    scope: "products",
  },
  {
    name: "Marketing Studio",
    blurb: "Ads that sell, made in minutes",
    icon: "Megaphone",
    scope: "products",
  },
  {
    name: "Canvas",
    blurb: "Full workflow on one canvas",
    icon: "Nodes",
    scope: "products",
  },
  {
    name: "Higgsfield Soul",
    blurb: "Photoreal character consistency",
    icon: "Portrait",
    scope: "characters",
  },
  {
    name: "Kling 3.0",
    blurb: "Cinematic motion at 1080p",
    icon: "Film",
    scope: "models",
  },
  {
    name: "Mixed Media",
    blurb: "Community remixes of the week",
    icon: "Layers",
    scope: "community",
  },
  {
    name: "Nano Banana Pro",
    blurb: "Google's flagship generation model",
    icon: "Burst",
    scope: "models",
  },
];
