"use client";

import { Handle, Position } from "@xyflow/react";
import { Info, Plus, GripVertical, Trash2, FileText, Image as ImageIcon } from "lucide-react";

export function RequestInputsNode({ data }: { data: any }) {
  const fields = data.fields || [];

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

  const handleAddField = () => {
    if (!data.onChange) return;
    const newId = `field-${Date.now()}`;
    const newField = {
      id: newId,
      type: "text_field",
      name: `input_${fields.length + 1}`,
      value: "",
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
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: "380px",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "visible", // crucial for absolute handle offset
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
        <button
          type="button"
          onClick={handleAddField}
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
            color: "#4f46e5",
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#f5f5f5")}
          title="Add Input Parameter"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Node Body */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
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
          fields.map((field: any, index: number) => {
            const isImage = field.type === "image_field";
            return (
              <div
                key={field.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  padding: "12px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  position: "relative", // crucial for holding absolute handle
                }}
              >
                {/* Field Controls Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
                    <GripVertical size={14} style={{ color: "#94a3b8", cursor: "grab" }} />
                    <input
                      type="text"
                      className="nodrag"
                      value={field.name}
                      onChange={(e) => handleFieldChange(field.id, "name", e.target.value)}
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        background: "transparent",
                        border: "1px solid transparent",
                        borderRadius: "4px",
                        outline: "none",
                        width: "120px",
                        padding: "2px 4px",
                      }}
                      onFocus={(e) => {
                        e.target.style.background = "#ffffff";
                        e.target.style.borderColor = "#cbd5e1";
                      }}
                      onBlur={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.borderColor = "transparent";
                      }}
                    />
                    
                    {/* Format Switcher */}
                    <select
                      className="nodrag"
                      value={field.type}
                      onChange={(e) => handleFieldChange(field.id, "type", e.target.value)}
                      style={{
                        fontSize: "10px",
                        color: "#64748b",
                        border: "1px solid #e2e8f0",
                        borderRadius: "4px",
                        padding: "1px 4px",
                        background: "#ffffff",
                        outline: "none",
                      }}
                    >
                      <option value="text_field">Text</option>
                      <option value="image_field">Image</option>
                    </select>
                  </div>

                  {/* Action row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      className="nodrag"
                      onClick={() => handleFieldDelete(field.id)}
                      style={{
                        background: "none",
                        border: 0,
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "2px",
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Delete parameter"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Input element depending on format */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {isImage ? (
                    <div
                      className="nodrag"
                      style={{
                        border: "1px dashed #cbd5e1",
                        borderRadius: "6px",
                        background: "#ffffff",
                        padding: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ImageIcon size={18} style={{ color: "#94a3b8" }} />
                      <input
                        type="text"
                        placeholder="Paste image URL..."
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, "value", e.target.value)}
                        style={{
                          width: "100%",
                          fontSize: "11px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          outline: "none",
                        }}
                      />
                    </div>
                  ) : (
                    <textarea
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.id, "value", e.target.value)}
                      placeholder="Enter value..."
                      rows={3}
                      className="nodrag nowheel"
                      style={{
                        width: "100%",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        padding: "8px",
                        fontSize: "12px",
                        color: "#334155",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  )}
                </div>

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
            );
          })
        )}
      </div>
    </div>
  );
}
