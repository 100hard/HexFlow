"use client";

import {
  Clock,
  Crop,
  FileText,
  Image as ImageIcon,
  Mic,
  Plus,
  Search,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";

interface AddNodeBarProps {
  onAddNode: (type: "gemini" | "cropImage") => void;
}

export function AddNodeBar({ onAddNode }: AddNodeBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (type: "gemini" | "cropImage") => {
    onAddNode(type);
    setIsOpen(false);
    setSearchQuery("");
  };

  const recentItems = [
    { id: "cropImage" as const, name: "Crop Image", icon: Crop },
    { id: "gemini" as const, name: "Gemini 3.1 Pro", icon: Sparkles },
  ];

  const imageItems = [
    { name: "Generate Image", icon: ImageIcon, expandable: true },
    { name: "Edit Image", icon: ImageIcon, expandable: true },
    { name: "3D", icon: ImageIcon, expandable: true },
  ];

  const videoItems = [
    { name: "Generate Video", icon: Video, expandable: true },
    { name: "Enhance Video", icon: Video, expandable: true },
    { name: "BG Remover", icon: Video, expandable: true },
  ];

  // Filtering recent items by search query
  const filteredRecent = recentItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            borderRadius: "20px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            width: "320px",
            maxHeight: "440px",
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
            }}
          >
            <Search size={16} style={{ color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search nodes or models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 0,
                outline: "none",
                fontSize: "14px",
                color: "#0f172a",
                width: "100%",
                background: "transparent",
              }}
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
              padding: "8px 0",
              maxHeight: "360px",
            }}
          >
            {/* Recent Section */}
            {filteredRecent.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    padding: "8px 16px 4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Clock size={12} />
                  <span>Recent</span>
                </div>
                {filteredRecent.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: "transparent",
                      border: 0,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <item.icon size={16} style={{ color: "#475569" }} />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Image Section */}
            {searchQuery === "" && (
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    padding: "12px 16px 4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ImageIcon size={12} />
                  <span>IMAGE</span>
                </div>
                {imageItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "not-allowed",
                      opacity: 0.6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <item.icon size={16} style={{ color: "#94a3b8" }} />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#475569" }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>&gt;</span>
                  </div>
                ))}
              </div>
            )}

            {/* Video Section */}
            {searchQuery === "" && (
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    padding: "12px 16px 4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Video size={12} />
                  <span>VIDEO</span>
                </div>
                {videoItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "not-allowed",
                      opacity: 0.6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <item.icon size={16} style={{ color: "#94a3b8" }} />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#475569" }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>&gt;</span>
                  </div>
                ))}
              </div>
            )}

            {/* Audio Section */}
            {searchQuery === "" && (
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    padding: "12px 16px 4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Mic size={12} />
                  <span>AUDIO</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Visual Trigger Bar matching [ Page-Icon | + ] exactly */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "6px 8px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Document Icon button */}
        <button
          style={{
            background: "none",
            border: 0,
            color: "#64748b",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "not-allowed",
            borderRadius: "10px",
          }}
          title="Documents"
        >
          <FileText size={20} />
        </button>

        {/* Plus Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: isOpen ? "#0f172a" : "#f1f5f9",
            color: isOpen ? "#ffffff" : "#0f172a",
            border: 0,
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          title="Add node"
        >
          <Plus size={20} style={{ transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s ease" }} />
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
