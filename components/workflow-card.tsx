"use client";

import { useState, type CSSProperties } from "react";
import { ImagePlus, MoreVertical, PencilLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Workflow = {
  id: string;
  name: string;
  updatedAt: string | Date;
};

type WorkflowCardProps = {
  workflow: Workflow;
  onRefresh?: () => void;
};

const cardStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: 250,
};

export function WorkflowCard({ workflow, onRefresh }: WorkflowCardProps) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  // 1. Interactive Rename Action Handler
  const handleRename = async () => {
    const newName = prompt("Enter new workflow name:", workflow.name);
    if (!newName || newName.trim() === "" || newName === workflow.name) return;

    try {
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        if (onRefresh) onRefresh();
        router.refresh();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to rename workflow");
      }
    } catch (error) {
      alert("Failed to rename workflow. Please try again.");
    }
  };

  // 2. Interactive Delete Action Handler
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${workflow.name}"?`)) return;

    try {
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (onRefresh) onRefresh();
        router.refresh();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to delete workflow");
      }
    } catch (error) {
      alert("Failed to delete workflow. Please try again.");
    }
  };

  // Format updatedAt date beautifully
  const displayDate = typeof workflow.updatedAt === "string" 
    ? workflow.updatedAt 
    : `Edited ${new Date(workflow.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}`;

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
          {workflow.name.toLowerCase().includes("marketing") || workflow.name.toLowerCase().includes("copy") ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Glowing background halo */}
              <div
                style={{
                  position: "absolute",
                  width: "100px",
                  height: "100px",
                  borderRadius: "999px",
                  background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)",
                  filter: "blur(8px)",
                }}
              />
              
              {/* Minimalist modern Headphones SVG */}
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="url(#headphone-gradient-card)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: "drop-shadow(0 4px 12px rgba(99, 102, 241, 0.4))",
                  zIndex: 2,
                }}
              >
                <defs>
                  <linearGradient id="headphone-gradient-card" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                {/* Headband arc */}
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                {/* Left Muff */}
                <rect x="2" y="12" width="3" height="6" rx="1.5" fill="#818cf8" stroke="none" />
                <rect x="2" y="12" width="3" height="6" rx="1.5" />
                {/* Right Muff */}
                <rect x="19" y="12" width="3" height="6" rx="1.5" fill="#818cf8" stroke="none" />
                <rect x="19" y="12" width="3" height="6" rx="1.5" />
                {/* Audio wave dynamic particles */}
                <path d="M9 13v-2" stroke="#a78bfa" strokeWidth="1" />
                <path d="M12 15V9" stroke="#818cf8" strokeWidth="1" />
                <path d="M15 13v-2" stroke="#a78bfa" strokeWidth="1" />
              </svg>

              {/* Soft neon overlay grid lines */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                  opacity: 0.7,
                }}
              />
            </div>
          ) : (
            <>
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
            </>
          )}
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
            <DropdownMenuItem onClick={handleRename} style={{ fontSize: 14 }}>
              <PencilLine size={16} className="mr-2" />
              Rename workflow
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:bg-red-50 focus:text-red-700" style={{ fontSize: 14 }}>
              <Trash2 size={16} className="mr-2" />
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
          {displayDate}
        </div>
      </div>
    </div>
  );
}
