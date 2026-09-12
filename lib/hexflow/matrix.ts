/**
 * HexFlow Authoritative Connection Matrix & Port Contracts
 * Reference: 02_NODE_SPEC.md (Section 15, 16, 17)
 */

import { SemanticType, InputPort, OutputPort } from "./types";

export interface NodeContractDef {
  type: string;
  label: string;
  category: "Creative" | "Generate" | "Control";
  inputs: InputPort[];
  outputs: OutputPort[];
}

export const NODE_CONTRACTS: Record<string, NodeContractDef> = {
  product: {
    type: "product",
    label: "Product",
    category: "Creative",
    inputs: [],
    outputs: [
      { id: "product", label: "Product", type: "PRODUCT" },
    ],
  },
  hook: {
    type: "hook",
    label: "Hook",
    category: "Creative",
    inputs: [
      { id: "product", label: "Product", type: "PRODUCT", required: false, cardinality: "single", role: "context" },
    ],
    outputs: [
      { id: "hook", label: "Hook", type: "HOOK" },
    ],
  },
  script: {
    type: "script",
    label: "Script",
    category: "Creative",
    inputs: [
      { id: "product", label: "Product", type: "PRODUCT", required: true, cardinality: "single", role: "context" },
      { id: "hook", label: "Hook", type: "HOOK", required: false, cardinality: "single", role: "creative_direction" },
    ],
    outputs: [
      { id: "script", label: "Script", type: "SCRIPT" },
    ],
  },
  actor: {
    type: "actor",
    label: "Actor",
    category: "Creative",
    inputs: [],
    outputs: [
      { id: "actor", label: "Actor", type: "ACTOR" },
    ],
  },
  setting: {
    type: "setting",
    label: "Setting",
    category: "Creative",
    inputs: [
      { id: "product", label: "Product", type: "PRODUCT", required: false, cardinality: "single", role: "context" },
    ],
    outputs: [
      { id: "setting", label: "Setting", type: "SETTING" },
    ],
  },
  generateImage: {
    type: "generateImage",
    label: "Generate Image",
    category: "Generate",
    inputs: [
      { id: "product", label: "Product", type: "PRODUCT", required: false, cardinality: "single", role: "context" },
      { id: "setting", label: "Setting", type: "SETTING", required: false, cardinality: "single", role: "context" },
    ],
    outputs: [
      { id: "image", label: "Image", type: "IMAGE" },
    ],
  },
  generateVideo: {
    type: "generateVideo",
    label: "Generate Video",
    category: "Generate",
    inputs: [
      { id: "script", label: "Script", type: "SCRIPT", required: true, cardinality: "single", role: "primary" },
      { id: "product", label: "Product", type: "PRODUCT", required: false, cardinality: "single", role: "context" },
      { id: "actor", label: "Actor", type: "ACTOR", required: false, cardinality: "single", role: "context" },
      { id: "setting", label: "Setting", type: "SETTING", required: false, cardinality: "single", role: "context" },
      { id: "image", label: "Image", type: "IMAGE", required: false, cardinality: "single", role: "visual_source" },
    ],
    outputs: [
      { id: "video", label: "Video", type: "VIDEO" },
    ],
  },
  review: {
    type: "review",
    label: "Review / Approve",
    category: "Control",
    inputs: [
      { id: "script", label: "Script Draft", type: "SCRIPT", required: false, cardinality: "single", role: "primary" },
      { id: "video", label: "Video Candidate", type: "VIDEO", required: false, cardinality: "single", role: "primary" },
    ],
    outputs: [
      { id: "script", label: "Approved Script", type: "SCRIPT" },
      { id: "video", label: "Approved Video", type: "VIDEO" },
    ],
  },
};

/**
 * Authoritative Allowed Connections Table:
 * SourceType.outputPort -> TargetType.inputPort
 */
