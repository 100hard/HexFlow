"use client";

import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  addEdge,
  useReactFlow,
  useViewport,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type Node,
  type Connection,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  Play,
  Loader2,
  Cloud,
  Check,
  Undo2,
  Redo2,
  Download,
  Upload,
  History,
  Map,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ZoomOut,
  ZoomIn,
  Maximize2,
  LayoutGrid,
  Move,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useEffect, useState } from "react";

// HexFlow Nodes & Engine
import {
  ProductNode,
  HookNode,
  ScriptNode,
  ActorNode,
  SettingNode,
  GenerateImageNode,
  GenerateVideoNode,
  ReviewNode,
} from "@/components/canvas/nodes/hexflow";
import { AddNodeBar } from "@/components/canvas/add-node-bar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  isValidHexFlowConnection,
  getSemanticColor,
  NODE_CONTRACTS,
} from "@/lib/hexflow/matrix";
import {
  propagateStaleState,
  resolveNodeInputs,
  validateNodeRequirements,
  executeSingleNodeLogic,
  GraphNode,
  GraphEdge,
} from "@/lib/hexflow/dag-engine";
import { computeNodeFingerprint } from "@/lib/hexflow/fingerprint";
import {
  getCanonicalHexFlowNodes,
  getCanonicalHexFlowEdges,
} from "@/lib/hexflow/initial-workflow";
import { AgentCommandBar } from "@/components/canvas/agent-command-bar";
import { GraphOperation } from "@/lib/hexflow/agent-engine";
import { HOOK_PRESETS, ACTOR_PRESETS, SETTING_PRESETS } from "@/lib/hexflow/mock-generators";

