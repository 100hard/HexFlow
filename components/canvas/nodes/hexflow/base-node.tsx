"use client";

import React, { ReactNode } from "react";
import { Play, Loader2, RotateCcw, Trash2, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { NodeState } from "@/lib/hexflow/types";

interface BaseNodeProps {
  id: string;
  title: string;
  category: "Creative" | "Generate" | "Control";
  state: NodeState;
  staleReason?: string;
  onRun?: () => void;
  onDelete?: () => void;
  onReset?: () => void;
  children: ReactNode;
  width?: number;
}

export function BaseNode({
  id,
  title,
  category,
  state,
  staleReason,
  onRun,
  onDelete,
  onReset,
  children,
  width = 380,
}: BaseNodeProps) {
  const isRunning = state === "RUNNING";
  const isStale = state === "STALE";
  const isUpToDate = state === "UP_TO_DATE";

  // Outline border color
  const getBorderColor = () => {
    if (isRunning) return "#4f46e5"; // Indigo running
    if (isStale) return "#d97706"; // Amber stale
    if (isUpToDate) return "#059669"; // Emerald up to date
    return "#e2e8f0"; // Clean slate border
  };

  const getBoxShadow = () => {
    if (isRunning) return "0 0 0 2px rgba(79, 70, 229, 0.25), 0 8px 24px -4px rgba(0, 0, 0, 0.08)";
    if (isStale) return "0 0 0 1.5px rgba(217, 119, 6, 0.3), 0 8px 20px -4px rgba(0, 0, 0, 0.06)";
    if (isUpToDate) return "0 0 0 1px rgba(5, 150, 105, 0.2), 0 6px 18px -4px rgba(0, 0, 0, 0.04)";
    return "0 4px 16px -2px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)";
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: `1px solid ${getBorderColor()}`,
        borderRadius: "12px",
        boxShadow: getBoxShadow(),
        width: `${width}px`,
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "visible",
        position: "relative",
      }}
    >
      {/* Stale Alert Banner on Top of Node */}
      {isStale && (
        <div
          style={{
            background: "#fffbeb",
            borderBottom: "1px solid #fef3c7",
            padding: "6px 14px",
            borderRadius: "11px 11px 0 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            fontWeight: 500,
            color: "#92400e",
          }}
        >
          <AlertTriangle size={12} className="text-amber-600 flex-shrink-0" />
          <span style={{ flex: 1 }}>Needs rerun: {staleReason || "Upstream changed"}</span>
        </div>
      )}

      {/* Node Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid #f8fafc",
          cursor: "grab",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Category Tag */}
          <span
            style={{
              fontSize: "9px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "2px 6px",
              borderRadius: "4px",
              background:
                category === "Creative"
                  ? "#f8fafc"
                  : category === "Generate"
                  ? "#faf5ff"
                  : "#f0fdf4",
              color:
                category === "Creative"
                  ? "#475569"
                  : category === "Generate"
                  ? "#7e22ce"
                  : "#15803d",
              border:
                category === "Creative"
                  ? "1px solid #e2e8f0"
                  : category === "Generate"
                  ? "1px solid #f3e8ff"
                  : "1px solid #dcfce7",
            }}
          >
            {category}
          </span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", letterSpacing: "-0.01em" }}>
            {title}
          </span>
        </div>

        {/* State Badge & Run Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* State Indicator */}
          {isRunning ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "10px",
                fontWeight: 500,
                color: "#4f46e5",
                background: "#eef2ff",
                border: "1px solid #e0e7ff",
                padding: "2px 7px",
                borderRadius: "999px",
              }}
            >
              <Loader2 size={10} className="animate-spin text-indigo-600" />
              Running
            </span>
          ) : isUpToDate ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "10px",
                fontWeight: 500,
                color: "#047857",
                background: "#ecfdf5",
                border: "1px solid #d1fae5",
                padding: "2px 7px",
                borderRadius: "999px",
              }}
            >
              <CheckCircle2 size={10} className="text-emerald-600" />
              Up to date
            </span>
          ) : isStale ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "10px",
                fontWeight: 500,
                color: "#b45309",
                background: "#fffbeb",
                border: "1px solid #fef3c7",
                padding: "2px 7px",
                borderRadius: "999px",
              }}
            >
              <Clock size={10} className="text-amber-600" />
              Stale
            </span>
          ) : (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 500,
                color: "#64748b",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "2px 7px",
                borderRadius: "999px",
              }}
            >
              Not run
            </span>
          )}

          {/* Quick Run Play Button */}
          {onRun && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRun();
              }}
              disabled={isRunning}
              className="nodrag"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "5px",
                border: "1px solid #e2e8f0",
                background: isRunning ? "#f8fafc" : "#ffffff",
                color: isRunning ? "#94a3b8" : "#047857",
                cursor: isRunning ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
              title="Run this node"
            >
              {isRunning ? (
                <Loader2 size={11} className="animate-spin text-slate-400" />
              ) : (
                <Play size={10} fill="#047857" />
              )}
            </button>
          )}

          {/* Delete action */}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="nodrag"
              style={{
                background: "none",
                border: 0,
                color: "#94a3b8",
                cursor: "pointer",
                padding: "3px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
              title="Delete node"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Node Body */}
      <div style={{ padding: "16px" }}>{children}</div>
    </div>
  );
}
