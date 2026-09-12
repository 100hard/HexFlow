"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { 
  Plus, 
  Search, 
  Upload, 
  Loader2, 
  Sparkles, 
  Link as LinkIcon, 
  Sliders, 
  Mic, 
  Palette, 
  HelpCircle, 
  Moon, 
  ArrowRight,
  Play
} from "lucide-react";
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

const templatePreviews = [
  {
    id: "ugc",
    title: "UGC",
    caption: "“Commute upgraded.”",
    bgGradient: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    accent: "#38bdf8",
    iconName: "Earbuds Commute",
  },
  {
    id: "review",
    title: "Review",
    caption: "“Honestly couldn't go back.”",
    bgGradient: "linear-gradient(180deg, #334155 0%, #1e293b 100%)",
    accent: "#a855f7",
    iconName: "Tech Desk",
  },
  {
    id: "unboxing",
    title: "Unboxing",
    caption: "“First look, real reaction.”",
    bgGradient: "linear-gradient(180deg, #475569 0%, #1e293b 100%)",
    accent: "#f43f5e",
    iconName: "Jewelry Box",
  },
  {
    id: "before_after",
    title: "Before / After",
    caption: "“See the glow.”",
    bgGradient: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
    accent: "#ec4899",
    iconName: "Skincare Glow",
  },
  {
    id: "problem_solution",
    title: "Problem → Solution",
    caption: "“Set up in minutes.”",
    bgGradient: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    accent: "#10b981",
    iconName: "Home Workspace",
  },
  {
    id: "cinematic",
    title: "Product cinematic",
    caption: "“Delicate. Deliberate.”",
    bgGradient: "linear-gradient(180deg, #451a03 0%, #1c1917 100%)",
    accent: "#f59e0b",
    iconName: "Gold Luxury",
  },
  {
    id: "asmr",
    title: "ASMR",
    caption: "“Lights every evening.”",
    bgGradient: "linear-gradient(180deg, #292524 0%, #0c0a09 100%)",
    accent: "#fbbf24",
    iconName: "Candle Warmth",
  },
];

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
        body: JSON.stringify({ name: "HexFlow Creative Pipeline" }),
      });

      if (response.ok) {
        const newWorkflow = await response.json();
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

  // 3. Interactive JSON Import Handler
  const handleImportJSON = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.nodes && Array.isArray(data.nodes)) {
          const name = data.name ? `${data.name} (Imported)` : "Imported Workflow";
          
          const response = await fetch("/api/workflows", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              nodes: data.nodes,
              edges: data.edges || [],
            }),
          });

          if (response.ok) {
            const newWorkflow = await response.json();
            router.push(`/workflow/${newWorkflow.id}`);
          } else {
            alert("Failed to import workflow. Please check formatting.");
          }
        } else {
          alert("Invalid workflow JSON format. Missing 'nodes' array.");
        }
      } catch (err) {
        console.error("Failed to parse imported JSON:", err);
        alert("Error reading JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // Filter dynamic workflows based on search query
  const filteredWorkflows = workflowsList.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <AppSidebar />

      {/* Main Content Area */}
      <div style={{ paddingLeft: 240, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        
        {/* Top Header Bar matching HexCoded exactly */}
        <header
          style={{
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 32px",
            background: "#ffffff",
            borderBottom: "1px solid #f8fafc",
            gap: 16,
          }}
        >
          {/* Workspace badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "#16a34a",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              S
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "#94a3b8", textTransform: "uppercase" }}>
                Brand
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                Sauhard&apos;s Workspace
              </span>
            </div>
          </div>

          {/* Subscribe Button */}
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 32,
              padding: "0 14px",
              borderRadius: 9999,
              border: "1px solid #bbf7d0",
              background: "#f0fdf4",
              color: "#16a34a",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            className="hover:bg-emerald-100"
          >
            <span>✦</span>
            <span>Subscribe</span>
          </button>

          {/* Dark mode toggle */}
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              color: "#64748b",
              cursor: "pointer",
            }}
            title="Toggle theme"
          >
            <Moon size={15} />
          </button>
        </header>

        {/* Interior Container */}
        <main style={{ flex: 1, padding: "28px 40px 48px", maxWidth: 1280, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          
          {/* 1. Authentic HexCoded Hero Card with Mint Wash */}
          <section
            style={{
              position: "relative",
              borderRadius: 24,
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 55%, #e8f9ed 100%)",
              border: "1px solid #d1fae5",
              padding: "44px 48px",
              overflow: "hidden",
            }}
          >
            <div style={{ maxWidth: 620, position: "relative", zIndex: 2 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 38,
                  fontWeight: 900,
                  lineHeight: 1.12,
                  letterSpacing: "-0.035em",
                  color: "#0f172a",
                }}
              >
                Turn anything into a <span style={{ color: "#16a34a" }}>scroll-stopping</span> video.
              </h1>

              <p
                style={{
                  margin: "16px 0 24px",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "#475569",
                  fontWeight: 450,
                }}
              >
                A product, a service or a place — in minutes. No editing, no technical choices. Tell us what you want and we&apos;ll write it, cast it and make the video for you.
              </p>

              {/* First cut in ~3 minutes badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255, 255, 255, 0.75)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid #86efac",
                  padding: "6px 14px",
                  borderRadius: 9999,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#15803d",
                }}
              >
                <span>⚡</span>
                <span>First cut in ~3 minutes</span>
              </div>
            </div>
          </section>

          {/* 2. "What do you want to make?" Section */}
          <section style={{ marginTop: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#16a34a",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                ?
              </div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                What do you want to make?
              </h2>
            </div>

            {/* 4 Action Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: 16,
              }}
            >
              {/* Card 1: From a link */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #f1f5f9",
                  borderRadius: 16,
                  padding: "20px 22px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                className="hover:border-emerald-200 hover:shadow-md group"
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#16a34a",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LinkIcon size={18} />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      background: "#dcfce7",
                      color: "#15803d",
                      padding: "2px 8px",
                      borderRadius: 4,
                      textTransform: "uppercase",
                    }}
                  >
                    FASTEST
                  </span>
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
                  From a link
                </h3>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45, color: "#64748b" }}>
                  Paste your product, service or place — we make the ad.
                </p>
              </div>

              {/* Card 2: Marketing Studio */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #f1f5f9",
                  borderRadius: 16,
                  padding: "20px 22px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                className="hover:border-emerald-200 hover:shadow-md group"
              >
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#16a34a",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sliders size={18} />
                  </div>
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
                  Marketing Studio
                </h3>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45, color: "#64748b" }}>
                  Describe it in words — we write it, cast it and make it.
                </p>
              </div>

              {/* Card 3: Talking head */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #f1f5f9",
                  borderRadius: 16,
                  padding: "20px 22px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                className="hover:border-emerald-200 hover:shadow-md group"
              >
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#16a34a",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Mic size={18} />
                  </div>
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
                  Talking head
                </h3>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45, color: "#64748b" }}>
                  A real face says your script — yours or from the library.
                </p>
              </div>

              {/* Card 4: HexFlow Visual Node Pipeline */}
              <Link
                href="/workflows"
                style={{
                  display: "block",
                  textDecoration: "none",
                  background: "#ffffff",
                  border: "1px solid #f1f5f9",
                  borderRadius: 16,
                  padding: "20px 22px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                className="hover:border-emerald-300 hover:shadow-md group"
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#16a34a",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Palette size={18} />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      background: "#dcfce7",
                      color: "#15803d",
                      padding: "2px 8px",
                      borderRadius: 4,
                      textTransform: "uppercase",
                    }}
                  >
                    PRO STUDIO
                  </span>
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
                  HexFlow
                </h3>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.45, color: "#64748b" }}>
                  Pick a model — generate images and video, your way with node DAGs.
                </p>
              </Link>
            </div>
          </section>

          {/* 3. "START WITH A TEMPLATE" Section */}
          <section style={{ marginTop: 44 }}>
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                }}
              >
                Start with a template
              </span>
            </div>

            {/* Horizontal Scrolling Video Reel Previews */}
            <div
              style={{
                display: "flex",
                gap: 16,
                overflowX: "auto",
                paddingBottom: 12,
                scrollSnapType: "x mandatory",
              }}
              className="no-scrollbar"
            >
              {templatePreviews.map((template) => (
                <Link
                  key={template.id}
                  href="/workflow/demo-canonical-flow"
                  style={{
                    flex: "0 0 160px",
                    scrollSnapAlign: "start",
                    textDecoration: "none",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #f1f5f9",
                    background: "#0f172a",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "transform 0.15s ease",
                  }}
                  className="hover:-translate-y-1"
                >
                  <div
                    style={{
                      aspectRatio: "9 / 16",
                      position: "relative",
                      background: template.bgGradient,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "16px 14px",
                    }}
                  >
                    {/* Play hover pill */}
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(6px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                      }}
                    >
                      <Play size={12} fill="#ffffff" />
                    </div>

                    {/* Bottom label */}
                    <div style={{ position: "relative", zIndex: 2 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#ffffff",
                          background: "rgba(255,255,255,0.2)",
                          backdropFilter: "blur(6px)",
                          padding: "3px 8px",
                          borderRadius: 6,
                          display: "inline-block",
                          marginBottom: 6,
                        }}
                      >
                        {template.title}
                      </span>
                      <p style={{ margin: 0, fontSize: 11.5, color: "#cbd5e1", lineHeight: 1.35, fontWeight: 500 }}>
                        {template.caption}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 4. "YOUR WORKFLOWS & CREATIVE PIPELINES" Section */}
          <section style={{ marginTop: 48, paddingTop: 36, borderTop: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Your Workflows &amp; Pipelines
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                  Nonlinear node DAGs — change any prompt or seed without starting over.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Search */}
                <div style={{ position: "relative", width: 220 }}>
                  <Search
                    size={14}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search pipelines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      height: 34,
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      padding: "0 12px 0 32px",
                      fontSize: 13,
                      color: "#0f172a",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Import JSON */}
                <label
                  style={{
                    display: "inline-flex",
                    height: 34,
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    padding: "0 12px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                  className="hover:bg-slate-50"
                >
                  <Upload size={14} />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    style={{ display: "none" }}
                  />
                </label>

                {/* Create Workflow Button */}
                <button
                  onClick={handleCreateWorkflow}
                  disabled={creating}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    height: 34,
                    padding: "0 16px",
                    borderRadius: 8,
                    border: 0,
                    background: "#16a34a",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: creating ? "not-allowed" : "pointer",
                    boxShadow: "0 1px 2px rgba(22, 163, 74, 0.2)",
                  }}
                  className="hover:bg-emerald-700"
                >
                  {creating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} strokeWidth={2.5} />
                  )}
                  <span>New Workflow</span>
                </button>
              </div>
            </div>

            {/* Workflow Cards */}
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", padding: "32px 0" }}>
                <Loader2 size={18} className="animate-spin text-emerald-600" />
                <span style={{ fontSize: 13 }}>Loading creative pipelines...</span>
              </div>
            ) : filteredWorkflows.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 280px))",
                  gap: 20,
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
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  border: "1px dashed #e2e8f0",
                  borderRadius: 16,
                  background: "#f8fafc",
                }}
              >
                <p style={{ margin: 0, fontSize: 13.5, color: "#64748b" }}>
                  {searchQuery ? "No matching workflows found." : "Create your first creative workflow pipeline to start generating."}
                </p>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}