export default function WorkflowCanvasPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [workflowName, setWorkflowName] = useState("HexFlow Studio");
  const [caseStudy, setCaseStudy] = useState<{ code: string; subtitle: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");

  // Execution History & Runs state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ui" | "api">("ui");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  // Execution tracking states
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingNodeIds, setExecutingNodeIds] = useState<string[]>([]);
  const [isMinimapOpen, setIsMinimapOpen] = useState(false);

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [rfInstance, setRfInstance] = useState<any>(null);

  // Undo/Redo canvas history stacks
  const [past, setPast] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const [future, setFuture] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);

  const takeSnapshot = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    setPast((prev) => {
      const snapshot = {
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        edges: JSON.parse(JSON.stringify(currentEdges)),
      };
      const nextPast = [...prev, snapshot];
      if (nextPast.length > 30) nextPast.shift();
      return nextPast;
    });
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setPast(newPast);
    setFuture((prev) => [
      { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) },
      ...prev,
    ]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
  }, [past, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setFuture(newFuture);
    setPast((prev) => [
      ...prev,
      { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) },
    ]);
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [future, nodes, edges, setNodes, setEdges]);

  // 1. Fetch live database workflow on mount
  useEffect(() => {
    const loadWorkflow = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/workflows/${id}`);
        if (response.ok) {
          const data = await response.json();
          setWorkflowName(data.name || "HexFlow Studio");

          // Case study tagging
          let code = data.caseStudyCode;
          let subtitle = data.caseStudySubtitle;
          if (!code) {
            if (id === "demo-canonical-flow" || id === "demo-change-actor") {
              code = "01 / CHANGE";
              subtitle = "Change one creative decision without starting over.";
            } else if (id === "demo-explore-hooks") {
              code = "02 / EXPLORE";
              subtitle = "Explore two openings without rebuilding the campaign.";
            } else if (id === "demo-visual-worlds" || id === "apex-visual-iteration") {
              code = "03 / ITERATE";
              subtitle = "Keep the voice and message. Explore different aesthetic settings.";
            }
          }
          if (code) {
            setCaseStudy({ code, subtitle: subtitle || "" });
          }

          // If workflow nodes are empty or legacy, populate canonical starter workflow
          const rawNodes = data.nodes || [];
          const isLegacy = rawNodes.some((n: any) => n.type === "requestInputs" || n.type === "cropImage");

          if (rawNodes.length === 0 || isLegacy) {
            setNodes(getCanonicalHexFlowNodes());
            setEdges(getCanonicalHexFlowEdges());
          } else {
            setNodes(rawNodes);
            if (data.edges) {
              const mappedEdges = data.edges.map((edge: any) => ({
                ...edge,
                type: "button",
              }));
              setEdges(mappedEdges);
            }
          }
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error loading workflow:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflow();
  }, [id, router, setNodes, setEdges]);

  // 2. Debounced Auto-Saving
  const saveWorkflowState = useCallback(
    async (currentNodes: Node[], currentEdges: Edge[], currentName?: string) => {
      if (loading) return;
      setSavingState("saving");

      try {
        const payload: any = {
          nodes: currentNodes,
          edges: currentEdges,
        };
        if (currentName) payload.name = currentName;

        const response = await fetch(`/api/workflows/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setSavingState("saved");
          setTimeout(() => setSavingState("idle"), 2000);
        } else {
          setSavingState("idle");
        }
      } catch (err) {
        console.error("Auto-save error:", err);
        setSavingState("idle");
      }
    },
    [loading, id]
  );

  useEffect(() => {
    if (loading || nodes.length === 0) return;
    const handler = setTimeout(() => {
      saveWorkflowState(nodes, edges, workflowName);
    }, 1500);
    return () => clearTimeout(handler);
  }, [nodes, edges, loading, saveWorkflowState, workflowName]);

  // 3. Fetch Runs History
  const fetchRuns = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/workflows/${id}/runs`);
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch (err) {
      console.error("Failed to fetch run logs:", err);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchRuns();
  }, [id, fetchRuns]);

  // 4. Node Data Change with Real-Time Forward Stale Propagation
  const onNodeDataChange = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((currentNodes) => {
        const targetNode = currentNodes.find((n) => n.id === nodeId);
        const nodeTitle = targetNode?.type ? (NODE_CONTRACTS[targetNode.type]?.label || targetNode.type) : "Node";

        // Update target node data
        const updatedTargetNodes = currentNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            };
          }
          return node;
        });

        // Forward-only stale propagation across outgoing edges
        const reason = `${nodeTitle} configuration updated`;
        return propagateStaleState(
          nodeId,
          reason,
          updatedTargetNodes as unknown as GraphNode[],
          edges as unknown as GraphEdge[]
        ) as unknown as Node[];
      });
    },
    [setNodes, edges]
  );

  // 5. Node Deletion Handler
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      takeSnapshot(nodes, edges);
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges, nodes, edges, takeSnapshot]
  );

  // 6. Strict Semantic Connection Validation
  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const check = isValidHexFlowConnection(
        connection as any,
        nodes as any,
        edges as any
      );
      if (!check.valid && check.reason) {
        // Subtle non-intrusive console diagnostic
        console.warn("[HexFlow Connection Blocked]:", check.reason);
      }
      return check.valid;
    },
    [nodes, edges]
  );

  // 7. On Connect Handler with Dynamic Color-Coded Wires
  const onConnect = useCallback(
    (connection: Connection) => {
      takeSnapshot(nodes, edges);
      const targetNode = nodes.find((n) => n.id === connection.target);
      const contract = targetNode?.type ? NODE_CONTRACTS[targetNode.type] : null;
      const inputDef = contract?.inputs.find((i) => i.id === connection.targetHandle);
      const strokeColor = inputDef ? getSemanticColor(inputDef.type) : "#6366f1";

      const newEdge: Edge = {
        ...connection,
        id: `edge-${Date.now()}`,
        type: "button",
        style: { stroke: strokeColor, strokeWidth: 1.75 },
      };

      setEdges((eds) => addEdge(newEdge, eds));

      // Connecting an input to target node marks target and its descendants STALE
      if (connection.target) {
        setNodes((nds) =>
          propagateStaleState(
            connection.target,
            "Input wire connected",
            nds as unknown as GraphNode[],
            [...edges, newEdge] as unknown as GraphEdge[]
          ) as unknown as Node[]
        );
      }
    },
    [nodes, edges, setEdges, setNodes, takeSnapshot]
  );

  // 8. Add Node from Catalog Dock
  const handleAddNode = useCallback(
    (type: string) => {
      takeSnapshot(nodes, edges);
      const newId = `node-${type}-${Date.now()}`;
      const randomOffset = Math.floor(Math.random() * 40) - 20;

      const newNode: Node = {
        id: newId,
        type,
        position: { x: 700 + randomOffset, y: 250 + randomOffset },
        data: {
          state: "NOT_RUN",
          config: {},
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, edges, setNodes, takeSnapshot]
  );

  // 9. Agent Graph Operations Handler ("Ask HexFlow")
  const applyGraphOperation = useCallback(
    async (operation: GraphOperation) => {
      // Record in history stack for Undo/Redo
      takeSnapshot(nodes, edges);

      if (operation.type === "CREATE_GRAPH") {
        setNodes(operation.nodes);
        setEdges(operation.edges);
        // Automatically fit graph to view smoothly
        setTimeout(() => {
          rfInstance?.fitView({ padding: 0.22, duration: 400 });
        }, 120);
      } else if (operation.type === "MODIFY_NODE") {
        const targetId = operation.targetNodeId;
        const targetNode = nodes.find((n) => n.id === targetId);
        if (!targetNode) return;

        // Apply config updates strictly
        const existingConfig = targetNode.data.config || {};
        const newConfig = { ...existingConfig, ...operation.configUpdates };

        // For creative decision nodes (Hook, Actor, Setting), derive the updated display preset output from the new config
        let updatedOutputData = targetNode.data.outputData;
        if (targetNode.type === "hook") {
          const hookKey = operation.configUpdates.hookKey || operation.configUpdates.key || (existingConfig as any)?.hookKey || "before_after";
          const preset = HOOK_PRESETS[hookKey] || HOOK_PRESETS.before_after;
          const text = operation.configUpdates.text || operation.configUpdates.customHook || preset.text;
          const tone = operation.configUpdates.tone || preset.tone;
          const category = operation.configUpdates.category || preset.category;
          updatedOutputData = {
            type: "HOOK",
            id: `hook-${Date.now()}`,
            category,
            text,
            tone,
          };
        } else if (targetNode.type === "actor" && (operation.configUpdates.actorKey || operation.configUpdates.key)) {
          const actorKey = operation.configUpdates.actorKey || operation.configUpdates.key;
          const preset = ACTOR_PRESETS[actorKey] || ACTOR_PRESETS.marcus;
          updatedOutputData = {
            ...preset,
            lookId: operation.configUpdates.lookId || preset.lookId,
          };
        } else if (targetNode.type === "setting" && (operation.configUpdates.settingKey || operation.configUpdates.key)) {
          const settingKey = operation.configUpdates.settingKey || operation.configUpdates.key;
          const preset = SETTING_PRESETS[settingKey] || SETTING_PRESETS.gym;
          updatedOutputData = {
            ...preset,
            lighting: operation.configUpdates.lighting || preset.lighting,
            mood: operation.configUpdates.mood || preset.mood,
          };
        }

        // Apply change and invoke propagateStaleState - identical to manual UI edits!
        onNodeDataChange(targetId, {
          config: newConfig,
          outputData: updatedOutputData,
        });
      } else if (operation.type === "DELETE_NODES") {
        const nodeIdsToRemove = new Set(operation.targetNodeIds);
        const edgeIdsToRemove = new Set(operation.targetEdgeIds);

        setNodes((prev) => prev.filter((n) => !nodeIdsToRemove.has(n.id)));
        setEdges((prev) => prev.filter((e) => !edgeIdsToRemove.has(e.id)));

        // Fit remaining canvas into view after deletion
        setTimeout(() => {
          rfInstance?.fitView({ padding: 0.22, duration: 400 });
        }, 120);
      }
    },
    [nodes, edges, takeSnapshot, setNodes, setEdges, rfInstance, onNodeDataChange]
  );

  // 10. Single Node Isolated Execution
  const handleExecuteSingleNode = useCallback(
    async (nodeId: string) => {
      if (isExecuting) return;
      const targetNode = nodes.find((n) => n.id === nodeId);
      if (!targetNode) return;

      const resolvedInputs = resolveNodeInputs(nodeId, nodes as GraphNode[], edges as GraphEdge[]);
      const reqCheck = validateNodeRequirements(targetNode as GraphNode, resolvedInputs);

      if (!reqCheck.valid) {
        alert(`Cannot run ${targetNode.type}: Missing required input(s): ${reqCheck.missing.join(", ")}`);
        return;
      }

      setIsExecuting(true);
      setExecutingNodeIds([nodeId]);
      const startTime = Date.now();

      try {
        // Snappy, realistic generation pulse (900ms)
        await new Promise((resolve) => setTimeout(resolve, 900));

        const outputResult = await executeSingleNodeLogic(targetNode as GraphNode, resolvedInputs);
        const fingerprint = computeNodeFingerprint(targetNode.type, targetNode.data.config || {}, resolvedInputs);

        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === nodeId) {
              return {
                ...n,
                data: {
                  ...n.data,
                  state: "UP_TO_DATE",
                  staleReason: undefined,
                  outputData: outputResult,
                  previousOutputData: undefined,
                  fingerprint,
                  lastRunDuration: (Date.now() - startTime) / 1000,
                },
              };
            }
            return n;
          })
        );

        const duration = (Date.now() - startTime) / 1000;
        await fetch(`/api/workflows/${id}/runs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "SUCCESS",
            scope: "SINGLE",
            duration,
            nodesState: {
              [nodeId]: {
                name: (targetNode.type && NODE_CONTRACTS[targetNode.type]?.label) || targetNode.type || "node",
                status: "SUCCESS",
                duration,
                inputs: resolvedInputs,
                outputs: outputResult,
              },
            },
          }),
        });

        await fetchRuns();
      } catch (err) {
        console.error("Single node execution failed:", err);
      } finally {
        setIsExecuting(false);
        setExecutingNodeIds([]);
      }
    },
    [id, isExecuting, nodes, edges, fetchRuns, setNodes]
  );

  // 10. SELECTIVE EXECUTION ENGINE (The Core "Bring Workflow Up To Date" Runner)
  const handleExecuteWorkflow = useCallback(async () => {
    if (isExecuting || nodes.length === 0) return;

    setIsExecuting(true);
    const startTime = Date.now();

    try {
      // 1. Identify which nodes need running vs which are UP_TO_DATE (Reused)
      const nodesNeedingRun: GraphNode[] = [];
      const reusedNodes: GraphNode[] = [];

      nodes.forEach((node) => {
        const state = (node.data as any)?.state;
        if (state === "UP_TO_DATE" && (node.data as any)?.outputData) {
          reusedNodes.push(node as GraphNode);
        } else {
          nodesNeedingRun.push(node as GraphNode);
        }
      });

      if (nodesNeedingRun.length === 0) {
        alert("All nodes are already up to date! Reusing cached outputs.");
        setIsExecuting(false);
        return;
      }

      // 2. Prepare execution promise coordination
      const nodePromises: Record<string, Promise<void>> = {};
      const nodeResolvers: Record<string, () => void> = {};

      nodes.forEach((node) => {
        nodePromises[node.id] = new Promise<void>((resolve) => {
          nodeResolvers[node.id] = resolve;
        });
      });

      // Immediately resolve all UP_TO_DATE nodes (they are reused instantly)
      reusedNodes.forEach((node) => {
        nodeResolvers[node.id]();
      });

      const auditNodeStates: Record<string, any> = {};

      // Record reused nodes in audit trail
      reusedNodes.forEach((n) => {
        auditNodeStates[n.id] = {
          name: (n.type && NODE_CONTRACTS[n.type]?.label) || n.type || "node",
          status: "REUSED",
          duration: 0,
          outputs: n.data.outputData,
          message: "Inputs unchanged; cached output reused",
        };
      });

      // 3. Execution worker for nodes requiring execution
      const runNodeTask = async (nodeId: string) => {
        const targetNode = nodes.find((n) => n.id === nodeId);
        if (!targetNode) return;

        // Wait for all immediate parent dependencies to finish
        const incomingEdges = edges.filter((e) => e.target === nodeId);
        const parentPromises = incomingEdges.map((e) => nodePromises[e.source]);
        await Promise.all(parentPromises);

        // Turn on active loader & glow highlight
        setExecutingNodeIds((prev) => [...prev, nodeId]);

        // Snappy realistic execution delays (600ms - 1200ms)
        const delay = targetNode.type === "generateVideo" ? 1400 : targetNode.type === "generateImage" ? 900 : 600;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Read resolved inputs freshly from current state
        let currentResolvedInputs: Record<string, any> = {};
        setNodes((latestNodes) => {
          currentResolvedInputs = resolveNodeInputs(nodeId, latestNodes as GraphNode[], edges as GraphEdge[]);
          return latestNodes;
        });

        // Compute output
        const outputResult = await executeSingleNodeLogic(targetNode as GraphNode, currentResolvedInputs);
        const fingerprint = computeNodeFingerprint(targetNode.type, targetNode.data.config || {}, currentResolvedInputs);

        // Commit newly computed output & set node state UP_TO_DATE
        setNodes((latestNodes) =>
          latestNodes.map((n) => {
            if (n.id === nodeId) {
              return {
                ...n,
                data: {
                  ...n.data,
                  state: "UP_TO_DATE",
                  staleReason: undefined,
                  outputData: outputResult,
                  previousOutputData: undefined,
                  fingerprint,
                  lastRunDuration: delay / 1000,
                },
              };
            }
            return n;
          })
        );

        auditNodeStates[nodeId] = {
          name: (targetNode.type && NODE_CONTRACTS[targetNode.type]?.label) || targetNode.type || "node",
          status: "REGENERATED",
          duration: delay / 1000,
          inputs: currentResolvedInputs,
          outputs: outputResult,
        };

        // Turn off loader for this node and unblock downstream dependents
        setExecutingNodeIds((prev) => prev.filter((id) => id !== nodeId));
        nodeResolvers[nodeId]();
      };

      // 4. Fire all tasks concurrently — dependencies automatically coordinate via Promise.all
      const executionTasks = nodesNeedingRun.map((node) => runNodeTask(node.id));
      await Promise.all(executionTasks);

      const totalDuration = (Date.now() - startTime) / 1000;

      // 5. Persist run record to PostgreSQL database
      const res = await fetch(`/api/workflows/${id}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SUCCESS",
          scope: reusedNodes.length > 0 ? "PARTIAL" : "FULL",
          duration: totalDuration,
          nodesState: auditNodeStates,
        }),
      });

      if (res.ok) {
        await fetchRuns();
        setIsHistoryOpen(true);
      }
    } catch (err) {
      console.error("Selective workflow run error:", err);
    } finally {
      setIsExecuting(false);
      setExecutingNodeIds([]);
    }
  }, [id, isExecuting, nodes, edges, fetchRuns, setNodes]);

  // Dynamic injection of interactive handlers into nodes
  const nodesWithHandlers = useMemo(() => {
    return nodes.map((node) => {
      const isNodeExecuting = executingNodeIds.includes(node.id);
      return {
        ...node,
        data: {
          ...node.data,
          onChange: (newData: any) => onNodeDataChange(node.id, newData),
          onRunNode: () => handleExecuteSingleNode(node.id),
          onDelete: () => handleDeleteNode(node.id),
          state: isNodeExecuting ? "RUNNING" : (node.data as any)?.state || "NOT_RUN",
          isExecutingCanvas: isExecuting,
        },
      };
    });
  }, [nodes, executingNodeIds, isExecuting, onNodeDataChange, handleExecuteSingleNode, handleDeleteNode]);

  // Register all 8 HexFlow Node Templates
  const nodeTypes = useMemo(
    () => ({
      product: ProductNode,
      hook: HookNode,
      script: ScriptNode,
      actor: ActorNode,
      setting: SettingNode,
      generateImage: GenerateImageNode,
      generateVideo: GenerateVideoNode,
      review: ReviewNode,
      // Legacy backwards-compatibility
      requestInputs: ProductNode,
      gemini: ScriptNode,
      cropImage: SettingNode,
      response: ReviewNode,
    }),
    []
  );

  const edgeTypes = useMemo(() => ({ button: ButtonEdge }), []);

  // Filtered runs for history sidebar
  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      if (statusFilter === "ALL") return true;
      return run.status === statusFilter;
    });
  }, [runs, statusFilter]);

  if (loading) {
    return (
      <div style={{ display: "flex", width: "100vw", height: "100vh", alignItems: "center", justifyContent: "center", background: "#fcfcfc" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <span style={{ fontSize: "14px", color: "#6b7280" }}>Initializing HexFlow Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#fafafa", overflow: "hidden", position: "relative" }}>
      <AppSidebar />

      <div style={{ marginLeft: "240px", width: "calc(100vw - 240px)", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Workspace Canvas Header */}
        <header
          style={{
            height: "56px",
            borderBottom: "1px solid #f1f5f9",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            zIndex: 30,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Left Side: Back button and Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#475569",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              className="hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
            </Link>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {caseStudy?.code && (
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 800,
                      color: "#15803d",
                      background: "#dcfce7",
                      padding: "2px 7px",
                      borderRadius: "6px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {caseStudy.code}
                  </span>
                )}
                <span style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f172a" }}>
                  {workflowName}
                </span>

                {/* Cloud Sync State */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#94a3b8", marginLeft: 8 }}>
                  {savingState === "saving" ? (
                    <>
                      <Loader2 size={12} className="animate-spin text-emerald-600" />
                      <span>Saving...</span>
                    </>
                  ) : savingState === "saved" ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span className="text-emerald-700">Saved</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={12} />
                      <span>Cloud synced</span>
                    </>
                  )}
                </div>
              </div>

              {caseStudy?.subtitle && (
                <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 450 }}>
                  {caseStudy.subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Right Side: Workspace Badge & Primary Run Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Workspace pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 8, borderRight: "1px solid #f1f5f9" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#16a34a",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                S
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>
                Sauhard&apos;s Workspace
              </span>
            </div>

            {/* Bring Up To Date Primary Run Button */}
            <button
              onClick={handleExecuteWorkflow}
              disabled={isExecuting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 18px",
                height: "34px",
                borderRadius: "8px",
                border: 0,
                background: isExecuting ? "#86efac" : "#16a34a",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: isExecuting ? "not-allowed" : "pointer",
                boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)",
                transition: "all 0.15s ease",
              }}
              className={!isExecuting ? "hover:bg-emerald-700" : ""}
            >
              {isExecuting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Updating Workflow...</span>
                </>
              ) : (
                <>
                  <Play size={13} fill="#ffffff" />
                  <span>Run (Bring Up To Date)</span>
                </>
              )}
            </button>

            {/* Execution History Button */}
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              style={{
                display: "inline-flex",
                width: "34px",
                height: "34px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: isHistoryOpen ? "#f1f5f9" : "#ffffff",
                color: "#334155",
                cursor: "pointer",
              }}
              title="Execution History"
              className="hover:bg-slate-50"
            >
              <History size={16} />
            </button>
          </div>
        </header>

        {/* Main React Flow Canvas */}
        <main style={{ flex: 1, display: "flex", flexDirection: "row", position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          <div style={{ flex: 1, height: "100%", position: "relative", background: "#f8f9fa" }}>
            {/* Top-Floating Agent Command Bar ("Ask HexFlow") */}
            <AgentCommandBar
              currentNodes={nodes}
              currentEdges={edges}
              onApplyOperation={applyGraphOperation}
              isExecuting={isExecuting}
            />

            <ReactFlow
              onInit={setRfInstance}
              nodes={nodesWithHandlers}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView={false}
              defaultViewport={{ x: 60, y: 80, zoom: 0.65 }}
              minZoom={0.2}
              maxZoom={1.5}
              nodesDraggable={true}
              panOnDrag={true}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#cbd5e1" />

              <CustomCanvasControls
                undo={undo}
                redo={redo}
                canUndo={past.length > 0}
                canRedo={future.length > 0}
              />

              {/* Minimap toggle button */}
              {!isMinimapOpen ? (
                <button
                  type="button"
                  onClick={() => setIsMinimapOpen(true)}
                  className="nodrag"
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#475569",
                    cursor: "pointer",
                    zIndex: 100,
                  }}
                  title="Open Minimap"
                >
                  <Map size={18} />
                </button>
              ) : (
                <div style={{ position: "absolute", bottom: "20px", right: "20px", zIndex: 100 }}>
                  <div style={{ position: "relative" }}>
                    <MiniMap
                      style={{
                        border: 0,
                        borderRadius: "12px",
                        background: "#0f172a",
                        width: "200px",
                        height: "135px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                        margin: 0,
                      }}
                      nodeColor={(node) => {
                        switch (node.type) {
                          case "product":
                            return "#f97316";
                          case "hook":
                            return "#eab308";
                          case "script":
                            return "#10b981";
                          case "actor":
                            return "#8b5cf6";
                          case "setting":
                            return "#06b6d4";
                          case "generateImage":
                            return "#3b82f6";
                          case "generateVideo":
                            return "#ec4899";
                          case "review":
                            return "#16a34a";
                          default:
                            return "#64748b";
                        }
                      }}
                      maskColor="rgba(255, 255, 255, 0.15)"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMinimapOpen(false)}
                      className="nodrag"
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 101,
                      }}
                    >
                      <Minimize2 size={11} />
                    </button>
                  </div>
                </div>
              )}
            </ReactFlow>
          </div>

          {/* Execution History Drawer */}
          {isHistoryOpen && (
            <div
              style={{
                width: "380px",
                height: "100%",
                background: "#ffffff",
                borderLeft: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                zIndex: 10,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Execution Audit Trail</span>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  style={{ background: "none", border: 0, fontSize: "13px", fontWeight: 600, color: "#4f46e5", cursor: "pointer" }}
                >
                  Close
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                {filteredRuns.length === 0 ? (
                  <div style={{ border: "1px dashed #e2e8f0", borderRadius: "8px", padding: "32px 16px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                    No run logs yet. Click "Run" to update the workflow.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filteredRuns.map((run) => (
                      <div
                        key={run.id}
                        style={{
                          border: "1px solid",
                          borderRadius: "10px",
                          padding: "12px",
                          cursor: "pointer",
                          background: selectedRunId === run.id ? "#f8fafc" : "#ffffff",
                          borderColor: selectedRunId === run.id ? "#6366f1" : "#e2e8f0",
                          transition: "all 0.15s ease",
                        }}
                        onClick={() => setSelectedRunId(selectedRunId === run.id ? null : run.id)}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: run.scope === "PARTIAL" ? "#eff6ff" : "#f0fdf4",
                              color: run.scope === "PARTIAL" ? "#2563eb" : "#16a34a",
                            }}
                          >
                            {run.scope === "PARTIAL" ? "SELECTIVE RE-RUN" : "FULL RUN"}
                          </span>
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                            {run.duration.toFixed(2)}s
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                          {new Date(run.createdAt).toLocaleString()}
                        </div>

                        {/* Expandable Node Diagnostics */}
                        {selectedRunId === run.id && (
                          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "12px", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>
                              Node Level Execution:
                            </div>
                            {Object.entries(run.nodesState as Record<string, any>).map(([nodeId, state]) => (
                              <div
                                key={nodeId}
                                style={{
                                  background: "#f8fafc",
                                  border: "1px solid #f1f5f9",
                                  borderRadius: "6px",
                                  padding: "8px",
                                  fontSize: "11px",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                                  <span style={{ fontWeight: 600, color: "#1e293b" }}>{state.name || nodeId}</span>
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      fontSize: "10px",
                                      color: state.status === "REUSED" ? "#16a34a" : "#6366f1",
                                    }}
                                  >
                                    {state.status === "REUSED" ? "✓ REUSED (CACHED)" : "⟳ REGENERATED"}
                                  </span>
                                </div>
                                {state.message && (
                                  <div style={{ fontSize: "10px", color: "#64748b" }}>{state.message}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Add Node Toolbar */}
      <AddNodeBar onAddNode={handleAddNode} />
    </div>
  );
}

// Canvas Zoom & Pan Bar Controls
function CustomCanvasControls({
  undo,
  redo,
  canUndo,
  canRedo,
}: {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const zoomPercent = Math.round(zoom * 100);

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={() => setIsCollapsed(false)}
        className="nodrag"
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          width: "44px",
          height: "44px",
          borderRadius: "14px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#475569",
          cursor: "pointer",
          zIndex: 100,
        }}
      >
        <ChevronRight size={18} />
      </button>
    );
  }

  return (
    <div
      className="nodrag"
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        height: "44px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "22px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
        display: "flex",
        alignItems: "center",
        padding: "0 6px",
        gap: "4px",
        zIndex: 100,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <button
        type="button"
        onClick={() => setIsCollapsed(true)}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "10px",
          border: "1.5px solid #0f172a",
          background: "#ffffff",
          color: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>

      <div style={{ width: "1px", height: "18px", background: "#e2e8f0", margin: "0 4px" }} />

      <button
        type="button"
        onClick={undo}
        disabled={!canUndo}
        style={{
          width: "28px",
          height: "28px",
          border: 0,
          background: "transparent",
          color: canUndo ? "#475569" : "#cbd5e1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: canUndo ? "pointer" : "not-allowed",
        }}
        title="Undo"
      >
        <Undo2 size={15} />
      </button>

      <button
        type="button"
        onClick={redo}
        disabled={!canRedo}
        style={{
          width: "28px",
          height: "28px",
          border: 0,
          background: "transparent",
          color: canRedo ? "#475569" : "#cbd5e1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: canRedo ? "pointer" : "not-allowed",
        }}
        title="Redo"
      >
        <Redo2 size={15} />
      </button>

      <div style={{ width: "1px", height: "18px", background: "#e2e8f0", margin: "0 4px" }} />

      <button
        type="button"
        onClick={() => zoomOut()}
        style={{
          width: "28px",
          height: "28px",
          border: 0,
          background: "transparent",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        title="Zoom Out"
      >
        <ZoomOut size={16} />
      </button>

      <span style={{ fontSize: "13px", fontWeight: 500, color: "#475569", minWidth: "36px", textAlign: "center" }}>
        {zoomPercent}%
      </span>

      <button
        type="button"
        onClick={() => zoomIn()}
        style={{
          width: "28px",
          height: "28px",
          border: 0,
          background: "transparent",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        title="Zoom In"
      >
        <ZoomIn size={16} />
      </button>

      <div style={{ width: "1px", height: "18px", background: "#e2e8f0", margin: "0 4px" }} />

      <button
        type="button"
        onClick={() => fitView({ padding: 0.2 })}
        style={{
          width: "28px",
          height: "28px",
          border: 0,
          background: "transparent",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        title="Fit View"
      >
        <Maximize2 size={15} />
      </button>
    </div>
  );
}

// Custom interactive Bezier connection edge with hover disconnect cross
function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  interactionWidth = 20,
}: EdgeProps & { interactionWidth?: number }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isHovered, setIsHovered] = useState(false);
  const { setEdges } = useReactFlow();

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={interactionWidth}
        style={{ cursor: "pointer" }}
      />
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isHovered ? 2.5 : style.strokeWidth || 1.75,
          transition: "stroke-width 0.15s ease, stroke 0.15s ease",
        }}
      />
      {isHovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            <button
              type="button"
              onClick={onEdgeClick}
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                fontSize: "12px",
                lineHeight: "1",
                padding: 0,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#dc2626";
                e.currentTarget.style.borderColor = "#fca5a5";
                e.currentTarget.style.background = "#fef2f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.background = "#ffffff";
              }}
              title="Disconnect wire"
            >
              ×
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  );
}
