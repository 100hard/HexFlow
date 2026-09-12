/**
 * HexFlow Showcase Workflows
 * 
 * 3 intuitive, story-driven pipelines demonstrating:
 * 01 / CHANGE: Swap the actor, keep the creative. (Nonlinear editing)
 * 02 / EXPLORE: Which hook works better? (Parallel creative branching)
 * 03 / ITERATE: Same idea. Two visual worlds. (Setting & aesthetic iteration)
 */

import { PRODUCT_PRESETS, HOOK_PRESETS, ACTOR_PRESETS, SETTING_PRESETS } from "./mock-generators";

// ============================================================================
// 01 / CHANGE: "Swap the actor, keep the creative"
// Subtitle: Change one creative decision without starting over.
// Narrative: A finished, ready-to-publish UGC video. Switch the actor from Maya
// to Marcus — the script & product stay cached (0s, 0 credits), only the video updates.
// ============================================================================
export function getWorkflowChangeActor() {
  const nodes = [
    {
      id: "node-product",
      type: "product",
      position: { x: 50, y: 140 },
      data: {
        state: "UP_TO_DATE",
        config: { preset: "nike", productName: "Nike Air Zoom Pegasus" },
        outputData: PRODUCT_PRESETS.nike,
      },
    },
    {
      id: "node-hook",
      type: "hook",
      position: { x: 460, y: 80 },
      data: {
        state: "UP_TO_DATE",
        config: { hookKey: "problem_solution", tone: "Urgent & Direct" },
        outputData: {
          type: "HOOK",
          id: "hook-init",
          category: "Problem → Solution",
          text: "Stop running in shoes that ruin your knees every morning.",
          tone: "Urgent & Direct",
        },
      },
    },
    {
      id: "node-script",
      type: "script",
      position: { x: 880, y: 80 },
      data: {
        state: "UP_TO_DATE",
        config: { length: 30, tone: "Urgent & Direct", style: "Problem-Solution UGC" },
        outputData: {
          type: "SCRIPT",
          id: "script-init",
          text: `[HOOK]: "Stop running in shoes that ruin your knees every morning."\n\n[THE PROBLEM]: "Most runners ignore shin splints until they can barely jog. The issue isn't your form—it's zero midsole responsiveness."\n\n[THE SOLUTION]: "Nike Pegasus dual Zoom Air units give you instant joint relief and 2x energy return."\n\n[CTA]: "Tap the link below to get 20% off your first pair!"`,
          durationSeconds: 30,
          tone: "Urgent & Direct",
        },
      },
    },
    {
      id: "node-actor",
      type: "actor",
      position: { x: 880, y: 440 },
      data: {
        state: "UP_TO_DATE",
        config: { actorKey: "maya", lookId: "Athletic Coach" },
        outputData: ACTOR_PRESETS.maya,
      },
    },
    {
      id: "node-video",
      type: "generateVideo",
      position: { x: 1360, y: 220 },
      data: {
        state: "UP_TO_DATE",
        config: { model: "Seedance 2.5", duration: 15, aspectRatio: "9:16", resolution: "1080p" },
        outputData: {
          type: "VIDEO",
          id: "vid-nike-initial",
          assetUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
          durationSeconds: 15,
        },
      },
    },
  ];

  const edges = [
    { id: "edge-prod-hook", source: "node-product", sourceHandle: "product", target: "node-hook", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },
    { id: "edge-prod-script", source: "node-product", sourceHandle: "product", target: "node-script", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },
    { id: "edge-hook-script", source: "node-hook", sourceHandle: "hook", target: "node-script", targetHandle: "hook", type: "button", style: { stroke: "#b45309", strokeWidth: 1.75 } },
    { id: "edge-script-video", source: "node-script", sourceHandle: "script", target: "node-video", targetHandle: "script", type: "button", style: { stroke: "#047857", strokeWidth: 1.75 } },
    { id: "edge-actor-video", source: "node-actor", sourceHandle: "actor", target: "node-video", targetHandle: "actor", type: "button", style: { stroke: "#6d28d9", strokeWidth: 1.75 } },
  ];

  return {
    meta: {
      caseStudyCode: "01 / CHANGE",
      caseStudyTitle: "Swap the actor, keep the creative.",
      caseStudySubtitle: "Change one creative decision without starting over.",
    },
    nodes,
    edges,
  };
}

