"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Package, ExternalLink } from "lucide-react";
import { BaseNode } from "./base-node";
import { PortRow } from "./port-row";
import { HexFlowNodeData, ProductOutput } from "@/lib/hexflow/types";
import { PRODUCT_PRESETS } from "@/lib/hexflow/mock-generators";

export function ProductNode({ id, data }: { id: string; data: HexFlowNodeData }) {
  const config = data.config || { preset: "nike" };
  const currentPresetKey = config.preset || "nike";
  const currentOutput = (data.outputData as ProductOutput) || PRODUCT_PRESETS[currentPresetKey] || PRODUCT_PRESETS.nike;

  const handleSelectPreset = (presetKey: string) => {
    const selected = PRODUCT_PRESETS[presetKey];
    if (!selected) return;

    data.onChange?.({
      config: {
        ...config,
        preset: presetKey,
        productName: selected.name,
        description: selected.description,
        imageUrl: selected.imageUrl,
        sourceType: "EXISTING",
      },
      outputData: selected,
      state: "UP_TO_DATE",
    });
  };

  return (
    <BaseNode
      id={id}
      title="Product"
      category="Creative"
      state={data.state || "UP_TO_DATE"}
      staleReason={data.staleReason}
      onRun={data.onRunNode}
      onDelete={data.onDelete ? () => data.onDelete!(id) : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Preset Selector */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
            Select Product
          </label>
          <select
            value={currentPresetKey}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="nodrag"
            style={{
              width: "100%",
              marginTop: "4px",
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              fontSize: "13px",
              fontWeight: 500,
              color: "#0f172a",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="nike">Nike Air Zoom Pegasus (Footwear)</option>
            <option value="lumina">Lumina Glow Serum (Beauty)</option>
            <option value="apex">Apex ANC Headphones (Tech)</option>
          </select>
        </div>

        {/* Product Visual Card */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "10px",
            position: "relative",
          }}
        >
          {currentOutput.imageUrl && (
            <img
              src={currentOutput.imageUrl}
              alt={currentOutput.name}
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "8px",
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
              {currentOutput.name}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#64748b",
                lineHeight: "1.4",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {currentOutput.description}
            </span>
            {currentOutput.url && (
              <span style={{ fontSize: "10px", color: "#3b82f6", display: "flex", alignItems: "center", gap: "2px" }}>
                <ExternalLink size={10} />
                {currentOutput.url}
              </span>
            )}
          </div>
        </div>

        {/* Output Port Right Handle */}
        <PortRow
          type="source"
          id="product"
          semanticType="PRODUCT"
          label="PRODUCT"
        />
      </div>
    </BaseNode>
  );
}
