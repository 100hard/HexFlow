"use client";

import { useState, type CSSProperties } from "react";
import { ImagePlus, MoreVertical, PencilLine, Trash2 } from "lucide-react";
import Link from "next/link";

import type { Workflow } from "@/lib/mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type WorkflowCardProps = {
  workflow: Workflow;
};

const cardStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: 250,
};

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          transition: "border-color 0.15s ease",
        }}
      >
        <Link
          href={`/workflow/${workflow.id}`}
          style={{
            position: "relative",
            display: "block",
            aspectRatio: "250 / 162",
            background: "#f5f5f5",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(255,199,138,0.78) 0%, rgba(255,231,197,0.1) 18%, rgba(0,0,0,0) 28%), radial-gradient(120% 95% at 80% 8%, rgba(255,214,168,0.92), rgba(255,214,168,0) 32%), linear-gradient(180deg, #48515e 0%, #2e3745 32%, #202632 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -18,
              right: -10,
              bottom: 28,
              height: 52,
              borderTop: "2px solid rgba(255,255,255,0.85)",
              borderRadius: 999,
              transform: "rotate(-13deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 52,
              right: 40,
              bottom: 13,
              height: 28,
              background: "linear-gradient(180deg, rgba(70,130,255,0.98), rgba(0,95,221,0.98))",
              borderRadius: "30px 30px 16px 18px",
              transform: "skewX(-15deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 72,
              bottom: 9,
              width: 24,
              height: 24,
              borderRadius: 999,
              background: "#14171d",
              boxShadow: "98px 0 0 #14171d",
            }}
          />
        </Link>
      </div>

      <div
        style={{
          position: "absolute",
          left: 8,
          top: 8,
          zIndex: 10,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s ease",
        }}
      >
        <button
          type="button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: 6,
            border: 0,
            background: "rgba(255,255,255,0.8)",
            color: "#6b7280",
          }}
        >
          <ImagePlus size={16} />
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          right: 8,
          top: 8,
          zIndex: 10,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s ease",
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: 6,
                border: 0,
                background: "rgba(255,255,255,0.8)",
                color: "#6b7280",
              }}
            >
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild style={{ fontSize: 14 }}>
              <Link href={`/workflow/${workflow.id}`} className="w-full cursor-pointer">
                Open workflow
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem style={{ fontSize: 14 }}>
              <PencilLine size={16} />
              Rename workflow
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700" style={{ fontSize: 14 }}>
              <Trash2 size={16} />
              Delete workflow
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div style={{ marginTop: 8, padding: "0 4px" }}>
        <div
          title={workflow.name}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: 14,
            lineHeight: "20px",
            color: "#111827",
            fontWeight: 500,
          }}
        >
          {workflow.name}
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 12,
            lineHeight: "16px",
            color: "#6b7280",
          }}
        >
          {workflow.updatedAt}
        </div>
      </div>
    </div>
  );
}
