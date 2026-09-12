"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, CornerDownLeft, Loader2, Check, AlertCircle, X } from "lucide-react";
import { Node, Edge } from "@xyflow/react";
import { resolveHexFlowAgentIntent, GraphOperation } from "@/lib/hexflow/agent-engine";

interface AgentCommandBarProps {
  currentNodes: Node[];
  currentEdges: Edge[];
  onApplyOperation: (operation: GraphOperation) => Promise<void> | void;
  isExecuting?: boolean;
}

export function AgentCommandBar({
  currentNodes,
  currentEdges,
  onApplyOperation,
  isExecuting = false,
}: AgentCommandBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    title: string;
    subtitle?: string;
    model?: string;
  } | null>(null);

  const [creationStepIndex, setCreationStepIndex] = useState<number | null>(null);
  const [activeCreationSteps, setActiveCreationSteps] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Context-aware suggestions based on graph complexity
  const hasMultipleHooks = currentNodes.filter((n) => n.type === "hook").length > 1;
  const suggestions = hasMultipleHooks
    ? [
        "Change the second hook to Before / After",
        "Make the second script comedic",
        "Swap actor for Marcus",
      ]
    : [
        "Change the actor to Sarah",
        "Change the hook to Before / After",
        "Create two UGC concepts for this product, one Problem → Solution and one POV",
      ];

  // Auto-clear feedback after 8 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Handle outside click to collapse suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as any)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (customPrompt?: string) => {
    const textToRun = (customPrompt || prompt).trim();
    if (!textToRun || isSubmitting || isExecuting) return;

    setIsSubmitting(true);
    setFeedback(null);

    let op: GraphOperation | null = null;
    let feedbackTitle = "";
    let feedbackSubtitle = "";
    let modelName = "";

    try {
      // 1. Call HexFlow Agent API endpoint (OpenAI gpt-5-mini / gpt-4o-mini)
      const res = await fetch("/api/hexflow/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToRun,
          currentNodes,
          currentEdges,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.operation) {
          op = data.operation;
          feedbackTitle = data.operation.summary || data.userMessage || "Updated workflow";
          feedbackSubtitle = data.operation.detail || "";
          modelName = data.model || "";
        } else if (data.error && !data.operation) {
          throw new Error(data.userMessage || data.error);
        }
      } else {
        throw new Error(`Agent API returned HTTP ${res.status}`);
      }
    } catch (apiError: any) {
      console.warn("[AgentCommandBar] API request failed, engaging local resolver fallback:", apiError);
      // 2. Seamless local fallback
      const localResult = resolveHexFlowAgentIntent(textToRun, currentNodes, currentEdges);
      if (localResult.success && localResult.operation) {
        op = localResult.operation;
        feedbackTitle = op.summary;
        feedbackSubtitle = op.detail;
        modelName = "offline-rules";
      } else {
        setFeedback({
          type: "error",
          title: "Could not resolve creative request",
          subtitle: localResult.userMessage || localResult.error || apiError.message,
        });
        setIsSubmitting(false);
        return;
      }
    }

    if (!op) {
      setFeedback({
        type: "error",
        title: "Could not apply graph changes",
        subtitle: "No valid graph operation generated.",
      });
      setIsSubmitting(false);
      return;
    }

    // If CREATE_GRAPH, run the rapid sequential construction feedback
    if (op.type === "CREATE_GRAPH" && op.nodeSteps && op.nodeSteps.length > 0) {
      setActiveCreationSteps(op.nodeSteps);
      for (let i = 0; i < op.nodeSteps.length; i++) {
        setCreationStepIndex(i);
        await new Promise((r) => setTimeout(r, 90));
      }
      setCreationStepIndex(null);
      setActiveCreationSteps([]);
    }

    // Apply operation to React Flow state
    await onApplyOperation(op);

    setFeedback({
      type: "success",
      title: feedbackTitle || op.summary,
      subtitle: feedbackSubtitle || op.detail,
      model: modelName,
    });

    setPrompt("");
    setIsFocused(false);
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: "14px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "auto",
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Main Floating Capsule */}
      <div
        style={{
          width: isFocused ? "580px" : "460px",
          transition: "width 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease",
          background: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: isFocused ? "1.5px solid #16a34a" : "1.5px solid #86efac",
          borderRadius: "9999px",
          boxShadow: isFocused
            ? "0 12px 35px -6px rgba(22, 163, 74, 0.22), 0 4px 14px rgba(0, 0, 0, 0.05)"
            : "0 6px 22px -3px rgba(22, 163, 74, 0.12), 0 2px 6px rgba(0, 0, 0, 0.03)",
          display: "flex",
          alignItems: "center",
          padding: "5px 6px 5px 18px",
          gap: "8px",
        }}
      >
        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Ask HexFlow to create or change workflows..."
          disabled={isSubmitting || isExecuting}
          style={{
            flex: 1,
            border: 0,
            outline: "none",
            background: "transparent",
            fontSize: "13.5px",
            color: "#0f172a",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            padding: "5px 0",
          }}
        />

        {/* Clear prompt button */}
        {prompt && (
          <button
            type="button"
            onClick={() => setPrompt("")}
            style={{
              background: "transparent",
              border: 0,
              padding: "4px",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        )}

        {/* Submit Action Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!prompt.trim() || isSubmitting || isExecuting}
          style={{
            height: "32px",
            padding: "0 14px",
            borderRadius: "9999px",
            border: 0,
            background: prompt.trim() ? "#16a34a" : "#f1f5f9",
            color: prompt.trim() ? "#ffffff" : "#94a3b8",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            cursor: prompt.trim() ? "pointer" : "default",
            transition: "all 0.15s ease",
            boxShadow: prompt.trim() ? "0 2px 8px rgba(22, 163, 74, 0.28)" : "none",
          }}
        >
          {isSubmitting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <>
              <span>Apply</span>
              <CornerDownLeft size={12} />
            </>
          )}
        </button>
      </div>

      {/* Quick Suggestion Chips (Visible on Focus) */}
      {isFocused && !isSubmitting && (
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: "640px",
            animation: "fadeIn 0.15s ease",
          }}
        >
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setPrompt(s);
                handleSubmit(s);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid #e2e8f0",
                borderRadius: "9999px",
                padding: "4px 11px",
                fontSize: "11px",
                fontWeight: 550,
                color: "#334155",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.03)",
                transition: "all 0.12s ease",
              }}
              className="hover:border-green-500 hover:text-green-700 hover:bg-green-50/60"
            >
              <span style={{ color: "#16a34a", fontSize: "10px" }}>✦</span>
              <span>{s.length > 52 ? s.substring(0, 48) + "..." : s}</span>
            </button>
          ))}
        </div>
      )}

      {/* Creation Step Sequential Animation */}
      {creationStepIndex !== null && activeCreationSteps.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            background: "#ffffff",
            border: "1px solid #d1fae5",
            borderRadius: "12px",
            padding: "10px 16px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            minWidth: "280px",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", display: "flex", alignItems: "center", gap: 6 }}>
            <Loader2 size={12} className="animate-spin text-emerald-600" />
            <span>Constructing workflow structure...</span>
          </div>
          <div style={{ fontSize: "11.5px", color: "#047857", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={13} />
            <span>{activeCreationSteps[creationStepIndex]}</span>
          </div>
        </div>
      )}

      {/* Feedback Banner (Explains What Changed and Downstream Impact) */}
      {feedback && creationStepIndex === null && (
        <div
          style={{
            marginTop: "8px",
            background: feedback.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${feedback.type === "success" ? "#86efac" : "#fca5a5"}`,
            borderRadius: "10px",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: "9px",
            maxWidth: "520px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {feedback.type === "success" ? (
            <Check size={15} color="#16a34a" style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: feedback.type === "success" ? "#166534" : "#991b1b",
                  letterSpacing: "-0.01em",
                }}
              >
                {feedback.title}
              </span>
            </div>
            {feedback.subtitle && (
              <span
                style={{
                  fontSize: "11px",
                  color: feedback.type === "success" ? "#15803d" : "#b91c1c",
                  lineHeight: 1.35,
                }}
              >
                {feedback.subtitle}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: 0,
              padding: "2px",
              cursor: "pointer",
              color: feedback.type === "success" ? "#16a34a" : "#dc2626",
            }}
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
