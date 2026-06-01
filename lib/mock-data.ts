export type WorkflowStatus = "Active" | "Draft" | "Paused";

export type Workflow = {
  id: string;
  name: string;
  updatedAt: string;
  status: WorkflowStatus;
  featured?: boolean;
};

export const workflows: Workflow[] = [
  { id: "wf-01", name: "AI Marketing Copy Generator", updatedAt: "Edited 57m ago", status: "Active", featured: true },
  { id: "wf-02", name: "AI Marketing Copy Generator Co...", updatedAt: "Edited 5h ago", status: "Draft" },
  { id: "wf-03", name: "AI Marketing Copy Generator Co...", updatedAt: "Edited 6h ago", status: "Active" },
  { id: "wf-04", name: "AI Marketing Copy Generator Co...", updatedAt: "Edited 6h ago", status: "Paused" },
  { id: "wf-05", name: "AI Marketing Copy Generator Co...", updatedAt: "Edited 7h ago", status: "Draft" },
  { id: "wf-06", name: "AI Marketing Copy Generator Co...", updatedAt: "Edited 8h ago", status: "Active" },
];
