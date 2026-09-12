/**
 * HexFlow Local Prototyping Store
 * 
 * Provides an in-memory/fallback store for workflows and runs so you can test
 * HexFlow immediately without configuring external Clerk or PostgreSQL credentials,
 * while automatically falling back gracefully.
 */

import { getCanonicalHexFlowNodes, getCanonicalHexFlowEdges } from "./initial-workflow";
import { 
  getWorkflowChangeActor, 
  getWorkflowExploreHooks, 
  getWorkflowVisualWorlds 
} from "./showcase-workflows";

export interface StoredWorkflow {
  id: string;
  name: string;
  userId: string;
  nodes: any;
  edges: any;
  createdAt: string;
  updatedAt: string;
  caseStudyCode?: string;
  caseStudySubtitle?: string;
}

export interface StoredRun {
  id: string;
  workflowId: string;
  userId: string;
  status: string;
  scope: string;
  duration: number;
  nodesState: any;
  createdAt: string;
}

class MemoryStore {
  private workflows: Map<string, StoredWorkflow> = new Map();
  private runs: Map<string, StoredRun[]> = new Map();

  constructor() {
    this.ensureShowcaseWorkflows();
  }

  private ensureShowcaseWorkflows() {
    const now = new Date().toISOString();

    // Clean up deprecated demo IDs if present
    const obsoleteIds = ["apex-visual-iteration", "lumina-multi-model"];
    for (const oldId of obsoleteIds) {
      this.workflows.delete(oldId);
    }

    // 01 / CHANGE: Swap the actor, keep the creative.
    const flow1 = getWorkflowChangeActor();
    const id1 = "demo-canonical-flow";
    this.workflows.set(id1, {
      id: id1,
      name: flow1.meta.caseStudyTitle,
      userId: "guest_creator",
      nodes: flow1.nodes,
      edges: flow1.edges,
      caseStudyCode: flow1.meta.caseStudyCode,
      caseStudySubtitle: flow1.meta.caseStudySubtitle,
      createdAt: this.workflows.get(id1)?.createdAt || now,
      updatedAt: now,
    });

    // 02 / EXPLORE: Which hook works better?
    const flow2 = getWorkflowExploreHooks();
    const id2 = "demo-explore-hooks";
    this.workflows.set(id2, {
      id: id2,
      name: flow2.meta.caseStudyTitle,
      userId: "guest_creator",
      nodes: flow2.nodes,
      edges: flow2.edges,
      caseStudyCode: flow2.meta.caseStudyCode,
      caseStudySubtitle: flow2.meta.caseStudySubtitle,
      createdAt: this.workflows.get(id2)?.createdAt || now,
      updatedAt: now,
    });

    // 03 / ITERATE: Same idea. Two visual worlds.
    const flow3 = getWorkflowVisualWorlds();
    const id3 = "demo-visual-worlds";
    this.workflows.set(id3, {
      id: id3,
      name: flow3.meta.caseStudyTitle,
      userId: "guest_creator",
      nodes: flow3.nodes,
      edges: flow3.edges,
      caseStudyCode: flow3.meta.caseStudyCode,
      caseStudySubtitle: flow3.meta.caseStudySubtitle,
      createdAt: this.workflows.get(id3)?.createdAt || now,
      updatedAt: now,
    });
  }

  listWorkflows(userId: string): StoredWorkflow[] {
    this.ensureShowcaseWorkflows();
    const list: StoredWorkflow[] = [];
    this.workflows.forEach((wf) => {
      if (wf.userId === userId || userId === "guest_creator") {
        list.push(wf);
      }
    });
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getWorkflow(id: string): StoredWorkflow | null {
    this.ensureShowcaseWorkflows();
    return this.workflows.get(id) || null;
  }

  createWorkflow(name: string, userId: string, nodes?: any, edges?: any): StoredWorkflow {
    const id = `flow-${Date.now()}`;
    const wf: StoredWorkflow = {
      id,
      name,
      userId,
      nodes: nodes || getCanonicalHexFlowNodes(),
      edges: edges || getCanonicalHexFlowEdges(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.workflows.set(id, wf);
    return wf;
  }

  updateWorkflow(id: string, updates: Partial<StoredWorkflow>): StoredWorkflow | null {
    const existing = this.workflows.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.workflows.set(id, updated);
    return updated;
  }

  deleteWorkflow(id: string): boolean {
    this.workflows.delete(id);
    this.runs.delete(id);
    return true;
  }

  listRuns(workflowId: string): StoredRun[] {
    return this.runs.get(workflowId) || [];
  }

  createRun(runData: Omit<StoredRun, "id" | "createdAt">): StoredRun {
    const id = `run-${Date.now()}`;
    const run: StoredRun = {
      ...runData,
      id,
      createdAt: new Date().toISOString(),
    };
    const list = this.runs.get(runData.workflowId) || [];
    list.unshift(run);
    this.runs.set(runData.workflowId, list);
    return run;
  }
}

const globalForStore = globalThis as unknown as { hexflowStore?: MemoryStore };
export const memoryStore = globalForStore.hexflowStore || new MemoryStore();
if (process.env.NODE_ENV !== "production") {
  globalForStore.hexflowStore = memoryStore;
}
