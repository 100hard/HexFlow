"use client";

import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  addEdge,
  useReactFlow,
  useViewport,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type Node,
  type Connection,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Play, Loader2, Save, Cloud, Check, Undo2, Redo2, Download, Upload, History, Calculator, Wallet, Map, Minimize2, ChevronLeft, ChevronRight, Command, ZoomOut, ZoomIn, Maximize2, LayoutGrid, Move, X, ImagePlus, Search, Plus, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useEffect, useState } from "react";

// Imports of custom nodes and sidebar
import { RequestInputsNode } from "@/components/canvas/nodes/request-inputs";
import { ResponseNode } from "@/components/canvas/nodes/response-node";
import { GeminiNode } from "@/components/canvas/nodes/gemini-node";
import { CropImageNode } from "@/components/canvas/nodes/crop-image-node";
import { AddNodeBar } from "@/components/canvas/add-node-bar";
import { AppSidebar } from "@/components/app-sidebar";

export default function WorkflowCanvasPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [workflowName, setWorkflowName] = useState("Loading workflow...");
  const [loading, setLoading] = useState(true);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");

  // Execution History & Runs state hooks
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ui" | "api">("ui");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  
  // Execution animation tracking states
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingNodeIds, setExecutingNodeIds] = useState<string[]>([]);
  const [isMinimapOpen, setIsMinimapOpen] = useState(false);

  // Filter runs by active tab (UI vs API) and status filter
  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const matchTab = activeTab === "ui" ? (run.scope === "FULL" || run.scope === "SINGLE" || run.scope === "PARTIAL") : (run.scope === "API");
      if (!matchTab) return false;
      
      if (statusFilter === "ALL") return true;
      return run.status === statusFilter;
    });
  }, [runs, activeTab, statusFilter]);

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Undo/Redo canvas history stacks
  const [past, setPast] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const [future, setFuture] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);

  const takeSnapshot = useCallback((currentNodes: Node[], currentEdges: Edge[]) => {
    setPast((prev) => {
      const snapshot = {
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        edges: JSON.parse(JSON.stringify(currentEdges)),
      };
      const nextPast = [...prev, snapshot];
      if (nextPast.length > 30) {
        nextPast.shift();
      }
      return nextPast;
    });
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture((prev) => [
      { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) },
      ...prev,
    ]);

    setNodes(previous.nodes);
    setEdges(previous.edges);
  }, [past, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setFuture(newFuture);
    setPast((prev) => [
      ...prev,
      { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) },
    ]);

    setNodes(next.nodes);
    setEdges(next.edges);
  }, [future, nodes, edges, setNodes, setEdges]);

  // Import / Export callbacks
  const exportWorkflowToJSON = useCallback(() => {
    const workflowData = {
      name: workflowName,
      nodes,
      edges,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(workflowData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `${workflowName.replace(/\s+/g, "_").toLowerCase()}_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [workflowName, nodes, edges]);

  const importWorkflowFromJSON = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.nodes && Array.isArray(data.nodes)) {
            takeSnapshot(nodes, edges);
            setNodes(data.nodes);
            if (data.edges && Array.isArray(data.edges)) {
              setEdges(data.edges);
            } else {
              setEdges([]);
            }
            if (data.name) {
              setWorkflowName(data.name);
            }
          } else {
            alert("Invalid workflow JSON format. Missing 'nodes' array.");
          }
        } catch (err) {
          console.error("Failed to parse imported workflow JSON:", err);
          alert("Error reading JSON file.");
        }
      };
      reader.readAsText(file);
    },
    [nodes, edges, takeSnapshot, setNodes, setEdges]
  );

  // 1. Fetch live database workflow graph on mount
  useEffect(() => {
    const loadWorkflow = async () => {
      // Auto-clone logic for featured sample template
      if (id === "wf-template-marketing") {
        try {
          const createRes = await fetch("/api/workflows", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "AI Marketing Copy Generator (Cloned)" }),
          });

          if (createRes.ok) {
            const clonedWf = await createRes.json();
            router.replace(`/workflow/${clonedWf.id}`);
            return;
          } else {
            console.error("Cloning template response not ok:", createRes.status);
            router.push("/");
          }
        } catch (err) {
          console.error("Cloning template error:", err);
          router.push("/");
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`/api/workflows/${id}`);
        if (response.ok) {
          const data = await response.json();
          setWorkflowName(data.name);
          
          // Populate canvas states
          if (data.nodes) setNodes(data.nodes);
          if (data.edges) {
            const mappedEdges = data.edges.map((edge: any) => ({
              ...edge,
              type: "button",
            }));
            setEdges(mappedEdges);
          }
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error loading workflow from database:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflow();
  }, [id, router, setNodes, setEdges]);

  // 2. Debounced Database Auto-Saving Logic
  const saveWorkflowState = useCallback(async (currentNodes: Node[], currentEdges: Edge[], currentName?: string) => {
    if (loading || id === "wf-template-marketing") return;
    setSavingState("saving");

    try {
      const payload: any = {
        nodes: currentNodes,
        edges: currentEdges,
      };
      if (currentName) {
        payload.name = currentName;
      }
      const response = await fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSavingState("saved");
        setTimeout(() => setSavingState("idle"), 2500);
      } else {
        setSavingState("idle");
      }
    } catch (err) {
      console.error("Failed to auto-save canvas:", err);
      setSavingState("idle");
    }
  }, [loading, id]);

  // Fetch historical runs from PostgreSQL database
  const fetchRuns = useCallback(async () => {
    if (!id || id === "wf-template-marketing") return;
    try {
      const res = await fetch(`/api/workflows/${id}/runs`);
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch (err) {
      console.error("Failed to fetch workflow run logs:", err);
    }
  }, [id]);

  useEffect(() => {
    if (id && id !== "wf-template-marketing") {
      fetchRuns();
    }
  }, [id, fetchRuns]);

  // Core handler to execute workflow with visual step-by-step glowing node highlights in parallel level layers
  const handleExecuteWorkflow = useCallback(async () => {
    if (isExecuting || nodes.length === 0) return;
    
    setIsExecuting(true);
    const startTime = Date.now();
    
    try {
      // 1. Create task execution promises for all nodes
      const nodePromises: Record<string, Promise<void>> = {};
      const nodeResolvers: Record<string, () => void> = {};
      
      nodes.forEach((node) => {
        nodePromises[node.id] = new Promise<void>((resolve) => {
          nodeResolvers[node.id] = resolve;
        });
      });

      // 2. Define single node async execution task (Trigger.dev simulation style!)
      const executeNode = async (nodeId: string) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        // Trace incoming wires (parent dependencies)
        const incomingEdges = edges.filter((e) => e.target === nodeId);
        const parentPromises = incomingEdges.map((e) => nodePromises[e.source]);
        
        // Wait for all parent nodes to finish before this node starts! (Parallel first-to-finish data flow!)
        await Promise.all(parentPromises);

        // This node starts running!
        setExecutingNodeIds((prev) => [...prev, nodeId]);

        // Simulating the exact artificial delays
        // "Crop Image: 30+ second artificial delay (mandatory)"
        let executionDelay = 1200; // default delay
        if (node.type === "cropImage") {
          executionDelay = 30000; // Mandatory 30-second delay for Crop Image!
        } else if (node.type === "gemini") {
          executionDelay = 3500; // Gemini prompt execution delay
        } else if (node.type === "requestInputs") {
          executionDelay = 1000; // Input preloading delay
        }

        await new Promise((resolve) => setTimeout(resolve, executionDelay));

        // Compute and inject outputs
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === nodeId) {
              let outputs: any = {};
              if (n.type === "requestInputs") {
                // Prepopulated inputs
              } else if (n.type === "cropImage") {
                const incomingEdge = edges.find((e) => e.target === n.id && e.targetHandle === "image");
                let srcImg = n.data?.imageValue || "";
                if (incomingEdge) {
                  const srcNode = nds.find((sn) => sn.id === incomingEdge.source);
                  if (srcNode) {
                    if (srcNode.id === "node-request-inputs") {
                      const f = ((srcNode.data as any)?.fields || []).find((f: any) => f.id === incomingEdge.sourceHandle);
                      srcImg = f ? f.value : "";
                    } else if (srcNode.type === "cropImage") {
                      srcImg = (srcNode.data as any)?.outputImage?.url || "";
                    }
                  }
                }
                
                if (!srcImg) {
                  srcImg = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300";
                }

                outputs = {
                  outputImage: {
                    url: srcImg,
                    crop: {
                      x: n.data?.xPos !== undefined ? n.data.xPos : 0,
                      y: n.data?.yPos !== undefined ? n.data.yPos : 0,
                      width: n.data?.width !== undefined ? n.data.width : 100,
                      height: n.data?.height !== undefined ? n.data.height : 100,
                    },
                  },
                };
              } else if (n.type === "gemini") {
                outputs = {
                  outputResponse: "Drafted marketing copy for wireless bluetooth noise cancelling headphones.",
                };
              }
              
              return {
                ...n,
                data: {
                  ...n.data,
                  ...outputs,
                  executed: true,
                },
              };
            }
            return n;
          })
        );

        // Turn off glowing pulse highlight for this node
        setExecutingNodeIds((prev) => prev.filter((id) => id !== nodeId));
        
        // Resolve completion to allow downstream nodes to proceed immediately!
        nodeResolvers[nodeId]();
      };

      // 3. Kick off all executions in parallel!
      // Children automatically suspend on Promise.all(parentPromises) until their exact dependencies finish.
      // Sibling nodes run concurrently without blocking each other.
      const allExecutions = nodes.map((node) => executeNode(node.id));
      await Promise.all(allExecutions);

      setExecutingNodeIds([]);
      
      const endTime = Date.now();
      const executionDuration = (endTime - startTime) / 1000;
      
      // Compile mock execution tracking node states for runs API
      const mockNodesState: Record<string, any> = {};
      nodes.forEach((node) => {
        let nodeInputs: any = {};
        let nodeOutputs: any = {};
        
        if (node.type === "requestInputs") {
          nodeInputs = {};
          nodeOutputs = { fields: (node.data as any)?.fields?.map((f: any) => ({ name: f.name, type: f.type })) || [] };
        } else if (node.type === "gemini") {
          nodeInputs = { prompt: (node.data as any)?.prompt || "Write Prompt..." };
          nodeOutputs = { response: "Drafted marketing copy for wireless bluetooth noise cancelling headphones." };
        } else if (node.type === "cropImage") {
          nodeInputs = {
            x: node.data?.xPos !== undefined ? node.data.xPos : 0,
            y: node.data?.yPos !== undefined ? node.data.yPos : 0,
            width: node.data?.width !== undefined ? node.data.width : 100,
            height: node.data?.height !== undefined ? node.data.height : 100,
          };
          nodeOutputs = { image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300" };
        } else if (node.type === "response") {
          nodeInputs = { connected_wires: edges.filter((e) => e.target === node.id).map((e) => e.source) };
          nodeOutputs = { status: "RENDERED_SUCCESSFULLY" };
        }
        
        mockNodesState[node.id] = {
          name: node.type === "requestInputs" ? "Request Inputs" : node.type === "response" ? "Response" : node.type === "gemini" ? "Gemini 3.1 Pro" : "Crop Image",
          status: "SUCCESS",
          duration: node.type === "requestInputs" ? 0.8 : 1.2,
          inputs: nodeInputs,
          outputs: nodeOutputs,
        };
      });
      
      const res = await fetch(`/api/workflows/${id}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SUCCESS",
          scope: "FULL",
          duration: executionDuration,
          nodesState: mockNodesState,
        }),
      });
      
      if (res.ok) {
        await fetchRuns();
        setIsHistoryOpen(true);
      }
    } catch (err) {
      console.error("Failed to run workflow:", err);
    } finally {
      setIsExecuting(false);
      setExecutingNodeIds([]);
    }
  }, [id, nodes, edges, isExecuting, fetchRuns]);

  // Core handler to execute a single node and save it to history logs
  const handleExecuteSingleNode = useCallback(async (nodeId: string) => {
    if (isExecuting) return;
    
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setIsExecuting(true);
    setExecutingNodeIds([nodeId]);
    const startTime = Date.now();

    try {
      // Simulating the exact artificial delays
      let executionDelay = 1200; // default delay
      if (node.type === "cropImage") {
        executionDelay = 30000; // Mandatory 30-second delay for Crop Image!
      } else if (node.type === "gemini") {
        executionDelay = 3500; // Gemini prompt execution delay
      }

      await new Promise((resolve) => setTimeout(resolve, executionDelay));

      // Compute and inject outputs
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            let outputs: any = {};
            if (n.type === "cropImage") {
              const incomingEdge = edges.find((e) => e.target === n.id && e.targetHandle === "image");
              let srcImg = n.data?.imageValue || "";
              if (incomingEdge) {
                const srcNode = nds.find((sn) => sn.id === incomingEdge.source);
                if (srcNode) {
                  if (srcNode.id === "node-request-inputs") {
                    const f = ((srcNode.data as any)?.fields || []).find((f: any) => f.id === incomingEdge.sourceHandle);
                    srcImg = f ? f.value : "";
                  } else if (srcNode.type === "cropImage") {
                    srcImg = (srcNode.data as any)?.outputImage?.url || "";
                  }
                }
              }
              
              if (!srcImg) {
                srcImg = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300";
              }

              outputs = {
                outputImage: {
                  url: srcImg,
                  crop: {
                    x: n.data?.xPos !== undefined ? n.data.xPos : 0,
                    y: n.data?.yPos !== undefined ? n.data.yPos : 0,
                    width: n.data?.width !== undefined ? n.data.width : 100,
                    height: n.data?.height !== undefined ? n.data.height : 100,
                  },
                },
              };
            } else if (n.type === "gemini") {
              outputs = {
                outputResponse: "Drafted marketing copy for wireless bluetooth noise cancelling headphones.",
              };
            }
            
            return {
              ...n,
              data: {
                ...n.data,
                ...outputs,
                executed: true,
              },
            };
          }
          return n;
        })
      );

      const endTime = Date.now();
      const executionDuration = (endTime - startTime) / 1000;

      // Compile mock execution tracking node states for runs API
      const mockNodesState: Record<string, any> = {};
      
      let nodeInputs: any = {};
      let nodeOutputs: any = {};
      
      if (node.type === "gemini") {
        nodeInputs = { prompt: (node.data as any)?.prompt || "Write Prompt..." };
        nodeOutputs = { response: "Drafted marketing copy for wireless bluetooth noise cancelling headphones." };
      } else if (node.type === "cropImage") {
        nodeInputs = {
          x: node.data?.xPos !== undefined ? node.data.xPos : 0,
          y: node.data?.yPos !== undefined ? node.data.yPos : 0,
          width: node.data?.width !== undefined ? node.data.width : 100,
          height: node.data?.height !== undefined ? node.data.height : 100,
        };
        nodeOutputs = { image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300" };
      }
      
      mockNodesState[node.id] = {
        name: node.type === "gemini" ? "Gemini 3.1 Pro" : "Crop Image",
        status: "SUCCESS",
        duration: executionDuration,
        inputs: nodeInputs,
        outputs: nodeOutputs,
      };

      const res = await fetch(`/api/workflows/${id}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SUCCESS",
          scope: "SINGLE",
          duration: executionDuration,
          nodesState: mockNodesState,
        }),
      });
      
      if (res.ok) {
        await fetchRuns();
        setIsHistoryOpen(true);
      }
    } catch (err) {
      console.error("Failed to execute single node:", err);
    } finally {
      setIsExecuting(false);
      setExecutingNodeIds([]);
    }
  }, [id, nodes, edges, isExecuting, fetchRuns]);

  // Trigger auto-save when nodes/edges changes stop
  useEffect(() => {
    if (loading || nodes.length === 0) return;
    
    const handler = setTimeout(() => {
      saveWorkflowState(nodes, edges, workflowName);
    }, 1500);

    return () => clearTimeout(handler);
  }, [nodes, edges, loading, saveWorkflowState, workflowName]);

  // Node data change handler for custom nodes
  const onNodeDataChange = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Deletion handler for user-added nodes
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      takeSnapshot(nodes, edges);
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges, nodes, edges, takeSnapshot]
  );

  // Dynamic image upload overlay option modal states
  const [uploadState, setUploadState] = useState<{
    nodeId: string;
    fieldId: string;
  } | null>(null);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([]);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [activeMediaTab, setActiveMediaTab] = useState<"all" | "generated" | "uploads" | "favorites">("all");
  const [transloaditProgress, setTransloaditProgress] = useState<number | null>(null);
  const [transloaditStep, setTransloaditStep] = useState<string>("");

  const handleImageUploaded = useCallback((imageUrl: string) => {
    if (!uploadState) return;
    const { nodeId, fieldId } = uploadState;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          if (node.id === "node-request-inputs") {
            const fields = (node.data.fields || []) as any[];
            const updatedFields = fields.map((f: any) => {
              if (f.id === fieldId) {
                return { ...f, value: imageUrl };
              }
              return f;
            });
            return {
              ...node,
              data: {
                ...node.data,
                fields: updatedFields,
              },
            };
          } else {
            return {
              ...node,
              data: {
                ...node.data,
                imageValue: imageUrl,
              },
            };
          }
        }
        return node;
      })
    );

    // Also add to asset manager library automatically so it shows up in "Select Asset"!
    setUploadedAssets((prev) => {
      if (prev.includes(imageUrl)) return prev;
      return [imageUrl, ...prev];
    });

    setUploadState(null);
    setIsAssetModalOpen(false);
  }, [uploadState, setNodes]);

  // Dynamic mapping to inject onDelete and onChange handlers into custom nodes data
  const nodesWithDelete = useMemo(() => {
    return nodes.map((node) => {
      const baseData = {
        ...node.data,
        onChange: (newData: any) => onNodeDataChange(node.id, newData),
        onUploadImageClick: (fieldId?: string) => {
          setUploadState({
            nodeId: node.id,
            fieldId: fieldId || "imageValue",
          });
        },
        onRunNode: () => handleExecuteSingleNode(node.id),
        executing: executingNodeIds.includes(node.id),
        isExecuting: isExecuting,
      };

      if (node.id === "node-request-inputs" || node.id === "node-response") {
        return { ...node, data: baseData };
      }

      return {
        ...node,
        data: {
          ...baseData,
          onDelete: handleDeleteNode,
        },
      };
    });
  }, [nodes, onNodeDataChange, handleDeleteNode, executingNodeIds, handleExecuteSingleNode, isExecuting]);

  // Addition handler for Gemini and Crop Image nodes
  const handleAddNode = useCallback(
    (type: "gemini" | "cropImage") => {
      takeSnapshot(nodes, edges);
      const newId = `${type}-${Date.now()}`;
      const randomOffset = Math.floor(Math.random() * 60) - 30;
      
      const newNode: Node = {
        id: newId,
        type,
        position: { x: 500 + randomOffset, y: 150 + randomOffset },
        data: {
          prompt: type === "gemini" ? "Write Prompt for Car Racing" : "",
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, nodes, edges, takeSnapshot]
  );

  // Connection handler with visual color-coded stroke styling matching source handle type
  const onConnect = useCallback(
    (connection: Connection) => {
      takeSnapshot(nodes, edges);
      let strokeColor = "#818cf8"; // Animated Purple/Indigo by default

      const sourceHandle = connection.sourceHandle || "";
      const targetHandle = connection.targetHandle || "";

      if (sourceHandle.includes("image") || targetHandle.includes("image")) {
        strokeColor = "#3b82f6"; // blue
      } else if (sourceHandle.includes("video") || targetHandle.includes("video")) {
        strokeColor = "#10b981"; // green
      } else if (sourceHandle.includes("audio") || targetHandle.includes("audio")) {
        strokeColor = "#06b6d4"; // cyan
      } else if (sourceHandle.includes("Position") || targetHandle.includes("Position") || 
                 sourceHandle.includes("width") || targetHandle.includes("width") || 
                 sourceHandle.includes("height") || targetHandle.includes("height")) {
        strokeColor = "#ec4899"; // pink
      } else {
        // Standard text flows styled with premium brand orange edge to match orange handles!
        strokeColor = "#f59e0b";
      }

      const newEdge: Edge = {
        ...connection,
        id: `edge-${Date.now()}`,
        type: "button",
        style: { stroke: strokeColor, strokeWidth: 2.5 },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, nodes, edges, takeSnapshot]
  );

  // Type-safe connection validation rules
  const isValidConnection = useCallback(
    (connection: any) => {
      // Disallow connecting to self
      if (connection.source === connection.target) return false;

      const sourceHandle = connection.sourceHandle || "";
      const targetHandle = connection.targetHandle || "";

      const getHandleFormat = (handleId: string) => {
        if (handleId.includes("image")) return "image";
        if (handleId.includes("video")) return "video";
        if (handleId.includes("audio")) return "audio";
        if (handleId.includes("Position") || handleId.includes("width") || handleId.includes("height")) {
          return "coordinate";
        }
        return "text";
      };

      const sourceFormat = getHandleFormat(sourceHandle);
      const targetFormat = getHandleFormat(targetHandle);

      // Enforce strict matching formats
      return sourceFormat === targetFormat;
    },
    []
  );

  // Wrap standard React Flow callbacks to intercept and save history snapshots on keyboard deletions
  const onNodesChangeWrapper = useCallback(
    (changes: any) => {
      const hasRemoval = changes.some((c: any) => c.type === "remove");
      if (hasRemoval) {
        takeSnapshot(nodes, edges);
      }
      onNodesChange(changes);
    },
    [onNodesChange, nodes, edges, takeSnapshot]
  );

  const onEdgesChangeWrapper = useCallback(
    (changes: any) => {
      const hasRemoval = changes.some((c: any) => c.type === "remove");
      if (hasRemoval) {
        takeSnapshot(nodes, edges);
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, nodes, edges, takeSnapshot]
  );

  const onNodeDragStart = useCallback(() => {
    takeSnapshot(nodes, edges);
  }, [nodes, edges, takeSnapshot]);

  // Register all node templates
  const nodeTypes = {
    requestInputs: RequestInputsNode,
    response: ResponseNode,
    gemini: GeminiNode,
    cropImage: CropImageNode,
  };

  // Register custom edge templates
  const edgeTypes = {
    button: ButtonEdge,
  };

  if (loading) {
    return (
      <div style={{ display: "flex", width: "100vw", height: "100vh", alignItems: "center", justifyContent: "center", background: "#fcfcfc" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <span style={{ fontSize: 14, color: "#6b7280" }}>Initializing canvas board...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: "#fafafa",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <AppSidebar />

      <div
        style={{
          marginLeft: "261px",
          width: "calc(100vw - 261px)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Workspace Canvas Header */}
        <header
          style={{
            height: "56px",
            borderBottom: "1px solid #e5e7eb",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            zIndex: 30,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Left Side: Back button and Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                color: "#374151",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} />
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                {workflowName}
              </span>
              
              {/* Cloud Auto-Saving indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#9ca3af", marginLeft: 8 }}>
                {savingState === "saving" ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-indigo-500" />
                    <span>Saving...</span>
                  </>
                ) : savingState === "saved" ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    <span className="text-emerald-600">Saved</span>
                  </>
                ) : (
                  <>
                    <Cloud size={12} />
                    <span>Cloud synced</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Action Run Play button */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            
            {/* Est parameter box */}
            <div
              style={{
                display: "inline-flex",
                height: "32px",
                alignItems: "center",
                gap: "8px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                padding: "0 12px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#6b7280",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
              }}
            >
              <Calculator size={14} style={{ color: "#4b5563" }} />
              <span>
                Est <strong style={{ color: "#1f2937", fontWeight: 600, marginLeft: "4px", marginRight: "4px" }}>1.72</strong> M
              </span>
            </div>

            {/* Bal parameter box */}
            <div
              style={{
                display: "inline-flex",
                height: "32px",
                alignItems: "center",
                gap: "8px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                padding: "0 12px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#6b7280",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
              }}
            >
              <Wallet size={14} style={{ color: "#4b5563" }} />
              <span>
                Bal <strong style={{ color: "#1f2937", fontWeight: 600, marginLeft: "4px", marginRight: "4px" }}>0.00</strong> M
              </span>
            </div>

            {/* Play triangle button */}
            <button
              onClick={handleExecuteWorkflow}
              disabled={isExecuting}
              style={{
                display: "inline-flex",
                width: "48px",
                height: "32px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: 0,
                background: isExecuting ? "#818cf8" : "#5046e6",
                color: "#ffffff",
                cursor: isExecuting ? "not-allowed" : "pointer",
                boxShadow: "0 1px 2px rgba(80, 70, 230, 0.2)",
                transition: "background 0.15s ease",
              }}
            >
              {isExecuting ? (
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Play size={14} fill="#ffffff" style={{ color: "#ffffff" }} />
              )}
            </button>

            {/* Export JSON Button */}
            <button
              type="button"
              onClick={exportWorkflowToJSON}
              style={{
                display: "inline-flex",
                height: "32px",
                alignItems: "center",
                gap: "6px",
                padding: "0 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
              title="Export Workflow as JSON"
            >
              <Download size={14} />
              <span>Export</span>
            </button>

            {/* Import JSON Button */}
            <label
              style={{
                display: "inline-flex",
                height: "32px",
                alignItems: "center",
                gap: "6px",
                padding: "0 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
              title="Import Workflow from JSON"
            >
              <Upload size={14} />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={importWorkflowFromJSON}
                style={{ display: "none" }}
              />
            </label>

            {/* Execution History Button */}
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              style={{
                display: "inline-flex",
                width: "32px",
                height: "32px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: isHistoryOpen ? "#f1f5f9" : "#ffffff",
                color: "#1f2937",
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = isHistoryOpen ? "#f1f5f9" : "#ffffff")}
              title="Execution History"
            >
              <History size={16} />
            </button>
          </div>
        </header>

        {/* Main React Flow Canvas Area */}
        <main style={{ flex: 1, display: "flex", flexDirection: "row", position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          <div style={{ flex: 1, height: "100%", position: "relative", background: "#f8f9fa" }}>
            <ReactFlow
              nodes={nodesWithDelete}
              edges={edges}
              onNodesChange={onNodesChangeWrapper}
              onEdgesChange={onEdgesChangeWrapper}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              onNodeDragStart={onNodeDragStart}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView={false}
              defaultViewport={{ x: 100, y: 80, zoom: 0.58 }}
              minZoom={0.2}
              maxZoom={1.5}
              nodesDraggable={true}
              panOnDrag={true}
            >
              {/* Dot background styled beautifully and crisply */}
              <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#cbd5e1" />

              {/* Premium custom bottom bar controls */}
              <CustomCanvasControls
                undo={undo}
                redo={redo}
                canUndo={past.length > 0}
                canRedo={future.length > 0}
              />

              {/* Toggleable Minimap bottom-right */}
              {!isMinimapOpen ? (
                <button
                  type="button"
                  onClick={() => setIsMinimapOpen(true)}
                  className="nodrag"
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#475569",
                    cursor: "pointer",
                    zIndex: 100,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                  title="Open Minimap"
                >
                  <Map size={18} />
                </button>
              ) : (
                <div style={{ position: "absolute", bottom: "20px", right: "20px", zIndex: 100 }}>
                  <div style={{ position: "relative" }}>
                    <MiniMap
                      style={{
                        border: 0,
                        borderRadius: "12px",
                        background: "#0c0c0e", // very dark zinc/black
                        width: "200px",
                        height: "135px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                        margin: 0,
                      }}
                      nodeColor={(node) => {
                        switch (node.type) {
                          case "requestInputs":
                            return "#52525b"; // brighter dark gray square
                          case "gemini":
                            return "#22c55e"; // green rectangle
                          case "cropImage":
                            return "#3b82f6"; // blue rectangle
                          case "response":
                            return "#52525b"; // brighter dark gray square
                          default:
                            return "#3f3f46";
                        }
                      }}
                      maskColor="rgba(255, 255, 255, 0.15)"
                    />
                    {/* Collapse button on the top-right of the minimap */}
                    <button
                      type="button"
                      onClick={() => setIsMinimapOpen(false)}
                      className="nodrag"
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "#ffffff",
                        border: "2px solid #1c1917",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#1c1917",
                        cursor: "pointer",
                        zIndex: 101,
                        padding: 0,
                      }}
                    >
                      <Minimize2 size={11} />
                    </button>
                  </div>
                </div>
              )}
            </ReactFlow>
          </div>

          {/* Execution History Sliding Sidebar Panel */}
          {isHistoryOpen && (
            <div
              style={{
                width: "360px",
                height: "100%",
                background: "#ffffff",
                borderLeft: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                zIndex: 10,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>Execution History</span>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  style={{
                    background: "none",
                    border: 0,
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#4f46e5",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>

              {/* Top Tab Selectors */}
              <div style={{ padding: "16px 20px 8px" }}>
                <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "8px", gap: "4px" }}>
                  <button
                    onClick={() => setActiveTab("ui")}
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 500,
                      borderRadius: "6px",
                      border: 0,
                      background: activeTab === "ui" ? "#ffffff" : "transparent",
                      color: activeTab === "ui" ? "#0f172a" : "#64748b",
                      boxShadow: activeTab === "ui" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    UI Runs
                  </button>
                  <button
                    onClick={() => setActiveTab("api")}
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 500,
                      borderRadius: "6px",
                      border: 0,
                      background: activeTab === "api" ? "#ffffff" : "transparent",
                      color: activeTab === "api" ? "#0f172a" : "#64748b",
                      boxShadow: activeTab === "api" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    API Runs
                  </button>
                </div>
              </div>

              {/* Filter and Title Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#334155" }}>Run history</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#334155",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="ALL">All</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="PARTIAL">Partial</option>
                </select>
              </div>

              {/* Scrollable list area */}
              <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
                {filteredRuns.length === 0 ? (
                  <div
                    style={{
                      border: "1px dashed #e2e8f0",
                      borderRadius: "8px",
                      padding: "32px 16px",
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "13px",
                      marginTop: "10px",
                    }}
                  >
                    No runs for this filter yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filteredRuns.map((run) => (
                      <div
                        key={run.id}
                        style={{
                          border: "1px solid",
                          borderRadius: "8px",
                          padding: "12px",
                          cursor: "pointer",
                          background: selectedRunId === run.id ? "#f8fafc" : "#ffffff",
                          borderColor: selectedRunId === run.id ? "#6366f1" : "#e2e8f0",
                          transition: "all 0.2s",
                        }}
                        onClick={() => setSelectedRunId(selectedRunId === run.id ? null : run.id)}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background:
                                run.status === "SUCCESS"
                                  ? "#f0fdf4"
                                  : run.status === "FAILED"
                                  ? "#fef2f2"
                                  : "#fffbeb",
                              color:
                                run.status === "SUCCESS"
                                  ? "#16a34a"
                                  : run.status === "FAILED"
                                  ? "#dc2626"
                                  : "#d97706",
                            }}
                          >
                            {run.status}
                          </span>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>
                            {run.duration.toFixed(2)}s
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 500, color: "#1e293b", marginBottom: "4px" }}>
                          Scope: {run.scope} Run
                        </div>
                        <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                          {new Date(run.createdAt).toLocaleString()}
                        </div>

                        {/* Expanded details exposing node-level execution tracking */}
                        {selectedRunId === run.id && (
                          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "12px", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>
                              Node Execution tracking:
                            </div>
                            {Object.entries(run.nodesState as Record<string, any>).map(([nodeId, state]) => (
                              <div
                                key={nodeId}
                                style={{
                                  background: "#f8fafc",
                                  border: "1px solid #f1f5f9",
                                  borderRadius: "6px",
                                  padding: "8px",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#1e293b" }}>
                                    {state.name || nodeId}
                                  </span>
                                  <span style={{ fontSize: "10px", color: state.status === "SUCCESS" ? "#16a34a" : "#dc2626" }}>
                                    {state.status} ({state.duration ? state.duration.toFixed(2) : 0}s)
                                  </span>
                                </div>
                                {state.inputs && Object.keys(state.inputs).length > 0 && (
                                  <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "2px" }}>
                                    <strong>Inputs:</strong> {JSON.stringify(state.inputs)}
                                  </div>
                                )}
                                {state.outputs && Object.keys(state.outputs).length > 0 && (
                                  <div style={{ fontSize: "10px", color: "#64748b" }}>
                                    <strong>Outputs:</strong> {JSON.stringify(state.outputs)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Add Node Popover Toolbar bottom center relative to canvas */}
      <AddNodeBar onAddNode={handleAddNode} />

      {/* Dynamic Image Upload Popover Options Panel */}
      {uploadState && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setUploadState(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              width: "350px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #f3f4f6",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {transloaditProgress !== null ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "10px 0" }}>
                {/* Branded Transloadit Headless Assembly Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444", animation: "ping 1.5s infinite" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.5px", color: "#111827", textTransform: "uppercase" }}>
                    Transloadit Assembly
                  </span>
                </div>
                
                {/* Progress Circle or Bar */}
                <div style={{ width: "100%", height: "8px", background: "#f3f4f6", borderRadius: "999px", overflow: "hidden", position: "relative" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${transloaditProgress}%`,
                      background: "linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)",
                      transition: "width 0.2s ease-out",
                      borderRadius: "999px"
                    }}
                  />
                </div>

                <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                  {transloaditProgress}%
                </div>

                <div style={{ fontSize: "11px", color: "#6b7280", textAlign: "center", minHeight: "32px", lineHeight: "16px" }}>
                  {transloaditStep}
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#4b5563", textAlign: "center", lineHeight: "22px", padding: "0 10px" }}>
                  Add a file from your device or select one from your library
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsAssetModalOpen(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    height: "46px",
                    borderRadius: "10px",
                    background: "#374151",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: 0,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#1f2937")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#374151")}
                >
                  <ImagePlus size={18} />
                  <span>Select Asset</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === "string") {
                            const imgData = reader.result;
                            setTransloaditProgress(0);
                            setTransloaditStep("Spawning new Transloadit assembly pipeline session...");
                            
                            let progress = 0;
                            const interval = setInterval(() => {
                              progress += Math.floor(Math.random() * 12) + 6;
                              if (progress >= 100) {
                                progress = 100;
                                clearInterval(interval);
                                setTransloaditStep("Transloadit assembly finished successfully! Delivering output URLs...");
                                setTimeout(() => {
                                  handleImageUploaded(imgData);
                                  setTransloaditProgress(null);
                                  setTransloaditStep("");
                                }, 800);
                              } else {
                                if (progress < 30) {
                                  setTransloaditStep(`Uploading raw payload to Transloadit worker: ${progress}%`);
                                } else if (progress < 75) {
                                  setTransloaditStep(`Executing image transformation tasks: ${progress}%`);
                                } else {
                                  setTransloaditStep(`Caching assets in S3 delivery bucket: ${progress}%`);
                                }
                              }
                              setTransloaditProgress(progress);
                            }, 250);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    height: "46px",
                    borderRadius: "10px",
                    background: "#4f46e5",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: 0,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#4338ca")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#4f46e5")}
                >
                  <Plus size={18} />
                  <span>Upload via Transloadit</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Asset Manager Library Modal */}
      {isAssetModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
          onClick={() => setIsAssetModalOpen(false)}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "1000px",
              height: "80%",
              maxHeight: "700px",
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#111827" }}>Select Image</h3>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>{uploadedAssets.length} files</span>
              </div>
              <button
                onClick={() => setIsAssetModalOpen(false)}
                style={{
                  background: "none",
                  border: 0,
                  color: "#9ca3af",
                  cursor: "pointer",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.color = "#1f2937";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = "#9ca3af";
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Toolbar (Search, Reload, Upload Media button) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
              {/* Search Bar */}
              <div style={{ position: "relative", width: "400px" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search prompts & file names..."
                  value={assetSearchQuery}
                  onChange={(e) => setAssetSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    background: "#ffffff",
                    padding: "0 16px 0 42px",
                    fontSize: "14px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setAssetSearchQuery("")}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4b5563",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                  title="Reload Media"
                >
                  <RotateCcw size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === "string") {
                            handleImageUploaded(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "#111827",
                    color: "#ffffff",
                    padding: "0 16px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: 0,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#1f2937")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#111827")}
                >
                  <Upload size={16} />
                  <span>Upload Media</span>
                </button>
              </div>
            </div>

            {/* Modal Workspace (Split Columns) */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              {/* Left Sidebar (Media Tabs & Categories) */}
              <div style={{ width: "220px", borderRight: "1px solid #f3f4f6", padding: "20px 16px", display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Your Media
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                    <button
                      onClick={() => setActiveMediaTab("all")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "36px",
                        padding: "0 12px",
                        borderRadius: "8px",
                        background: activeMediaTab === "all" ? "#f3e8ff" : "transparent",
                        color: activeMediaTab === "all" ? "#7c3aed" : "#4b5563",
                        fontSize: "13px",
                        fontWeight: activeMediaTab === "all" ? 600 : 500,
                        border: 0,
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveMediaTab("generated")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "36px",
                        padding: "0 12px",
                        borderRadius: "8px",
                        background: activeMediaTab === "generated" ? "#f3e8ff" : "transparent",
                        color: activeMediaTab === "generated" ? "#7c3aed" : "#4b5563",
                        fontSize: "13px",
                        fontWeight: activeMediaTab === "generated" ? 600 : 500,
                        border: 0,
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      Generated
                    </button>
                    <button
                      onClick={() => setActiveMediaTab("uploads")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "36px",
                        padding: "0 12px",
                        borderRadius: "8px",
                        background: activeMediaTab === "uploads" ? "#f3e8ff" : "transparent",
                        color: activeMediaTab === "uploads" ? "#7c3aed" : "#4b5563",
                        fontSize: "13px",
                        fontWeight: activeMediaTab === "uploads" ? 600 : 500,
                        border: 0,
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      My Uploads
                    </button>
                    <button
                      onClick={() => setActiveMediaTab("favorites")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "36px",
                        padding: "0 12px",
                        borderRadius: "8px",
                        background: activeMediaTab === "favorites" ? "#f3e8ff" : "transparent",
                        color: activeMediaTab === "favorites" ? "#7c3aed" : "#4b5563",
                        fontSize: "13px",
                        fontWeight: activeMediaTab === "favorites" ? 600 : 500,
                        border: 0,
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      Favorites
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#4b5563", fontSize: "13px", cursor: "pointer", padding: "0 8px" }}>
                    <span>Filters</span>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6" }} />
                  </div>
                </div>
              </div>

              {/* Center Body (Assets Grid or Empty state) */}
              <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                {uploadedAssets.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                    <div style={{ width: "64px", height: "64px", background: "#f3f4f6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                      <ImagePlus size={32} />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#111827" }}>No assets found</h4>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>Upload files above, or generate content in chat</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e: any) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === "string") {
                                handleImageUploaded(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        height: "38px",
                        borderRadius: "8px",
                        background: "#ffffff",
                        border: "1px solid #d1d5db",
                        padding: "0 16px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#374151",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f9fafb";
                        e.currentTarget.style.borderColor = "#9ca3af";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.borderColor = "#d1d5db";
                      }}
                    >
                      <Upload size={14} />
                      <span>Upload files</span>
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {uploadedAssets
                      .filter((asset) => assetSearchQuery === "" || asset.includes(assetSearchQuery))
                      .map((asset, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleImageUploaded(asset)}
                          style={{
                            position: "relative",
                            aspectRatio: "1",
                            borderRadius: "12px",
                            border: "2px solid #e5e7eb",
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#7c3aed";
                            e.currentTarget.style.transform = "scale(1.03)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <img
                            src={asset}
                            alt={`Asset ${idx}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          {/* Selected overlay label on hover */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(124, 58, 237, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0,
                              transition: "opacity 0.2s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                          >
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", background: "#ffffff", padding: "4px 8px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                              Use Asset
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Right Sidebar (Folders / Organization) */}
              <div style={{ width: "160px", borderLeft: "1px solid #f3f4f6", padding: "20px 12px", background: "#fafafa" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "32px",
                      padding: "0 12px",
                      borderRadius: "6px",
                      background: "#f3f4f6",
                      color: "#111827",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    All
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "32px",
                      padding: "0 12px",
                      color: "#6b7280",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    My Folders
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Premium Canvas Controls matching Galaxy Bottom Options exactly
function CustomCanvasControls({
  undo,
  redo,
  canUndo,
  canRedo,
}: {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const zoomPercent = Math.round(zoom * 100);

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={() => setIsCollapsed(false)}
        className="nodrag"
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          width: "44px",
          height: "44px",
          borderRadius: "14px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#475569",
          cursor: "pointer",
          zIndex: 100,
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
      >
        <ChevronRight size={18} />
      </button>
    );
  }

  return (
    <div
      className="nodrag"
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        height: "44px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "22px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
        display: "flex",
        alignItems: "center",
        padding: "0 6px",
        gap: "4px",
        zIndex: 100,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Collapse button < */}
      <button
        type="button"
        onClick={() => setIsCollapsed(true)}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "10px",
          border: "2px solid #0f172a",
          background: "#ffffff",
          color: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontWeight: "bold",
          marginRight: "4px",
        }}
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>

      <div style={{ width: "1px", height: "18px", background: "#e2e8f0", margin: "0 4px" }} />

      {/* Undo & Redo */}
      <button
        type="button"
        onClick={undo}
        disabled={!canUndo}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          border: 0,
          background: "transparent",
          color: canUndo ? "#475569" : "#cbd5e1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: canUndo ? "pointer" : "not-allowed",
        }}
      >
        <Undo2 size={15} />
      </button>

      <button
        type="button"
        onClick={redo}
        disabled={!canRedo}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          border: 0,
          background: "transparent",
          color: canRedo ? "#475569" : "#cbd5e1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: canRedo ? "pointer" : "not-allowed",
        }}
      >
        <Redo2 size={15} />
      </button>

      {/* Command Shortcut button */}
      <button
        type="button"
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          border: 0,
          background: "transparent",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Command size={15} />
      </button>

      <div style={{ width: "1px", height: "18px", background: "#e2e8f0", margin: "0 4px" }} />

      {/* Zoom out */}
      <button
        type="button"
        onClick={() => zoomOut()}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          border: 0,
          background: "transparent",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <ZoomOut size={16} />
      </button>

      {/* Zoom percent display */}
      <span
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "#475569",
          minWidth: "36px",
          textAlign: "center",
          userSelect: "none",
        }}
      >
        {zoomPercent}%
      </span>

      {/* Zoom in */}
      <button
        type="button"
        onClick={() => zoomIn()}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          border: 0,
          background: "transparent",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <ZoomIn size={16} />
      </button>

      <div style={{ width: "1px", height: "18px", background: "#e2e8f0", margin: "0 4px" }} />

      {/* Fit to screen */}
      <button
        type="button"
        onClick={() => fitView({ padding: 0.2 })}
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          border: 0,
          background: "transparent",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Maximize2 size={15} />
      </button>

      {/* Layout/Grid Grid button */}
      <button
        type="button"
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          border: 0,
          background: "transparent",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <LayoutGrid size={15} />
      </button>

      {/* Center pan button */}
      <button
        type="button"
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          border: 0,
          background: "transparent",
          color: "#475569",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          marginRight: "4px",
        }}
      >
        <Move size={15} />
      </button>
    </div>
  );
}

// Custom interactive Bezier connection edge showing dynamic delete button on hover
function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  interactionWidth = 20,
}: EdgeProps & { interactionWidth?: number }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const { setEdges } = useReactFlow();

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsTooltipHovered(false);
      }}
    >
      {/* Invisible thick path to increase the hover detection surface area */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={interactionWidth}
        style={{ cursor: "pointer" }}
      />
      {/* Visual wire path */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isHovered ? 3.5 : style.strokeWidth || 2.5,
          transition: "stroke-width 0.15s ease",
        }}
      />
      
      {/* Red cross disconnect button positioned at the exact mid-point of the Bezier path */}
      {isHovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <button
                type="button"
                onClick={onEdgeClick}
                onMouseEnter={() => setIsTooltipHovered(true)}
                onMouseLeave={() => setIsTooltipHovered(false)}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "#ef4444", // Magica high-contrast red cross button
                  border: "1.5px solid #ffffff",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  padding: 0,
                  transition: "transform 0.1s ease, background 0.1s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.12)";
                  e.currentTarget.style.background = "#dc2626";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = "#ef4444";
                }}
              >
                <X size={10} strokeWidth={3.5} />
              </button>
              
              {/* Tooltip text: 'Delete connection' */}
              {isTooltipHovered && (
                <div
                  style={{
                    position: "absolute",
                    left: "24px",
                    whiteSpace: "nowrap",
                    background: "#0f172a",
                    color: "#ffffff",
                    fontSize: "9px",
                    fontWeight: 500,
                    padding: "3px 7px",
                    borderRadius: "4px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                    pointerEvents: "none",
                  }}
                >
                  Delete connection
                </div>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  );
}
