"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { MapPin, Sun, Moon } from "lucide-react";
import { BaseNode } from "./base-node";
import { PortRow } from "./port-row";
import { HexFlowNodeData, SettingOutput } from "@/lib/hexflow/types";
import { SETTING_PRESETS } from "@/lib/hexflow/mock-generators";

export function SettingNode({ id, data }: { id: string; data: HexFlowNodeData }) {
  const config = data.config || { settingKey: "studio" };
  const currentKey = config.settingKey || "studio";
  const currentOutput = (data.outputData as SettingOutput) || SETTING_PRESETS[currentKey] || SETTING_PRESETS.studio;

  const handleSelectSetting = (key: string) => {
    const selected = SETTING_PRESETS[key];
    if (!selected) return;

    data.onChange?.({
      config: {
        ...config,
        settingKey: key,
        lighting: selected.lighting,
        mood: selected.mood,
      },
      outputData: selected,
      state: "UP_TO_DATE",
    });
  };

  return (
    <BaseNode
      id={id}
      title="Setting"
      category="Creative"
      state={data.state || "UP_TO_DATE"}
      staleReason={data.staleReason}
      onRun={data.onRunNode}
      onDelete={data.onDelete ? () => data.onDelete!(id) : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
        {/* Optional Input Port: product */}
        <PortRow
          type="target"
          id="product"
          semanticType="PRODUCT"
          label="PRODUCT"
          roleHint="optional context"
        />

        {/* Setting Selector */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
            Scene Environment
          </label>
          <select
            value={currentKey}
            onChange={(e) => handleSelectSetting(e.target.value)}
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
            <option value="studio">Minimalist Loft Studio</option>
            <option value="urban">Downtown City Street</option>
            <option value="gym">Athletic Training Facility</option>
          </select>
        </div>

        {/* Setting Details Card */}
        <div
          style={{
            background: "#ecfeff",
            border: "1px solid #cffafe",
            borderRadius: "10px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MapPin size={14} className="text-cyan-600" />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#0e7490" }}>
              {currentOutput.name}
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "#155e75", lineHeight: "1.4" }}>
            {currentOutput.description}
          </span>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <span style={{ fontSize: "10px", background: "#cffafe", color: "#0e7490", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
              ☀️ {currentOutput.lighting}
            </span>
            <span style={{ fontSize: "10px", background: "#cffafe", color: "#0e7490", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
              ✨ {currentOutput.mood}
            </span>
          </div>
        </div>

        {/* Output Port: setting */}
        <PortRow
          type="source"
          id="setting"
          semanticType="SETTING"
          label="SETTING"
        />
      </div>
    </BaseNode>
  );
}
