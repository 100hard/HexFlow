"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import { BaseNode } from "./base-node";
import { PortRow } from "./port-row";
import { HexFlowNodeData, ImageOutput } from "@/lib/hexflow/types";

export function GenerateImageNode({ id, data }: { id: string; data: HexFlowNodeData }) {
  const config = data.config || { model: "Flux 1.1 Pro", aspectRatio: "9:16" };
  const currentOutput = data.outputData as ImageOutput | null;
  const previousOutput = data.previousOutputData as ImageOutput | null;
  const displayOutput = currentOutput || previousOutput;

  const handleConfigChange = (key: string, value: any) => {
    data.onChange?.({
      config: { ...config, [key]: value },
    });
  };

  return (
    <BaseNode
      id={id}
      title="Generate Image"
      category="Generate"
      state={data.state || "NOT_RUN"}
      staleReason={data.staleReason}
      onRun={data.onRunNode}
      onDelete={data.onDelete ? () => data.onDelete!(id) : undefined}
      width={380}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
        {/* Left Input Ports */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
          <PortRow
            type="target"
            id="product"
            semanticType="PRODUCT"
            label="PRODUCT"
            roleHint="optional"
          />
          <PortRow
            type="target"
            id="setting"
            semanticType="SETTING"
            label="SETTING"
            roleHint="optional"
          />
        </div>

        {/* Model & Aspect Ratio Settings */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Model
            </label>
            <select
              value={config.model || "Flux 1.1 Pro"}
              onChange={(e) => handleConfigChange("model", e.target.value)}
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
              <option value="Flux 1.1 Pro">Flux 1.1 Pro</option>
              <option value="GPT Image">GPT Image (DALL-E 3)</option>
              <option value="Midjourney V6">Midjourney V6</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Aspect Ratio
            </label>
            <select
              value={config.aspectRatio || "9:16"}
              onChange={(e) => handleConfigChange("aspectRatio", e.target.value)}
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
              <option value="9:16">9:16 (Stories/Reels)</option>
              <option value="1:1">1:1 (Square Feed)</option>
              <option value="16:9">16:9 (Landscape)</option>
            </select>
          </div>
        </div>

        {/* Image Preview Area */}
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #dbeafe",
            borderRadius: "10px",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "130px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {displayOutput ? (
            <div style={{ position: "relative", width: "100%", maxHeight: "160px", overflow: "hidden", borderRadius: "6px" }}>
              <img
                src={displayOutput.assetUrl}
                alt="Generated Image"
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: "6px",
                  right: "6px",
                  background: "rgba(0,0,0,0.6)",
                  color: "#ffffff",
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontWeight: 600,
                }}
              >
                {displayOutput.model}
              </span>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#60a5fa", padding: "16px 0" }}>
              <ImageIcon size={24} style={{ margin: "0 auto 6px" }} />
              <span style={{ fontSize: "12px" }}>Click Run to generate visual asset</span>
            </div>
          )}
        </div>

        {/* Output Port: image */}
        <PortRow
          type="source"
          id="image"
          semanticType="IMAGE"
          label="IMAGE"
        />
      </div>
    </BaseNode>
  );
}
