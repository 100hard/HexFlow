/**
 * HexFlow High-Fidelity Creative Mock Generators
 * Reference: 00_CONTEXT.md (§36-39) & 03_EXECUTION_MODEL.md (§37-38)
 * 
 * Provides authentic creative outputs for Product, Hook, Script, Actor, Setting, Image, Video, and Review.
 */

import {
  ProductOutput,
  HookOutput,
  ScriptOutput,
  ActorOutput,
  SettingOutput,
  ImageOutput,
  VideoOutput,
} from "./types";

// 1. PRODUCT PRESETS
export const PRODUCT_PRESETS: Record<string, ProductOutput> = {
  nike: {
    type: "PRODUCT",
    id: "prod-nike",
    name: "Nike Air Zoom Pegasus",
    description: "Responsive everyday running shoe with engineered mesh upper and dual Zoom Air units for maximum energy return.",
    sourceType: "EXISTING",
    imageUrl: "/products/nike-shoe.jpg",
    url: "https://nike.com/pegasus",
  },
  lumina: {
    type: "PRODUCT",
    id: "prod-lumina",
    name: "Lumina Vitamin C Glow Serum",
    description: "Cold-pressed antioxidant serum that brightens dull skin, evens tone, and locks in 24-hour hydration.",
    sourceType: "EXISTING",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600",
    url: "https://luminaskincare.com/glow",
  },
  apex: {
    type: "PRODUCT",
    id: "prod-apex",
    name: "Apex ANC Wireless Headphones",
    description: "Studio-grade active noise cancellation with 40-hour battery life, spatial audio, and memory foam comfort.",
    sourceType: "EXISTING",
    imageUrl: "/products/headphones.jpg",
    url: "https://apexaudio.com/anc",
  },
};

// 2. HOOK PRESETS
export const HOOK_PRESETS: Record<string, { category: string; text: string; tone: string }> = {
  problem_solution: {
    category: "Problem → Solution",
    text: "Stop running in shoes that destroy your knees every single morning.",
    tone: "Urgent & Direct",
  },
  pov: {
    category: "POV Angle",
    text: "POV: You finally discovered the secret runners have been keeping all year.",
    tone: "Intriguing & Relatable",
  },
  before_after: {
    category: "Before / After",
    text: "Here is what my morning routine looked like before vs after finding this.",
    tone: "Transformational & Honest",
  },
  bold_claim: {
    category: "Bold Claim",
    text: "This single switch made all my previous sneakers obsolete on day one.",
    tone: "Confident & Bold",
  },
  social_proof: {
    category: "Social Proof",
    text: "There is a reason 10,000+ runners switched to these this month.",
    tone: "Enthusiastic & Validating",
  },
  spicy_reveal: {
    category: "Spicy Reveal",
    text: "Nobody talks about this, but 90% of your morning fatigue is what's on your feet.",
    tone: "Provocative",
  },
  product_hit: {
    category: "Product Hit",
    text: "The exact moment I laced these up, my 5K time dropped by two full minutes.",
    tone: "Excited / Social Proof",
  },
};

// 3. ACTOR PRESETS (Maya, Sarah, Marcus)
export const ACTOR_PRESETS: Record<string, ActorOutput> = {
  maya: {
    type: "ACTOR",
    id: "actor-maya",
    name: "Maya",
    actorType: "AI UGC Creator",
    lookId: "Casual UGC",
    voiceId: "voice-en-us-casual-f",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  },
  sarah: {
    type: "ACTOR",
    id: "actor-sarah",
    name: "Sarah",
    actorType: "Corporate / Direct Presenter",
    lookId: "Modern Professional",
    voiceId: "voice-en-us-authoritative-f",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
  },
  marcus: {
    type: "ACTOR",
    id: "actor-marcus",
    name: "Marcus",
    actorType: "Fitness & High Energy",
    lookId: "Athletic Activewear",
    voiceId: "voice-en-us-energetic-m",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
  },
};

