"use client";

import React from "react";
import { Video as VideoIcon, Film, AlertCircle } from "lucide-react";
import { BaseNode } from "./base-node";
import { PortRow } from "./port-row";
import { HexFlowNodeData, VideoOutput } from "@/lib/hexflow/types";

export function GenerateVideoNode({
  id,
  data,
}: {
  id: string;
  data: HexFlowNodeData;
}) {
  const config = data.config || {
    model: "Seedance 2.5",
    duration: 15,
    aspectRatio: "9:16",
    resolution: "1080p",
  };

  const currentOutput = data.outputData as VideoOutput | null;
  const previousOutput = data.previousOutputData as VideoOutput | null;
  const isStale = data.state === "STALE";

  // When stale, preserve and display the previous video result.
  const displayVideo = currentOutput || previousOutput;

  const handleConfigChange = (key: string, value: any) => {
    data.onChange?.({
      config: { ...config, [key]: value },
    });
  };

  return (
    <BaseNode
      id={id}
      title="Generate Video"
      category="Generate"
      state={data.state || "NOT_RUN"}
      staleReason={data.staleReason}
      onRun={data.onRunNode}
      onDelete={data.onDelete ? () => data.onDelete!(id) : undefined}
      width={420}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          position: "relative",
        }}
      >
        {/* Left Input Ports */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "10px",
          }}
        >
          <PortRow
            type="target"
            id="script"
            semanticType="SCRIPT"
            label="SCRIPT"
            required={true}
          />

          <PortRow
            type="target"
            id="actor"
            semanticType="ACTOR"
            label="ACTOR"
            roleHint="talent"
          />

          <PortRow
            type="target"
            id="product"
            semanticType="PRODUCT"
            label="PRODUCT"
            roleHint="context"
          />

          <PortRow
            type="target"
            id="setting"
            semanticType="SETTING"
            label="SETTING"
            roleHint="scene"
          />

          <PortRow
            type="target"
            id="image"
            semanticType="IMAGE"
            label="IMAGE"
            roleHint="visual keyframe"
          />
        </div>

        {/* Video Production Settings */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <div>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              AI Video Model
            </label>

            <select
              value={config.model || "Seedance 2.5"}
              onChange={(e) =>
                handleConfigChange("model", e.target.value)
              }
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
              <option value="Seedance 2.5">
                Seedance 2.5 (High Fidelity)
              </option>
              <option value="Kling 1.5">
                Kling 1.5 HD
              </option>
              <option value="Runway Gen-3">
                Runway Gen-3 Alpha
              </option>
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Format & Aspect
            </label>

            <select
              value={config.aspectRatio || "9:16"}
              onChange={(e) =>
                handleConfigChange("aspectRatio", e.target.value)
              }
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
              <option value="9:16">
                9:16 (Vertical 1080x1920)
              </option>
              <option value="16:9">
                16:9 (Landscape 1920x1080)
              </option>
              <option value="1:1">
                1:1 (Square Feed 1080x1080)
              </option>
            </select>
          </div>
        </div>

        {/* Video Preview */}
        <div
          style={{
            background:
              "linear-gradient(145deg, #111827 0%, #1f2937 55%, #111827 100%)",
            borderRadius: "10px",
            overflow: "hidden",
            position: "relative",
            minHeight: "180px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #334155",
          }}
        >
          {displayVideo ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              {/* Prototype render visual */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Film size={22} color="#e2e8f0" />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#f8fafc",
                    }}
                  >
                    Prototype render
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginTop: "4px",
                    }}
                  >
                    Video generation is simulated for this demo
                  </div>
                </div>
              </div>

              {/* Preserved Previous Result Overlay */}
              {isStale && (
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    background: "rgba(245, 158, 11, 0.9)",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <AlertCircle size={12} />
                  PREVIOUS RESULT PRESERVED
                </div>
              )}

              {/* Video Specs */}
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  background: "rgba(0,0,0,0.55)",
                  color: "#cbd5e1",
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "3px 7px",
                  borderRadius: "4px",
                }}
              >
                {displayVideo.model} • {displayVideo.resolution}
              </div>

              {/* Prototype Label */}
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "8px",
                  color: "#64748b",
                  fontSize: "9px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Generation simulated
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#94a3b8",
                padding: "20px 0",
              }}
            >
              <VideoIcon
                size={28}
                style={{
                  margin: "0 auto 8px",
                  color: "#64748b",
                }}
              />

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#f8fafc",
                }}
              >
                No video generated yet
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  marginTop: "2px",
                }}
              >
                Connect Script and click Run
              </div>
            </div>
          )}
        </div>

        {/* Output Port Right Handle */}
        <PortRow
          type="source"
          id="video"
          semanticType="VIDEO"
          label="VIDEO"
        />
      </div>
    </BaseNode>
  );
}