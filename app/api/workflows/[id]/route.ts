import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-helper";
import { memoryStore } from "@/lib/hexflow/store";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (process.env.DATABASE_URL) {
      try {
        const workflow = await prisma.workflow.findFirst({
          where: { id, userId: user.userId },
        });
        if (workflow) return NextResponse.json(workflow);
      } catch (dbErr) {
        console.warn("DB find failed, falling back to local memory store:", dbErr);
      }
    }

    const workflow = memoryStore.getWorkflow(id);
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error: any) {
    console.error("GET Workflow Detail Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load workflow" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const updateData: Record<string, any> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.nodes !== undefined) updateData.nodes = body.nodes;
    if (body.edges !== undefined) updateData.edges = body.edges;

    if (process.env.DATABASE_URL) {
      try {
        const updated = await prisma.workflow.update({
          where: { id },
          data: updateData,
        });
        return NextResponse.json(updated);
      } catch (dbErr) {
        console.warn("DB update failed, falling back to local memory store:", dbErr);
      }
    }

    const updated = memoryStore.updateWorkflow(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH Workflow Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update workflow" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (process.env.DATABASE_URL) {
      try {
        await prisma.workflow.delete({ where: { id } });
        return NextResponse.json({ success: true });
      } catch (dbErr) {
        console.warn("DB delete failed, falling back to local memory store:", dbErr);
      }
    }

    memoryStore.deleteWorkflow(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Workflow Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete workflow" }, { status: 500 });
  }
}