// ============================================================================
// 02 / EXPLORE: "Which hook works better?"
// Subtitle: Explore two openings without rebuilding the campaign.
// Narrative: 1 shared Nike product branches into 2 parallel Hook & Actor tests:
// Problem-Solution (Maya) vs POV Curiosity (Marcus).
// Both scripts pass through human editorial approval before video rendering.
// ============================================================================
export function getWorkflowExploreHooks() {
  const nodes = [
    // Shared Product
    {
      id: "node-product",
      type: "product",
      position: { x: 50, y: 320 },
      data: {
        state: "UP_TO_DATE",
        config: { preset: "nike", productName: "Nike Air Zoom Pegasus" },
        outputData: PRODUCT_PRESETS.nike,
      },
    },

    // --- LANE A: Problem -> Solution Variant ---
    {
      id: "node-hook-a",
      type: "hook",
      position: { x: 460, y: 60 },
      data: {
        conceptId: "A",
        state: "UP_TO_DATE",
        config: { hookKey: "problem_solution", tone: "Urgent & Direct" },
        outputData: {
          type: "HOOK",
          id: "hook-a",
          category: "Problem → Solution",
          text: "Stop running in shoes that ruin your knees every morning.",
          tone: "Urgent & Direct",
        },
      },
    },
    {
      id: "node-script-a",
      type: "script",
      position: { x: 880, y: 60 },
      data: {
        conceptId: "A",
        state: "UP_TO_DATE",
        config: { length: 30, tone: "Urgent & Direct", style: "Problem-Solution UGC" },
        outputData: {
          type: "SCRIPT",
          id: "script-a",
          text: `[HOOK]: "Stop running in shoes that ruin your knees every morning."\n\n[THE PROBLEM]: "Most runners ignore shin splints until they can barely jog. The issue isn't your form—it's zero midsole responsiveness."\n\n[THE SOLUTION]: "Then I switched to Nike Pegasus. The dual Zoom Air cushioning gave me instant joint relief."\n\n[CTA]: "Tap the link below to get 20% off your first pair!"`,
          durationSeconds: 30,
          tone: "Urgent & Direct",
        },
      },
    },
    {
      id: "node-review-a",
      type: "review",
      position: { x: 1320, y: 60 },
      data: {
        conceptId: "A",
        state: "UP_TO_DATE",
        config: {},
        outputData: {
          type: "SCRIPT",
          approved: true,
          approvedAt: new Date().toISOString(),
          text: `[HOOK]: "Stop running in shoes that ruin your knees every morning."\n\n[THE PROBLEM]: "Most runners ignore shin splints until they can barely jog."\n\n[THE SOLUTION]: "Nike Pegasus dual Zoom Air cushioning gave me instant relief."`,
          durationSeconds: 30,
          tone: "Urgent & Direct",
        },
      },
    },
    {
      id: "node-actor-a",
      type: "actor",
      position: { x: 1320, y: 300 },
      data: {
        conceptId: "A",
        state: "UP_TO_DATE",
        config: { actorKey: "maya", lookId: "Athletic Coach" },
        outputData: ACTOR_PRESETS.maya,
      },
    },
    {
      id: "node-video-a",
      type: "generateVideo",
      position: { x: 1760, y: 120 },
      data: {
        conceptId: "A",
        state: "UP_TO_DATE",
        config: { model: "Seedance 2.5", duration: 15, aspectRatio: "9:16", resolution: "1080p" },
        outputData: {
          type: "VIDEO",
          id: "vid-a",
          assetUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
          durationSeconds: 15,
        },
      },
    },

    // --- LANE B: POV Curiosity Variant ---
    {
      id: "node-hook-b",
      type: "hook",
      position: { x: 460, y: 560 },
      data: {
        conceptId: "B",
        state: "UP_TO_DATE",
        config: { hookKey: "pov", tone: "Curiosity & Relatable" },
        outputData: {
          type: "HOOK",
          id: "hook-b",
          category: "POV Curiosity",
          text: "POV: You finally discovered the shoe marathoners won't tell you about.",
          tone: "Curiosity & Relatable",
        },
      },
    },
    {
      id: "node-script-b",
      type: "script",
      position: { x: 880, y: 560 },
      data: {
        conceptId: "B",
        state: "UP_TO_DATE",
        config: { length: 30, tone: "Casual & Relatable", style: "Social Storytelling" },
        outputData: {
          type: "SCRIPT",
          id: "script-b",
          text: `[HOOK]: "POV: You finally discovered the shoe marathoners won't tell you about."\n\n[STORY]: "I used to think all sneakers felt the same after 5 miles. Until I laced these up on my morning run."\n\n[REVEAL]: "The energy return on the Nike Pegasus is completely unreal."\n\n[CTA]: "Check out the colorways before they're gone!"`,
          durationSeconds: 30,
          tone: "Casual & Relatable",
        },
      },
    },
    {
      id: "node-review-b",
      type: "review",
      position: { x: 1320, y: 560 },
      data: {
        conceptId: "B",
        state: "UP_TO_DATE",
        config: {},
        outputData: {
          type: "SCRIPT",
          approved: true,
          approvedAt: new Date().toISOString(),
          text: `[HOOK]: "POV: You finally discovered the shoe marathoners won't tell you about."\n\n[STORY]: "Until I laced these up on my morning run."\n\n[REVEAL]: "The energy return is completely unreal."`,
          durationSeconds: 30,
          tone: "Casual & Relatable",
        },
      },
    },
    {
      id: "node-actor-b",
      type: "actor",
      position: { x: 1320, y: 800 },
      data: {
        conceptId: "B",
        state: "UP_TO_DATE",
        config: { actorKey: "marcus", lookId: "Urban Commuter" },
        outputData: ACTOR_PRESETS.marcus,
      },
    },
    {
      id: "node-video-b",
      type: "generateVideo",
      position: { x: 1760, y: 620 },
      data: {
        state: "UP_TO_DATE",
        config: { model: "Kling 3.0 Turbo", duration: 15, aspectRatio: "9:16", resolution: "1080p" },
        outputData: {
          type: "VIDEO",
          id: "vid-b",
          assetUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
          durationSeconds: 15,
        },
      },
    },
  ];

  const edges = [
    { id: "edge-prod-hook-a", source: "node-product", sourceHandle: "product", target: "node-hook-a", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },
    { id: "edge-prod-hook-b", source: "node-product", sourceHandle: "product", target: "node-hook-b", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },
    { id: "edge-prod-script-a", source: "node-product", sourceHandle: "product", target: "node-script-a", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },
    { id: "edge-prod-script-b", source: "node-product", sourceHandle: "product", target: "node-script-b", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },
    { id: "edge-hook-script-a", source: "node-hook-a", sourceHandle: "hook", target: "node-script-a", targetHandle: "hook", type: "button", style: { stroke: "#b45309", strokeWidth: 1.75 } },
    { id: "edge-hook-script-b", source: "node-hook-b", sourceHandle: "hook", target: "node-script-b", targetHandle: "hook", type: "button", style: { stroke: "#b45309", strokeWidth: 1.75 } },
    { id: "edge-script-review-a", source: "node-script-a", sourceHandle: "script", target: "node-review-a", targetHandle: "script", type: "button", style: { stroke: "#047857", strokeWidth: 1.75 } },
    { id: "edge-script-review-b", source: "node-script-b", sourceHandle: "script", target: "node-review-b", targetHandle: "script", type: "button", style: { stroke: "#047857", strokeWidth: 1.75 } },
    { id: "edge-review-video-a", source: "node-review-a", sourceHandle: "script", target: "node-video-a", targetHandle: "script", type: "button", style: { stroke: "#047857", strokeWidth: 1.75 } },
    { id: "edge-review-video-b", source: "node-review-b", sourceHandle: "script", target: "node-video-b", targetHandle: "script", type: "button", style: { stroke: "#047857", strokeWidth: 1.75 } },
    { id: "edge-actor-video-a", source: "node-actor-a", sourceHandle: "actor", target: "node-video-a", targetHandle: "actor", type: "button", style: { stroke: "#6d28d9", strokeWidth: 1.75 } },
    { id: "edge-actor-video-b", source: "node-actor-b", sourceHandle: "actor", target: "node-video-b", targetHandle: "actor", type: "button", style: { stroke: "#6d28d9", strokeWidth: 1.75 } },
  ];

  return {
    meta: {
      caseStudyCode: "02 / EXPLORE",
      caseStudyTitle: "Which hook works better?",
      caseStudySubtitle: "Explore two openings without rebuilding the campaign.",
    },
    nodes,
    edges,
  };
}

