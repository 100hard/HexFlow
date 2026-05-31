import { Plus, Search, Upload } from "lucide-react";
import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { WorkflowCard } from "@/components/workflow-card";
import { workflows } from "@/lib/mock-data";

export default function HomePage() {
  const featuredWorkflow = workflows.find((workflow) => workflow.featured);
  const userWorkflows = workflows.filter((workflow) => !workflow.featured);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "#eb1f26", zIndex: 40 }} />
      <AppSidebar />

      <main style={{ minHeight: "100vh", paddingLeft: 261 }}>
        <section style={{ width: "100%", maxWidth: 1152, margin: "0 auto", padding: "24px 16px 32px" }}>
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
                }}
              >
                <Upload size={16} />
                Import
              </button>
              <button
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
                }}
                aria-label="Create Workflow"
              >
                <Plus size={16} />
                <span>New workflow</span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <h2 style={{ margin: 0, fontSize: 14, lineHeight: "20px", fontWeight: 600, color: "#111827" }}>System Workflows</h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: "20px", color: "#6b7280" }}>
              Pre-built workflow templates — click to open and start using.
            </p>

            {featuredWorkflow ? (
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
                  <div style={{ padding: 16, fontSize: 14, lineHeight: "20px", fontWeight: 500, color: "#111827" }}>
                    {featuredWorkflow.name}
                  </div>
                </Link>
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 40 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 14, lineHeight: "20px", fontWeight: 600, color: "#111827" }}>Your Workflows</h2>
                <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: "20px", color: "#6b7280" }}>
                  Open one to edit, run, and review history.
                </p>
              </div>

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

            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 250px))",
                  columnGap: 24,
                  rowGap: 36,
                }}
              >
                {userWorkflows.map((workflow) => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
