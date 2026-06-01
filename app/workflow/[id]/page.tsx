"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  addEdge,
  type Edge,
  type Node,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Play, Loader2, Save, Cloud, Check, Undo2, Redo2, Download, Upload, History, Calculator, Wallet, Map, Minimize2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useEffect, useState } from "react";

// Imports of custom nodes and sidebar
import { RequestInputsNode } from "@/components/canvas/nodes/request-inputs";
import { ResponseNode } from "@/components/canvas/nodes/response-node";
import { GeminiNode } from "@/components/canvas/nodes/gemini-node";
import { CropImageNode } from "@/components/canvas/nodes/crop-image-node";
import { AddNodeBar } from "@/components/canvas/add-node-bar";
import { AppSidebar } from "@/components/app-sidebar";

export default function WorkflowCanvasPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [workflowName, setWorkflowName] = useState("Loading workflow...");
  const [loading, setLoading] = useState(true);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");

  // Execution History & Runs state hooks
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ui" | "api">("ui");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  
  // Execution animation tracking states
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);
  const [isMinimapOpen, setIsMinimapOpen] = useState(false);

  // Filter runs by active tab (UI vs API) and status filter
  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const matchTab = activeTab === "ui" ? (run.scope === "FULL" || run.scope === "SINGLE" || run.scope === "PARTIAL") : (run.scope === "API");
      if (!matchTab) return false;
      
      if (statusFilter === "ALL") return true;
      return run.status === statusFilter;
    });
  }, [runs, activeTab, statusFilter]);

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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
      if (nextPast.length > 30) {
        nextPast.shift();
      }
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

  // Import / Export callbacks
  const exportWorkflowToJSON = useCallback(() => {
    const workflowData = {
      name: workflowName,
      nodes,
      edges,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(workflowData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `${workflowName.replace(/\s+/g, "_").toLowerCase()}_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [workflowName, nodes, edges]);

  const importWorkflowFromJSON = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.nodes && Array.isArray(data.nodes)) {
            takeSnapshot(nodes, edges);
            setNodes(data.nodes);
            if (data.edges && Array.isArray(data.edges)) {
              setEdges(data.edges);
            } else {
              setEdges([]);
            }
            if (data.name) {
              setWorkflowName(data.name);
            }
          } else {
            alert("Invalid workflow JSON format. Missing 'nodes' array.");
          }
        } catch (err) {
          console.error("Failed to parse imported workflow JSON:", err);
          alert("Error reading JSON file.");
        }
      };
      reader.readAsText(file);
    },
    [nodes, edges, takeSnapshot, setNodes, setEdges]
  );

  // 1. Fetch live database workflow graph on mount
  useEffect(() => {
    const loadWorkflow = async () => {
      // Auto-clone logic for featured sample template
      if (id === "wf-template-marketing") {
        try {
          const createRes = await fetch("/api/workflows", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "AI Marketing Copy Generator (Cloned)" }),
          });

          if (createRes.ok) {
            const clonedWf = await createRes.json();
            router.replace(`/workflow/${clonedWf.id}`);
            return;
          } else {
            console.error("Cloning template response not ok:", createRes.status);
            router.push("/");
          }
        } catch (err) {
          console.error("Cloning template error:", err);
          router.push("/");
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`/api/workflows/${id}`);
        if (response.ok) {
          const data = await response.json();
          setWorkflowName(data.name);
          
          // Populate canvas states
          if (data.nodes) setNodes(data.nodes);
          if (data.edges) setEdges(data.edges);
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error loading workflow from database:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflow();
  }, [id, router, setNodes, setEdges]);

  // 2. Debounced Database Auto-Saving Logic
  const saveWorkflowState = useCallback(async (currentNodes: Node[], currentEdges: Edge[]) => {
    if (loading || id === "wf-template-marketing") return;
    setSavingState("saving");

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodes: currentNodes,
          edges: currentEdges,
        }),
      });

      if (response.ok) {
        setSavingState("saved");
        setTimeout(() => setSavingState("idle"), 2500);
      } else {
        setSavingState("idle");
      }
    } catch (err) {
      console.error("Failed to auto-save canvas:", err);
      setSavingState("idle");
    }
  }, [loading, id]);

  // Fetch historical runs from PostgreSQL database
  const fetchRuns = useCallback(async () => {
    if (!id || id === "wf-template-marketing") return;
    try {
      const res = await fetch(`/api/workflows/${id}/runs`);
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch (err) {
      console.error("Failed to fetch workflow run logs:", err);
    }
  }, [id]);

  useEffect(() => {
    if (id && id !== "wf-template-marketing") {
      fetchRuns();
    }
  }, [id, fetchRuns]);

  // Core handler to execute workflow with visual step-by-step glowing node highlights
  const handleExecuteWorkflow = useCallback(async () => {
    if (isExecuting || nodes.length === 0) return;
    
    setIsExecuting(true);
    const startTime = Date.now();
    
    try {
      // Step 1: Glow Request-Inputs node
      setExecutingNodeId("node-request-inputs");
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Step 2: Glow all user-added intermediary processing nodes (Gemini / CropImage)
      const userNodes = nodes.filter((n) => n.id !== "node-request-inputs" && n.id !== "node-response");
      for (const node of userNodes) {
        setExecutingNodeId(node.id);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      // Step 3: Glow final Response node
      setExecutingNodeId("node-response");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Clear executing border
      setExecutingNodeId(null);
      
      const endTime = Date.now();
      const executionDuration = (endTime - startTime) / 1000; // in seconds
      
      // Compile mock execution tracking node states
      const mockNodesState: Record<string, any> = {};
      nodes.forEach((node) => {
        let nodeInputs: any = {};
        let nodeOutputs: any = {};
        
        if (node.type === "requestInputs") {
          nodeInputs = {};
          nodeOutputs = { fields: (node.data as any)?.fields?.map((f: any) => ({ name: f.name, type: f.type })) || [] };
        } else if (node.type === "gemini") {
          nodeInputs = { prompt: (node.data as any)?.prompt || "Write Prompt..." };
          nodeOutputs = { response: "Drafted marketing copy for wireless bluetooth noise cancelling headphones." };
        } else if (node.type === "cropImage") {
          nodeInputs = { x: 0, y: 0, width: 100, height: 100 };
          nodeOutputs = { image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300" };
        } else if (node.type === "response") {
          nodeInputs = { connected_wires: edges.filter((e) => e.target === node.id).map((e) => e.source) };
          nodeOutputs = { status: "RENDERED_SUCCESSFULLY" };
        }
        
        mockNodesState[node.id] = {
          name: node.type === "requestInputs" ? "Request Inputs" : node.type === "response" ? "Response" : node.type === "gemini" ? "Gemini 3.1 Pro" : "Crop Image",
          status: "SUCCESS",
          duration: node.type === "requestInputs" ? 0.8 : 1.0,
          inputs: nodeInputs,
          outputs: nodeOutputs,
        };
      });
      
      // POST the completed run log to the PostgreSQL database
      const res = await fetch(`/api/workflows/${id}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SUCCESS",
          scope: "FULL",
          duration: executionDuration,
          nodesState: mockNodesState,
        }),
      });
      
      if (res.ok) {
        // Instantly reload list to show newest run log in right history sidebar panel!
        await fetchRuns();
        // Open the history panel if not already open to show the success status instantly!
        setIsHistoryOpen(true);
      }
    } catch (err) {
      console.error("Failed to run workflow:", err);
    } finally {
      setIsExecuting(false);
      setExecutingNodeId(null);
    }
  }, [id, nodes, edges, isExecuting, fetchRuns]);

  // Trigger auto-save when nodes/edges changes stop
  useEffect(() => {
    if (loading || nodes.length === 0) return;
    
    const handler = setTimeout(() => {
      saveWorkflowState(nodes, edges);
    }, 1500);

    return () => clearTimeout(handler);
  }, [nodes, edges, loading, saveWorkflowState]);

  // Node data change handler for custom nodes
  const onNodeDataChange = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
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
        })
      );
    },
    [setNodes]
  );

  // Deletion handler for user-added nodes
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      takeSnapshot(nodes, edges);
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges, nodes, edges, takeSnapshot]
  );

  // Dynamic mapping to inject onDelete and onChange handlers into custom nodes data
  const nodesWithDelete = useMemo(() => {
    return nodes.map((node) => {
      const baseData = {
        ...node.data,
        onChange: (newData: any) => onNodeDataChange(node.id, newData),
        executing: node.id === executingNodeId,
      };

      if (node.id === "node-request-inputs" || node.id === "node-response") {
        return { ...node, data: baseData };
      }

      return {
        ...node,
        data: {
          ...baseData,
          onDelete: handleDeleteNode,
        },
      };
    });
  }, [nodes, onNodeDataChange, handleDeleteNode, executingNodeId]);

  // Addition handler for Gemini and Crop Image nodes
  const handleAddNode = useCallback(
    (type: "gemini" | "cropImage") => {
      takeSnapshot(nodes, edges);
      const newId = `${type}-${Date.now()}`;
      const randomOffset = Math.floor(Math.random() * 60) - 30;
      
      const newNode: Node = {
        id: newId,
        type,
        position: { x: 500 + randomOffset, y: 150 + randomOffset },
        data: {
          prompt: type === "gemini" ? "Write Prompt for Car Racing" : "",
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, nodes, edges, takeSnapshot]
  );

  // Connection handler with visual color-coded stroke styling matching source handle type
  const onConnect = useCallback(
    (connection: Connection) => {
      takeSnapshot(nodes, edges);
      let strokeColor = "#818cf8"; // Animated Purple/Indigo by default

      const sourceHandle = connection.sourceHandle || "";
      const targetHandle = connection.targetHandle || "";

      if (sourceHandle.includes("image") || targetHandle.includes("image")) {
        strokeColor = "#3b82f6"; // blue
      } else if (sourceHandle.includes("video") || targetHandle.includes("video")) {
        strokeColor = "#10b981"; // green
      } else if (sourceHandle.includes("audio") || targetHandle.includes("audio")) {
        strokeColor = "#06b6d4"; // cyan
      } else if (sourceHandle.includes("Position") || targetHandle.includes("Position") || 
                 sourceHandle.includes("width") || targetHandle.includes("width") || 
                 sourceHandle.includes("height") || targetHandle.includes("height")) {
        strokeColor = "#ec4899"; // pink
      } else {
        // Standard text flows styled with premium brand orange edge to match orange handles!
        strokeColor = "#f59e0b";
      }

      const newEdge: Edge = {
        ...connection,
        id: `edge-${Date.now()}`,
        style: { stroke: strokeColor, strokeWidth: 2.5 },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, nodes, edges, takeSnapshot]
  );

  // Type-safe connection validation rules
  const isValidConnection = useCallback(
    (connection: any) => {
      // Disallow connecting to self
      if (connection.source === connection.target) return false;

      const sourceHandle = connection.sourceHandle || "";
      const targetHandle = connection.targetHandle || "";

      const getHandleFormat = (handleId: string) => {
        if (handleId.includes("image")) return "image";
        if (handleId.includes("video")) return "video";
        if (handleId.includes("audio")) return "audio";
        if (handleId.includes("Position") || handleId.includes("width") || handleId.includes("height")) {
          return "coordinate";
        }
        return "text";
      };

      const sourceFormat = getHandleFormat(sourceHandle);
      const targetFormat = getHandleFormat(targetHandle);

      // Enforce strict matching formats
      return sourceFormat === targetFormat;
    },
    []
  );

  // Wrap standard React Flow callbacks to intercept and save history snapshots on keyboard deletions
  const onNodesChangeWrapper = useCallback(
    (changes: any) => {
      const hasRemoval = changes.some((c: any) => c.type === "remove");
      if (hasRemoval) {
        takeSnapshot(nodes, edges);
      }
      onNodesChange(changes);
    },
    [onNodesChange, nodes, edges, takeSnapshot]
  );

  const onEdgesChangeWrapper = useCallback(
    (changes: any) => {
      const hasRemoval = changes.some((c: any) => c.type === "remove");
      if (hasRemoval) {
        takeSnapshot(nodes, edges);
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, nodes, edges, takeSnapshot]
  );

  const onNodeDragStart = useCallback(() => {
    takeSnapshot(nodes, edges);
  }, [nodes, edges, takeSnapshot]);

  // Register all node templates
  const nodeTypes = {
    requestInputs: RequestInputsNode,
    response: ResponseNode,
    gemini: GeminiNode,
    cropImage: CropImageNode,
  };

  if (loading) {
    return (
      <div style={{ display: "flex", width: "100vw", height: "100vh", alignItems: "center", justifyContent: "center", background: "#fcfcfc" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <span style={{ fontSize: 14, color: "#6b7280" }}>Initializing canvas board...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: "#fafafa",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <AppSidebar />

      <div
        style={{
          marginLeft: "261px",
          width: "calc(100vw - 261px)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Workspace Canvas Header */}
        <header
          style={{
            height: "56px",
            borderBottom: "1px solid #e5e7eb",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            zIndex: 30,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Left Side: Back button and Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                color: "#374151",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} />
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                {workflowName}
              </span>
              
              {/* Cloud Auto-Saving indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#9ca3af", marginLeft: 8 }}>
                {savingState === "saving" ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-indigo-500" />
                    <span>Saving...</span>
                  </>
                ) : savingState === "saved" ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    <span className="text-emerald-600">Saved</span>
                  </>
                ) : (
                  <>
                    <Cloud size={12} />
                    <span>Cloud synced</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Action Run Play button */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            
            {/* Est parameter box */}
            <div
              style={{
                display: "inline-flex",
                height: "32px",
                alignItems: "center",
                gap: "8px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                padding: "0 12px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#6b7280",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
              }}
            >
              <Calculator size={14} style={{ color: "#4b5563" }} />
              <span>
                Est <strong style={{ color: "#1f2937", fontWeight: 600, marginLeft: "4px", marginRight: "4px" }}>1.72</strong> M
              </span>
            </div>

            {/* Bal parameter box */}
            <div
              style={{
                display: "inline-flex",
                height: "32px",
                alignItems: "center",
                gap: "8px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                padding: "0 12px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#6b7280",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
              }}
            >
              <Wallet size={14} style={{ color: "#4b5563" }} />
              <span>
                Bal <strong style={{ color: "#1f2937", fontWeight: 600, marginLeft: "4px", marginRight: "4px" }}>0.00</strong> M
              </span>
            </div>

            {/* Play triangle button */}
            <button
              onClick={handleExecuteWorkflow}
              disabled={isExecuting}
              style={{
                display: "inline-flex",
                width: "48px",
                height: "32px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: 0,
                background: isExecuting ? "#818cf8" : "#5046e6",
                color: "#ffffff",
                cursor: isExecuting ? "not-allowed" : "pointer",
                boxShadow: "0 1px 2px rgba(80, 70, 230, 0.2)",
                transition: "background 0.15s ease",
              }}
            >
              {isExecuting ? (
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Play size={14} fill="#ffffff" style={{ color: "#ffffff" }} />
              )}
            </button>

            {/* Execution History Button */}
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              style={{
                display: "inline-flex",
                width: "32px",
                height: "32px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: isHistoryOpen ? "#f1f5f9" : "#ffffff",
                color: "#1f2937",
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = isHistoryOpen ? "#f1f5f9" : "#ffffff")}
              title="Execution History"
            >
              <History size={16} />
            </button>
          </div>
        </header>

        {/* Main React Flow Canvas Area */}
        <main style={{ flex: 1, display: "flex", flexDirection: "row", position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          <div style={{ flex: 1, height: "100%", position: "relative", background: "#f8f9fa" }}>
            <ReactFlow
              nodes={nodesWithDelete}
              edges={edges}
              onNodesChange={onNodesChangeWrapper}
              onEdgesChange={onEdgesChangeWrapper}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              onNodeDragStart={onNodeDragStart}
              nodeTypes={nodeTypes}
              fitView={false}
              defaultViewport={{ x: 100, y: 80, zoom: 0.58 }}
              minZoom={0.2}
              maxZoom={1.5}
              nodesDraggable={true}
              panOnDrag={true}
            >
              {/* Dot background styled beautifully and crisply */}
              <Background variant={BackgroundVariant.Dots} gap={24} size={3} color="#94a3b8" />

              {/* Zoom & Fit controls bottom-left */}
              <Controls
                style={{
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#ffffff",
                }}
              />

              {/* Toggleable Minimap bottom-right */}
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
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
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
                        background: "#0c0c0e", // very dark zinc/black
                        width: "200px",
                        height: "135px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                        margin: 0,
                      }}
                      nodeColor={(node) => {
                        switch (node.type) {
                          case "requestInputs":
                            return "#52525b"; // brighter dark gray square
                          case "gemini":
                            return "#22c55e"; // green rectangle
                          case "cropImage":
                            return "#3b82f6"; // blue rectangle
                          case "response":
                            return "#52525b"; // brighter dark gray square
                          default:
                            return "#3f3f46";
                        }
                      }}
                      maskColor="rgba(255, 255, 255, 0.15)"
                    />
                    {/* Collapse button on the top-right of the minimap */}
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
                        border: "2px solid #1c1917",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#1c1917",
                        cursor: "pointer",
                        zIndex: 101,
                        padding: 0,
                      }}
                    >
                      <Minimize2 size={11} />
                    </button>
                  </div>
                </div>
              )}
            </ReactFlow>
          </div>

          {/* Execution History Sliding Sidebar Panel */}
          {isHistoryOpen && (
            <div
              style={{
                width: "360px",
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
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>Execution History</span>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  style={{
                    background: "none",
                    border: 0,
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#4f46e5",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>

              {/* Top Tab Selectors */}
              <div style={{ padding: "16px 20px 8px" }}>
                <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "8px", gap: "4px" }}>
                  <button
                    onClick={() => setActiveTab("ui")}
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 500,
                      borderRadius: "6px",
                      border: 0,
                      background: activeTab === "ui" ? "#ffffff" : "transparent",
                      color: activeTab === "ui" ? "#0f172a" : "#64748b",
                      boxShadow: activeTab === "ui" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    UI Runs
                  </button>
                  <button
                    onClick={() => setActiveTab("api")}
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 500,
                      borderRadius: "6px",
                      border: 0,
                      background: activeTab === "api" ? "#ffffff" : "transparent",
                      color: activeTab === "api" ? "#0f172a" : "#64748b",
                      boxShadow: activeTab === "api" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    API Runs
                  </button>
                </div>
              </div>

              {/* Filter and Title Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#334155" }}>Run history</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#334155",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="ALL">All</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="PARTIAL">Partial</option>
                </select>
              </div>

              {/* Scrollable list area */}
              <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
                {filteredRuns.length === 0 ? (
                  <div
                    style={{
                      border: "1px dashed #e2e8f0",
                      borderRadius: "8px",
                      padding: "32px 16px",
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "13px",
                      marginTop: "10px",
                    }}
                  >
                    No runs for this filter yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filteredRuns.map((run) => (
                      <div
                        key={run.id}
                        style={{
                          border: "1px solid",
                          borderRadius: "8px",
                          padding: "12px",
                          cursor: "pointer",
                          background: selectedRunId === run.id ? "#f8fafc" : "#ffffff",
                          borderColor: selectedRunId === run.id ? "#6366f1" : "#e2e8f0",
                          transition: "all 0.2s",
                        }}
                        onClick={() => setSelectedRunId(selectedRunId === run.id ? null : run.id)}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background:
                                run.status === "SUCCESS"
                                  ? "#f0fdf4"
                                  : run.status === "FAILED"
                                  ? "#fef2f2"
                                  : "#fffbeb",
                              color:
                                run.status === "SUCCESS"
                                  ? "#16a34a"
                                  : run.status === "FAILED"
                                  ? "#dc2626"
                                  : "#d97706",
                            }}
                          >
                            {run.status}
                          </span>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>
                            {run.duration.toFixed(2)}s
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 500, color: "#1e293b", marginBottom: "4px" }}>
                          Scope: {run.scope} Run
                        </div>
                        <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                          {new Date(run.createdAt).toLocaleString()}
                        </div>

                        {/* Expanded details exposing node-level execution tracking */}
                        {selectedRunId === run.id && (
                          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "12px", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
                              Node Execution tracking:
                            </div>
                            {Object.entries(run.nodesState as Record<string, any>).map(([nodeId, state]) => (
                              <div
                                key={nodeId}
                                style={{
                                  background: "#f8fafc",
                                  border: "1px solid #f1f5f9",
                                  borderRadius: "6px",
                                  padding: "8px",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#1e293b" }}>
                                    {state.name || nodeId}
                                  </span>
                                  <span style={{ fontSize: "10px", color: state.status === "SUCCESS" ? "#16a34a" : "#dc2626" }}>
                                    {state.status} ({state.duration ? state.duration.toFixed(2) : 0}s)
                                  </span>
                                </div>
                                {state.inputs && Object.keys(state.inputs).length > 0 && (
                                  <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "2px" }}>
                                    <strong>Inputs:</strong> {JSON.stringify(state.inputs)}
                                  </div>
                                )}
                                {state.outputs && Object.keys(state.outputs).length > 0 && (
                                  <div style={{ fontSize: "10px", color: "#64748b" }}>
                                    <strong>Outputs:</strong> {JSON.stringify(state.outputs)}
                                  </div>
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

      {/* Floating Add Node Popover Toolbar bottom center relative to canvas */}
      <AddNodeBar onAddNode={handleAddNode} />
    </div>
  );
}
