"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { FileText, Clock, Volume2 } from "lucide-react";
import { BaseNode } from "./base-node";
import { PortRow } from "./port-row";
import { HexFlowNodeData, ScriptOutput } from "@/lib/hexflow/types";

export function ScriptNode({ id, data }: { id: string; data: HexFlowNodeData }) {
  const config = data.config || { length: 30, tone: "Energetic & Direct", style: "UGC Testimonial" };
  const currentOutput = data.outputData as ScriptOutput | null;
  const previousOutput = data.previousOutputData as ScriptOutput | null;
  const displayOutput = currentOutput || previousOutput;

  const handleConfigChange = (key: string, value: any) => {
    data.onChange?.({
      config: { ...config, [key]: value },
    });
  };

  return (
    <BaseNode
      id={id}
      title="Script"
      category="Creative"
      state={data.state || "NOT_RUN"}
      staleReason={data.staleReason}
      onRun={data.onRunNode}
      onDelete={data.onDelete ? () => data.onDelete!(id) : undefined}
      width={420}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
        {/* Left Input Ports */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
          <PortRow
            type="target"
            id="product"
            semanticType="PRODUCT"
            label="PRODUCT"
            required={true}
          />
          <PortRow
            type="target"
            id="hook"
            semanticType="HOOK"
            label="HOOK"
            roleHint="optional creative angle"
          />
        </div>

        {/* Script Config Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Target Length
            </label>
            <select
              value={config.length || 30}
              onChange={(e) => handleConfigChange("length", Number(e.target.value))}
              className="nodrag"
              style={{
                width: "100%",
                marginTop: "4px",
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontSize: "12px",
                color: "#0f172a",
                outline: "none",
              }}
            >
              <option value={15}>15 seconds (Snackable)</option>
              <option value={30}>30 seconds (Standard)</option>
              <option value={60}>60 seconds (Longform)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Style & Tone
            </label>
            <select
              value={config.style || "UGC Testimonial"}
              onChange={(e) => handleConfigChange("style", e.target.value)}
              className="nodrag"
              style={{
                width: "100%",
                marginTop: "4px",
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontSize: "12px",
                color: "#0f172a",
                outline: "none",
              }}
            >
              <option value="UGC Testimonial">UGC Testimonial</option>
              <option value="Direct Response">Direct Response</option>
              <option value="High Energy Story">High Energy Story</option>
            </select>
          </div>
        </div>

        {/* Script Content Viewer */}
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #dcfce7",
            borderRadius: "10px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={14} className="text-emerald-600" />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", textTransform: "uppercase" }}>
                Generated Script
              </span>
            </div>
            {displayOutput && (
              <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
                <Clock size={11} />
                ~{displayOutput.durationSeconds || 30}s duration
              </span>
            )}
          </div>

          {displayOutput ? (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #bbf7d0",
                borderRadius: "6px",
                padding: "10px",
                fontSize: "12px",
                lineHeight: "1.5",
                color: "#1e293b",
                maxHeight: "140px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
              }}
            >
              {displayOutput.text}
            </div>
          ) : (
            <div style={{ padding: "16px", textAlign: "center", fontSize: "12px", color: "#86efac" }}>
              Connect Product and click Run to compose script.
            </div>
          )}
        </div>

        {/* Output Port Right Handle */}
        <PortRow
          type="source"
          id="script"
          semanticType="SCRIPT"
          label="SCRIPT"
        />
      </div>
    </BaseNode>
  );
}
