"use client";

import { Handle, Position, useEdges, useNodes } from "@xyflow/react";
import { Info, X, Edit2 } from "lucide-react";

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
        border: data?.executing ? "2px solid #6366f1" : "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: data?.executing 
          ? "0 0 0 4px rgba(99, 102, 241, 0.5), 0 10px 30px rgba(99, 102, 241, 0.3)" 
          : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: "360px",
        transition: "all 0.3s ease-in-out",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "visible",
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
        {/* Lavender box and custom box-arrow pointing out to the right */}
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
            <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
            <path d="M11 13h10" />
            <path d="m18 10 3 3-3 3" />
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
      <div style={{ padding: "16px", display: "flex", flexDirection: "column" }}>
        
        {/* result parameter with Left target Handle vertically centered */}
        <div 
          style={{ 
            position: "relative", 
            display: "flex", 
            alignItems: "center", 
            paddingBottom: "12px", 
            borderBottom: "1px solid #f3f4f6",
            marginBottom: "16px",
            minHeight: "24px"
          }}
        >
          {/* Blue Handle perfectly left-aligned next to result */}
          <div style={{ position: "absolute", left: "-22px", top: "50%", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="result"
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

          <span style={{ fontSize: "13px", fontWeight: 500, color: "#4f46e5", paddingLeft: "4px" }}>
            result
          </span>
        </div>

        {/* Dynamic Cards for Connected Wires or No Output Placeholder */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: "80px", justifyContent: "center" }}>
          {incomingEdges.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                fontSize: "13px",
                color: "#94a3b8",
                padding: "24px 0",
              }}
            >
              No output added yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {incomingEdges.map((edge) => {
                const nodeName = getSourceNodeName(edge.source);
                const fieldName = getSourceFieldName(edge.source, edge.sourceHandle);
                return (
                  <div
                    key={edge.id}
                    style={{
                      background: "#f9fafb",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      border: "1px solid #e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280" }}>
                        {nodeName}
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#111827" }}>
                        {fieldName}
                      </span>
                    </div>
                    
                    {/* Inline action buttons for connected tags */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        className="nodrag"
                        style={{
                          background: "none",
                          border: 0,
                          color: "#9ca3af",
                          cursor: "pointer",
                          padding: "2px",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        className="nodrag"
                        style={{
                          background: "none",
                          border: 0,
                          color: "#9ca3af",
                          cursor: "pointer",
                          padding: "2px",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
