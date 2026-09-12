/**
 * Canonical HexFlow Starter Workflow
 * Demo 01 / CHANGE: Swap the actor, keep the creative.
 */

import { getWorkflowChangeActor } from "./showcase-workflows";

export function getCanonicalHexFlowNodes() {
  return getWorkflowChangeActor().nodes;
}

export function getCanonicalHexFlowEdges() {
  return getWorkflowChangeActor().edges;
}
