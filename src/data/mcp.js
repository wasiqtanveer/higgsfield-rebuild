/**
 * The MCP surface.
 *
 * Higgsfield's MCP page is a connection page first and a marketing page second:
 * the top third is a setup card that changes with the client you picked, and
 * everything below it is evidence that the connection is worth making. The data
 * is shaped that way -- each client owns both of its install paths (the hosted
 * plugin and the CLI), because the page never shows a generic set of steps.
 */

/** The client rail. `transports` lists which install paths the client offers. */
export const CLIENTS = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: "Knot",
    transports: ["mcp", "cli"],
    steps: [
      {
        title: "Add Higgsfield plugin to ChatGPT",
        body: "Find Higgsfield in the Plugins Directory or click the button below. Then click Add and sign in",
        action: { label: "Add Higgsfield plugin", icon: "ArrowUpRight" },
      },
      {
        title: "Connect and start creating",
        body: "After signing in, ask ChatGPT to generate an image or video",
        action: { label: "Start creating", icon: "Knot", tone: "light" },
      },
    ],
    cli: {
      note: "Works with the ChatGPT desktop app once developer mode is on.",
      command: "npx -y @higgsfield/mcp@latest install chatgpt",
    },
  },
  {
    id: "claude",
    name: "Claude",
    icon: "Sparkle",
    transports: ["mcp", "cli"],
    steps: [
      {
        title: "Add the Higgsfield connector",
        body: "Open Settings, Connectors, Add custom connector, and paste the Higgsfield MCP URL",
        action: { label: "Copy connector URL", icon: "Layers" },
      },
      {
        title: "Connect and start creating",
        body: "Authorise once, then ask Claude for a shot and it renders on Higgsfield",
        action: { label: "Start creating", icon: "Sparkle", tone: "light" },
      },
    ],
    cli: {
      note: "The connector and the CLI share one account, so installing both is safe.",
      command: "npx -y @higgsfield/mcp@latest install claude",
    },
  },
  {
    id: "grok",
    name: "Grok Bot",
    icon: "Bolt",
    transports: ["mcp"],
    steps: [
      {
        title: "Invite the Higgsfield bot",
        body: "Add the bot to your workspace, then mention it in any thread to link your account",
        action: { label: "Add Grok bot", icon: "ArrowUpRight" },
      },
      {
        title: "Connect and start creating",
        body: "Reply to the bot with a prompt and the result lands back in the thread",
        action: { label: "Start creating", icon: "Bolt", tone: "light" },
      },
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    icon: "Cube",
    transports: ["mcp", "cli"],
    steps: [
      {
        title: "Add Higgsfield to mcp.json",
        body: "One click writes the server into your Cursor MCP config and opens the sign-in",
        action: { label: "Add to Cursor", icon: "Cube" },
      },
      {
        title: "Connect and start creating",
        body: "Reload the MCP panel, then ask for assets straight from the composer",
        action: { label: "Start creating", icon: "Cube", tone: "light" },
      },
    ],
    cli: {
      note: "Writes to ~/.cursor/mcp.json. Restart Cursor once when it finishes.",
      command: "npx -y @higgsfield/mcp@latest install cursor",
    },
  },
  {
    id: "claude-code",
    name: "Claude Code",
    icon: "Terminal",
    transports: ["cli", "mcp"],
    steps: [
      {
        title: "Register the MCP server",
        body: "Run the CLI in your project, or add the server by hand with claude mcp add",
        action: { label: "Copy install command", icon: "Terminal" },
      },
      {
        title: "Connect and start creating",
        body: "Run /mcp to authorise, then ask for renders without leaving the terminal",
        action: { label: "Read the docs", icon: "Doc", tone: "light" },
      },
    ],
    cli: {
      note: "Scoped to the current project. Pass --scope user to install it everywhere.",
      command: "claude mcp add higgsfield -- npx -y @higgsfield/mcp@latest",
    },
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    icon: "Robot",
    transports: ["cli", "mcp"],
    steps: [
      {
        title: "Add the server to your agent",
        body: "Drop the Higgsfield entry into your OpenClaw servers file and restart the runner",
        action: { label: "Copy server entry", icon: "Layers" },
      },
      {
        title: "Connect and start creating",
        body: "Your agent picks up the render tools on its next tool sweep",
        action: { label: "Start creating", icon: "Robot", tone: "light" },
      },
    ],
    cli: {
      note: "Headless runners should use a service key rather than the browser sign-in.",
      command: "openclaw mcp add higgsfield --url https://mcp.higgsfield.ai/sse",
    },
  },
  {
    id: "hermes",
    name: "Hermes",
    icon: "Head",
    transports: ["mcp"],
    steps: [
      {
        title: "Enable the Higgsfield tool pack",
        body: "Open the Hermes tool library, search Higgsfield, and switch the pack on",
        action: { label: "Open tool library", icon: "ArrowUpRight" },
      },
      {
        title: "Connect and start creating",
        body: "Sign in once and every Hermes persona can render on your credits",
        action: { label: "Start creating", icon: "Head", tone: "light" },
      },
    ],
  },
];

