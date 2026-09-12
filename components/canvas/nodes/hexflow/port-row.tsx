"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { getSemanticColor } from "@/lib/hexflow/matrix";
import { SemanticType } from "@/lib/hexflow/types";

interface PortRowProps {
  type: "target" | "source";
  id: string;
  semanticType: SemanticType;
  label: string;
  required?: boolean;
  roleHint?: string;
  position?: Position;
}

export function PortRow({
  type,
  id,
  semanticType,
  label,
  required,
  roleHint,
  position = type === "target" ? Position.Left : Position.Right,
}: PortRowProps) {
  const isTarget = type === "target";
  const color = getSemanticColor(semanticType);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: isTarget ? "flex-start" : "flex-end",
        height: "24px",
        position: "relative",
        margin: "1px 0",
      }}
    >
      <Handle
        type={type}
        position={position}
        id={id}
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#ffffff",
          border: `2px solid ${color}`,
          cursor: "crosshair",
          transition: "transform 0.15s ease, border-color 0.15s ease",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginLeft: isTarget ? "16px" : undefined,
          marginRight: !isTarget ? "16px" : undefined,
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: color,
          }}
        >
          {label}
        </span>
        {required && (
          <span
            style={{
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              padding: "1px 4px",
              borderRadius: "3px",
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fee2e2",
            }}
          >
            Required
          </span>
        )}
        {roleHint && !required && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 400,
              color: "#94a3b8",
            }}
          >
            ({roleHint})
          </span>
        )}
      </div>
    </div>
  );
}
