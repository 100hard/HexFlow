"use client";

import { Handle, Position, useEdges, useNodes } from "@xyflow/react";
import { Info } from "lucide-react";

export function ResponseNode({ id, data }: { id: string; data: any }) {
  const edges = useEdges();
  const nodes = useNodes();

  // Find all edges pointing to this response node
  const incomingEdges = edges.filter((e) => e.target === id);

  const getSourceNodeName = (sourceId: string) => {
    const srcNode = nodes.find((n) => n.id === sourceId);
    if (!srcNode) return "Workflow Trigger";
    if (srcNode.id === "node-request-inputs") return "Request Inputs";
    if (srcNode.type === "gemini") return "Gemini 3.1 Pro";
    if (srcNode.type === "cropImage") return "Crop Image";
    return srcNode.type || "Source Node";
  };

  const getSourceFieldName = (sourceId: string, sourceHandle: string | null | undefined) => {
    const srcNode = nodes.find((n) => n.id === sourceId);
    if (!srcNode) return "data";
    if (srcNode.id === "node-request-inputs" && sourceHandle) {
      const nodeData = srcNode.data as any;
      const field = (nodeData?.fields || []).find((f: any) => f.id === sourceHandle);
      return field ? field.name : sourceHandle;
    }
    return sourceHandle || "result";
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: "360px",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "visible", // crucial for absolute handle placement
        position: "relative",
      }}
    >
      {/* Node Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          borderBottom: "1px solid #f3f4f6",
          background: "#ffffff",
          borderRadius: "12px 12px 0 0",
          cursor: "grab",
        }}
      >
        {/* Lavender box and custom box-arrow icon */}
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "#e0e7ff",
            color: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M15 12H9M9 12l3-3M9 12l3 3" />
          </svg>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
            Response
          </span>
          <Info size={14} style={{ color: "#9ca3af", cursor: "pointer" }} />
        </div>
      </div>

      {/* Node Body */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
        
        {/* Master Input Handle */}
        <div style={{ position: "relative" }}>
          {/* Glowing Target Handle Offset left by 22px */}
          <div style={{ position: "absolute", left: "-22px", top: "50%", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="result" // matches standard target handle
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#3b82f6",
                border: "2px solid rgba(59, 130, 246, 0.5)",
                boxShadow: "0 0 8px rgba(59, 130, 246, 0.31)",
                cursor: "crosshair",
                position: "relative",
                left: 0,
                top: 0,
                transform: "none",
              }}
            />
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              paddingLeft: "2px",
            }}
          >
            Output Parameters
          </div>
        </div>

        {/* Dynamic Cards for Connected Wires */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {incomingEdges.length === 0 ? (
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                fontSize: "11px",
                color: "#94a3b8",
                border: "1px dashed #e2e8f0",
                borderRadius: "8px",
                background: "#f8fafc",
                lineHeight: "1.4",
              }}
            >
              No parameters connected. Drag a wire from upstream output ports to here.
            </div>
          ) : (
            incomingEdges.map((edge) => {
              const nodeName = getSourceNodeName(edge.source);
              const fieldName = getSourceFieldName(edge.source, edge.sourceHandle);
              return (
                <div
                  key={edge.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#4f46e5" }}>
                      {nodeName}
                    </span>
                    <span style={{ fontSize: "9px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#64748b" }}>
                      linked
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 500, color: "#334155" }}>
                    {fieldName}
                  </div>
                  <div
                    style={{
                      borderRadius: "6px",
                      border: "1px solid #f1f5f9",
                      background: "#f8fafc",
                      padding: "6px 8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: "10px", color: "#94a3b8" }}>Waiting for execution run...</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