// 4. SETTING PRESETS
export const SETTING_PRESETS: Record<string, SettingOutput> = {
  studio: {
    type: "SETTING",
    id: "setting-studio",
    name: "Minimalist Loft Studio",
    description: "Sunlit modern loft with exposed white brick and natural morning light.",
    lighting: "Warm Golden Hour",
    timeOfDay: "Morning",
    mood: "Crisp & Premium",
  },
  urban: {
    type: "SETTING",
    id: "setting-urban",
    name: "Downtown City Street",
    description: "Vibrant metropolitan sidewalk with bokeh streetlights and contemporary architecture.",
    lighting: "Overcast Cool",
    timeOfDay: "Afternoon",
    mood: "High Energy",
  },
  gym: {
    type: "SETTING",
    id: "setting-gym",
    name: "Athletic Training Facility",
    description: "Sleek industrial gym with rubber turf, dark matte equipment, and rim lighting.",
    lighting: "Directional Spotlight",
    timeOfDay: "Evening",
    mood: "Intense & Focused",
  },
};

// 5. GENERATE SCRIPT
export function generateScriptOutput(
  product: ProductOutput | null,
  hook: HookOutput | null,
  config: { length?: number; tone?: string; style?: string }
): ScriptOutput {
  const prodName = product?.name || "this breakthrough product";
  const hookText = hook?.text || "Are you tired of settling for mediocre results?";
  const length = config.length || 30;
  const tone = config.tone || "Energetic & Direct";
  const style = config.style || "UGC Testimonial";

  const scriptBody = `[HOOK (0-3s)]: "${hookText}"

[THE PROBLEM (3-10s)]: "I used to struggle with the exact same issue every day. Most options out there promise the world, but end up letting you down when you need them most."

[THE SOLUTION (10-20s)]: "Then I switched to ${prodName}. From the very first day, the difference was night and day. The dual cushioning and lightweight feel gave me an instant boost."

[CALL TO ACTION (20-${length}s)]: "If you're ready to upgrade your routine, click the link below to grab yours before this batch sells out!"`;

  return {
    type: "SCRIPT",
    id: `script-${Date.now()}`,
    text: scriptBody,
    language: "English (US)",
    durationSeconds: length,
    tone,
    style,
  };
}

// 6. GENERATE IMAGE
export function generateImageOutput(
  product: ProductOutput | null,
  setting: SettingOutput | null,
  config: { model?: string; aspectRatio?: string; prompt?: string }
): ImageOutput {
  const model = config.model || "Flux 1.1 Pro";
  const aspectRatio = config.aspectRatio || "9:16";

  // Pre-curated high-res imagery matching settings & products
  const imageUrl = product?.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600";

  return {
    type: "IMAGE",
    id: `img-${Date.now()}`,
    assetUrl: imageUrl,
    width: 1080,
    height: 1920,
    model,
    prompt: config.prompt || `Ultra-detailed commercial photo of ${product?.name || "product"} in ${setting?.name || "studio"}, commercial lighting.`,
  };
}

// 7. GENERATE VIDEO
export function generateVideoOutput(
  script: ScriptOutput | null,
  product: ProductOutput | null,
  actor: ActorOutput | null,
  setting: SettingOutput | null,
  config: { model?: string; duration?: number; aspectRatio?: string; resolution?: string }
): VideoOutput {
  const actorName = actor?.name || "Maya";
  const durationSeconds = config.duration || script?.durationSeconds || 15;
  const model = config.model || "Seedance 2.5";
  const aspectRatio = config.aspectRatio || "9:16";
  const resolution = config.resolution || "1080p";

  // Distinct video assets for different actors so the visual change is unmistakably obvious!
  let videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  let thumbnailUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600";

  if (actorName.toLowerCase().includes("sarah")) {
    videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
    thumbnailUrl = "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600";
  } else if (actorName.toLowerCase().includes("marcus")) {
    videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";
    thumbnailUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600";
  }

  return {
    type: "VIDEO",
    id: `vid-${Date.now()}`,
    assetUrl: videoUrl,
    thumbnailUrl,
    durationSeconds,
    aspectRatio,
    resolution,
    model,
  };
}
