"use client";

import { Handle, Position } from "@xyflow/react";
import { Coins, Info, Play, RotateCcw, Trash2, Upload, ChevronDown, Maximize2, Plus } from "lucide-react";
import { useState } from "react";

export function GeminiNode({ id, data, onDelete }: { id: string; data: any; onDelete?: (id: string) => void }) {
  const [prompt, setPrompt] = useState(data.prompt || "");
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt || "");
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: "380px",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "visible", // crucial for absolute handle placement and tooltips
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
            Gemini 3.1 Pro
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
              Generate text using Gemini 3.1 Pro (Google) via OpenRouter
            </div>
          </div>

          {/* Reset Button */}
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
        
        {/* Input Field: Prompt */}
        <div style={{ position: "relative" }}>
          {/* Glowing Target Handle Offset left by 22px */}
          <div style={{ position: "absolute", left: "-22px", top: "14px", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="prompt"
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#f59e0b",
                border: "2px solid rgba(245, 158, 11, 0.5)",
                boxShadow: "0 0 8px rgba(245, 158, 11, 0.31)",
                cursor: "crosshair",
                position: "relative",
                left: 0,
                top: 0,
                transform: "none",
              }}
            />
          </div>

          {/* Label block */}
          <div style={{ display: "flex", alignItems: "center", fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
            <span>Prompt</span>
            <span style={{ color: "#f87171", marginLeft: "2px" }}>*</span>
            <span style={{ marginLeft: "4px", display: "inline-flex", cursor: "pointer" }}>
              <Info size={12} style={{ color: "#9ca3af" }} />
            </span>
            <span style={{ marginLeft: "auto" }}>
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
                }}
              >
                <Plus size={14} />
              </button>
            </span>
          </div>

          {/* Input Textarea Area */}
          <div style={{ position: "relative" }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
              rows={3}
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
            {/* Expand maximize button absolute positioned */}
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

        {/* Input Field: System Prompt */}
        <div style={{ position: "relative" }}>
          {/* Glowing Target Handle Offset left by 22px */}
          <div style={{ position: "absolute", left: "-22px", top: "14px", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="system_prompt"
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#f59e0b",
                border: "2px solid rgba(245, 158, 11, 0.5)",
                boxShadow: "0 0 8px rgba(245, 158, 11, 0.31)",
                cursor: "crosshair",
                position: "relative",
                left: 0,
                top: 0,
                transform: "none",
              }}
            />
          </div>

          {/* Label block */}
          <div style={{ display: "flex", alignItems: "center", fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
            <span>System Prompt</span>
            <span style={{ marginLeft: "4px", display: "inline-flex", cursor: "pointer" }}>
              <Info size={12} style={{ color: "#9ca3af" }} />
            </span>
            <span style={{ marginLeft: "auto" }}>
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
                }}
              >
                <Plus size={14} />
              </button>
            </span>
          </div>

          {/* Input Textarea Area */}
          <div style={{ position: "relative" }}>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant..."
              rows={3}
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
            {/* Expand maximize button absolute positioned */}
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

        {/* Input block Image (Vision) - Side-by-side layout */}
        <div style={{ position: "relative" }}>
          {/* Glowing Target Handle Offset left by 22px */}
          <div style={{ position: "absolute", left: "-22px", top: "12px", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="image_urls"
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
              Image (Vision)
            </span>
            <div style={{ flex: 1 }}>
              <button
                type="button"
                className="nodrag"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "8px",
                  border: "1px dashed #d1d5db",
                  background: "#f5f5f5",
                  padding: "10px",
                  fontSize: "12px",
                  color: "#6b7280",
                  cursor: "pointer",
                }}
              >
                <Upload size={14} />
                <span>Upload image</span>
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                <span style={{ display: "inline-flex", cursor: "pointer" }}>
                  <Info size={12} style={{ color: "#9ca3af" }} />
                </span>
                <span style={{ fontSize: "10px", color: "#9ca3af" }}>Upload requirements</span>
              </div>
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

        {/* Input block Video - Side-by-side layout */}
        <div style={{ position: "relative" }}>
          {/* Glowing Target Handle Offset left by 22px */}
          <div style={{ position: "absolute", left: "-22px", top: "12px", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="video_urls"
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#22c55e",
                border: "2px solid rgba(34, 197, 94, 0.5)",
                boxShadow: "0 0 8px rgba(34, 197, 94, 0.31)",
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
              Video
            </span>
            <div style={{ flex: 1 }}>
              <button
                type="button"
                className="nodrag"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "8px",
                  border: "1px dashed #d1d5db",
                  background: "#f5f5f5",
                  padding: "10px",
                  fontSize: "12px",
                  color: "#6b7280",
                  cursor: "pointer",
                }}
              >
                <Upload size={14} />
                <span>Upload video</span>
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

        {/* Input block Audio - Side-by-side layout */}
        <div style={{ position: "relative" }}>
          {/* Glowing Target Handle Offset left by 22px */}
          <div style={{ position: "absolute", left: "-22px", top: "12px", transform: "translateY(-50%)", zIndex: 50 }}>
            <Handle
              type="target"
              position={Position.Left}
              id="audio_urls"
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#06b6d4",
                border: "2px solid rgba(6, 182, 212, 0.5)",
                boxShadow: "0 0 8px rgba(6, 182, 212, 0.31)",
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
              Audio
            </span>
            <div style={{ flex: 1 }}>
              <button
                type="button"
                className="nodrag"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "8px",
                  border: "1px dashed #d1d5db",
                  background: "#f5f5f5",
                  padding: "10px",
                  fontSize: "12px",
                  color: "#6b7280",
                  cursor: "pointer",
                }}
              >
                <Upload size={14} />
                <span>Upload audio</span>
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

        {/* Collapsible Settings Button */}
        <div>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            type="button"
            className="nodrag"
            style={{
              background: "none",
              border: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              padding: "4px 0",
              marginTop: "12px",
              color: "#9ca3af",
            }}
          >
            <ChevronDown
              size={16}
              style={{
                transform: isSettingsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.2s",
                color: "#9ca3af",
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: 500 }}>Settings</span>
          </button>
        </div>

        {/* Response block (Output) */}
        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "16px", position: "relative" }}>
          {/* Glowing Source Handle Offset right by 22px */}
          <div style={{ position: "absolute", right: "-22px", top: "8px", transform: "translateY(-50%)", zIndex: 50 }}>
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

          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>Response</div>
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
          <span>~0.0001M</span>
        </div>

      </div>
    </div>
  );
}
