"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { User, Sparkles } from "lucide-react";
import { BaseNode } from "./base-node";
import { PortRow } from "./port-row";
import { HexFlowNodeData, ActorOutput } from "@/lib/hexflow/types";
import { ACTOR_PRESETS } from "@/lib/hexflow/mock-generators";

export function ActorNode({ id, data }: { id: string; data: HexFlowNodeData }) {
  const config = data.config || { actorKey: "maya" };
  const currentKey = config.actorKey || "maya";
  const currentOutput = (data.outputData as ActorOutput) || ACTOR_PRESETS[currentKey] || ACTOR_PRESETS.maya;

  const handleSelectActor = (key: string) => {
    const selected = ACTOR_PRESETS[key];
    if (!selected) return;

    data.onChange?.({
      config: {
        ...config,
        actorKey: key,
        lookId: selected.lookId,
      },
      outputData: selected,
      state: "UP_TO_DATE",
    });
  };

  return (
    <BaseNode
      id={id}
      title="Actor"
      category="Creative"
      state={data.state || "UP_TO_DATE"}
      staleReason={data.staleReason}
      onRun={data.onRunNode}
      onDelete={data.onDelete ? () => data.onDelete!(id) : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
        {/* Actor Picker Selector */}
        <div>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
            Select AI Actor
          </label>
          <select
            value={currentKey}
            onChange={(e) => handleSelectActor(e.target.value)}
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
            <option value="maya">Maya (Casual UGC Creator)</option>
            <option value="sarah">Sarah (Corporate / Direct Presenter)</option>
            <option value="marcus">Marcus (Fitness & High Energy)</option>
          </select>
        </div>

        {/* Actor Visual Showcase Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: "#faf5ff",
            border: "1px solid #f3e8ff",
            borderRadius: "12px",
            padding: "12px",
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              src={currentOutput.imageUrl}
              alt={currentOutput.name}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #a855f7",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#22c55e",
                border: "2px solid #ffffff",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
              {currentOutput.name}
            </span>
            <span style={{ fontSize: "12px", color: "#7e22ce", fontWeight: 500 }}>
              {currentOutput.actorType}
            </span>
            <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
              <span style={{ fontSize: "10px", background: "#f3e8ff", color: "#6b21a8", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                Look: {currentOutput.lookId}
              </span>
            </div>
          </div>
        </div>

        {/* Output Port: actor */}
        <PortRow
          type="source"
          id="actor"
          semanticType="ACTOR"
          label="ACTOR"
        />
      </div>
    </BaseNode>
  );
}
