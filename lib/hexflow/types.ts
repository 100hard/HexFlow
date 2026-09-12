/**
 * HexFlow Core Semantic Types & Contracts
 * Reference: 02_NODE_SPEC.md & 03_EXECUTION_MODEL.md
 */

export type SemanticType =
  | "PRODUCT"
  | "HOOK"
  | "SCRIPT"
  | "ACTOR"
  | "SETTING"
  | "IMAGE"
  | "VIDEO";

export type NodeState =
  | "NOT_RUN"
  | "RUNNING"
  | "UP_TO_DATE"
  | "STALE"
  | "FAILED";

export type PortCardinality = "single";

export interface InputPort {
  id: string;
  label: string;
  type: SemanticType;
  required: boolean;
  cardinality: PortCardinality;
  role: "primary" | "context" | "creative_direction" | "visual_source";
}

export interface OutputPort {
  id: string;
  label: string;
  type: SemanticType;
}

// Semantic Data Payloads produced by nodes
export interface ProductOutput {
  type: "PRODUCT";
  id: string;
  name: string;
  description: string;
  sourceType: "URL" | "UPLOAD" | "EXISTING";
  imageUrl?: string;
  url?: string;
}

export interface HookOutput {
  type: "HOOK";
  id: string;
  category: string;
  text: string;
  tone: string;
}

export interface ScriptOutput {
  type: "SCRIPT";
  id: string;
  text: string;
  language: string;
  durationSeconds: number;
  tone: string;
  style: string;
}

export interface ActorOutput {
  type: "ACTOR";
  id: string;
  name: string;
  actorType: string;
  lookId: string;
  voiceId: string;
  imageUrl: string;
}

export interface SettingOutput {
  type: "SETTING";
  id: string;
  name: string;
  description: string;
  lighting: string;
  timeOfDay: string;
  mood: string;
}

export interface ImageOutput {
  type: "IMAGE";
  id: string;
  assetUrl: string;
  width: number;
  height: number;
  model: string;
  prompt?: string;
}

export interface VideoOutput {
  type: "VIDEO";
  id: string;
  assetUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  aspectRatio: string;
  resolution: string;
  model: string;
}

export interface ReviewOutput {
  type: "SCRIPT" | "VIDEO";
  approved: boolean;
  approvedAt?: string;
  script?: ScriptOutput;
  video?: VideoOutput;
  text?: string;
  durationSeconds?: number;
  tone?: string;
}

export type SemanticOutput =
  | ProductOutput
  | HookOutput
  | ScriptOutput
  | ActorOutput
  | SettingOutput
  | ImageOutput
  | VideoOutput
  | ReviewOutput;

// Common HexFlowNodeData shape embedded into React Flow node.data
export interface HexFlowNodeData {
  title?: string;
  state: NodeState;
  staleReason?: string;
  fingerprint?: string;
  outputData?: SemanticOutput | null;
  previousOutputData?: SemanticOutput | null;
  config: Record<string, any>;
  lastRunDuration?: number;
  error?: string;
  // Canvas interactive handlers
  onChange?: (newPartialData: Partial<HexFlowNodeData>) => void;
  onRunNode?: () => void;
  onDelete?: (nodeId: string) => void;
  isExecutingCanvas?: boolean;
}
