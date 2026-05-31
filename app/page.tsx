"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Upload, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { WorkflowCard } from "@/components/workflow-card";

type Workflow = {
  id: string;
  name: string;
  updatedAt: string;
  featured?: boolean;
};

export default function HomePage() {
  const router = useRouter();
  const [workflowsList, setWorkflowsList] = useState<Workflow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // 1. Fetch live database workflows on mount
  const fetchWorkflows = async () => {
    try {
      const response = await fetch("/api/workflows");
      if (response.ok) {
        const data = await response.json();
        setWorkflowsList(data);
      }
    } catch (error) {
      console.error("Failed to load workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  // 2. Interactive Workflow Creation Handler
  const handleCreateWorkflow = async () => {
    if (creating) return;
    setCreating(true);

    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "AI racing car generator clone" }),
      });

      if (response.ok) {
        const newWorkflow = await response.json();
        // Automatically open the new workflow canvas!
        router.push(`/workflow/${newWorkflow.id}`);
      } else {
        alert("Failed to create workflow. Please check your session.");
        setCreating(false);
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
      setCreating(false);
    }
  };

  // Pre-built static featured template as described in sample workflows specs
  const featuredWorkflow = {
    id: "wf-template-racing",
    name: "AI Racing Car Generator (Sample Template)",
    updatedAt: "System Template",
    featured: true,
  };

  // Filter dynamic database workflows based on search query
  const filteredWorkflows = workflowsList.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Premium top accent brand line */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "#eb1f26", zIndex: 40 }} />
      <AppSidebar />

      <main style={{ minHeight: "100vh", paddingLeft: 261 }}>
        <section style={{ width: "100%", maxWidth: 1152, margin: "0 auto", padding: "24px 16px 32px" }}>
          {/* Header Dashboard section */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, lineHeight: "32px", fontWeight: 600, color: "#111111" }}>
                Flow
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: "20px", color: "#6b7280" }}>
                Build workflows or run models directly.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <button
                style={{
                  display: "inline-flex",
                  height: 36,
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  padding: "0 12px",
                  fontSize: 14,
                  fontWeight: 400,
                  color: "rgba(17,24,39,0.8)",
                  cursor: "pointer",
                }}
              >
                <Upload size={16} />
                Import
              </button>
              <button
                onClick={handleCreateWorkflow}
                disabled={creating}
                style={{
                  display: "inline-flex",
                  height: 36,
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 8,
                  border: 0,
                  background: "#111827",
                  padding: "0 12px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#ffffff",
                  cursor: creating ? "not-allowed" : "pointer",
                  opacity: creating ? 0.8 : 1,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
                aria-label="Create Workflow"
              >
                {creating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                <span>New workflow</span>
              </button>
            </div>
          </div>

          {/* System Workflows Segment */}
          <div style={{ marginTop: 32 }}>
            <h2 style={{ margin: 0, fontSize: 14, lineHeight: "20px", fontWeight: 600, color: "#111827" }}>System Workflows</h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: "20px", color: "#6b7280" }}>
              Pre-built workflow templates — click to open and start using.
            </p>

            <div style={{ marginTop: 16 }}>
              <Link
                href={`/workflow/${featuredWorkflow.id}`}
                className="hover:-translate-y-0.5 transition-transform duration-150"
                style={{
                  display: "block",
                  width: 280,
                  overflow: "hidden",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#f5f5f5",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  textDecoration: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "5 / 3",
                    background:
                      "linear-gradient(180deg, rgba(255,199,138,0.78) 0%, rgba(255,231,197,0.1) 18%, rgba(0,0,0,0) 28%), radial-gradient(120% 95% at 80% 8%, rgba(255,214,168,0.92), rgba(255,214,168,0) 32%), linear-gradient(180deg, #48515e 0%, #2e3745 32%, #202632 100%)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: -22,
                      right: -14,
                      bottom: 28,
                      height: 64,
                      borderTop: "3px solid rgba(255,255,255,0.86)",
                      borderRadius: "999px",
                      transform: "rotate(-13deg)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 78,
                      right: 44,
                      bottom: 14,
                      height: 34,
                      background: "linear-gradient(180deg, rgba(70,130,255,0.98), rgba(0,95,221,0.98))",
                      borderRadius: "34px 34px 18px 20px",
                      transform: "skewX(-15deg)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 101,
                      bottom: 10,
                      width: 30,
                      height: 30,
                      borderRadius: "999px",
                      background: "#14171d",
                      boxShadow: "126px 0 0 #14171d",
                    }}
                  />
                </div>
                <div style={{ padding: 16, fontSize: 14, lineHeight: "20px", fontWeight: 500, color: "#111827", display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={14} className="text-amber-500" />
                  <span>{featuredWorkflow.name}</span>
                </div>
              </Link>
            </div>
          </div>

          {/* User Workflows Segment */}
          <div style={{ marginTop: 40 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 14, lineHeight: "20px", fontWeight: 600, color: "#111827" }}>Your Workflows</h2>
                <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: "20px", color: "#6b7280" }}>
                  Open one to edit, run, and review history.
                </p>
              </div>

              {/* Live search input filter */}
              <div style={{ position: "relative", width: 208 }}>
                <Search
                  size={14}
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6b7280",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    height: 32,
                    width: "100%",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "#ffffff",
                    padding: "0 12px 0 32px",
                    fontSize: 14,
                    color: "#111827",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Displaying Live Lists or state indicators */}
            <div style={{ marginTop: 16 }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7280", padding: "24px 0" }}>
                  <Loader2 size={18} className="animate-spin text-indigo-600" />
                  <span style={{ fontSize: 14 }}>Connecting to Neon database...</span>
                </div>
              ) : filteredWorkflows.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 250px))",
                    columnGap: 24,
                    rowGap: 36,
                  }}
                >
                  {filteredWorkflows.map((workflow) => (
                    <WorkflowCard
                      key={workflow.id}
                      workflow={workflow}
                      onRefresh={fetchWorkflows}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ padding: "40px 0", textAlign: "center", border: "1px dashed #e5e7eb", borderRadius: 12 }}>
                  <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
                    {searchQuery ? "No matching workflows found." : "Create your first workflow to get started!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
