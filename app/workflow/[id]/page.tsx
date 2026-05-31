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
import { ArrowLeft, Play, Loader2, Save, Cloud, Check, Undo2, Redo2, Download, Upload } from "lucide-react";
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
      if (id === "wf-template-racing") {
        try {
          const createRes = await fetch("/api/workflows", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "AI Racing Car Generator (Cloned)" }),
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
    if (loading || id === "wf-template-racing") return;
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
  }, [nodes, onNodeDataChange, handleDeleteNode]);

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
        // Standard text flows styled with premium brand purple edge!
        strokeColor = "#4f46e5";
      }

      const newEdge: Edge = {
        ...connection,
        id: `edge-${Date.now()}`,
        animated: true,
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
            
            {/* Undo / Redo Controls */}
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", background: "#ffffff" }}>
              <button
                onClick={undo}
                disabled={past.length === 0}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  border: 0,
                  background: "transparent",
                  color: past.length === 0 ? "#cbd5e1" : "#334155",
                  cursor: past.length === 0 ? "not-allowed" : "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (past.length > 0) e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={13} />
              </button>
              <div style={{ width: "1px", height: "16px", background: "#e2e8f0" }} />
              <button
                onClick={redo}
                disabled={future.length === 0}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  border: 0,
                  background: "transparent",
                  color: future.length === 0 ? "#cbd5e1" : "#334155",
                  cursor: future.length === 0 ? "not-allowed" : "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (future.length > 0) e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={13} />
              </button>
            </div>

            {/* Import / Export Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={exportWorkflowToJSON}
                style={{
                  display: "inline-flex",
                  height: "32px",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  padding: "0 10px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#334155",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                title="Export configuration JSON"
              >
                <Download size={12} />
                <span>Export</span>
              </button>

              <label
                style={{
                  display: "inline-flex",
                  height: "32px",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  padding: "0 10px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#334155",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                title="Import configuration JSON"
              >
                <Upload size={12} />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importWorkflowFromJSON}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <button
              onClick={() => saveWorkflowState(nodes, edges)}
              style={{
                display: "inline-flex",
                height: "32px",
                alignItems: "center",
                gap: "6px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                padding: "0 12px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#374151",
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
            >
              <Save size={12} />
              <span>Force save</span>
            </button>
            <button
              style={{
                display: "inline-flex",
                height: "32px",
                alignItems: "center",
                gap: "6px",
                borderRadius: "6px",
                border: 0,
                background: "#4f46e5",
                padding: "0 12px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(79, 70, 229, 0.2)",
                transition: "background 0.15s ease",
              }}
            >
              <Play size={12} fill="#ffffff" />
              <span>Run</span>
            </button>
          </div>
        </header>

        {/* Main React Flow Canvas Area */}
        <main style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
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

            {/* MiniMap bottom-right */}
            <MiniMap
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: "#ffffff",
                overflow: "hidden",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              }}
              nodeColor={(node) => {
                switch (node.type) {
                  case "requestInputs":
                    return "#f97316";
                  case "response":
                    return "#3b82f6";
                  case "gemini":
                    return "#eab308";
                  case "cropImage":
                    return "#ec4899";
                  default:
                    return "#e5e7eb";
                }
              }}
              maskColor="rgba(240, 240, 240, 0.6)"
            />
          </ReactFlow>
        </main>
      </div>

      {/* Floating Add Node Popover Toolbar bottom center relative to canvas */}
      <AddNodeBar onAddNode={handleAddNode} />
    </div>
  );
}
