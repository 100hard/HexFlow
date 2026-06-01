"use client";

import { Handle, Position } from "@xyflow/react";
import { Info, Plus, GripVertical, Trash2, Copy, Upload, Maximize2 } from "lucide-react";
import { useState } from "react";

export function RequestInputsNode({ data }: { data: any }) {
  const fields = data.fields || [];
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleFieldChange = (fieldId: string, key: "name" | "value" | "type", value: string) => {
    if (!data.onChange) return;
    const updatedFields = fields.map((f: any) => {
      if (f.id === fieldId) {
        return { ...f, [key]: value };
      }
      return f;
    });
    data.onChange({ fields: updatedFields });
  };

  const handleAddField = (type: "text_field" | "image_field") => {
    if (!data.onChange) return;
    const newId = `field-${Date.now()}`;
    const count = fields.filter((f: any) => f.type === type).length + 1;
    const newField = {
      id: newId,
      type: type,
      name: type === "text_field" ? `text_input_${count}` : `image_input_${count}`,
      value: "",
    };
    data.onChange({ fields: [...fields, newField] });
    setShowAddMenu(false);
  };

  const handleFieldDuplicate = (field: any) => {
    if (!data.onChange) return;
    const newId = `field-${Date.now()}`;
    const newField = {
      ...field,
      id: newId,
      name: `${field.name}_copy`,
    };
    data.onChange({ fields: [...fields, newField] });
  };

  const handleFieldDelete = (fieldId: string) => {
    if (!data.onChange) return;
    const updatedFields = fields.filter((f: any) => f.id !== fieldId);
    data.onChange({ fields: updatedFields });
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: data?.executing ? "2px solid #6366f1" : "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: data?.executing 
          ? "0 0 0 4px rgba(99, 102, 241, 0.5), 0 10px 30px rgba(99, 102, 241, 0.3)" 
          : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: "380px",
        transition: "all 0.3s ease-in-out",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "visible",
        position: "relative",
      }}
    >
      {/* Node Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #f3f4f6",
          cursor: "grab",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
            Request-Inputs
          </span>
          <Info size={14} style={{ color: "#9ca3af", cursor: "pointer" }} />
        </div>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="nodrag"
            style={{
              background: "#f5f5f5",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f5")}
            title="Add Input Parameter"
          >
            <Plus size={16} />
          </button>
          
          {showAddMenu && (
            <div
              className="nodrag"
              style={{
                position: "absolute",
                top: "38px",
                right: 0,
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                zIndex: 999,
                padding: "4px",
                width: "140px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <button
                onClick={() => handleAddField("text_field")}
                type="button"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "none",
                  border: 0,
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#374151",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                Text Input
              </button>
              <button
                onClick={() => handleAddField("image_field")}
                type="button"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "none",
                  border: 0,
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#374151",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                Image Input
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Node Body */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {fields.length === 0 ? (
          <div
            style={{
              padding: "12px",
              textAlign: "center",
              fontSize: "12px",
              color: "#9ca3af",
              border: "1px dashed #e5e7eb",
              borderRadius: "8px",
            }}
          >
            No parameters defined yet. Click + to add.
          </div>
        ) : (
          fields.map((field: any) => {
            const isImage = field.type === "image_field";
            return (
              <div
                key={field.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {/* Field Controls Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
                    <GripVertical size={14} style={{ color: "#94a3b8", cursor: "grab", flexShrink: 0 }} />
                    <input
                      type="text"
                      className="nodrag"
                      value={field.name}
                      onChange={(e) => handleFieldChange(field.id, "name", e.target.value)}
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#374151",
                        background: "transparent",
                        border: "1px solid transparent",
                        borderRadius: "4px",
                        outline: "none",
                        width: "140px",
                        padding: "2px 4px",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#e5e7eb";
                      }}
                      onMouseLeave={(e) => {
                        if (document.activeElement !== e.currentTarget) {
                          e.currentTarget.style.borderColor = "transparent";
                        }
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.borderColor = "#cbd5e1";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                    />
                    <Info size={13} style={{ color: "#cbd5e1", cursor: "pointer", flexShrink: 0 }} />
                  </div>

                  {/* Actions (Duplicate/Copy & Delete) */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <button
                      type="button"
                      className="nodrag"
                      onClick={() => handleFieldDuplicate(field)}
                      style={{
                        background: "none",
                        border: 0,
                        color: "#9ca3af",
                        cursor: "pointer",
                        padding: "2px",
                        display: "flex",
                        alignItems: "center",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#4b5563")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                      title="Duplicate Field"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      className="nodrag"
                      onClick={() => handleFieldDelete(field.id)}
                      style={{
                        background: "none",
                        border: 0,
                        color: "#9ca3af",
                        cursor: "pointer",
                        padding: "2px",
                        display: "flex",
                        alignItems: "center",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                      title="Delete parameter"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Input element depending on format */}
                <div style={{ position: "relative" }}>
                  {isImage ? (
                    <button
                      type="button"
                      className="nodrag"
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        borderRadius: "8px",
                        border: "1px dashed #d1d5db",
                        background: "#f5f5f5",
                        padding: "10px 12px",
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#6b7280",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#e5e7eb";
                        e.currentTarget.style.borderColor = "#9ca3af";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f5f5f5";
                        e.currentTarget.style.borderColor = "#d1d5db";
                      }}
                    >
                      <Upload size={14} />
                      <span>Upload Image</span>
                    </button>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <textarea
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, "value", e.target.value)}
                        placeholder="Enter text..."
                        rows={3}
                        className="nodrag nowheel"
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: "#f5f5f5",
                          padding: "12px",
                          fontSize: "14px",
                          color: "#111827",
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                      <button
                        type="button"
                        className="nodrag"
                        style={{
                          position: "absolute",
                          bottom: "8px",
                          right: "8px",
                          width: "24px",
                          height: "24px",
                          background: "rgba(229, 231, 235, 0.8)",
                          border: 0,
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          cursor: "pointer",
                        }}
                      >
                        <Maximize2 size={12} />
                      </button>
                    </div>
                  )}

                  {/* Output source Handle offset absolutely right by -22px */}
                  <div style={{ position: "absolute", right: "-22px", top: "50%", transform: "translateY(-50%)", zIndex: 50 }}>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={field.id}
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        background: isImage ? "#3b82f6" : "#f59e0b",
                        border: `2px solid ${isImage ? "rgba(59, 130, 246, 0.5)" : "rgba(245, 158, 11, 0.5)"}`,
                        boxShadow: `0 0 8px ${isImage ? "rgba(59, 130, 246, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                        cursor: "crosshair",
                        position: "relative",
                        right: 0,
                        top: 0,
                        transform: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
