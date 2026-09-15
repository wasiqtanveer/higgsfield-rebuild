/**
 * Mega-menu contents for the Image, Video and Audio nav triggers.
 *
 * Each panel is two groups -- Features (things you do) and Models (things that
 * do it). That split is the menu's whole information architecture, so it is
 * encoded as structure here rather than implied by ordering.
 *
 * `icon` names resolve against the authored icon set at render time.
 */

export const MENUS = {
  Image: [
    {
      label: "Features",
      items: [
        { name: "Create Image", blurb: "Generate AI images", icon: "Image" },
        { name: "Cinematic Cameras", blurb: "Image generation with camera controls", icon: "Camera", badge: "Top", tone: "promo" },
        { name: "Canvas", blurb: "Visual ideation meets repeatable AI workflows.", icon: "Nodes" },
        { name: "Soul Moodboard", blurb: "Turn your references into a focused moodboard", icon: "Mark" },
        { name: "Soul ID Character", blurb: "Create unique character", icon: "Mark" },
        { name: "AI Influencer", blurb: "Create and manage your AI influencer", icon: "Head" },
        { name: "Photodump", blurb: "Generate Your Aesthetic", icon: "Portrait" },
        { name: "Relight", blurb: "Adjust lighting position, color, and brightness", icon: "Light" },
        { name: "Inpaint", blurb: "Select an area, describe the change", icon: "Brush" },
        { name: "Image Upscale", blurb: "Enhance image quality", icon: "Upscale" },
        { name: "Face Swap", blurb: "Create Realistic Face Swaps", icon: "Swap" },
        { name: "Character Swap", blurb: "Create Realistic Character Swaps", icon: "Swap" },
      ],
    },
    {
      label: "Models",
      items: [
        { name: "Higgsfield Soul 2.0", blurb: "Next generation ultra-realistic fashion visuals", icon: "Mark", badge: "Top", tone: "promo" },
        { name: "Higgsfield Soul Cinema", blurb: "Cinematic Film-Grade Aesthetic", icon: "Mark" },
        { name: "GPT Image 2.5 Sunburst", blurb: "Exceptional quality, precise edits", icon: "Burst", badge: "New", tone: "accent" },
        { name: "GPT Image 2.5 Flare", blurb: "Stunning everyday images, fast", icon: "Burst", badge: "New", tone: "accent" },
        { name: "GPT Image 2", blurb: "4K images with near-perfect text rendering", icon: "Burst", badge: "Top", tone: "promo" },
        { name: "Seedream 5.0 Pro", blurb: "Logically consistent images with intelligent visual reasoning", icon: "Bars" },
        { name: "Nano Banana 2 Lite", blurb: "Lightweight image generation at speed", icon: "Wave" },
        { name: "Nano Banana Pro", blurb: "Best 4K image model ever", icon: "Wave", badge: "Top", tone: "promo" },
        { name: "Recraft V4 Styles", blurb: "Style it once, every image matches", icon: "Layers", badge: "New", tone: "accent" },
        { name: "Recraft V4.1", blurb: "Photorealistic and expressive image generation", icon: "Layers" },
        { name: "Grok Imagine 2.0", blurb: "High-resolution image generation by xAI", icon: "Bolt", badge: "New", tone: "accent" },
        { name: "FLUX.2", blurb: "Speed-optimized detail", icon: "Bolt" },
        { name: "Z-Image", blurb: "Instant lifelike portraits", icon: "Aperture" },
        { name: "Topaz", blurb: "Detail-preserving enhancement", icon: "Diamond" },
      ],
    },
  ],

  Video: [
    {
      label: "Features",
      items: [
        { name: "Create Video", blurb: "Generate AI videos", icon: "Film" },
        { name: "Cinema Studio", blurb: "Cinematic video with AI director", icon: "Camera" },
        { name: "Faceless Studio", blurb: "Start a faceless channel in one click", icon: "Head" },
        { name: "3D Jutsu", blurb: "Create 3D scenes and turn them into videos", icon: "Cube", badge: "New", tone: "accent" },
        { name: "Shorts Studio", blurb: "Turn your footage into ready-made shorts", icon: "Frame" },
        { name: "Higgsfield Explainer", blurb: "Turn any topic into an explainer video", icon: "Doc" },
        { name: "Canvas", blurb: "Visual ideation meets repeatable AI workflows.", icon: "Nodes" },
        { name: "Mixed Media", blurb: "Create mixed media projects", icon: "Layers" },
        { name: "Edit Video", blurb: "Edit scenes, shots, elements", icon: "Scissors" },
        { name: "Higgsfield Reframe", blurb: "Reframe and resize videos to any aspect ratio", icon: "Frame" },
        { name: "Click to Ad", blurb: "Turn product URLs into video ads", icon: "Tag" },
        { name: "Change Color Palette", blurb: "Adjust color palette, tones, and overall mood", icon: "Palette" },
        { name: "Relight", blurb: "Adjust lighting position, color, and brightness", icon: "Light" },
        { name: "Lipsync Studio", blurb: "Create Talking Clips", icon: "Mic" },
        { name: "Draw to Video", blurb: "Sketch turns into a cinema", icon: "Brush" },
        { name: "Draw to Edit", blurb: "Sketch directly on video frames to guide edits", icon: "Brush" },
        { name: "UGC Factory", blurb: "Build UGC video with avatar", icon: "Portrait" },
        { name: "Video Upscale", blurb: "Enhance video quality", icon: "Upscale" },
      ],
    },
    {
      label: "Models",
      items: [
        { name: "Seedance 2.5", blurb: "Create cinematic videos up to 30 seconds", icon: "Bars", badge: "Top", tone: "promo" },
        { name: "Higgsfield Genjutsu", blurb: "Transfer motion or swap objects from a reference video", icon: "Mark", badge: "New", tone: "accent" },
        { name: "Gemini Omni Flash 1.1", blurb: "Generate and edit video from any input", icon: "Burst" },
        { name: "Kling 3.0", blurb: "Cinematic videos with audio", icon: "Film" },
        { name: "Kling Motion Control", blurb: "Transfer motion from video to image", icon: "Swap" },
        { name: "FLUX.3 Video", blurb: "Text, image, and video generation with synchronized audio", icon: "Bolt" },
        { name: "MiniMax H3", blurb: "Create 2K videos from text, keyframes, or multimodal references", icon: "Cube" },
        { name: "Wan 3.0", blurb: "Create videos from text, keyframes, or multimodal references", icon: "Cube" },
        { name: "Grok Imagine 1.5", blurb: "Cinematic videos with synchronized audio", icon: "Bolt" },
        { name: "Kling 3.0 Omni Edit", blurb: "Edit videos with text prompts", icon: "Scissors" },
        { name: "Sora 2", blurb: "OpenAI's most advanced video model", icon: "Burst" },
        { name: "Google Veo 3.1", blurb: "Advanced AI video with sound", icon: "Aperture" },
        { name: "HappyHorse", blurb: "Alibaba's #1 ranked video and audio model", icon: "Diamond" },
        { name: "Minimax Hailuo 2.3", blurb: "Fastest high-dynamic video", icon: "Bolt" },
        { name: "Higgsfield DOP", blurb: "VFX and camera control", icon: "Camera" },
      ],
    },
  ],

  Audio: [
    {
      label: "Features",
      items: [
        { name: "Text to Speech", blurb: "Generate speech from text", icon: "Mic" },
        { name: "Voice Change", blurb: "Swap voices in any video", icon: "Waveform" },
        { name: "Translate", blurb: "Translate and lip-sync your video into a new language", icon: "Globe" },
      ],
    },
    {
      label: "Models",
      items: [
        { name: "Seed Audio 1.0", blurb: "Multi-speaker scenes with speech and ambience", icon: "Waveform" },
        { name: "Eleven v3", blurb: "Emotion and delivery control via inline tags", icon: "Waveform" },
        { name: "Qwen Audio 3.0", blurb: "Natural speech with voice, style, and emotion control", icon: "Speaker" },
        { name: "MiniMax Speech 2.8 HD", blurb: "High-fidelity single-voice narration", icon: "Speaker" },
        { name: "Seed Speech", blurb: "Multilingual speech across 30+ languages", icon: "Globe" },
      ],
    },
  ],
};