// ============================================================================
// 03 / ITERATE: "Same idea. Two visual worlds."
// Subtitle: Keep the voice and message. Explore different aesthetic settings.
// Narrative: Product & Script are locked in via Human Review. The creator tests:
// Downtown City Subway Commute vs Minimalist Dark Studio Pedestal.
// ============================================================================
export function getWorkflowVisualWorlds() {
  const nodes = [
    // Shared Product
    {
      id: "node-product",
      type: "product",
      position: { x: 50, y: 260 },
      data: {
        state: "UP_TO_DATE",
        config: { preset: "apex", productName: "Apex ANC Wireless Headphones" },
        outputData: PRODUCT_PRESETS.apex,
      },
    },

    // Locked Approved Script
    {
      id: "node-script",
      type: "script",
      position: { x: 460, y: 260 },
      data: {
        state: "UP_TO_DATE",
        config: { length: 20, tone: "Energetic & Direct", style: "Tech Review" },
        outputData: {
          type: "SCRIPT",
          id: "script-apex",
          text: `[HOOK]: "Once you turn on 40dB active noise cancellation, you never commute without these."\n\n[THE BENEFIT]: "Spatial audio, 40-hour battery life, and zero ear fatigue after 8 hours."\n\n[CTA]: "Get the studio sound at half the price today."`,
          durationSeconds: 20,
          tone: "Energetic & Direct",
        },
      },
    },

    // Central Script & Voice Review Gate (Human-Approved)
    {
      id: "node-review",
      type: "review",
      position: { x: 880, y: 260 },
      data: {
        state: "UP_TO_DATE",
        config: {},
        outputData: {
          type: "SCRIPT",
          approved: true,
          approvedAt: new Date().toISOString(),
          text: `[HOOK]: "Once you turn on 40dB active noise cancellation, you never commute without these."\n\n[THE BENEFIT]: "Spatial audio, 40-hour battery life, and zero ear fatigue after 8 hours."\n\n[CTA]: "Get the studio sound at half the price today."`,
          durationSeconds: 20,
          tone: "Energetic & Direct",
        },
      },
    },

    // --- VISUAL WORLD 1: Downtown City Subway (Top Lane) ---
    {
      id: "node-setting-subway",
      type: "setting",
      position: { x: 880, y: 60 },
      data: {
        state: "UP_TO_DATE",
        config: { settingKey: "urban", lighting: "Subway Train Motion", mood: "Dynamic Urban Commute" },
        outputData: SETTING_PRESETS.urban,
      },
    },
    {
      id: "node-image-subway",
      type: "generateImage",
      position: { x: 1300, y: 60 },
      data: {
        state: "UP_TO_DATE",
        config: { model: "Flux 1.1 Pro", aspectRatio: "9:16", prompt: "Commuter wearing sleek black headphones on a moving subway train, cinematic motion blur" },
        outputData: {
          type: "IMAGE",
          id: "img-subway",
          assetUrl: "/products/headphones.jpg",
          model: "Flux 1.1 Pro",
        },
      },
    },
    {
      id: "node-video-subway",
      type: "generateVideo",
      position: { x: 1760, y: 100 },
      data: {
        state: "UP_TO_DATE",
        config: { model: "Seedance 2.5", duration: 15, aspectRatio: "9:16", resolution: "1080p" },
        outputData: {
          type: "VIDEO",
          id: "vid-subway",
          assetUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          thumbnailUrl: "/products/headphones.jpg",
          durationSeconds: 15,
        },
      },
    },

    // --- VISUAL WORLD 2: Minimalist Dark Studio (Bottom Lane) ---
    {
      id: "node-setting-studio",
      type: "setting",
      position: { x: 880, y: 460 },
      data: {
        state: "UP_TO_DATE",
        config: { settingKey: "studio", lighting: "Dramatic Rim Light", mood: "Luxury Product Showcase" },
        outputData: SETTING_PRESETS.studio,
      },
    },
    {
      id: "node-image-studio",
      type: "generateImage",
      position: { x: 1300, y: 460 },
      data: {
        state: "UP_TO_DATE",
        config: { model: "Recraft 4.1", aspectRatio: "9:16", prompt: "Apex headphones resting on dark slate pedestal with subtle warm ambient backlighting, luxury commercial" },
        outputData: {
          type: "IMAGE",
          id: "img-studio",
          assetUrl: "/products/headphones.jpg",
          model: "Recraft 4.1",
        },
      },
    },
    {
      id: "node-video-studio",
      type: "generateVideo",
      position: { x: 1760, y: 460 },
      data: {
        state: "UP_TO_DATE",
        config: { model: "Google Veo 3.1", duration: 15, aspectRatio: "9:16", resolution: "4K" },
        outputData: {
          type: "VIDEO",
          id: "vid-studio",
          assetUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          thumbnailUrl: "/products/headphones.jpg",
          durationSeconds: 15,
        },
      },
    },
  ];

  const edges = [
    { id: "edge-prod-script", source: "node-product", sourceHandle: "product", target: "node-script", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },
    { id: "edge-script-review", source: "node-script", sourceHandle: "script", target: "node-review", targetHandle: "script", type: "button", style: { stroke: "#047857", strokeWidth: 1.75 } },
    { id: "edge-prod-setting-subway", source: "node-product", sourceHandle: "product", target: "node-setting-subway", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },
    { id: "edge-prod-setting-studio", source: "node-product", sourceHandle: "product", target: "node-setting-studio", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },

    // Setting Subway -> Image Subway -> Video Subway
    { id: "edge-setting-img-subway", source: "node-setting-subway", sourceHandle: "setting", target: "node-image-subway", targetHandle: "setting", type: "button", style: { stroke: "#0f766e", strokeWidth: 1.75 } },
    { id: "edge-img-video-subway", source: "node-image-subway", sourceHandle: "image", target: "node-video-subway", targetHandle: "image", type: "button", style: { stroke: "#2563eb", strokeWidth: 1.75 } },
    { id: "edge-review-video-subway", source: "node-review", sourceHandle: "script", target: "node-video-subway", targetHandle: "script", type: "button", style: { stroke: "#047857", strokeWidth: 1.75 } },

    // Setting Studio -> Image Studio -> Video Studio
    { id: "edge-setting-img-studio", source: "node-setting-studio", sourceHandle: "setting", target: "node-image-studio", targetHandle: "setting", type: "button", style: { stroke: "#0f766e", strokeWidth: 1.75 } },
    { id: "edge-img-video-studio", source: "node-image-studio", sourceHandle: "image", target: "node-video-studio", targetHandle: "image", type: "button", style: { stroke: "#2563eb", strokeWidth: 1.75 } },
    { id: "edge-review-video-studio", source: "node-review", sourceHandle: "script", target: "node-video-studio", targetHandle: "script", type: "button", style: { stroke: "#047857", strokeWidth: 1.75 } },
  ];

  return {
    meta: {
      caseStudyCode: "03 / ITERATE",
      caseStudyTitle: "Same idea. Two visual worlds.",
      caseStudySubtitle: "Keep the voice and message. Explore different aesthetic settings.",
    },
    nodes,
    edges,
  };
}
