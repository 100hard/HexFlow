import { NextResponse } from "next/server";
import { Node, Edge } from "@xyflow/react";
import {
  resolveHexFlowAgentIntent,
  buildTwoConceptUGCWorkflow,
  findTargetNode,
  GraphOperation,
} from "@/lib/hexflow/agent-engine";
import {
  PRODUCT_PRESETS,
  HOOK_PRESETS,
  ACTOR_PRESETS,
  SETTING_PRESETS,
} from "@/lib/hexflow/mock-generators";
import { memoryStore } from "@/lib/hexflow/store";

export const dynamic = "force-dynamic";

interface AgentRequestBody {
  prompt: string;
  workflowId?: string;
  currentNodes?: Node[];
  currentEdges?: Edge[];
}

const SYSTEM_PROMPT = `You are the HexFlow Graph Agent ("Ask HexFlow").
You convert natural language creative and structural instructions into structured graph operations for a node-based generative video workflow.

Canvas Concepts & Nodes:
- Concept Lanes: Concept A (top lane, y=80) and Concept B (bottom lane, y=560). Shared assets (Product, Actor, Setting) sit centered between lanes at y=320.
- Node Types:
  1. "product": Brand/product context. Presets: "nike" (Nike Pegasus), "apex" (Apex ANC Headphones), "lumina" (Lumina Vitamin C Serum).
  2. "hook": Creative angle. Presets: "problem_solution", "pov", "before_after", "bold_claim", "social_proof", "spicy_reveal", "product_hit", or "custom".
  3. "script": Full video script. Config: { length: 15 | 30 | 45 | 60, tone: string, style: string }.
  4. "actor": Consistent talent/creator. Presets: "maya" (Casual Coach), "marcus" (Commuter), "sarah" (Professional).
  5. "setting": Visual environment. Presets: "gym" (Bright Gym), "urban" (Subway Commute), "studio" (Minimalist Studio).
  6. "generateImage": AI storyboards/keyframes.
  7. "generateVideo": Video synthesis. Config: { model: "Seedance 2.5" | "Kling 3.0 Turbo" | "Runway Gen-3", duration: number }.
  8. "review": Human approval checkpoint.

Strict Architectural Directives:
1. When asked to CREATE (e.g. "Create two UGC concepts...", "Set up an A/B test..."):
   - Return "CREATE_GRAPH".
   - Specify productKey, hookA (key, text, tone), hookB (key, text, tone), actorKey, settingKey, scriptATone, scriptBTone.
2. When asked to MODIFY (e.g. "Change the second hook to Before / After", "Make script B comedic", "Swap actor for Marcus"):
   - Return "MODIFY_NODE".
   - You MUST identify the target node from the user's canvas.
   - For Concept A: targetConceptId = "A". For Concept B: targetConceptId = "B".
   - Identify targetNodeType ("hook", "script", "actor", "setting", "generateVideo").
   - Provide configUpdates ONLY. NEVER modify outputData directly.
   - Specify affectedDownstreamTypes:
     - Modifying Hook affects ["script", "generateVideo"]
     - Modifying Script affects ["generateVideo"]
     - Modifying Actor affects ["generateVideo"]
     - Modifying Setting affects ["generateImage", "generateVideo"]
3. When asked to DELETE / REMOVE nodes (e.g. "Remove the second hook and script", "Delete lane B", "Simplify to one concept", "Remove the second hook entirely", "I only want one workflow"):
   - Return "DELETE_NODES".
   - Identify which conceptId lane is being removed: "A" or "B". Default to "B" if unclear.
   - List targetNodeIds: look at the canvas nodes provided and include IDs of nodes matching the requested types in that concept lane.
   - List targetEdgeIds: include all edge IDs that have source OR target matching any targetNodeId.
   - Do NOT delete shared nodes (product, actor, setting) unless user explicitly says so.
4. Output strictly valid JSON matching this schema:
{
  "operationType": "CREATE_GRAPH" | "MODIFY_NODE" | "DELETE_NODES",
  "summary": "Brief 1-sentence action summary",
  "detail": "Description of graph changes or downstream staleness",
  "createGraphOptions"?: {
    "productKey"?: "nike" | "apex" | "lumina",
    "hookA"?: {
      "key": string,
      "text"?: string,
      "tone"?: string
    },
    "hookB"?: {
      "key": string,
      "text"?: string,
      "tone"?: string
    },
    "actorKey"?: "maya" | "marcus" | "sarah",
    "settingKey"?: "gym" | "urban" | "studio",
    "scriptATone"?: string,
    "scriptAStyle"?: string,
    "scriptBTone"?: string,
    "scriptBStyle"?: string
  },
  "modifyNodeOptions"?: {
    "targetConceptId"?: "A" | "B" | null,
    "targetNodeType": "hook" | "script" | "actor" | "setting" | "generateVideo" | "product",
    "targetNodeId"?: string,
    "configUpdates": Record<string, any>,
    "affectedDownstreamTypes": string[]
  },
  "deleteNodeOptions"?: {
    "targetConceptId": "A" | "B",
    "targetNodeIds": string[],
    "targetEdgeIds": string[]
  },
  "userMessage": "Clear feedback string for the user"
}`;

