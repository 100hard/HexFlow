"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { 
  Plus, 
  Search, 
  Upload, 
  Loader2, 
  Sparkles, 
  Palette, 
  ArrowRight, 
  Moon, 
  Layers, 
  Zap, 
  Clock,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { WorkflowCard } from "@/components/workflow-card";
import { PRODUCT_PRESETS, HOOK_PRESETS, ACTOR_PRESETS } from "@/lib/hexflow/mock-generators";

type Workflow = {
  id: string;
  name: string;
  updatedAt: string;
  featured?: boolean;
};

// Available pre-configured templates demonstrating HexFlow powers
const workflowTemplates = [
  {
    id: "case-study-01",
    caseCode: "01 / CHANGE",
    name: "Swap the actor, keep the creative.",
    category: "Change One Thing",
    aspectRatio: "9:16 UGC Video",
    badge: "Nonlinear Edit",
    image: "/products/nike-shoe.jpg",
    description: "Change one creative decision without starting over. Swap Maya for Marcus—script and product stay cached, only the video updates.",
    models: ["Seedance 2.5", "FLUX.2 Max"],
    existingWorkflowId: "demo-canonical-flow",
  },
  {
    id: "case-study-02",
    caseCode: "02 / EXPLORE",
    name: "Which hook works better?",
    category: "Parallel Angles",
    aspectRatio: "9:16 Dual Test",
    badge: "Creative Branching",
    image: "/products/nike-shoe.jpg",
    description: "Explore different creative directions without losing the one you already made. Test Problem-Solution vs POV Curiosity side-by-side.",
    models: ["Seedance 2.5", "Kling 3.0 Turbo"],
    existingWorkflowId: "demo-explore-hooks",
  },
  {
    id: "case-study-03",
    caseCode: "03 / ITERATE",
    name: "Same idea. Two visual worlds.",
    category: "Visual Variation",
    aspectRatio: "9:16 Commercial",
    badge: "Setting Iteration",
    image: "/products/headphones.jpg",
    description: "Keep the idea. Change the visual world. Voiceover is locked; rapidly test Subway Commute vs Minimalist Dark Studio Pedestal.",
    models: ["FLUX.2 Max", "Google Veo 3.1"],
    existingWorkflowId: "demo-visual-worlds",
  },
  {
    id: "template-blank",
    caseCode: "CUSTOM",
    name: "Blank Canvas Pipeline",
    category: "Custom DAG",
    aspectRatio: "Flexible",
    badge: "From Scratch",
    image: null,
    description: "Start completely from scratch. Connect custom node branches, models, and inputs your way.",
    models: ["30+ Frontier Models"],
    isBlank: true,
  },
];

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflowsList, setWorkflowsList] = useState<Workflow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // 1. Fetch live workflows
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

  // 2. Launch or Create from Template
  const handleSelectTemplate = async (template: typeof workflowTemplates[0]) => {
    if (creating) return;

    // If it's the primary demo workflow and exists, navigate directly
    if (template.existingWorkflowId) {
      router.push(`/workflow/${template.existingWorkflowId}`);
      return;
    }

    setCreating(true);
    try {
      // Build custom nodes for preset if applicable
      let initialNodes = undefined;
      const t = template as any;
      if (t.presetKey && PRODUCT_PRESETS[t.presetKey]) {
        const product = PRODUCT_PRESETS[t.presetKey];
        initialNodes = [
          {
            id: "node-product",
            type: "product",
            position: { x: 50, y: 120 },
            data: {
              state: "UP_TO_DATE",
              config: { preset: t.presetKey },
              outputData: product,
            },
          },
          {
            id: "node-hook",
            type: "hook",
            position: { x: 480, y: 50 },
            data: {
              state: "UP_TO_DATE",
              config: { hookKey: "problem_solution", tone: "Urgent & Direct" },
              outputData: {
                type: "HOOK",
                id: "hook-init",
                category: HOOK_PRESETS.problem_solution.category,
                text: HOOK_PRESETS.problem_solution.text,
                tone: HOOK_PRESETS.problem_solution.tone,
              },
            },
          },
          {
            id: "node-script",
            type: "script",
            position: { x: 900, y: 80 },
            data: {
              state: "NOT_RUN",
              config: { length: 30, tone: "Energetic & Direct", style: "UGC Testimonial" },
            },
          },
          {
            id: "node-actor",
            type: "actor",
            position: { x: 900, y: 460 },
            data: {
              state: "UP_TO_DATE",
              config: { actorKey: "maya", lookId: "Casual UGC" },
              outputData: ACTOR_PRESETS.maya,
            },
          },
          {
            id: "node-video",
            type: "generateVideo",
            position: { x: 1400, y: 180 },
            data: {
              state: "NOT_RUN",
              config: { model: template.models[0] || "Seedance 2.5", duration: 15, aspectRatio: "9:16", resolution: "1080p" },
            },
          },
          {
            id: "node-review",
            type: "review",
            position: { x: 1900, y: 220 },
            data: {
              state: "NOT_RUN",
              config: {},
            },
          },
        ];
      } else if (template.isBlank) {
        // Blank starter with minimal product node
        initialNodes = [
          {
            id: "node-product",
            type: "product",
            position: { x: 100, y: 160 },
            data: {
              state: "NOT_RUN",
              config: { preset: "nike" },
              outputData: PRODUCT_PRESETS.nike,
            },
          },
        ];
      }

      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          nodes: initialNodes,
        }),
      });

      if (response.ok) {
        const newWorkflow = await response.json();
        router.push(`/workflow/${newWorkflow.id}`);
      } else {
        alert("Failed to initialize template pipeline.");
        setCreating(false);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred creating the workflow.");
      setCreating(false);
    }
  };

  // 3. Interactive JSON Import
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

  // Filter dynamic database workflows
  const filteredWorkflows = workflowsList.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <AppSidebar />

      {/* Main Content Area */}
      <div style={{ paddingLeft: 240, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        
        {/* Top Header Bar matching HexCoded */}
        <header
          style={{
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 36px",
            background: "#ffffff",
            borderBottom: "1px solid #f8fafc",
          }}
        >
          {/* Left Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>Tools</span>
            <span style={{ fontSize: 13, color: "#cbd5e1" }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>HexFlow Workflows</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: "#dcfce7",
                color: "#15803d",
                padding: "2px 8px",
                borderRadius: 9999,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              STUDIO
            </span>
          </div>

          {/* Right workspace profile & actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
              }}
              className="hover:bg-emerald-100"
            >
              <span>✦</span>
              <span>Subscribe</span>
            </button>

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
          </div>
        </header>

        {/* Interior Container */}
        <main style={{ flex: 1, padding: "36px 40px 60px", maxWidth: 1280, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          
          {/* Header Section */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 36 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#16a34a", textTransform: "uppercase" }}>
                  HexFlow Node Studio
                </span>
              </div>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a" }}>
                Choose a Workflow
              </h1>
              <p style={{ margin: "8px 0 0", fontSize: 14.5, color: "#64748b", maxWidth: 640 }}>
                Select a pre-configured commercial pipeline below to launch into the canvas, or build your own custom directed graph.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Import JSON */}
              <label
                style={{
                  display: "inline-flex",
                  height: 36,
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  padding: "0 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#475569",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                className="hover:bg-slate-50"
              >
                <Upload size={15} />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  style={{ display: "none" }}
                />
              </label>

              {/* Blank Workflow CTA */}
              <button
                onClick={() => handleSelectTemplate(workflowTemplates[3])}
                disabled={creating}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 36,
                  padding: "0 18px",
                  borderRadius: 8,
                  border: 0,
                  background: "#16a34a",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: creating ? "not-allowed" : "pointer",
                  boxShadow: "0 1px 3px rgba(22, 163, 74, 0.25)",
                  transition: "all 0.15s ease",
                }}
                className="hover:bg-emerald-700"
              >
                {creating ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Plus size={15} strokeWidth={2.5} />
                )}
                <span>New Blank Flow</span>
              </button>
            </div>
          </div>

          {/* Section 1: Template Choices */}
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                }}
              >
                Start from a Template
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
                gap: 20,
              }}
            >
              {workflowTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  style={{
                    borderRadius: 16,
                    border: "1px solid #f1f5f9",
                    background: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  className="hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 group"
                >
                  {/* Thumbnail Banner */}
                  <div
                    style={{
                      height: 160,
                      position: "relative",
                      overflow: "hidden",
                      background: "#0f172a",
                    }}
                  >
                    {template.image ? (
                      <img
                        src={template.image}
                        alt={template.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.4s ease",
                        }}
                        className="group-hover:scale-105"
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "radial-gradient(circle, rgba(22, 163, 74, 0.15) 0%, rgba(15, 23, 42, 1) 70%)",
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 12,
                            border: "1px dashed rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#86efac",
                          }}
                        >
                          <Plus size={24} />
                        </div>
                      </div>
                    )}

                    {/* Dark gradient overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.65) 100%)",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Top Badges */}
                    <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#ffffff",
                          background: "rgba(0,0,0,0.6)",
                          backdropFilter: "blur(6px)",
                          padding: "3px 8px",
                          borderRadius: 6,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {template.category}
                      </span>

                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#15803d",
                          background: "#dcfce7",
                          padding: "2px 8px",
                          borderRadius: 6,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {template.badge}
                      </span>
                    </div>

                    {/* Bottom Aspect Tag */}
                    <div style={{ position: "absolute", bottom: 10, right: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#cbd5e1" }}>
                        {template.aspectRatio}
                      </span>
                    </div>
                  </div>

                  {/* Body content */}
                  <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                      {template.name}
                    </h3>

                    <p style={{ margin: "0 0 16px", fontSize: 12.5, lineHeight: 1.5, color: "#64748b", flex: 1 }}>
                      {template.description}
                    </p>

                    {/* Model Chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                      {template.models.map((model) => (
                        <span
                          key={model}
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            color: "#475569",
                            padding: "2px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {model}
                        </span>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div
                      style={{
                        paddingTop: 14,
                        borderTop: "1px solid #f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#16a34a",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      <span>{template.isBlank ? "Create Blank Flow" : "Use Template"}</span>
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Your Existing Workflows */}
          <section style={{ paddingTop: 32, borderTop: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Your Saved Pipelines
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                  Resume where you left off or run selective updates on cached branches.
                </p>
              </div>

              {/* Search Filter */}
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
                  placeholder="Search your pipelines..."
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
            </div>

            {/* Workflow Cards */}
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", padding: "32px 0" }}>
                <Loader2 size={18} className="animate-spin text-emerald-600" />
                <span style={{ fontSize: 13 }}>Loading your pipelines...</span>
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
                  {searchQuery ? "No matching workflows found." : "Pick a template above to create your first pipeline."}
                </p>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
