/**
 * HexFlow Agent Intent & Graph Mutation Engine ("Ask HexFlow")
 * 
 * Translates natural language creative requests into explicit graph operations:
 * - CREATE_GRAPH: Constructs multi-concept UGC workflows with shared foundation
 * - MODIFY_NODE: Surgically updates node configs (hooks, actors, scripts, settings)
 *   and triggers the existing HexFlow stale propagation engine.
 * 
 * Strict Principle:
 * Agent modifies creative configuration/intent; the DAG execution engine
 * produces outputs and handles downstream invalidation.
 */

import { Node, Edge } from "@xyflow/react";
import { PRODUCT_PRESETS, HOOK_PRESETS, ACTOR_PRESETS, SETTING_PRESETS } from "./mock-generators";

export interface CreateGraphOperation {
  type: "CREATE_GRAPH";
  nodes: Node[];
  edges: Edge[];
  summary: string;
  detail: string;
  nodeSteps?: string[];
}

export interface ModifyNodeOperation {
  type: "MODIFY_NODE";
  targetNodeId: string;
  configUpdates: Record<string, any>;
  summary: string;
  detail: string;
  affectedDownstreamTypes: string[];
}

export interface DeleteNodesOperation {
  type: "DELETE_NODES";
  /** Node IDs to remove from the canvas */
  targetNodeIds: string[];
  /** Edge IDs to also remove (typically all edges connected to deleted nodes) */
  targetEdgeIds: string[];
  summary: string;
  detail: string;
}

export type GraphOperation = CreateGraphOperation | ModifyNodeOperation | DeleteNodesOperation;

export interface AgentResolutionResult {
  success: boolean;
  operation?: GraphOperation;
  error?: string;
  userMessage: string;
}

/**
 * Normalizes user prompt for robust deterministic pattern matching
 */
