import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helper";
import { memoryStore } from "@/lib/hexflow/store";
import { getCanonicalHexFlowNodes, getCanonicalHexFlowEdges } from "@/lib/hexflow/initial-workflow";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try Prisma Neon DB if configured, otherwise fallback to in-memory store
    if (process.env.DATABASE_URL) {
      try {
        const workflows = await prisma.workflow.findMany({
          where: { userId: user.userId },
          orderBy: { updatedAt: "desc" },
        });
        return NextResponse.json(workflows);
      } catch (dbErr) {
        console.warn("DB Query failed, falling back to local memory store:", dbErr);
      }
    }

    const workflows = memoryStore.listWorkflows(user.userId);
    return NextResponse.json(workflows);
  } catch (error: any) {
    console.error("GET Workflows Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load workflows" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name = body.name || "Untitled Workflow";
    const nodes = body.nodes || getCanonicalHexFlowNodes();
    const edges = body.edges || getCanonicalHexFlowEdges();

    if (process.env.DATABASE_URL) {
      try {
        // Ensure user exists in DB
        await prisma.user.upsert({
          where: { id: user.userId },
          update: { email: user.email },
          create: { id: user.userId, email: user.email },
        });

        const workflow = await prisma.workflow.create({
          data: {
            name,
            userId: user.userId,
            nodes,
            edges,
          },
        });
        return NextResponse.json(workflow);
      } catch (dbErr) {
        console.warn("DB Create failed, falling back to local memory store:", dbErr);
      }
    }

    const workflow = memoryStore.createWorkflow(name, user.userId, nodes, edges);
    return NextResponse.json(workflow);
  } catch (error: any) {
    console.error("POST Workflows Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create workflow" }, { status: 500 });
  }
}
