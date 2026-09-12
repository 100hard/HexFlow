"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, AlertCircle, FileText, Film, Edit3 } from "lucide-react";
import { BaseNode } from "./base-node";
import { PortRow } from "./port-row";
import { HexFlowNodeData, ScriptOutput, VideoOutput, ReviewOutput } from "@/lib/hexflow/types";

export function ReviewNode({ id, data }: { id: string; data: HexFlowNodeData }) {
  const currentOutput = (data.outputData || data.previousOutputData) as any;
  const isVideo = currentOutput?.type === "VIDEO" && !!currentOutput?.video?.assetUrl;
  const isApproved = currentOutput?.approved ?? (data.state === "UP_TO_DATE");

  // Extract script text snippet
  const scriptText = currentOutput?.script?.text || currentOutput?.text || "";
  const hookMatch = scriptText.match(/\[HOOK\]:\s*"([^"]+)"/);
  const hookText = hookMatch ? hookMatch[1] : (scriptText.split("\n")[0] || "");
  const duration = currentOutput?.script?.durationSeconds || currentOutput?.durationSeconds || 30;

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(scriptText);

  // Synchronize local editedText if upstream changes
  React.useEffect(() => {
    if (scriptText) setEditedText(scriptText);
  }, [scriptText]);

  const handleToggleApprove = () => {
    const newApproved = !isApproved;
    if (isVideo) {
      data.onChange?.({
        outputData: {
          type: "VIDEO",
          approved: newApproved,
          approvedAt: newApproved ? new Date().toISOString() : undefined,
          video: currentOutput?.video || currentOutput,
        },
        state: newApproved ? "UP_TO_DATE" : "STALE",
      });
    } else {
      // Script review approval
      const baseScript = currentOutput?.script || currentOutput || {};
      data.onChange?.({
        outputData: {
          ...baseScript,
          type: "SCRIPT",
          text: editedText || scriptText,
          approved: newApproved,
          approvedAt: newApproved ? new Date().toISOString() : undefined,
        },
        state: newApproved ? "UP_TO_DATE" : "STALE",
        staleReason: newApproved ? undefined : "Pending human review",
      });
    }
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    const baseScript = currentOutput?.script || currentOutput || {};
    data.onChange?.({
      outputData: {
        ...baseScript,
        type: "SCRIPT",
        text: editedText,
        approved: true,
        approvedAt: new Date().toISOString(),
      },
      state: "UP_TO_DATE",
      staleReason: undefined,
    });
  };

  return (
    <BaseNode
      id={id}
      title={isVideo ? "Video Review Gate" : "Script & Creative Review"}
      category="Control"
      state={data.state || "NOT_RUN"}
      staleReason={data.staleReason}
      onRun={data.onRunNode}
      onDelete={data.onDelete ? () => data.onDelete!(id) : undefined}
      width={400}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
        {/* Left Input Port */}
        <PortRow
          type="target"
          id={isVideo ? "video" : "script"}
          semanticType={isVideo ? "VIDEO" : "SCRIPT"}
          label={isVideo ? "VIDEO CANDIDATE" : "SCRIPT DRAFT"}
          required={true}
        />

        {/* Human Gate Status Banner */}
        <div
          style={{
            background: isApproved ? "#f0fdf4" : "#fffbeb",
            border: `1.5px solid ${isApproved ? "#86efac" : "#fde68a"}`,
            borderRadius: "10px",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              {isApproved ? (
                <ShieldCheck size={18} color="#16a34a" />
              ) : (
                <AlertCircle size={18} color="#d97706" />
              )}
              <span style={{ fontSize: "13px", fontWeight: 700, color: isApproved ? "#166534" : "#92400e" }}>
                {isApproved ? "Approved for Production" : "Pending Human Sign-Off"}
              </span>
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "999px",
                background: isApproved ? "#dcfce7" : "#fef3c7",
                color: isApproved ? "#15803d" : "#b45309",
              }}
            >
              {isApproved ? "LOCKED" : "REVIEW REQUIRED"}
            </span>
          </div>

          <div style={{ fontSize: "11px", color: isApproved ? "#166534" : "#78350f", lineHeight: 1.4 }}>
            {isApproved
              ? "Human taste approved. Downstream video rendering is unlocked. Swapping actors will preserve this creative."
              : "Review copy and hook before launching heavy AI video rendering."}
          </div>

          {/* Script Content Preview */}
          {!isVideo && (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px",
                marginTop: "4px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#047857", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Hook & Message ({duration}s)
                </span>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="nodrag"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "none",
                      border: 0,
                      color: "#64748b",
                      fontSize: "11px",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Copy</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="nodrag"
                    style={{
                      background: "#047857",
                      color: "#ffffff",
                      border: 0,
                      borderRadius: "4px",
                      fontSize: "11px",
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Save
                  </button>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="nodrag"
                  rows={4}
                  style={{
                    width: "100%",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                />
              ) : (
                <div style={{ fontSize: "12px", color: "#1e293b", fontStyle: "italic", lineHeight: 1.45 }}>
                  &ldquo;{hookText || "Click to inspect draft script..."}&rdquo;
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleToggleApprove}
            className="nodrag"
            style={{
              width: "100%",
              marginTop: "4px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: 0,
              background: isApproved ? "#15803d" : "#0f172a",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <CheckCircle2 size={15} />
            <span>{isApproved ? "Approved (Click to Revoke)" : "Approve & Unlock Render"}</span>
          </button>
        </div>

        {/* Right Output Port */}
        <PortRow
          type="source"
          id={isVideo ? "video" : "script"}
          semanticType={isVideo ? "VIDEO" : "SCRIPT"}
          label={isVideo ? "APPROVED VIDEO" : "APPROVED SCRIPT"}
        />
      </div>
    </BaseNode>
  );
}