function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/[—–]/g, "-")
    .replace(/→/g, "->")
    .replace(/["'“”]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolves concept identity from prompt references:
 * "second", "2", "concept 2", "b", "lane b", "variant 2" -> "B"
 * "first", "1", "concept 1", "a", "lane a", "variant 1" -> "A"
 */
function resolveConceptId(text: string): "A" | "B" | null {
  if (
    text.includes("second") ||
    text.includes("concept 2") ||
    text.includes("concept two") ||
    text.includes("concept b") ||
    text.includes("lane b") ||
    text.includes("variant 2") ||
    text.includes("variant b") ||
    text.includes("hook b") ||
    text.includes("script b") ||
    text.includes("video b") ||
    text.includes("the 2nd") ||
    text.includes("2nd")
  ) {
    return "B";
  }

  if (
    text.includes("first") ||
    text.includes("concept 1") ||
    text.includes("concept one") ||
    text.includes("concept a") ||
    text.includes("lane a") ||
    text.includes("variant 1") ||
    text.includes("variant a") ||
    text.includes("hook a") ||
    text.includes("script a") ||
    text.includes("video a") ||
    text.includes("the 1st") ||
    text.includes("1st")
  ) {
    return "A";
  }

  return null;
}

export interface TwoConceptWorkflowOptions {
  hookA?: string;
  hookAText?: string;
  hookATone?: string;
  hookB?: string;
  hookBText?: string;
  hookBTone?: string;
  actorKey?: string;
  productKey?: string;
  scriptATone?: string;
  scriptAStyle?: string;
  scriptBTone?: string;
  scriptBStyle?: string;
  videoAModel?: string;
  videoBModel?: string;
}

/**
 * Builds standard 2-lane UGC Workflow:
 * Shared Product -> Hook A & Hook B -> Script A & Script B -> Video A & Video B <- Shared Actor
 */
export function buildTwoConceptUGCWorkflow(options?: TwoConceptWorkflowOptions): { nodes: Node[]; edges: Edge[] } {
  const prodKey = options?.productKey || "nike";
  const hookAKey = options?.hookA || "problem_solution";
  const hookBKey = options?.hookB || "pov";
  const actorKey = options?.actorKey || "maya";

  const productPreset = PRODUCT_PRESETS[prodKey] || PRODUCT_PRESETS.nike;
  const hookAPreset = HOOK_PRESETS[hookAKey] || HOOK_PRESETS.problem_solution;
  const hookBPreset = HOOK_PRESETS[hookBKey] || HOOK_PRESETS.pov;
  const actorPreset = ACTOR_PRESETS[actorKey] || ACTOR_PRESETS.maya;

  const hookAText = options?.hookAText || hookAPreset.text;
  const hookATone = options?.hookATone || hookAPreset.tone;
  const hookBText = options?.hookBText || hookBPreset.text;
  const hookBTone = options?.hookBTone || hookBPreset.tone;
  const scriptATone = options?.scriptATone || hookATone;
  const scriptAStyle = options?.scriptAStyle || "Problem-Solution UGC";
  const scriptBTone = options?.scriptBTone || hookBTone;
  const scriptBStyle = options?.scriptBStyle || "Social Storytelling";
  const videoAModel = options?.videoAModel || "Seedance 2.5";
  const videoBModel = options?.videoBModel || "Kling 3.0 Turbo";

  const nodes: Node[] = [
    // Shared Product (Col 0)
    {
      id: "node-product",
      type: "product",
      position: { x: 50, y: 320 },
      data: {
        state: "UP_TO_DATE",
        config: { preset: prodKey, productName: productPreset.name },
        outputData: productPreset,
      },
    },

    // --- CONCEPT A (Top Lane) ---
    {
      id: "node-hook-a",
      type: "hook",
      position: { x: 460, y: 80 },
      data: {
        conceptId: "A",
        state: "UP_TO_DATE",
        config: { hookKey: hookAKey, tone: hookATone },
        outputData: {
          type: "HOOK",
          id: "hook-a",
          category: hookAPreset.category,
          text: hookAText,
          tone: hookATone,
        },
      },
    },
    {
      id: "node-script-a",
      type: "script",
      position: { x: 880, y: 80 },
      data: {
        conceptId: "A",
        state: "UP_TO_DATE",
        config: { length: 30, tone: scriptATone, style: scriptAStyle },
        outputData: {
          type: "SCRIPT",
          id: "script-a",
          text: `[HOOK]: "${hookAText}"\n\n[THE PROBLEM]: "Most runners ignore foot fatigue until they can barely train."\n\n[THE SOLUTION]: "${productPreset.name} provides instant dual cushioning."\n\n[CTA]: "Click below to get 20% off today!"`,
          durationSeconds: 30,
          tone: scriptATone,
        },
      },
    },
    {
      id: "node-video-a",
      type: "generateVideo",
      position: { x: 1360, y: 80 },
      data: {
        conceptId: "A",
        state: "UP_TO_DATE",
        config: { model: videoAModel, duration: 15, aspectRatio: "9:16", resolution: "1080p" },
        outputData: {
          type: "VIDEO",
          id: "vid-a",
          assetUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          thumbnailUrl: actorPreset.imageUrl,
          durationSeconds: 15,
        },
      },
    },

    // --- CONCEPT B (Bottom Lane) ---
    {
      id: "node-hook-b",
      type: "hook",
      position: { x: 460, y: 560 },
      data: {
        conceptId: "B",
        state: "UP_TO_DATE",
        config: { hookKey: hookBKey, tone: hookBTone },
        outputData: {
          type: "HOOK",
          id: "hook-b",
          category: hookBPreset.category,
          text: hookBText,
          tone: hookBTone,
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
        config: { length: 30, tone: scriptBTone, style: scriptBStyle },
        outputData: {
          type: "SCRIPT",
          id: "script-b",
          text: `[HOOK]: "${hookBText}"\n\n[STORY]: "I used to think all everyday shoes felt the same."\n\n[REVEAL]: "Then I slipped into ${productPreset.name}. Complete game changer."\n\n[CTA]: "Check out the colorways before they sell out!"`,
          durationSeconds: 30,
          tone: scriptBTone,
        },
      },
    },
    {
      id: "node-video-b",
      type: "generateVideo",
      position: { x: 1360, y: 560 },
      data: {
        conceptId: "B",
        state: "UP_TO_DATE",
        config: { model: videoBModel, duration: 15, aspectRatio: "9:16", resolution: "1080p" },
        outputData: {
          type: "VIDEO",
          id: "vid-b",
          assetUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          thumbnailUrl: actorPreset.imageUrl,
          durationSeconds: 15,
        },
      },
    },

    // Shared Actor (Centered between lanes at Col 2)
    {
      id: "node-actor-shared",
      type: "actor",
      position: { x: 880, y: 320 },
      data: {
        state: "UP_TO_DATE",
        config: { actorKey, lookId: actorPreset.lookId },
        outputData: actorPreset,
      },
    },
  ];

  const edges: Edge[] = [
    // Product feeds hooks & scripts
    { id: "edge-prod-hook-a", source: "node-product", sourceHandle: "product", target: "node-hook-a", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },
    { id: "edge-prod-hook-b", source: "node-product", sourceHandle: "product", target: "node-hook-b", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },
    { id: "edge-prod-script-a", source: "node-product", sourceHandle: "product", target: "node-script-a", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },
    { id: "edge-prod-script-b", source: "node-product", sourceHandle: "product", target: "node-script-b", targetHandle: "product", type: "button", style: { stroke: "#c2410c", strokeWidth: 1.75 } },

    // Hooks feed scripts
    { id: "edge-hook-script-a", source: "node-hook-a", sourceHandle: "hook", target: "node-script-a", targetHandle: "hook", type: "button", style: { stroke: "#b45309", strokeWidth: 1.75 } },
    { id: "edge-hook-script-b", source: "node-hook-b", sourceHandle: "hook", target: "node-script-b", targetHandle: "hook", type: "button", style: { stroke: "#b45309", strokeWidth: 1.75 } },

    // Scripts feed videos
    { id: "edge-script-video-a", source: "node-script-a", sourceHandle: "script", target: "node-video-a", targetHandle: "script", type: "button", style: { stroke: "#047857", strokeWidth: 1.75 } },
    { id: "edge-script-video-b", source: "node-script-b", sourceHandle: "script", target: "node-video-b", targetHandle: "script", type: "button", style: { stroke: "#047857", strokeWidth: 1.75 } },

    // Shared Actor feeds both Video A and Video B
    { id: "edge-actor-video-a", source: "node-actor-shared", sourceHandle: "actor", target: "node-video-a", targetHandle: "actor", type: "button", style: { stroke: "#6d28d9", strokeWidth: 1.75 } },
    { id: "edge-actor-video-b", source: "node-actor-shared", sourceHandle: "actor", target: "node-video-b", targetHandle: "actor", type: "button", style: { stroke: "#6d28d9", strokeWidth: 1.75 } },
  ];

  return { nodes, edges };
}

/**
 * Finds a node in the graph matching concept ID and node type.
 * Falls back gracefully to matching by ordinal index or ID if conceptId is not set.
 */
export function findTargetNode(
  nodes: Node[],
  conceptId: "A" | "B",
  nodeType: string
): Node | null {
  // 1. Direct conceptId match
  const byConcept = nodes.find(
    (n) => n.type === nodeType && (n.data as any)?.conceptId === conceptId
  );
  if (byConcept) return byConcept;

  // 2. Suffix match on ID (e.g. node-hook-b or node-script-a)
  const targetSuffix = conceptId.toLowerCase();
  const byIdSuffix = nodes.find(
    (n) => n.type === nodeType && n.id.toLowerCase().endsWith(`-${targetSuffix}`)
  );
  if (byIdSuffix) return byIdSuffix;

  // 3. Positional / ordinal fallback (A = first occurrence, B = second occurrence)
  const matchingType = nodes.filter((n) => n.type === nodeType);
  if (matchingType.length >= 2) {
    return conceptId === "B" ? matchingType[1] : matchingType[0];
  }
  if (matchingType.length === 1) {
    return matchingType[0];
  }

  return null;
}

/**
 * Deterministically parses a user prompt and generates an explicit GraphOperation
 */
export function resolveHexFlowAgentIntent(
  rawPrompt: string,
  currentNodes: Node[],
  currentEdges: Edge[]
): AgentResolutionResult {
  const p = normalizePrompt(rawPrompt);

  if (!p) {
    return {
      success: false,
      error: "Empty prompt",
      userMessage: "Please describe what workflow to create or change.",
    };
  }

  // ==========================================================================
  // PATTERN 0: DELETE_NODES
  // e.g. "Remove the second hook and script"
  //      "Delete lane B"  / "simplify to one concept" / "remove concept B"
  //      "Remove the second hook entirely"
  // ==========================================================================
  const isDeleteIntent =
    p.startsWith("remove") ||
    p.startsWith("delete") ||
    p.startsWith("get rid") ||
    p.includes("remove the second") ||
    p.includes("delete the second") ||
    p.includes("remove concept b") ||
    p.includes("delete concept b") ||
    p.includes("remove lane b") ||
    p.includes("delete lane b") ||
    p.includes("simplify to one") ||
    p.includes("keep only one") ||
    p.includes("just one concept") ||
    p.includes("only one concept") ||
    p.includes("only one hook");

  if (isDeleteIntent) {
    const concept = resolveConceptId(p) ?? "B";

    // Determine which node types the user wants gone
    const wantsAll =
      p.includes("lane") ||
      p.includes("concept") ||
      p.includes("everything") ||
      p.includes("all of") ||
      (!p.includes("hook") && !p.includes("script") && !p.includes("video") && !p.includes("actor"));

    const wantsHook   = wantsAll || p.includes("hook");
    const wantsScript = wantsAll || p.includes("script");
    const wantsVideo  = wantsAll || p.includes("video");
    const wantsActor  = wantsAll || p.includes("actor");

    const typeFilter: string[] = [];
    if (wantsHook)   typeFilter.push("hook");
    if (wantsScript) typeFilter.push("script");
    if (wantsVideo)  typeFilter.push("generateVideo");
    if (wantsActor)  typeFilter.push("actor");

    // Gather matching nodes for the target concept
    const nodesToDelete: string[] = [];
    for (const type of typeFilter) {
      const match = findTargetNode(currentNodes, concept, type);
      if (match) nodesToDelete.push(match.id);
    }

    if (nodesToDelete.length === 0) {
      return {
        success: false,
        error: `Could not locate nodes to delete for Concept ${concept}`,
        userMessage: `I couldn't find any matching nodes to remove. Try specifying which lane or node type (e.g. "Remove the second hook and script").`,
      };
    }

    // Collect all edges that touch any of the deleted nodes
    const nodeIdSet = new Set(nodesToDelete);
    const edgesToDelete = currentEdges
      .filter((e) => nodeIdSet.has(e.source) || nodeIdSet.has(e.target))
      .map((e) => e.id);

    const deletedLabels = typeFilter
      .map((t) => (t === "generateVideo" ? "Video" : t.charAt(0).toUpperCase() + t.slice(1)))
      .join(" and ");

    const summary = `Removed ${deletedLabels} ${concept}`;
    const detail  = `Concept ${concept === "B" ? "A" : "B"} is untouched and fully cached.`;

    return {
      success: true,
      operation: {
        type: "DELETE_NODES",
        targetNodeIds: nodesToDelete,
        targetEdgeIds: edgesToDelete,
        summary,
        detail,
      },
      userMessage: `${summary}. ${detail}`,
    };
  }

  // ==========================================================================
  // PATTERN 1: CREATE_GRAPH
  // e.g. "Create two UGC concepts for this product, one Problem -> Solution and one POV, using the same actor"
  // ==========================================================================
  const isCreateIntent =
    p.startsWith("create") ||
    p.startsWith("build") ||
    p.startsWith("generate") ||
    p.startsWith("make two") ||
    p.startsWith("set up");

  const mentionsTwoConcepts =
    p.includes("two ugc") ||
    p.includes("2 ugc") ||
    p.includes("two concept") ||
    p.includes("2 concept") ||
    p.includes("two variant") ||
    p.includes("2 variant") ||
    p.includes("two direction") ||
    p.includes("2 direction") ||
    p.includes("two hook") ||
    p.includes("2 hook");

  if (isCreateIntent && (mentionsTwoConcepts || currentNodes.length <= 1)) {
    let hookA = "problem_solution";
    let hookB = "pov";

    if (p.includes("before") && p.includes("after")) {
      hookB = "before_after";
    } else if (p.includes("bold claim")) {
      hookB = "bold_claim";
    } else if (p.includes("social proof")) {
      hookB = "social_proof";
    }

    let prodKey = "nike";
    if (p.includes("apex") || p.includes("headphone")) prodKey = "apex";
    if (p.includes("lumina") || p.includes("serum")) prodKey = "lumina";

    let actorKey = "maya";
    if (p.includes("marcus")) actorKey = "marcus";
    if (p.includes("sarah")) actorKey = "sarah";

    const { nodes, edges } = buildTwoConceptUGCWorkflow({
      hookA,
      hookB,
      actorKey,
      productKey: prodKey,
    });

    return {
      success: true,
      operation: {
        type: "CREATE_GRAPH",
        nodes,
        edges,
        summary: "Created 2 creative directions",
        detail: "Shared Product and Actor across both branches.",
        nodeSteps: [
          "Product (Nike Pegasus)",
          "Hook A (Problem → Solution)",
          "Script A (UGC Pitch)",
          "Hook B (POV Angle)",
          "Script B (Social Story)",
          `Shared Actor (${actorPresetLabel(actorKey)})`,
          "Generate Video A",
          "Generate Video B",
        ],
      },
      userMessage: "Created 2 creative directions. Shared Product and Actor across both branches.",
    };
  }

  // ==========================================================================
  // PATTERN 2: MODIFY_NODE - Actor Change
  // e.g. "Change the actor to Sarah" or "Swap actor for Marcus"
  // Checked before hook to avoid misrouting prompts like "change actor to sarah"
  // ==========================================================================
  if (p.includes("actor") || p.includes("marcus") || p.includes("maya") || p.includes("sarah")) {
    const targetNode = currentNodes.find((n) => n.type === "actor");

    if (targetNode) {
      let actorKey = "marcus";
      if (p.includes("maya")) actorKey = "maya";
      if (p.includes("sarah")) actorKey = "sarah";

      const preset = ACTOR_PRESETS[actorKey] || ACTOR_PRESETS.marcus;

      return {
        success: true,
        operation: {
          type: "MODIFY_NODE",
          targetNodeId: targetNode.id,
          configUpdates: {
            actorKey,
            lookId: preset.lookId,
          },
          summary: `Changed Actor to ${preset.name}`,
          detail: "Video needs to be regenerated. Your script and hook are unchanged.",
          affectedDownstreamTypes: ["generateVideo"],
        },
        userMessage: `Changed Actor to ${preset.name}. Video needs to be regenerated. Your script and hook are unchanged.`,
      };
    }
  }

  // ==========================================================================
  // PATTERN 3: MODIFY_NODE - Hook Change
  // e.g. "Change the second hook to Before / After" or "Change hook to Before / After"
  // ==========================================================================
  if (p.includes("hook") && (p.includes("change") || p.includes("make") || p.includes("switch") || p.includes("set") || p.includes("try"))) {
    const hasMultipleHooks = currentNodes.filter((n) => n.type === "hook").length > 1;
    const concept = hasMultipleHooks ? (resolveConceptId(p) || "B") : "A";
    const targetNode = hasMultipleHooks
      ? findTargetNode(currentNodes, concept, "hook")
      : (currentNodes.find((n) => n.type === "hook") || null);

    if (!targetNode) {
      return {
        success: false,
        error: `Could not locate Hook node${hasMultipleHooks ? ` for Concept ${concept}` : ""}`,
        userMessage: `Could not find a Hook on the canvas to modify.`,
      };
    }

    let targetHookKey = "before_after";
    let targetHookLabel = "Before / After";

    if (p.includes("problem") || p.includes("solution")) {
      targetHookKey = "problem_solution";
      targetHookLabel = "Problem → Solution";
    } else if (p.includes("pov") || p.includes("curiosity")) {
      targetHookKey = "pov";
      targetHookLabel = "POV Angle";
    } else if (p.includes("bold") || p.includes("claim")) {
      targetHookKey = "bold_claim";
      targetHookLabel = "Bold Claim";
    } else if (p.includes("social") || p.includes("proof")) {
      targetHookKey = "social_proof";
      targetHookLabel = "Social Proof";
    }

    const preset = HOOK_PRESETS[targetHookKey] || HOOK_PRESETS.before_after;

    const summary = hasMultipleHooks
      ? `Changed Hook ${concept} to ${targetHookLabel}`
      : `Changed Hook to ${targetHookLabel}`;
    const detail = hasMultipleHooks
      ? `Script ${concept} and Video ${concept} need to be regenerated.`
      : "Script and Video need to be regenerated. Your product is unchanged.";

    return {
      success: true,
      operation: {
        type: "MODIFY_NODE",
        targetNodeId: targetNode.id,
        configUpdates: {
          hookKey: targetHookKey,
          customHook: preset.text,
          tone: preset.tone,
        },
        summary,
        detail,
        affectedDownstreamTypes: ["script", "generateVideo"],
      },
      userMessage: `${summary}. ${detail}`,
    };
  }

  // ==========================================================================
  // PATTERN 4: MODIFY_NODE - Script Tone / Style Change
  // e.g. "Make the second script comedic" or "Make script comedic"
  // ==========================================================================
  if (
    p.includes("comedic") ||
    p.includes("funny") ||
    p.includes("humorous") ||
    p.includes("urgent") ||
    p.includes("casual") ||
    p.includes("storytelling") ||
    p.includes("tone")
  ) {
    const hasMultipleScripts = currentNodes.filter((n) => n.type === "script").length > 1;
    const concept = hasMultipleScripts ? (resolveConceptId(p) || "B") : "A";
    const targetNode = hasMultipleScripts
      ? findTargetNode(currentNodes, concept, "script")
      : (currentNodes.find((n) => n.type === "script") || null);

    if (!targetNode) {
      return {
        success: false,
        error: `Could not locate Script node${hasMultipleScripts ? ` for Concept ${concept}` : ""}`,
        userMessage: `Could not find a Script on the canvas to modify.`,
      };
    }

    let tone = "Comedic & Lighthearted";
    let style = "Humorous UGC Satire";

    if (p.includes("urgent") || p.includes("direct")) {
      tone = "Urgent & Direct";
      style = "Problem-Solution Pitch";
    } else if (p.includes("casual") || p.includes("relatable")) {
      tone = "Casual & Relatable";
      style = "Social Storytelling";
    }

    const summary = hasMultipleScripts
      ? `Made Script ${concept} ${tone}`
      : `Made Script ${tone}`;
    const detail = hasMultipleScripts
      ? `Video ${concept} needs to be regenerated.`
      : "Video needs to be regenerated. Your hook and product are unchanged.";

    return {
      success: true,
      operation: {
        type: "MODIFY_NODE",
        targetNodeId: targetNode.id,
        configUpdates: {
          tone,
          style,
        },
        summary,
        detail,
        affectedDownstreamTypes: ["generateVideo"],
      },
      userMessage: `${summary}. ${detail}`,
    };
  }

  // ==========================================================================
  // PATTERN 5: MODIFY_NODE - Setting Change
  // e.g. "Change the setting for the second concept to a gym"
  // e.g. "Change setting to subway"
  // ==========================================================================
  if (p.includes("setting") || p.includes("gym") || p.includes("subway") || p.includes("studio") || p.includes("urban")) {
    const concept = resolveConceptId(p) || "B";
    let targetNode = findTargetNode(currentNodes, concept, "setting");
    if (!targetNode) {
      targetNode = currentNodes.find((n) => n.type === "setting") || null;
    }

    if (targetNode) {
      let settingKey = "gym";
      let label = "Gym";

      if (p.includes("subway") || p.includes("commute") || p.includes("urban")) {
        settingKey = "urban";
        label = "Subway Commute";
      } else if (p.includes("studio") || p.includes("minimal")) {
        settingKey = "studio";
        label = "Minimalist Studio";
      }

      const preset = SETTING_PRESETS[settingKey] || SETTING_PRESETS.gym || {
        lighting: "Bright Commercial Gym Lights",
        mood: "High Intensity Workout",
      };

      return {
        success: true,
        operation: {
          type: "MODIFY_NODE",
          targetNodeId: targetNode.id,
          configUpdates: {
            settingKey,
            lighting: preset.lighting,
            mood: preset.mood,
          },
          summary: `Changed Setting to ${label}`,
          detail: "Video needs to be regenerated. Your script and hook are unchanged.",
          affectedDownstreamTypes: ["generateImage", "generateVideo"],
        },
        userMessage: `Changed Setting to ${label}. Video needs to be regenerated. Your script and hook are unchanged.`,
      };
    }
  }

  return {
    success: false,
    error: "Unrecognized creative command",
    userMessage:
      'Try: "Create two UGC concepts" or "Change the hook to Before / After" or "Change the actor to Sarah".',
  };
}

function actorPresetLabel(key: string): string {
  if (key === "marcus") return "Marcus (Commuter)";
  if (key === "sarah") return "Sarah (Professional)";
  return "Maya (Coach)";
}
