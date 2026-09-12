"use client";

import { useState, type CSSProperties } from "react";
import { ImagePlus, MoreVertical, Pencil, Copy, Download, Trash2, ExternalLink } from "lucide-react";
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
  const handleRename = () => {
    setTimeout(async () => {
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
    }, 100);
  };

  // 2. Interactive Delete Action Handler
  const handleDelete = () => {
    setTimeout(async () => {
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
    }, 100);
  };

  // 3. Interactive Duplicate Action Handler
  const handleDuplicate = () => {
    setTimeout(async () => {
      try {
        const detailsRes = await fetch(`/api/workflows/${workflow.id}`);
        if (!detailsRes.ok) {
          alert("Failed to fetch original workflow details.");
          return;
        }
        const original = await detailsRes.json();

        const copyRes = await fetch("/api/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${original.name} (Copy)`,
            nodes: original.nodes,
            edges: original.edges,
          }),
        });

        if (copyRes.ok) {
          if (onRefresh) onRefresh();
          router.refresh();
        } else {
          alert("Failed to duplicate workflow.");
        }
      } catch (error) {
        alert("An error occurred during duplication.");
      }
    }, 100);
  };

  // 4. Interactive Export JSON Handler
  const handleExportJSON = () => {
    setTimeout(async () => {
      try {
        const detailsRes = await fetch(`/api/workflows/${workflow.id}`);
        if (!detailsRes.ok) {
          alert("Failed to fetch workflow details.");
          return;
        }
        const details = await detailsRes.json();
        
        const workflowData = {
          name: details.name,
          nodes: details.nodes,
          edges: details.edges,
        };
        
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(workflowData, null, 2)
        )}`;
        
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", jsonString);
        downloadAnchor.setAttribute("download", `${details.name.replace(/\s+/g, "_").toLowerCase()}_config.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      } catch (error) {
        alert("Failed to export workflow to JSON.");
      }
    }, 100);
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
          {(() => {
            const nameLower = workflow.name.toLowerCase();
            let productImage = "/products/nike-shoe.jpg";
            let productBadge = "Nike Pegasus";

            if (nameLower.includes("headphone") || nameLower.includes("audio") || nameLower.includes("sound") || nameLower.includes("copy") || nameLower.includes("marketing")) {
              productImage = "/products/headphones.jpg";
              productBadge = "Audio Gear";
            } else if (nameLower.includes("nike") || nameLower.includes("shoe") || nameLower.includes("sneaker") || nameLower.includes("ugc") || nameLower.includes("pipeline")) {
              productImage = "/products/nike-shoe.jpg";
              productBadge = "Nike Footwear";
            }

            return (
              <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#0f172a" }}>
                <img
                  src={productImage}
                  alt={workflow.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    transform: hovered ? "scale(1.08)" : "scale(1)",
                  }}
                />
                {/* Subtle studio gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 40%, rgba(15,23,42,0.7) 100%)",
                    pointerEvents: "none",
                  }}
                />
                {/* Bottom product category badge */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#ffffff",
                      background: "rgba(0, 0, 0, 0.6)",
                      backdropFilter: "blur(6px)",
                      padding: "2px 8px",
                      borderRadius: 4,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}
                  >
                    {productBadge}
                  </span>
                </div>
              </div>
            );
          })()}
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
          <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 rounded-xl shadow-lg p-1.5 font-sans">
            <DropdownMenuItem asChild style={{ fontSize: 13, fontWeight: 500, borderRadius: 8 }}>
              <Link href={`/workflow/${workflow.id}`} className="w-full flex items-center px-2 py-1.5 text-slate-700 hover:bg-slate-50 cursor-pointer">
                <ExternalLink size={14} className="mr-2.5 text-slate-500" />
                <span>Open</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleRename} style={{ fontSize: 13, fontWeight: 500, borderRadius: 8 }} className="flex items-center px-2 py-1.5 text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Pencil size={14} className="mr-2.5 text-slate-500" />
              <span>Rename</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDuplicate} style={{ fontSize: 13, fontWeight: 500, borderRadius: 8 }} className="flex items-center px-2 py-1.5 text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Copy size={14} className="mr-2.5 text-slate-500" />
              <span>Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleExportJSON} style={{ fontSize: 13, fontWeight: 500, borderRadius: 8 }} className="flex items-center px-2 py-1.5 text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Download size={14} className="mr-2.5 text-slate-500" />
              <span>Export JSON</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 border-t border-slate-100" />
            <DropdownMenuItem onSelect={handleDelete} className="flex items-center px-2 py-1.5 text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 cursor-pointer" style={{ fontSize: 13, fontWeight: 500, borderRadius: 8 }}>
              <Trash2 size={14} className="mr-2.5 text-red-500" />
              <span>Delete</span>
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