async function callOpenAIWithFallback(
  apiKey: string,
  userMessage: string,
  contextData: any
): Promise<{ data: any; modelUsed: string }> {
  // Primary model requested by user: gpt-5-mini
  const primaryModel = process.env.OPENAI_MODEL || "gpt-5-mini";
  const fallbackModel = "gpt-4o-mini";

  const makeRequest = async (model: string) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `User Request: "${userMessage}"\n\nCurrent Canvas Context:\n${JSON.stringify(
              contextData,
              null,
              2
            )}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr: any = {};
      try {
        parsedErr = JSON.parse(errText);
      } catch (_) {}
      const errorMsg = parsedErr?.error?.message || errText;
      const errorCode = parsedErr?.error?.code || response.status;
      throw new Error(`OpenAI error [${model}] (${errorCode}): ${errorMsg}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`Empty response from OpenAI [${model}]`);
    }

    return JSON.parse(content);
  };

  try {
    const data = await makeRequest(primaryModel);
    return { data, modelUsed: primaryModel };
  } catch (err: any) {
    const msg = String(err?.message || "");
    // If gpt-5-mini is not available on this tier/account, gracefully fallback to gpt-4o-mini
    if (
      primaryModel !== fallbackModel &&
      (msg.includes("model_not_found") ||
        msg.includes("does not exist") ||
        msg.includes("404") ||
        msg.includes("unrecognized") ||
        msg.includes("not found"))
    ) {
      console.warn(
        `[HexFlow Agent] Primary model ${primaryModel} not found. Falling back to ${fallbackModel}...`
      );
      const data = await makeRequest(fallbackModel);
      return { data, modelUsed: fallbackModel };
    }
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const body: AgentRequestBody = await req.json();
    let { prompt, workflowId, currentNodes = [], currentEdges = [] } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Empty prompt provided." },
        { status: 400 }
      );
    }

    // If currentNodes is empty, attempt to hydrate from memoryStore
    if ((!currentNodes || currentNodes.length === 0) && workflowId) {
      const storedWf = memoryStore.getWorkflow(workflowId);
      if (storedWf && Array.isArray(storedWf.nodes) && storedWf.nodes.length > 0) {
        currentNodes = storedWf.nodes;
        currentEdges = storedWf.edges || [];
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key, fallback immediately to local deterministic intent parser
    if (!apiKey) {
      console.log("[HexFlow Agent] No OPENAI_API_KEY detected; using deterministic parser.");
      const localResult = resolveHexFlowAgentIntent(prompt, currentNodes, currentEdges);
      return NextResponse.json({
        ...localResult,
        source: "local-deterministic",
        model: "offline-rules",
      });
    }

    // Prepare lightweight context summary for the LLM
    const contextSummary = {
      nodes: currentNodes.map((n) => ({
        id: n.id,
        type: n.type,
        conceptId: (n.data as any)?.conceptId || null,
        config: (n.data as any)?.config || {},
        state: (n.data as any)?.state || "UP_TO_DATE",
      })),
      edgesCount: currentEdges.length,
    };

    let llmResponse: any;
    let modelUsed = "gpt-5-mini";

    try {
      const aiResult = await callOpenAIWithFallback(apiKey, prompt, contextSummary);
      llmResponse = aiResult.data;
      modelUsed = aiResult.modelUsed;
    } catch (aiErr: any) {
      console.warn("[HexFlow Agent] OpenAI call failed, falling back to local resolver:", aiErr.message);
      const localResult = resolveHexFlowAgentIntent(prompt, currentNodes, currentEdges);
      return NextResponse.json({
        ...localResult,
        source: "local-fallback",
        model: "fallback-rules",
        warning: aiErr.message,
      });
    }

    // Process structured LLM response
    if (llmResponse.operationType === "CREATE_GRAPH") {
      const opts = llmResponse.createGraphOptions || {};

      const hookAKey = opts.hookA?.key || "problem_solution";
      const hookBKey = opts.hookB?.key || "pov";
      const prodKey = opts.productKey || "nike";
      const actorKey = opts.actorKey || "maya";

      const graph = buildTwoConceptUGCWorkflow({
        hookA: hookAKey,
        hookAText: opts.hookA?.text,
        hookATone: opts.hookA?.tone,
        hookB: hookBKey,
        hookBText: opts.hookB?.text,
        hookBTone: opts.hookB?.tone,
        productKey: prodKey,
        actorKey,
        scriptATone: opts.scriptATone,
        scriptAStyle: opts.scriptAStyle,
        scriptBTone: opts.scriptBTone,
        scriptBStyle: opts.scriptBStyle,
      });

      const operation: GraphOperation = {
        type: "CREATE_GRAPH",
        nodes: graph.nodes,
        edges: graph.edges,
        summary: llmResponse.summary || "Created 2 creative directions",
        detail: llmResponse.detail || "Shared Product and Actor across both branches.",
        nodeSteps: [
          `Product (${PRODUCT_PRESETS[prodKey]?.name || "Product"})`,
          `Hook A (${HOOK_PRESETS[hookAKey]?.category || "Hook A"})`,
          `Script A (Concept A)`,
          `Hook B (${HOOK_PRESETS[hookBKey]?.category || "Hook B"})`,
          `Script B (Concept B)`,
          `Shared Actor (${ACTOR_PRESETS[actorKey]?.name || "Actor"})`,
          "Generate Video A",
          "Generate Video B",
        ],
      };

      return NextResponse.json({
        success: true,
        operation,
        userMessage: llmResponse.userMessage || operation.summary,
        source: "openai",
        model: modelUsed,
      });
    }

    if (llmResponse.operationType === "MODIFY_NODE") {
      const mod = llmResponse.modifyNodeOptions;
      if (!mod) {
        throw new Error("Missing modifyNodeOptions in LLM response");
      }

      // Locate target node
      let targetNode: Node | null = null;

      if (mod.targetNodeId) {
        targetNode = currentNodes.find((n) => n.id === mod.targetNodeId) || null;
      }

      if (!targetNode && mod.targetNodeType) {
        const concept = mod.targetConceptId || null;
        if (concept) {
          targetNode = findTargetNode(currentNodes, concept, mod.targetNodeType);
        } else {
          targetNode = currentNodes.find((n) => n.type === mod.targetNodeType) || null;
        }
      }

      if (!targetNode) {
        return NextResponse.json({
          success: false,
          error: `Could not find matching ${mod.targetNodeType || "target"} node on the canvas.`,
          userMessage: `Could not find a matching ${mod.targetNodeType || "node"} to update.`,
          source: "openai",
          model: modelUsed,
        });
      }

      // Ensure clean, punchy, value-focused feedback copy
      let cleanSummary = llmResponse.summary || `Updated ${targetNode.type}`;
      let cleanDetail = llmResponse.detail;

      const hasMultipleHooks = currentNodes.filter((n) => n.type === "hook").length > 1;
      const concept = (targetNode.data as any)?.conceptId || mod.targetConceptId;

      if (targetNode.type === "actor") {
        const actorKey = mod.configUpdates?.actorKey || mod.configUpdates?.key;
        const actorName = ACTOR_PRESETS[actorKey]?.name || "new talent";
        cleanSummary = `Changed Actor to ${actorName}`;
        cleanDetail = "Video needs to be regenerated. Your script and hook are unchanged.";
      } else if (targetNode.type === "hook") {
        if (!hasMultipleHooks) {
          cleanSummary = cleanSummary.replace(/Hook [AB]/gi, "Hook");
          cleanDetail = "Script and Video need to be regenerated. Your product is unchanged.";
        } else if (concept) {
          cleanDetail = `Script ${concept} and Video ${concept} need to be regenerated.`;
        }
      } else if (targetNode.type === "script") {
        if (!hasMultipleHooks) {
          cleanSummary = cleanSummary.replace(/Script [AB]/gi, "Script");
          cleanDetail = "Video needs to be regenerated. Your hook and product are unchanged.";
        } else if (concept) {
          cleanDetail = `Video ${concept} needs to be regenerated.`;
        }
      } else if (targetNode.type === "setting") {
        cleanDetail = "Video needs to be regenerated. Your script and hook are unchanged.";
      }

      const operation: GraphOperation = {
        type: "MODIFY_NODE",
        targetNodeId: targetNode.id,
        configUpdates: mod.configUpdates || {},
        summary: cleanSummary,
        detail: cleanDetail || "Downstream nodes need to be regenerated.",
        affectedDownstreamTypes: mod.affectedDownstreamTypes || ["generateVideo"],
      };

      return NextResponse.json({
        success: true,
        operation,
        userMessage: `${cleanSummary}. ${cleanDetail}`,
        source: "openai",
        model: modelUsed,
      });
    }

    if (llmResponse.operationType === "DELETE_NODES") {
      const del = llmResponse.deleteNodeOptions;

      // If LLM gave us explicit IDs, trust them. Otherwise fall through to local resolver.
      if (del && Array.isArray(del.targetNodeIds) && del.targetNodeIds.length > 0) {
        // Always include all edges that touch the deleted nodes (guard against LLM omissions)
        const nodeIdSet = new Set<string>(del.targetNodeIds);
        const edgeIds: string[] = Array.isArray(del.targetEdgeIds) ? [...del.targetEdgeIds] : [];
        const extraEdgeIds = currentEdges
          .filter((e) => nodeIdSet.has(e.source) || nodeIdSet.has(e.target))
          .map((e) => e.id)
          .filter((eid) => !edgeIds.includes(eid));
        const allEdgeIds = [...edgeIds, ...extraEdgeIds];

        const summary = llmResponse.summary || "Removed selected nodes";
        const detail  = llmResponse.detail  || "The remaining concept is fully cached.";

        const operation: GraphOperation = {
          type: "DELETE_NODES",
          targetNodeIds: del.targetNodeIds,
          targetEdgeIds: allEdgeIds,
          summary,
          detail,
        };

        return NextResponse.json({
          success: true,
          operation,
          userMessage: `${summary}. ${detail}`,
          source: "openai",
          model: modelUsed,
        });
      }

      // LLM didn't populate deleteNodeOptions — fall through to local resolver
    }

    // Default fallback if unhandled operationType
    const localResult = resolveHexFlowAgentIntent(prompt, currentNodes, currentEdges);
    return NextResponse.json({
      ...localResult,
      source: "local-fallback",
      model: "fallback-rules",
    });
  } catch (error: any) {
    console.error("[HexFlow Agent API] Error handling request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Agent Error",
        userMessage: "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}
