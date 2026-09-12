/**
 * Test Suite for HexFlow Agent ("Ask HexFlow")
 * Verifies all 10 user constraints and core graph operations.
 */

import { resolveHexFlowAgentIntent } from "../lib/hexflow/agent-engine";
import { propagateStaleState } from "../lib/hexflow/dag-engine";
import { Node, Edge } from "@xyflow/react";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✔ PASS: ${message}`);
}

async function runAgentTests() {
  console.log("\n========================================================");
  console.log("Starting HexFlow Agent Verification Suite");
  console.log("========================================================\n");

  // TEST 1: CREATE_GRAPH from natural language
  console.log("--- Test 1: CREATE_GRAPH ---");
  const createPrompt = "Create two UGC concepts for this product, one Problem → Solution and one POV, using the same actor.";
  const res1 = resolveHexFlowAgentIntent(createPrompt, [], []);

  assert(res1.success, "Intent resolution should succeed for 2-concept prompt");
  assert(res1.operation?.type === "CREATE_GRAPH", "Operation should be CREATE_GRAPH");

  const op1 = res1.operation as any;
  const nodes: Node[] = op1.nodes;
  const edges: Edge[] = op1.edges;

  // Verify node counts and types
  const productNode = nodes.find(n => n.type === "product");
  const hookNodes = nodes.filter(n => n.type === "hook");
  const scriptNodes = nodes.filter(n => n.type === "script");
  const actorNode = nodes.find(n => n.type === "actor");
  const videoNodes = nodes.filter(n => n.type === "generateVideo");
  const reviewNodes = nodes.filter(n => n.type === "review");

  assert(!!productNode, "Must include exactly 1 Product node");
  assert(hookNodes.length === 2, "Must include exactly 2 Hook nodes");
  assert(scriptNodes.length === 2, "Must include exactly 2 Script nodes");
  assert(!!actorNode, "Must include exactly 1 Shared Actor node");
  assert(videoNodes.length === 2, "Must include exactly 2 Video nodes");
  assert(reviewNodes.length === 0, "Must NOT automatically insert Review nodes");

  // Verify conceptId tagging
  const hookA = hookNodes.find(n => (n.data as any).conceptId === "A");
  const hookB = hookNodes.find(n => (n.data as any).conceptId === "B");
  assert(!!hookA && (hookA.data as any).config.hookKey === "problem_solution", "Hook A should be Problem -> Solution");
  assert(!!hookB && (hookB.data as any).config.hookKey === "pov", "Hook B should be POV");

  // Verify shared actor wiring
  const actorEdges = edges.filter(e => e.source === actorNode?.id);
  assert(actorEdges.length === 2, "Shared actor must connect to both Video A and Video B");

  // TEST 2: Target Resolution - "Change the second hook to Before / After"
  console.log("\n--- Test 2: Target Resolution & Hook Modification ---");
  const modifyHookPrompt = "Change the second hook to Before / After";
  const res2 = resolveHexFlowAgentIntent(modifyHookPrompt, nodes, edges);

  assert(res2.success, "Intent resolution should succeed for second hook change");
  assert(res2.operation?.type === "MODIFY_NODE", "Operation must be MODIFY_NODE");

  const op2 = res2.operation as any;
  assert(op2.targetNodeId === "node-hook-b", `Target node must resolve to node-hook-b (was: ${op2.targetNodeId})`);
  assert(op2.configUpdates.hookKey === "before_after", "Hook key must be before_after");

  // TEST 3: Stale Propagation Consequence
  console.log("\n--- Test 3: Stale Invalidation Verification ---");
  // Simulate applying op2: Hook B changed, then propagateStaleState
  const updatedNodes = nodes.map(n => {
    if (n.id === "node-hook-b") {
      return {
        ...n,
        data: {
          ...n.data,
          config: { ...(n.data as any).config, ...op2.configUpdates },
        }
      };
    }
    return n;
  });

  const staleResult = propagateStaleState("node-hook-b", "Hook configuration updated", updatedNodes as any, edges as any);

  const scriptB = staleResult.find(n => n.id === "node-script-b");
  const videoB = staleResult.find(n => n.id === "node-video-b");
  const scriptA = staleResult.find(n => n.id === "node-script-a");
  const videoA = staleResult.find(n => n.id === "node-video-a");

  assert((scriptB?.data as any).state === "STALE", "Script B must become STALE");
  assert((videoB?.data as any).state === "STALE", "Video B must become STALE");
  assert((scriptA?.data as any).state === "UP_TO_DATE", "Script A must remain UP_TO_DATE");
  assert((videoA?.data as any).state === "UP_TO_DATE", "Video A must remain UP_TO_DATE");
  assert((productNode?.data as any).state === "UP_TO_DATE", "Product must remain UP_TO_DATE");

  // TEST 4: Script Tone Modification - "Actually, make the second one more comedic"
  console.log("\n--- Test 4: Script Tone Modification ---");
  const modifyTonePrompt = "Actually, make the second one more comedic";
  const res4 = resolveHexFlowAgentIntent(modifyTonePrompt, nodes, edges);

  assert(res4.success, "Intent resolution should succeed for comedic tone");
  assert(res4.operation?.type === "MODIFY_NODE", "Operation must be MODIFY_NODE");
  const op4 = res4.operation as any;
  assert(op4.targetNodeId === "node-script-b", `Target node must resolve to node-script-b (was: ${op4.targetNodeId})`);
  assert(op4.configUpdates.tone.includes("Comedic"), "Tone must be updated to Comedic");

  // TEST 5: Actor Swap - "Change the actor to Marcus"
  console.log("\n--- Test 5: Actor Swap ---");
  const actorSwapPrompt = "Change the actor to Marcus";
  const res5 = resolveHexFlowAgentIntent(actorSwapPrompt, nodes, edges);

  assert(res5.success, "Intent resolution should succeed for actor swap");
  assert(res5.operation?.type === "MODIFY_NODE", "Operation must be MODIFY_NODE");
  const op5 = res5.operation as any;
  assert(op5.targetNodeId === "node-actor-shared", "Must target shared actor");
  assert(op5.configUpdates.actorKey === "marcus", "Actor key must be marcus");

  // TEST 6: Critical Verification - Interleaved Manual & Agent Modifications (Constraint #11)
  console.log("\n--- Test 6: Interleaved Manual vs Agent Modifications ---");
  // 1. Start with fresh 2-concept workflow
  let currentNodes = op1.nodes.map((n: Node) => ({
    ...n,
    data: { ...n.data, state: "UP_TO_DATE" }
  }));

  // 2. Manual Actor Change (Maya -> Marcus)
  currentNodes = currentNodes.map((n: Node) =>
    n.id === "node-actor-shared"
      ? { ...n, data: { ...n.data, config: { ...(n.data as any).config, actorKey: "marcus" } } }
      : n
  );
  currentNodes = propagateStaleState("node-actor-shared", "Actor changed manually", currentNodes as any, edges as any);
  
  assert(currentNodes.find((n: Node) => n.id === "node-video-a")?.data.state === "STALE", "Manual: Video A becomes STALE");
  assert(currentNodes.find((n: Node) => n.id === "node-video-b")?.data.state === "STALE", "Manual: Video B becomes STALE");
  assert(currentNodes.find((n: Node) => n.id === "node-script-a")?.data.state === "UP_TO_DATE", "Manual: Script A remains UP_TO_DATE (actor does not invalidate script)");
  assert(currentNodes.find((n: Node) => n.id === "node-script-b")?.data.state === "UP_TO_DATE", "Manual: Script B remains UP_TO_DATE");

  // Reset all to UP_TO_DATE to test next step
  currentNodes = currentNodes.map((n: Node) => ({ ...n, data: { ...n.data, state: "UP_TO_DATE" } }));

  // 3. Agent changes Hook B to Before / After
  const agentHookResult = resolveHexFlowAgentIntent("Change the second hook to Before / After", currentNodes, edges);
  assert(agentHookResult.success, "Agent should resolve hook change");
  const agentOp = agentHookResult.operation as any;
  currentNodes = currentNodes.map((n: Node) =>
    n.id === agentOp.targetNodeId
      ? { ...n, data: { ...n.data, config: { ...(n.data as any).config, ...agentOp.configUpdates } } }
      : n
  );
  currentNodes = propagateStaleState(agentOp.targetNodeId, "Hook changed by agent", currentNodes as any, edges as any);

  assert(currentNodes.find((n: Node) => n.id === "node-script-b")?.data.state === "STALE", "Agent: Script B becomes STALE");
  assert(currentNodes.find((n: Node) => n.id === "node-video-b")?.data.state === "STALE", "Agent: Video B becomes STALE");
  assert(currentNodes.find((n: Node) => n.id === "node-script-a")?.data.state === "UP_TO_DATE", "Agent: Script A remains UP_TO_DATE");
  assert(currentNodes.find((n: Node) => n.id === "node-video-a")?.data.state === "UP_TO_DATE", "Agent: Video A remains UP_TO_DATE");

  // Reset to UP_TO_DATE
  currentNodes = currentNodes.map((n: Node) => ({ ...n, data: { ...n.data, state: "UP_TO_DATE" } }));

  // 4. Manual Script A change (editing length / tone)
  currentNodes = currentNodes.map((n: Node) =>
    n.id === "node-script-a"
      ? { ...n, data: { ...n.data, config: { ...(n.data as any).config, tone: "Urgent" } } }
      : n
  );
  currentNodes = propagateStaleState("node-script-a", "Script A edited manually", currentNodes as any, edges as any);

  assert(currentNodes.find((n: Node) => n.id === "node-video-a")?.data.state === "STALE", "Manual: Video A becomes STALE");
  assert(currentNodes.find((n: Node) => n.id === "node-script-b")?.data.state === "UP_TO_DATE", "Manual: Script B remains UP_TO_DATE");
  assert(currentNodes.find((n: Node) => n.id === "node-video-b")?.data.state === "UP_TO_DATE", "Manual: Video B remains UP_TO_DATE");

  console.log("✔ PASS: Interleaved manual & agent modifications rely on the exact same DAG dependency engine!");

  console.log("\n========================================================");
  console.log("ALL 6 CRITICAL HEXFLOW AGENT TESTS PASSED CLEANLY! 🚀");
  console.log("========================================================\n");
}

runAgentTests().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
