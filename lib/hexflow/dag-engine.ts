/**
 * HexFlow Selective DAG Engine & Execution Planner
 * Reference: 03_EXECUTION_MODEL.md
 */

import { HexFlowNodeData, NodeState } from "./types";
import { computeNodeFingerprint } from "./fingerprint";
import { NODE_CONTRACTS } from "./matrix";
import {
  generateScriptOutput,
  generateImageOutput,
  generateVideoOutput,
  PRODUCT_PRESETS,
  HOOK_PRESETS,
  ACTOR_PRESETS,
  SETTING_PRESETS,
} from "./mock-generators";

export interface GraphNode {
  id: string;
  type?: string;
  data: any;
  position?: { x: number; y: number };
  [key: string]: any;
}

export interface GraphEdge {
  id: string;
  source: string;
  sourceHandle?: string | null;
  target: string;
  targetHandle?: string | null;
}

/**
 * 1. Cycle Detection: Verify graph is a strict DAG
 */
export function hasCycle(nodes: GraphNode[], edges: GraphEdge[]): boolean {
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => adj.get(e.source)?.push(e.target));

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    inStack.add(nodeId);

    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (inStack.has(neighbor)) {
        return true;
      }
    }

    inStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }
  return false;
}

/**
 * 2. Resolve Incoming Inputs for a Node from Upstream Producers
 */
export function resolveNodeInputs(
  nodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[]
): Record<string, any> {
  const incomingEdges = edges.filter((e) => e.target === nodeId);
  const resolved: Record<string, any> = {};

  for (const edge of incomingEdges) {
    const handle = edge.targetHandle || "default";
    const sourceNode = nodes.find((n) => n.id === edge.source);
    if (sourceNode?.data?.outputData) {
      resolved[handle] = sourceNode.data.outputData;
    }
  }

  return resolved;
}

/**
 * 3. Validate Required Inputs for a Node
 */
export function validateNodeRequirements(
  node: GraphNode,
  resolvedInputs: Record<string, any>
): { valid: boolean; missing: string[] } {
  if (!node.type) return { valid: true, missing: [] };
  const contract = NODE_CONTRACTS[node.type];
  if (!contract) return { valid: true, missing: [] };

  const missing: string[] = [];
  for (const input of contract.inputs) {
    if (input.required && !resolvedInputs[input.id]) {
      missing.push(input.label);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * 4. Forward-Only Stale Propagation
 * Recursively marks all downstream descendants as STALE, keeping previous outputs visible.
 */
export function propagateStaleState<T extends GraphNode>(
  changedNodeId: string,
  reason: string,
  nodes: T[],
  edges: GraphEdge[]
): T[] {
  // Find all downstream nodes via BFS
  const descendants = new Set<string>();
  const queue = [changedNodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const outgoing = edges.filter((e) => e.source === current);
    for (const edge of outgoing) {
      if (!descendants.has(edge.target)) {
        descendants.add(edge.target);
        queue.push(edge.target);
      }
    }
  }

  return nodes.map((node) => {
    if (descendants.has(node.id)) {
      // If node is currently UP_TO_DATE or has output, mark STALE
      if (node.data.state === "UP_TO_DATE" || node.data.outputData) {
        return {
          ...node,
          data: {
            ...node.data,
            state: "STALE" as NodeState,
            staleReason: reason,
            previousOutputData: node.data.outputData || node.data.previousOutputData,
          },
        };
      }
    }
    return node;
  });
}

/**
 * 5. Execute Node Logic (High-Fidelity Generators)
 */
export async function executeSingleNodeLogic(
  node: GraphNode,
  resolvedInputs: Record<string, any>
): Promise<any> {
  const config = node.data.config || {};

  switch (node.type) {
    case "product": {
      const presetKey = config.preset || "nike";
      const preset = PRODUCT_PRESETS[presetKey] || PRODUCT_PRESETS.nike;
      return {
        ...preset,
        name: config.productName || preset.name,
        description: config.description || preset.description,
        imageUrl: config.imageUrl || preset.imageUrl,
        sourceType: config.sourceType || preset.sourceType,
      };
    }
    case "hook": {
      const hookKey = config.hookKey || "problem_solution";
      const preset = HOOK_PRESETS[hookKey] || HOOK_PRESETS.problem_solution;
      return {
        type: "HOOK",
        id: `hook-${Date.now()}`,
        category: preset.category,
        text: config.customHook || preset.text,
        tone: config.tone || preset.tone,
      };
    }
    case "script": {
      const product = resolvedInputs.product || null;
      const hook = resolvedInputs.hook || null;
      return generateScriptOutput(product, hook, config);
    }
    case "actor": {
      const actorKey = config.actorKey || "maya";
      const preset = ACTOR_PRESETS[actorKey] || ACTOR_PRESETS.maya;
      return {
        ...preset,
        lookId: config.lookId || preset.lookId,
      };
    }
    case "setting": {
      const settingKey = config.settingKey || "studio";
      const preset = SETTING_PRESETS[settingKey] || SETTING_PRESETS.studio;
      return {
        ...preset,
        lighting: config.lighting || preset.lighting,
        mood: config.mood || preset.mood,
      };
    }
    case "generateImage": {
      const product = resolvedInputs.product || null;
      const setting = resolvedInputs.setting || null;
      return generateImageOutput(product, setting, config);
    }
    case "generateVideo": {
      const scriptRaw = resolvedInputs.script || null;
      const script = scriptRaw?.script || scriptRaw;
      const product = resolvedInputs.product || null;
      const actor = resolvedInputs.actor || null;
      const setting = resolvedInputs.setting || null;
      return generateVideoOutput(script, product, actor, setting, config);
    }
    case "review": {
      const script = resolvedInputs.script;
      const video = resolvedInputs.video;
      if (script) {
        const base = script.script || script;
        return {
          ...base,
          type: "SCRIPT",
          approved: true,
          approvedAt: new Date().toISOString(),
        };
      }
      return {
        type: "VIDEO",
        approved: true,
        approvedAt: new Date().toISOString(),
        video: video || null,
      };
    }
    default:
      return null;
  }
}
