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
    id: "wf-template-marketing",
    name: "AI Marketing Copy Generator (Sample Template)",
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
                      width: "120px",
                      height: "120px",
                      borderRadius: "999px",
                      background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)",
                      filter: "blur(8px)",
                    }}
                  />
                  
                  {/* Minimalist modern Headphones SVG */}
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="url(#headphone-gradient)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: "drop-shadow(0 4px 12px rgba(99, 102, 241, 0.4))",
                      zIndex: 2,
                    }}
                  >
                    <defs>
                      <linearGradient id="headphone-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
                      backgroundSize: "16px 16px",
                      opacity: 0.7,
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
