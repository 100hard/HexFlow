"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Sparkles, Lightbulb } from "lucide-react";
import { BaseNode } from "./base-node";
import { PortRow } from "./port-row";
import { HexFlowNodeData, HookOutput } from "@/lib/hexflow/types";
import { HOOK_PRESETS } from "@/lib/hexflow/mock-generators";

export function HookNode({ id, data }: { id: string; data: HexFlowNodeData }) {
  const config = data.config || { hookKey: "problem_solution", tone: "Urgent & Direct" };
  const currentKey = config.hookKey || "problem_solution";
  const defaultPreset = HOOK_PRESETS[currentKey] || HOOK_PRESETS.problem_solution;
  const currentOutput = (data.outputData as HookOutput) || {
    type: "HOOK",
    id: "hook-init",
    category: defaultPreset.category,
    text: defaultPreset.text,
    tone: defaultPreset.tone,
  };

  const handleSelectHook = (key: string) => {
    const selected = HOOK_PRESETS[key];
    if (!selected) return;

    data.onChange?.({
      config: {
        ...config,
        hookKey: key,
        customHook: selected.text,
        tone: selected.tone,
      },
      outputData: {
        type: "HOOK",
        id: `hook-${Date.now()}`,
        category: selected.category,
        text: selected.text,
        tone: selected.tone,
      },
      state: "UP_TO_DATE",
    });
  };

  const handleCustomTextChange = (text: string) => {
    data.onChange?.({
      config: { ...config, customHook: text },
      outputData: {
        ...currentOutput,
        text,
      },
      state: "UP_TO_DATE",
    });
  };

  return (
    <BaseNode
      id={id}
      title="Hook"
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
          roleHint="optional"
        />

        {/* Hook Category Selector */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
            Creative Angle
          </label>
          <select
            value={currentKey}
            onChange={(e) => handleSelectHook(e.target.value)}
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
            <option value="problem_solution">Problem → Solution</option>
            <option value="pov">POV (Curiosity Gap)</option>
            <option value="spicy_reveal">Spicy Reveal</option>
            <option value="product_hit">Product Hit (Instant Benefit)</option>
          </select>
        </div>

        {/* Hook Preview & Editor */}
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: "10px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Lightbulb size={14} className="text-amber-600" />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#b45309", textTransform: "uppercase" }}>
              {currentOutput.category}
            </span>
          </div>
          <textarea
            value={currentOutput.text}
            onChange={(e) => handleCustomTextChange(e.target.value)}
            rows={2}
            className="nodrag nowheel"
            style={{
              width: "100%",
              borderRadius: "6px",
              border: "1px solid #fde68a",
              background: "#ffffff",
              padding: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#1e293b",
              lineHeight: "1.4",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Output Port: hook */}
        <PortRow
          type="source"
          id="hook"
          semanticType="HOOK"
          label="HOOK"
        />
      </div>
    </BaseNode>
  );
}
