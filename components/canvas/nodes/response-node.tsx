"use client";

import { Handle, Position } from "@xyflow/react";
import { Info, Pencil, Trash2 } from "lucide-react";

export function ResponseNode({ data }: { data: any }) {
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
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>
            Response
          </span>
          <Info size={14} style={{ color: "#9ca3af", cursor: "pointer" }} />
        </div>
      </div>

      {/* Node Body */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        
        {/* Label result linked to left handle */}
        <div style={{ position: "relative" }}>
          {/* Glowing Target Handle Offset left by 22px */}
          <div style={{ position: "absolute", left: "-22px", top: "50%", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="input"
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
              color: "#6b7280",
              fontWeight: 500,
              paddingLeft: "2px",
            }}
          >
            result
          </div>
        </div>

        {/* Cards for Output Parameters */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Output 1: gpt_image_2 */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "8px",
              padding: "12px",
              border: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                gpt_image_2
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  className="nodrag"
                  style={{ background: "none", border: 0, color: "#9ca3af", cursor: "pointer", padding: 0 }}
                >
                  <Pencil size={12} />
                </button>
                <button
                  type="button"
                  className="nodrag"
                  style={{ background: "none", border: 0, color: "#9ca3af", cursor: "pointer", padding: 0 }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div
              style={{
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                background: "#f5f5f5",
                minHeight: "44px",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>No output yet</span>
            </div>
          </div>

          {/* Output 2: seedance_2_0 */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "8px",
              padding: "12px",
              border: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                seedance_2_0
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  className="nodrag"
                  style={{ background: "none", border: 0, color: "#9ca3af", cursor: "pointer", padding: 0 }}
                >
                  <Pencil size={12} />
                </button>
                <button
                  type="button"
                  className="nodrag"
                  style={{ background: "none", border: 0, color: "#9ca3af", cursor: "pointer", padding: 0 }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div
              style={{
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                background: "#f5f5f5",
                minHeight: "44px",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>No output yet</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
