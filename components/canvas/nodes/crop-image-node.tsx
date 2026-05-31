"use client";

import { Handle, Position, useEdges } from "@xyflow/react";
import { Coins, Info, Play, RotateCcw, Trash2, Upload, Plus, Maximize2 } from "lucide-react";
import { useState } from "react";

export function CropImageNode({ id, data, onDelete }: { id: string; data: any; onDelete?: (id: string) => void }) {
  const [xPos, setXPos] = useState(0);
  const [yPos, setYPos] = useState(0);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  // Dynamic connected handles tracker
  const edges = useEdges();
  const isConnected = (handleId: string) => {
    return edges.some((edge) => edge.target === id && edge.targetHandle === handleId);
  };

  const imageConnected = isConnected("image");
  const xPositionConnected = isConnected("xPosition");
  const yPositionConnected = isConnected("yPosition");
  const widthConnected = isConnected("width");
  const heightConnected = isConnected("height");

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: "380px",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "visible", // crucial for absolute handles and tooltips
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
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#111827",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              userSelect: "none",
            }}
          >
            Crop Image
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          {/* Info Button with Hover Tooltip */}
          <div className="group" style={{ position: "relative", display: "inline-block" }}>
            <button
              type="button"
              style={{
                background: "none",
                border: 0,
                color: "#9ca3af",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Info size={14} />
            </button>
            <div
              style={{
                position: "absolute",
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                marginBottom: "8px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "8px 12px",
                fontSize: "11px",
                color: "#374151",
                width: "max-content",
                maxWidth: "280px",
                lineHeight: "1.4",
                zIndex: 9999,
                display: "none",
                pointerEvents: "none",
              }}
              className="group-hover:block"
            >
              Crop an image based on absolute percentages
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setXPos(0);
              setYPos(0);
              setWidth(100);
              setHeight(100);
            }}
            type="button"
            style={{
              background: "none",
              border: 0,
              color: "#9ca3af",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <RotateCcw size={14} />
          </button>

          {/* Sleek Run Play Button */}
          <button
            type="button"
            style={{
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              color: "#22c55e",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(34, 197, 94, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(34, 197, 94, 0.15)";
            }}
          >
            <Play size={12} fill="currentColor" />
            <span>Run</span>
          </button>

          {/* More actions button */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowDeleteMenu(!showDeleteMenu)}
              type="button"
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
              <span style={{ fontSize: "16px", lineHeight: 0, marginTop: "-4px" }}>...</span>
            </button>

            {showDeleteMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "38px",
                  right: 0,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  zIndex: 999,
                  padding: "4px",
                  width: "140px",
                }}
              >
                <button
                  onClick={() => {
                    if (onDelete) onDelete(id);
                    else if (data.onDelete) data.onDelete(id);
                    setShowDeleteMenu(false);
                  }}
                  type="button"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "none",
                    border: 0,
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#ef4444",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <Trash2 size={13} />
                  Delete Node
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Node Body Content */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Input Field: Input Image (Side-by-side) */}
        <div style={{ position: "relative" }}>
          {/* Glowing Target Handle Offset left by 22px */}
          <div style={{ position: "absolute", left: "-22px", top: "12px", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="image"
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

          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <span style={{ width: "100px", paddingTop: "8px", fontSize: "12px", color: "#6b7280", flexShrink: 0 }}>
              Input Image*
            </span>
            <div style={{ flex: 1 }}>
              <button
                type="button"
                disabled={imageConnected}
                className="nodrag"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "8px",
                  border: imageConnected ? "1px dashed #cbd5e1" : "1px dashed #d1d5db",
                  background: imageConnected ? "#e2e8f0" : "#f5f5f5",
                  padding: "10px",
                  fontSize: "12px",
                  color: imageConnected ? "#94a3b8" : "#6b7280",
                  cursor: imageConnected ? "not-allowed" : "pointer",
                }}
              >
                <Upload size={14} />
                <span>{imageConnected ? "Linked via handle" : "Upload image"}</span>
              </button>
            </div>
            <button
              type="button"
              className="nodrag"
              style={{
                marginTop: "6px",
                background: "#f5f5f5",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Range: X Position */}
        <div style={{ position: "relative" }}>
          {/* Glowing Target Handle Offset left by 22px */}
          <div style={{ position: "absolute", left: "-22px", top: "12px", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="xPosition"
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

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ width: "100px", fontSize: "12px", color: xPositionConnected ? "#94a3b8" : "#6b7280", flexShrink: 0 }}>
              X Position (%)
            </span>
            <input
              type="range"
              min="0"
              max="100"
              disabled={xPositionConnected}
              value={xPositionConnected ? 0 : xPos}
              onChange={(e) => setXPos(Number(e.target.value))}
              className="nodrag"
              style={{
                flex: 1,
                accentColor: xPositionConnected ? "#cbd5e1" : "#3b82f6",
                height: "4px",
                borderRadius: "2px",
                cursor: xPositionConnected ? "not-allowed" : "pointer",
                opacity: xPositionConnected ? 0.5 : 1,
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: 500, color: xPositionConnected ? "#94a3b8" : "#111827", minWidth: "24px", textAlign: "right" }}>
              {xPositionConnected ? "🔗" : xPos}
            </span>
            {!xPositionConnected && (
              <button
                onClick={() => setXPos(0)}
                type="button"
                className="nodrag"
                style={{
                  background: "none",
                  border: 0,
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <RotateCcw size={12} />
              </button>
            )}
            <button
              type="button"
              className="nodrag"
              style={{
                background: "#f5f5f5",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Range: Y Position */}
        <div style={{ position: "relative" }}>
          {/* Glowing Target Handle Offset left by 22px */}
          <div style={{ position: "absolute", left: "-22px", top: "12px", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="yPosition"
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

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ width: "100px", fontSize: "12px", color: yPositionConnected ? "#94a3b8" : "#6b7280", flexShrink: 0 }}>
              Y Position (%)
            </span>
            <input
              type="range"
              min="0"
              max="100"
              disabled={yPositionConnected}
              value={yPositionConnected ? 0 : yPos}
              onChange={(e) => setYPos(Number(e.target.value))}
              className="nodrag"
              style={{
                flex: 1,
                accentColor: yPositionConnected ? "#cbd5e1" : "#3b82f6",
                height: "4px",
                borderRadius: "2px",
                cursor: yPositionConnected ? "not-allowed" : "pointer",
                opacity: yPositionConnected ? 0.5 : 1,
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: 500, color: yPositionConnected ? "#94a3b8" : "#111827", minWidth: "24px", textAlign: "right" }}>
              {yPositionConnected ? "🔗" : yPos}
            </span>
            {!yPositionConnected && (
              <button
                onClick={() => setYPos(0)}
                type="button"
                className="nodrag"
                style={{
                  background: "none",
                  border: 0,
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <RotateCcw size={12} />
              </button>
            )}
            <button
              type="button"
              className="nodrag"
              style={{
                background: "#f5f5f5",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Range: Width */}
        <div style={{ position: "relative" }}>
          {/* Glowing Target Handle Offset left by 22px */}
          <div style={{ position: "absolute", left: "-22px", top: "12px", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="width"
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

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ width: "100px", fontSize: "12px", color: widthConnected ? "#94a3b8" : "#6b7280", flexShrink: 0 }}>
              Width (%)
            </span>
            <input
              type="range"
              min="0"
              max="100"
              disabled={widthConnected}
              value={widthConnected ? 0 : width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="nodrag"
              style={{
                flex: 1,
                accentColor: widthConnected ? "#cbd5e1" : "#3b82f6",
                height: "4px",
                borderRadius: "2px",
                cursor: widthConnected ? "not-allowed" : "pointer",
                opacity: widthConnected ? 0.5 : 1,
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: 500, color: widthConnected ? "#94a3b8" : "#111827", minWidth: "24px", textAlign: "right" }}>
              {widthConnected ? "🔗" : width}
            </span>
            {!widthConnected && (
              <button
                onClick={() => setWidth(100)}
                type="button"
                className="nodrag"
                style={{
                  background: "none",
                  border: 0,
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <RotateCcw size={12} />
              </button>
            )}
            <button
              type="button"
              className="nodrag"
              style={{
                background: "#f5f5f5",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Range: Height */}
        <div style={{ position: "relative" }}>
          {/* Glowing Target Handle Offset left by 22px */}
          <div style={{ position: "absolute", left: "-22px", top: "12px", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="height"
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

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ width: "100px", fontSize: "12px", color: heightConnected ? "#94a3b8" : "#6b7280", flexShrink: 0 }}>
              Height (%)
            </span>
            <input
              type="range"
              min="0"
              max="100"
              disabled={heightConnected}
              value={heightConnected ? 0 : height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="nodrag"
              style={{
                flex: 1,
                accentColor: heightConnected ? "#cbd5e1" : "#3b82f6",
                height: "4px",
                borderRadius: "2px",
                cursor: heightConnected ? "not-allowed" : "pointer",
                opacity: heightConnected ? 0.5 : 1,
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: 500, color: heightConnected ? "#94a3b8" : "#111827", minWidth: "24px", textAlign: "right" }}>
              {heightConnected ? "🔗" : height}
            </span>
            {!heightConnected && (
              <button
                onClick={() => setHeight(100)}
                type="button"
                className="nodrag"
                style={{
                  background: "none",
                  border: 0,
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <RotateCcw size={12} />
              </button>
            )}
            <button
              type="button"
              className="nodrag"
              style={{
                background: "#f5f5f5",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Output block: Output Image */}
        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "16px", position: "relative" }}>
          {/* Glowing Source Handle Offset right by 22px */}
          <div style={{ position: "absolute", right: "-22px", top: "8px", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="source"
              position={Position.Right}
              id="image_output"
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#3b82f6",
                border: "2px solid rgba(59, 130, 246, 0.5)",
                boxShadow: "0 0 8px rgba(59, 130, 246, 0.31)",
                cursor: "crosshair",
                position: "relative",
                right: 0,
                top: 0,
                transform: "none",
              }}
            />
          </div>

          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>Output Image</div>
          <div
            style={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              background: "#f5f5f5",
              minHeight: "84px",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>No output yet</span>
          </div>
        </div>

        {/* Cost coins icon footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "4px",
            fontSize: "10px",
            color: "#9ca3af",
            marginTop: "-4px",
          }}
        >
          <Coins size={12} />
          <span>~0.005M</span>
        </div>

      </div>
    </div>
  );
}