/** The two install paths the toggle switches between. */
export const TRANSPORTS = [
  { id: "mcp", label: "MCP", icon: "Layers" },
  { id: "cli", label: "CLI", icon: "Terminal" },
];

export const CLI_NOTE = "If you are using Claude Code or Codex, it's better to use the CLI";

/** The icon fan above the hero -- client glyphs, brand card in the centre. */
export const FAN = [
  { icon: "Portrait", tint: "linear-gradient(140deg,#2f4f8f,#88b4e8)" },
  { icon: "Nodes", tint: "linear-gradient(140deg,#123047,#2e6f8f)" },
  { icon: "Knot", tint: "linear-gradient(140deg,#f4f4f5,#c9c9cf)", ink: "#101014" },
  { icon: "Mark", tint: "var(--c-accent)", ink: "#000000", lead: true },
  { icon: "Film", tint: "linear-gradient(140deg,#151518,#2c2c32)" },
  { icon: "Robot", tint: "linear-gradient(140deg,#c0392b,#e8705f)" },
  { icon: "Burst", tint: "linear-gradient(140deg,#e07a3f,#f2b183)" },
];

/**
 * "How does MCP work" -- one worked example per intent. The transcript is the
 * point: it shows the model reasoning out loud and then handing a fully
 * specified job to Higgsfield, which is the thing a screenshot of a chat
 * window never conveys.
 */
export const WORKFLOWS = [
  {
    id: "video",
    label: "Video generation",
    icon: "Film",
    turns: [
      "I'll keep the interior-design tip concise, emphasize the warmer color temperature, and use energetic graphics to hold attention.",
      "The key line is set. Now I'll tighten the delivery and add animated captions, reframing, and visual accents.",
    ],
    job: {
      prompt:
        "Create an 8-second 9:16 talking-head short about replacing light bulbs with a warmer color temperature to make a room look more expensive. Use a clean blue backdrop, bold animated captions and a single product beat at the end.",
      chips: [
        { icon: "Bars", label: "Seedance 2" },
        { icon: "Frame", label: "9:16" },
        { icon: "Aperture", label: "8s" },
        { icon: "Speaker", label: "Audio" },
      ],
    },
    results: ["c02", "c07"],
  },
  {
    id: "faceless",
    label: "Faceless videos",
    icon: "Portrait",
    turns: [
      "No presenter on screen, so the story has to carry in b-roll and typography. I'll storyboard six beats and hold each for a beat and a half.",
      "Script locked. I'll generate the shots, then lay the voiceover under them and cut to the emphasis words.",
    ],
    job: {
      prompt:
        "Make a 45-second faceless explainer about deep-sea pressure. Cold blue palette, slow drifting camera, narrated voiceover, captions burned in at the lower third.",
      chips: [
        { icon: "Bars", label: "Kling 3.0" },
        { icon: "Frame", label: "9:16" },
        { icon: "Aperture", label: "45s" },
        { icon: "Mic", label: "Voiceover" },
      ],
    },
    results: ["c04", "c11"],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: "Coin",
    turns: [
      "You need variants, not one hero cut. I'll hold the product framing constant and vary the hook, so the test measures the copy rather than the edit.",
      "Six hooks written. Rendering each as its own cut with the same grade and end card.",
    ],
    job: {
      prompt:
        "Six ad variants for a matte ceramic bottle. Same 4:5 framing and warm grade in all of them, one hook per variant, hard cut to the logo end card at 6 seconds.",
      chips: [
        { icon: "Bars", label: "Veo 3.1" },
        { icon: "Frame", label: "4:5" },
        { icon: "Layers", label: "6 variants" },
        { icon: "Tag", label: "End card" },
      ],
    },
    results: ["c08", "c03"],
  },
  {
    id: "image",
    label: "Image generation",
    icon: "Image",
    turns: [
      "A packshot set wants one light rig, not four. I'll fix a soft key at 45 degrees and change only the angle between shots.",
      "Rig decided. Generating the set at 2K, then upscaling the two you keep.",
    ],
    job: {
      prompt:
        "A four-shot packshot set on seamless bone-white paper. Soft key from camera left, gentle falloff, no visible rim. Front, three-quarter, top-down and detail crop.",
      chips: [
        { icon: "Bars", label: "Nano Banana Pro" },
        { icon: "Frame", label: "1:1" },
        { icon: "Upscale", label: "2K" },
        { icon: "Layers", label: "4 shots" },
      ],
    },
    results: ["c10", "c05"],
  },
];

