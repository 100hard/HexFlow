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
import { ArrowLeft, Play, Loader2, Save, Cloud, Check } from "lucide-react";
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

  // Deletion handler for user-added nodes
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  // Dynamic mapping to inject onDelete handler into custom nodes data
  const nodesWithDelete = useMemo(() => {
    return nodes.map((node) => {
      if (node.id === "node-request-inputs" || node.id === "node-response") {
        return node;
      }
      return {
        ...node,
        data: {
          ...node.data,
          onDelete: handleDeleteNode,
        },
      };
    });
  }, [nodes, handleDeleteNode]);

  // Addition handler for Gemini and Crop Image nodes
  const handleAddNode = useCallback(
    (type: "gemini" | "cropImage") => {
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
    [setNodes]
  );

  // Connection handler with visual color-coded stroke styling matching source handle type
  const onConnect = useCallback(
    (connection: Connection) => {
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
    [setEdges]
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
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
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
