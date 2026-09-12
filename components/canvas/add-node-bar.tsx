"use client";

import {
  Package,
  Lightbulb,
  FileText,
  User,
  MapPin,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";

interface AddNodeBarProps {
  onAddNode: (type: string) => void;
}

export function AddNodeBar({ onAddNode }: AddNodeBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (type: string) => {
    onAddNode(type);
    setIsOpen(false);
    setSearchQuery("");
  };

  const categories = [
    {
      name: "CREATIVE",
      color: "#2563eb",
      items: [
        { id: "product", name: "Product", desc: "Product context & specs", icon: Package },
        { id: "hook", name: "Hook", desc: "Creative opening angle", icon: Lightbulb },
        { id: "script", name: "Script", desc: "UGC / commercial copy", icon: FileText },
        { id: "actor", name: "Actor", desc: "AI talent & look selection", icon: User },
        { id: "setting", name: "Setting", desc: "Environment, lighting, mood", icon: MapPin },
      ],
    },
    {
      name: "GENERATE",
      color: "#9333ea",
      items: [
        { id: "generateImage", name: "Generate Image", desc: "Visual keyframe producer", icon: ImageIcon },
        { id: "generateVideo", name: "Generate Video", desc: "Seedance 2.5 video engine", icon: Video },
      ],
    },
    {
      name: "CONTROL",
      color: "#16a34a",
      items: [
        { id: "review", name: "Review / Select", desc: "Human gatekeeper & approval", icon: CheckCircle2 },
      ],
    },
  ];

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "calc(50% + 130px)",
        transform: "translateX(-50%)",
        zIndex: 50,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Popover Menu above the bottom trigger */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "64px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            width: "340px",
            maxHeight: "460px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideUp 0.2s ease-out",
          }}
        >
          {/* Header Search Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              borderBottom: "1px solid #f1f5f9",
              gap: "8px",
              background: "#fafafa",
            }}
          >
            <Search size={16} style={{ color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search creative nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 0,
                outline: "none",
                fontSize: "13px",
                color: "#0f172a",
                width: "100%",
                background: "transparent",
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: 0, color: "#64748b", cursor: "pointer", padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* List content (Scrollable) */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px 0",
              maxHeight: "380px",
            }}
          >
            {filteredCategories.map((cat) => (
              <div key={cat.name} style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    color: cat.color,
                    padding: "4px 16px 6px",
                  }}
                >
                  {cat.name}
                </div>
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      style={{
                        width: "100%",
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        background: "transparent",
                        border: 0,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.12s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#475569",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Visual Trigger Bar */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "6px 8px",
          boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: isOpen ? "#0f172a" : "#4f46e5",
            color: "#ffffff",
            border: 0,
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
            boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
          }}
          title="Add creative node"
        >
          <Plus
            size={16}
            style={{
              transform: isOpen ? "rotate(45deg)" : "none",
              transition: "transform 0.2s ease",
            }}
          />
          <span>Add Node</span>
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 15px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