/** Skill library, grouped the way the product groups it. */
export const SKILL_CATEGORIES = [
  {
    id: "featured",
    label: "Featured",
    sub: "Popular skills to get started",
    icon: "Burst",
    lead: true,
  },
  { id: "marketing", label: "Marketing", sub: "Launch ads and campaigns", icon: "Coin" },
  { id: "ugc", label: "UGC factory", sub: "Create creator-led product videos", icon: "User" },
  {
    id: "faceless",
    label: "Faceless content factory",
    sub: "Create viral faceless videos",
    icon: "Film",
  },
  { id: "utility", label: "Utility", sub: "Edit, repurpose, and optimize", icon: "Scissors" },
  { id: "motion", label: "Motion & Design", sub: "Design and animate visuals", icon: "Palette" },
];

export const SKILLS = [
  {
    id: "viral-effects",
    name: "Viral Effects",
    icon: "Sparkle",
    clipId: "c06",
    overline: "Add your product",
    featured: true,
    cats: ["motion"],
  },
  { id: "ad-multiplier", name: "Ad Multiplier", icon: "Megaphone", clipId: "c10", featured: true, cats: ["marketing"] },
  { id: "product-studio", name: "Product Studio", icon: "Camera", clipId: "c03", featured: true, cats: ["marketing", "ugc"] },
  { id: "myth-machine", name: "Myth Machine", icon: "Brush", clipId: "c08", featured: true, cats: ["faceless", "motion"] },
  { id: "ugc-caster", name: "UGC Caster", icon: "Users", clipId: "c01", cats: ["ugc", "marketing"] },
  { id: "unboxing-loop", name: "Unboxing Loop", icon: "Cube", clipId: "c09", cats: ["ugc"] },
  { id: "doc-narrator", name: "Doc Narrator", icon: "Mic", clipId: "c11", cats: ["faceless"] },
  { id: "listicle-engine", name: "Listicle Engine", icon: "Doc", clipId: "c04", cats: ["faceless"] },
  { id: "reframe", name: "Reframe & Repost", icon: "Frame", clipId: "c02", cats: ["utility"] },
  { id: "upscaler", name: "Upscale to 4K", icon: "Upscale", clipId: "c05", cats: ["utility"] },
  { id: "face-swap", name: "Cast Swap", icon: "Swap", clipId: "c12", cats: ["utility", "ugc"] },
  { id: "title-kit", name: "Kinetic Titles", icon: "Bolt", clipId: "c07", cats: ["motion"] },
];

/**
 * The model wall. Image and video models are mixed rather than split: inside a
 * chat client, picking between them is the assistant's problem, not yours.
 */
export const MCP_MODELS = [
  { name: "Nano Banana Pro", vendor: "Google", icon: "Burst", clipId: "c03" },
  { name: "Google Omni Flash", vendor: "Google", icon: "Burst", clipId: "c08" },
  { name: "Seedance 2.5", vendor: "ByteDance", icon: "Bars", clipId: "c06" },
  { name: "Seedream 5.0 Lite", vendor: "ByteDance", icon: "Bars", clipId: "c04" },
  { name: "Sora 2", vendor: "OpenAI", icon: "Knot", clipId: "c12" },
  { name: "Veo 3.1", vendor: "Google", icon: "Burst", clipId: "c05" },
  { name: "Kling 3.0", vendor: "Kuaishou", icon: "Aperture", clipId: "c09" },
  { name: "GPT Image 2", vendor: "OpenAI", icon: "Knot", clipId: "c10" },
];

export const MCP_FAQS = [
  {
    q: "What is MCP, in one paragraph?",
    a: "Model Context Protocol is a standard way for an assistant to call tools that live somewhere else. Higgsfield publishes an MCP server, so once your client is connected it can see our render tools and use them the same way it uses its own -- you describe a shot in the chat you are already in, and the render happens on Higgsfield.",
  },
  {
    q: "Does it spend my Higgsfield credits?",
    a: "Yes. Generations started from a connected client are billed to the account you signed in with, at the same rate as the same job started on the site, and they show up in your library and your usage history alongside everything else.",
  },
  {
    q: "Which clients are supported?",
    a: "Anything that speaks MCP. The rail above covers the clients we test each release, but the server is a plain MCP endpoint, so a client we have never heard of will work if it implements the protocol.",
  },
  {
    q: "Can I use it in a headless agent?",
    a: "Yes, and you should use a service key rather than the browser sign-in when you do. Service keys carry their own rate limit and can be revoked on their own, so a runaway agent never costs you the account.",
  },
  {
    q: "Where do the results go?",
    a: "Into your Higgsfield library, immediately, whether the job started here or in a chat window. The client gets a link back so it can show you the result inline, and the asset itself stays on your account.",
  },
];
