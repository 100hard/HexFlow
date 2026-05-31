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
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo } from "react";

// Imports of custom nodes and sidebar
import { RequestInputsNode } from "@/components/canvas/nodes/request-inputs";
import { ResponseNode } from "@/components/canvas/nodes/response-node";
import { GeminiNode } from "@/components/canvas/nodes/gemini-node";
import { CropImageNode } from "@/components/canvas/nodes/crop-image-node";
import { AddNodeBar } from "@/components/canvas/add-node-bar";
import { AppSidebar } from "@/components/app-sidebar";
import { workflows } from "@/lib/mock-data";

export default function WorkflowCanvasPage() {
  const params = useParams();
  const id = params?.id as string;

  // Retrieve current workflow metadata or fallback
  const workflow = workflows.find((w) => w.id === id) || {
    id: "wf-new",
    name: "AI Racing Car Generator",
    status: "Active",
  };

  // Initial nodes layout (Request Inputs and Response default placement with Magica proportions)
  const initialNodes: Node[] = [
    {
      id: "node-request-inputs",
      type: "requestInputs",
      position: { x: 80, y: 150 },
      data: { prompt: "Write Prompt for Car Racing" },
      deletable: false,
    },
    {
      id: "node-response",
      type: "response",
      position: { x: 1050, y: 150 },
      data: {},
      deletable: false,
    },
  ];

  // Initial connecting edge from Request Inputs to Response
  const initialEdges: Edge[] = [
    {
      id: "edge-1",
      source: "node-request-inputs",
      sourceHandle: "output",
      target: "node-response",
      targetHandle: "input",
      animated: true,
      style: { stroke: "#f97316", strokeWidth: 2 },
    },
  ];

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
      // Injects onDelete for all except essential core nodes
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
      let strokeColor = "#f97316"; // default orange

      // Check handle IDs or source fields to determine styling
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
      }

      const newEdge: Edge = {
        ...connection,
        id: `edge-${Date.now()}`,
        animated: true,
        style: { stroke: strokeColor, strokeWidth: 2 },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Register all node templates
  const nodeTypes = {
    requestInputs: RequestInputsNode,
    response: ResponseNode,
    gemini: GeminiNode,
    cropImage: CropImageNode,
  };

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
      {/* Left Sidebar Navigation present inside the Workflow Canvas */}
      <AppSidebar />

      {/* Main Container shifted right by sidebar width */}
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
        {/* Simple Header Bar */}
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
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
            >
              <ArrowLeft size={16} />
            </Link>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
              {workflow.name}
            </span>
          </div>

          {/* Right Side: Action Run Play button */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              onMouseEnter={(e) => (e.currentTarget.style.background = "#4338ca")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#4f46e5")}
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
