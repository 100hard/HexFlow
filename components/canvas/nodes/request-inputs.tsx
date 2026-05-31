"use client";

import { Handle, Position } from "@xyflow/react";
import { Info, Plus, GripVertical, Copy, Trash2, Maximize2 } from "lucide-react";
import { useState } from "react";

export function RequestInputsNode({ data }: { data: any }) {
  const [prompt, setPrompt] = useState(data.prompt || "");

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: "380px",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "visible", // crucial for absolute handle offset
        position: "relative",
      }}
    >
      {/* Node Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #f3f4f6",
          cursor: "grab",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>
            Request-Inputs
          </span>
          <Info size={14} style={{ color: "#9ca3af", cursor: "pointer" }} />
        </div>
        <button
          type="button"
          className="nodrag"
          style={{
            background: "#f5f5f5",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f5")}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Node Body */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Property Line Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <GripVertical size={14} style={{ color: "#9ca3af", cursor: "grab" }} />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                Car prompt
              </span>
              <Info size={12} style={{ color: "#9ca3af", cursor: "pointer" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                className="nodrag"
                style={{ background: "none", border: 0, color: "#9ca3af", cursor: "pointer", padding: 0 }}
                title="Duplicate property"
              >
                <Copy size={13} />
              </button>
              <button
                type="button"
                className="nodrag"
                style={{ background: "none", border: 0, color: "#9ca3af", cursor: "pointer", padding: 0 }}
                title="Delete property"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div style={{ position: "relative" }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter prompt..."
              rows={4}
              className="nodrag nowheel"
              style={{
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#f5f5f5",
                padding: "12px",
                fontSize: "14px",
                color: "#111827",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
            {/* Maximize expand button absolute positioned */}
            <button
              type="button"
              className="nodrag"
              style={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                width: "24px",
                height: "24px",
                background: "rgba(229, 231, 235, 0.8)",
                border: 0,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                cursor: "pointer",
              }}
            >
              <Maximize2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Output source Handle offset right by 22px */}
      <div style={{ position: "absolute", right: "-22px", top: "50%", transform: "translateY(-50%)", zIndex: 50 }}>
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "#f59e0b",
            border: "2px solid rgba(245, 158, 11, 0.5)",
            boxShadow: "0 0 8px rgba(245, 158, 11, 0.31)",
            cursor: "crosshair",
            position: "relative",
            right: 0,
            top: 0,
            transform: "none",
          }}
        />
      </div>
    </div>
  );
}
