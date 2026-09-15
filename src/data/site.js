/**
 * Site-level navigation: the feature cloud above the footer, and the footer's
 * own columns. Kept as data because both are long, flat lists whose only
 * structure is their grouping -- expressing that as JSX would bury it.
 */

export const FEATURE_TAGS = [
  "Cinema Studio", "Visual Effects", "Higgsfield Soul", "Kling 2.1 Master",
  "Camera Controls", "Viral", "Action movements", "Commercial",
  "MiniMax Hailuo 02", "Seedance Pro", "Community", "Wan 2.2 Image",
  "Seedream 4.0", "Nano Banana", "Flux Kontext", "GPT Image", "Topaz",
  "Google Veo3", "Kling 2.5 Turbo", "Kling Avatars 2.0", "Claude MCP",
  "Wan 2.5", "Sora 2", "Sora 2 Presets", "Banana Placement", "Edit Image",
  "Multi Reference", "Upscale", "YouTube", "TikTok", "Instagram Reels",
  "YouTube Shorts", "Nano Banana Pro", "Kling o1", "Mixed Media Community",
  "Soul Presets", "Visual Effects Collection",
];

/** Footer columns, in the order and grouping the live footer uses. */
export const FOOTER_COLUMNS = [
  {
    groups: [
      {
        label: "Create",
        links: ["AI Video", "AI Image", "Edit Image", "Inpaint", "Upscale",
                "Sora 2 Upscale", "Mixed Media", "AI Face Swap", "AI Influencer", "Apps"],
      },
    ],
  },
  {
    groups: [
      {
        label: "Video Models",
        links: ["Seedance 2.5", "Seedance 2.0", "Kling 3.0", "Sora 2 Introduction",
                "Veo 3.1 Introduction", "WAN 2.6", "Grok Imagine 1.5", "Gemini Omni Flash"],
      },
      {
        label: "Image Models",
        links: ["Nano Banana", "Flux 2", "Seedream 5", "GPT Image 2"],
      },
    ],
  },
  {
    groups: [
      {
        label: "Studios",
        links: ["Cinema Studio", "Marketing Studio", "Lipsync Studio", "Photodump Studio",
                "Fashion Factory", "UGC Factory", "Higgsfield Popcorn", "Higgsfield Canvas"],
      },
      {
        label: "Soul",
        links: ["Soul 2.0", "Soul ID Character", "Soul Cinema"],
      },
    ],
  },
  {
    groups: [
      {
        label: "Platform",
        links: ["Supercomputer", "MCP/CLI", "Collab", "Games", "Reference Extension"],
      },
      {
        label: "Resources",
        links: ["Blog", "Creator Hub", "Help Center", "Academy", "Prompt Guide"],
      },
    ],
  },
  {
    groups: [
      {
        label: "Company",
        links: ["About", "Trust", "Enterprise", "Team", "Pricing", "Careers", "Contact"],
      },
      {
        label: "Community",
        links: ["Community", "Contests", "Creator Partners"],
      },
    ],
  },
];

export const FOOTER_ADDRESS = "535 Mission St, 14th floor, San Francisco, CA, 94105";
export const FOOTER_SOCIAL = ["X / Twitter", "Youtube", "LinkedIn", "Tiktok"];
export const FOOTER_LEGAL = ["Help center", "Cookie Notice", "Cookie Settings", "Terms", "Privacy"];
