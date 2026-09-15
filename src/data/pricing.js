/**
 * Pricing page content.
 *
 * Prices are held as monthly-billed-annually numbers plus a `monthly` list
 * price, because every figure on the page -- the strike-through, the "save $N
 * compared to monthly" line, the compare table -- is derived from those two.
 * Storing the derived strings instead is how pricing pages end up claiming a
 * discount the arithmetic does not support.
 */

export const PLANS = [
  {
    id: "basic",
    name: "Basic",
    tagline: "For first-time AI creators",
    tone: "neutral",
    cta: "Get Basic",
    ctaVariant: "light",
    monthly: 9,
    annual: 9,
    credits: {
      base: 120,
      steps: [120],
      note: "Fixed amount of 120 credits/mo",
      lines: ["= 60 Nano Banana Pro Generations", "~ 7 Seedance 2.0 Fast videos"],
    },
    unlimited: {
      locked: true,
      rows: [
        { name: "Nano Banana Pro", has: false },
        { name: "Nano Banana 2", has: false },
        { name: "Kling 3.0", has: false },
        { name: "No other unlimited models", has: false },
      ],
    },
    seedance: {
      tone: "none",
      title: "No access to Seedance 2.5",
      blurb: "Available from Pro plan",
      rows: [
        { name: "Seedance 2.5", has: false, badge: "No access" },
        { name: "Seedance 2.0", has: false, badge: "No access" },
      ],
    },
    features: [
      { label: "Parallel generations: up to 2 Videos, 2 Images", has: true },
      { label: "Access to Supercomputer", has: true, link: true },
      { label: "Access to Seedance 2.0 Fast & 2.0 Mini", has: true },
      { label: "Access to selected models & features", has: true, link: true },
      { label: "Early access to advanced AI features", has: false },
      { label: "Access to unlimited marketplace", has: false },
      { label: "Lowest cost per credit", has: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For everyday AI creation",
    tone: "lime",
    badge: "21% off",
    cta: "Get Pro",
    ctaVariant: "accent",
    monthly: 29,
    annual: 23,
    credits: {
      base: 600,
      steps: [600, 900],
      lines: ["= 300 Nano Banana Pro Generations", "~ 27 Seedance 2.0 videos"],
    },
    unlimited: {
      rows: [
        { name: "Nano Banana Pro", has: false, badges: [{ label: "No unlimited", tone: "mute" }] },
        { name: "Nano Banana 2", has: true, badges: [{ label: "2K", tone: "mute" }, { label: "7-day unlimited", tone: "accent" }] },
        { name: "Kling 3.0", has: true, badges: [{ label: "7-day unlimited", tone: "accent" }] },
      ],
      more: "7 unlimited & free generation models",
    },
    seedance: {
      tone: "blue",
      title: "Access to Seedance models",
      blurb: "Full line-up included",
      rows: [
        { name: "Seedance 2.5", has: true, badges: [{ label: "1080p", tone: "mute" }, { label: "Full access", tone: "accent" }] },
        { name: "Seedance 2.0", has: true, badges: [{ label: "4K", tone: "mute" }, { label: "Full access", tone: "accent" }] },
      ],
    },
    features: [
      { label: "Unlimited paid parallel generations", has: true, badge: "New" },
      { label: "Access to Supercomputer", has: true, link: true },
      { label: "Access to all Seedance models", has: true },
      { label: "Access to all models & features", has: true },
      { label: "Early access to advanced AI features", has: true },
      { label: "Access to unlimited marketplace", has: true },
      { label: "Lowest cost per credit", has: false },
    ],
  },
  {
    id: "max",
    name: "Max",
    tagline: "For ambitious AI projects",
    tone: "magenta",
    badge: "25% off",
    flag: "Best value",
    cta: "Get Max",
    ctaVariant: "promo",
    monthly: 79,
    annual: 59,
    credits: {
      base: 1800,
      steps: [1800, 3600, 5400],
      lines: ["= 900 Nano Banana Pro Generations", "~ 80 Seedance 2.0 videos"],
    },
    unlimited: {
      rows: [
        { name: "Nano Banana Pro", has: true, badges: [{ label: "2K", tone: "mute" }, { label: "7-day unlimited", tone: "accent" }] },
        { name: "Nano Banana 2", has: true, badges: [{ label: "2K", tone: "mute" }, { label: "7-day unlimited", tone: "accent" }] },
        { name: "Kling 3.0", has: true, badges: [{ label: "7-day unlimited", tone: "accent" }] },
      ],
      more: "7 unlimited & free generation models",
    },
    seedance: {
      tone: "blue",
      title: "Access to Seedance models",
      blurb: "Full line-up included",
      rows: [
        { name: "Seedance 2.5", has: true, badges: [{ label: "1080p", tone: "mute" }, { label: "Full access", tone: "accent" }] },
        { name: "Seedance 2.0", has: true, badges: [{ label: "4K", tone: "mute" }, { label: "Full access", tone: "accent" }] },
      ],
    },
    features: [
      { label: "Unlimited paid parallel generations", has: true, badge: "New" },
      { label: "Access to Supercomputer", has: true, link: true },
      { label: "Access to all Seedance models", has: true },
      { label: "Access to all models & features", has: true },
      { label: "Early access to advanced AI features", has: true },
      { label: "Access to unlimited marketplace", has: true },
      { label: "Lowest cost per credit", has: true, badge: "60% cheaper", badgeTone: "accent" },
    ],
  },
];

/**
 * The business tab.
 *
 * Structurally a different card, not a restyled one: priced per seat rather
 * than per month, sized with a seat stepper rather than a credit slider, and
 * carrying an Admin & Control group that the individual plans have no use for.
 */
export const BUSINESS_PLANS = [
  {
    id: "team",
    kind: "business",
    name: "Team",
    tagline: "For agencies and small teams to create faster",
    tone: "neutral",
    badge: "18% off",
    cta: "Get Team Annual",
    ctaVariant: "light",
    monthly: 79,
    annual: 65,
    seats: { min: 2, max: 9, start: 5 },
    credits: {
      headline: "5,000 credits in total/mo",
      lines: [
        "= 1,000 credits per seat/mo",
        "= 2,500 Nano Banana Pro images",
        "~ 833 Kling 3.0 videos",
      ],
    },
    features: [
      { label: "2 to 9 members in one shared workspace", has: true },
      { label: "Access to all features & models", has: true },
      { label: "Shared workspace & credit pool for your team", has: true },
      { label: "Early access to advanced AI features", has: true },
      { label: "Access to Seedance 2.5", has: true, link: true },
      { label: "Access to Supercomputer", has: true, link: true },
    ],
    unlimited: {
      title: "Unlimited models",
      icon: "Lock",
      locked: true,
      learnMore: true,
      rows: [
        { name: "Nano Banana Pro", has: false, badges: [{ label: "No unlimited", tone: "mute" }] },
        { name: "Seedream 5.0 Pro", has: false, badges: [{ label: "No unlimited", tone: "mute" }] },
        { name: "Kling 3.0", has: false, badges: [{ label: "No unlimited", tone: "mute" }] },
      ],
    },
    admin: [
      { label: "Basic analytics & priority support", has: true },
      { label: "Admin spend control", has: false },
      { label: "Priority queue", has: false },
      { label: "SSO", has: false },
      { label: "Delegated top-up access", has: false },
    ],
  },
  {
    id: "scale",
    kind: "business",
    name: "Scale",
    tagline: "Designed for growing creative teams",
    tone: "azure",
    badge: "30% off",
    flag: "Best value",
    cta: "Get Scale Annual",
    ctaVariant: "azure",
    monthly: 245,
    annual: 150,
    seats: { min: 5, max: 15, start: 5 },
    credits: {
      headline: "12,500 credits/mo",
      lines: [
        "= 2,500 credits per seat/mo",
        "= 6,250 Nano Banana Pro images",
        "~ 2,083 Kling 3.0 videos",
      ],
    },
    features: [
      { label: "5 to 15 members in one shared workspace", has: true },
      { label: "Access to all features & models", has: true },
      { label: "Shared workspace & credit pool for your team", has: true },
      { label: "Early access to advanced AI features", has: true },
      { label: "Access to Seedance 2.5", has: true, link: true },
      { label: "Access to Supercomputer", has: true, link: true },
    ],
    unlimited: {
      title: "Unlimited models",
      icon: "Infinity",
      learnMore: true,
      rows: [
        { name: "Nano Banana Pro", has: true, badges: [{ label: "2K", tone: "mute" }, { label: "7-day unlimited", tone: "accent" }] },
        { name: "Seedream 5.0 Pro", has: true, badges: [{ label: "2K", tone: "mute" }, { label: "7-day unlimited", tone: "accent" }] },
        { name: "Kling 3.0", has: true, badges: [{ label: "7-day unlimited", tone: "accent" }] },
      ],
    },
    admin: [
      { label: "Detailed analytics & priority support", has: true },
      { label: "Admin spend control", has: true },
      { label: "Priority queue for faster task processing", has: true },
      { label: "Basic SSO", has: true },
      { label: "Delegated top-up access", has: false },
    ],
  },
  {
    id: "enterprise",
    kind: "business",
    name: "Enterprise",
    tagline: "For organizations needing personalisation & security",
    tone: "outline",
    custom: true,
    cta: "Contact sales",
    ctaVariant: "light",
    secondaryCta: "Learn more",
    note: "Best offers for Higgsfield's partners",
    credits: {
      headline: "Custom credits per seat/mo",
      lines: ["= Unlimited seats", "= Custom model access", "= Volume rollover credits"],
    },
    features: [
      { label: "Unlimited members & Dedicated capacity (SLA)", has: true },
      { label: "Access to all features & models", has: true },
      { label: "Shared workspace & credit pool for your team", has: true },
      { label: "Early access to advanced AI features", has: true },
      { label: "Access to Seedance 2.5", has: true, link: true },
      { label: "Access to Supercomputer", has: true, link: true },
    ],
    unlimited: {
      title: "Unlimited resources",
      icon: "Infinity",
      learnMore: true,
      rows: [
        { name: "Volume discounts per model", has: true, badges: [{ label: "Included", tone: "mute" }] },
        { name: "Custom credits per seat", has: true, badges: [{ label: "Included", tone: "mute" }] },
        { name: "Unlimited number of seats", has: true, badges: [{ label: "Included", tone: "mute" }] },
        { name: "Custom capacity & SLA", has: true, badges: [{ label: "Included", tone: "mute" }] },
      ],
    },
    admin: [
      { label: "Detailed analytics & priority support", has: true },
      { label: "Admin spend control", has: true },
      { label: "Priority queue for faster task processing", has: true },
      { label: "Custom SSO", has: true },
      { label: "Delegated top-up access", has: true },
    ],
  },
];

/** The header block swaps wholesale between tabs -- different promo, different
 *  headline, different pitch. */
export const AUDIENCE_HEADERS = {
  individual: {
    title: "Plans for every workflow",
    lede: "From individuals to enterprise teams, find the right fit",
    promo: {
      tone: "magenta",
      badges: [{ label: "Special 30% off", tone: "promo", icon: "Diamond" }],
      lead: "Nano Banana Pro & Nano Banana 2 Unlimited.",
      rest: "Get unlimited access to top models from $5",
      blurb:
        "Get Nano Banana 2 & Pro Unlimited on Ultra plan for 7 days with Special 30% discount",
    },
  },
  business: {
    title: "Upgrade your plan",
    lede: "Lock better prices with upgrade or scale your creativity maximizing your current plan",
    promo: {
      tone: "azure",
      badges: [
        { label: "30% off", tone: "promo" },
        { label: "Best value", tone: "flag", icon: "Diamond" },
      ],
      lead: "Nano Banana Pro, Seedream 5.0 Pro, Kling 3.0 Unlimited",
      rest: "Upgrade to Scale plan with 30% discount",
      blurb:
        "Get Unlimited Nano Banana Pro, Seedream 5.0 Pro, Kling 3.0 on Scale plan for 7 days with 30% discount",
      cta: "Upgrade to Scale",
    },
  },
};

/* Plan finder ------------------------------------------------------------ */

export const FINDER_GOALS = [
  { id: "social", label: "Social media videos", icon: "Film" },
  { id: "avatar", label: "Talking-avatar videos", icon: "Portrait" },
  { id: "ugc", label: "UGC & product video ads", icon: "Megaphone" },
  { id: "marketing", label: "Marketing product photos", icon: "Camera" },
  { id: "cinematic", label: "Cinematic videos", icon: "Aperture" },
  { id: "personal", label: "Personal use", icon: "Sparkle" },
];

export const FINDER_FEATURES = [
  { id: "img", label: "AI image generation" },
  { id: "vid", label: "AI video generation" },
  { id: "mcp", label: "MCP & Supercomputer", tier: "Basic" },
];

/** Credit cost per unit, which is what turns the two sliders into a number of
 *  credits and therefore into a recommended plan. */
export const FINDER_RATES = {
  video: { label: "Kling 3.0 videos", per: 14, max: 200, step: 5, note: "per Kling 3.0 generation, 8s, 720p" },
  image: { label: "Nano Banana Pro images", per: 2, max: 500, step: 10, note: "per Nano Banana Pro generation" },
};

/* Compare table ---------------------------------------------------------- */

export const COMPARE_GROUPS = [
  {
    label: "Video",
    rows: [
      { label: "Concurrent Jobs", values: ["2 concurrent jobs", "3 concurrent jobs", "8 concurrent jobs"] },
      { label: "Seedance 2.0 720p", sub: "~22 credits/5s", values: [false, "320 videos", "960 videos"] },
      { label: "Seedance 2.0 1080p", sub: "~45 credits/5s", values: [false, "160 videos", "480 videos"] },
      { label: "Seedance 2.0 4K", sub: "~110 credits/5s", values: [false, "65 videos", "196 videos"] },
      { label: "Kling 3.0", sub: "~14 credits/8s", values: ["8 videos", "64 videos", "192 videos"] },
      { label: "Sora 2", sub: "~30 credits/10s", values: [false, "30 videos", "90 videos"] },
      { label: "Higgsfield Soul Cinema", sub: "~18 credits/shot", values: [false, "50 shots", "150 shots"] },
    ],
  },
  {
    label: "Image",
    rows: [
      { label: "Nano Banana Pro", sub: "~2 credits/image", values: ["60 images", "300 images", "900 images"] },
      { label: "Nano Banana 2", sub: "~1 credit/image", values: ["120 images", "600 images", "1,800 images"] },
      { label: "Seedream 5", sub: "~2 credits/image", values: [false, "300 images", "900 images"] },
      { label: "Upscale to 4K", values: [false, true, true] },
      { label: "Multi-reference editing", values: [false, true, true] },
    ],
  },
  {
    label: "Platform",
    rows: [
      { label: "Supercomputer", values: [true, true, true] },
      { label: "MCP & CLI", values: [false, true, true] },
      { label: "Commercial licence", values: [false, true, true] },
      { label: "Early access to new models", values: [false, true, true] },
      { label: "Priority support", values: [false, false, true] },
    ],
  },
];

/* FAQ -------------------------------------------------------------------- */

export const FAQS = [
  {
    q: "How do credits work?",
    a: "Every generation spends credits, and the rate depends on the model, resolution and length. Credits land at the start of each billing period and do not roll over, so the plan you pick should match a normal month rather than your busiest one.",
  },
  {
    q: "Is my subscription automatically renewed?",
    a: "Yes. Plans renew on the same date each period until you cancel, and you can cancel at any point from billing settings. Cancelling stops the next charge and leaves the current period running to its end.",
  },
  {
    q: "How many images or videos can I generate?",
    a: "It depends entirely on what you generate. As a rule of thumb, one credit is roughly one Nano Banana 2 image, two credits one Nano Banana Pro image, and around fourteen credits an eight-second Kling 3.0 clip at 720p.",
  },
  {
    q: "How can I purchase extra credits?",
    a: "Top-up packs are available from the billing page on every paid plan. Purchased credits sit alongside your monthly allowance, are spent only once the monthly credits run out, and do not expire while the subscription is active.",
  },
  {
    q: "How does Unlimited work?",
    a: "Unlimited models can be generated without spending credits, at standard queue priority and with fair-use limits that exist to stop automated abuse. Which models are unlimited changes as new ones launch, and the current list is shown on each plan card.",
  },
  {
    q: "How does 365 Unlimited promo work?",
    a: "The promo grants a year of unlimited access to the models listed in the offer, billed once up front. It stacks on top of the credits in your plan rather than replacing them, so paid models keep working as normal.",
  },
  {
    q: "Can I change my subscription after purchase?",
    a: "Upgrades apply immediately and are prorated against what you have already paid. Downgrades take effect at the start of the next billing period, so you keep the credits you have already been given.",
  },
  {
    q: "How much does it cost to use Higgsfield Supercomputer?",
    a: "Supercomputer runs are billed in the same credits as everything else, priced by the compute a task actually consumes. Short agent runs typically cost a few credits; long multi-step productions cost more, and the estimate is shown before a run starts.",
  },
];
