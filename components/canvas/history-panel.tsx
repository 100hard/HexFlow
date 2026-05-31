"use client";

import { CheckCircle2, ChevronRight, Clock, X } from "lucide-react";
import { useState } from "react";

type HistoryPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<"ui" | "api">("ui");

  if (!isOpen) return null;

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "360px",
        background: "#ffffff",
        borderLeft: "1px solid #e5e7eb",
        boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.05)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* History Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
          Execution History
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: 0,
            color: "#6b7280",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #f3f4f6",
          padding: "0 20px",
        }}
      >
        <button
          onClick={() => setActiveTab("ui")}
          style={{
            flex: 1,
            padding: "14px 0",
            fontSize: "13px",
            fontWeight: 500,
            border: 0,
            borderBottom: activeTab === "ui" ? "2px solid #eb1f26" : "2px solid transparent",
            color: activeTab === "ui" ? "#eb1f26" : "#6b7280",
            background: "none",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          UI Runs
        </button>
        <button
          onClick={() => setActiveTab("api")}
          style={{
            flex: 1,
            padding: "14px 0",
            fontSize: "13px",
            fontWeight: 500,
            border: 0,
            borderBottom: activeTab === "api" ? "2px solid #eb1f26" : "2px solid transparent",
            color: activeTab === "api" ? "#eb1f26" : "#6b7280",
            background: "none",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          API Runs
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f9fafb",
          background: "#fafafa",
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#4b5563", textTransform: "uppercase" }}>
          Run history
        </span>
        <select
          style={{
            background: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "11px",
            color: "#374151",
            padding: "2px 6px",
            outline: "none",
          }}
        >
          <option>All status</option>
          <option>Success</option>
          <option>Running</option>
          <option>Failed</option>
        </select>
      </div>

      {/* Runs List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {activeTab === "ui" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Mock Run 1 */}
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                    Run #148
                  </span>
                </div>
                <span style={{ fontSize: "10px", color: "#6b7280" }}>Success</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  fontSize: "11px",
                  color: "#6b7280",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} />
                  <span>3s ago • 1.2s</span>
                </div>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* Mock Run 2 */}
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                    Run #147
                  </span>
                </div>
                <span style={{ fontSize: "10px", color: "#6b7280" }}>Success</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  fontSize: "11px",
                  color: "#6b7280",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} />
                  <span>5m ago • 0.9s</span>
                </div>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
              color: "#9ca3af",
              fontSize: "12px",
              gap: "8px",
            }}
          >
            <span>No API runs found for this workflow.</span>
          </div>
        )}
      </div>

      {/* Close button at bottom */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #f3f4f6" }}>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            height: "36px",
            background: "#111827",
            color: "#ffffff",
            border: 0,
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </aside>
  );
}