export const VALID_CONNECTIONS: Array<{
  sourceType: string;
  sourceHandle: string;
  targetType: string;
  targetHandle: string;
}> = [
  { sourceType: "product", sourceHandle: "product", targetType: "hook", targetHandle: "product" },
  { sourceType: "product", sourceHandle: "product", targetType: "script", targetHandle: "product" },
  { sourceType: "product", sourceHandle: "product", targetType: "setting", targetHandle: "product" },
  { sourceType: "product", sourceHandle: "product", targetType: "generateImage", targetHandle: "product" },
  { sourceType: "product", sourceHandle: "product", targetType: "generateVideo", targetHandle: "product" },
  { sourceType: "hook", sourceHandle: "hook", targetType: "script", targetHandle: "hook" },
  { sourceType: "script", sourceHandle: "script", targetType: "generateVideo", targetHandle: "script" },
  { sourceType: "script", sourceHandle: "script", targetType: "review", targetHandle: "script" },
  { sourceType: "review", sourceHandle: "script", targetType: "generateVideo", targetHandle: "script" },
  { sourceType: "actor", sourceHandle: "actor", targetType: "generateVideo", targetHandle: "actor" },
  { sourceType: "setting", sourceHandle: "setting", targetType: "generateImage", targetHandle: "setting" },
  { sourceType: "setting", sourceHandle: "setting", targetType: "generateVideo", targetHandle: "setting" },
  { sourceType: "generateImage", sourceHandle: "image", targetType: "generateVideo", targetHandle: "image" },
  { sourceType: "generateVideo", sourceHandle: "video", targetType: "review", targetHandle: "video" },
];

/**
 * Validates whether a connection is semantically legal and adheres to single-cardinality rules.
 */
export function isValidHexFlowConnection(
  connection: {
    source: string;
    sourceHandle?: string | null;
    target: string;
    targetHandle?: string | null;
  },
  nodes: Array<{ id: string; type?: string }>,
  edges: Array<{ source: string; target: string; targetHandle?: string | null }>
): { valid: boolean; reason?: string } {
  if (connection.source === connection.target) {
    return { valid: false, reason: "Self-connections are not allowed." };
  }

  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  if (!sourceNode?.type || !targetNode?.type) {
    return { valid: false, reason: "Unknown node type." };
  }

  const sType = sourceNode.type;
  const tType = targetNode.type;
  const sHandle = connection.sourceHandle || "";
  const tHandle = connection.targetHandle || "";

  // Check single cardinality: Does the target handle already have an incoming wire?
  const existingIncoming = edges.find(
    (e) => e.target === connection.target && e.targetHandle === tHandle
  );
  if (existingIncoming) {
    return { valid: false, reason: "Port already has an incoming connection (single cardinality)." };
  }

  // Check against Authoritative Connection Matrix
  const isMatch = VALID_CONNECTIONS.some(
    (c) =>
      c.sourceType === sType &&
      c.sourceHandle === sHandle &&
      c.targetType === tType &&
      c.targetHandle === tHandle
  );

  if (!isMatch) {
    // Helpful error messaging for explicitly prohibited connections
    if (sType === "actor" && tType === "script") {
      return { valid: false, reason: "Actor cannot connect to Script (Actor connects to Generate Video so script remains valid when actor changes)." };
    }
    if (sType === "setting" && tType === "script") {
      return { valid: false, reason: "Setting cannot connect to Script (Setting affects visuals in Generate Video or Generate Image)." };
    }
    return { valid: false, reason: `Invalid connection: ${sType}.${sHandle} cannot connect to ${tType}.${tHandle}` };
  }

  return { valid: true };
}

/**
 * Color mapping for handles & wires by semantic type
 */
export function getSemanticColor(type: SemanticType): string {
  switch (type) {
    case "PRODUCT":
      return "#c2410c"; // Warm Terracotta / Burnt Ochre
    case "HOOK":
      return "#b45309"; // Warm Amber Bronze
    case "SCRIPT":
      return "#047857"; // Deep Forest Emerald
    case "ACTOR":
      return "#6d28d9"; // Rich Royal Violet
    case "SETTING":
      return "#0f766e"; // Muted Deep Teal
    case "IMAGE":
      return "#2563eb"; // Classy Slate Indigo
    case "VIDEO":
      return "#be185d"; // Velvet Rose
    default:
      return "#64748b";
  }
}
