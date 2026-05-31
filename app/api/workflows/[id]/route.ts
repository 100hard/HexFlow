import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET /api/workflows/[id] - Fetch detailed workflow details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const workflow = await prisma.workflow.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error: any) {
    console.error("GET Workflow Detail Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load workflow" }, { status: 500 });
  }
}

// 2. PATCH /api/workflows/[id] - Update workflow (rename or update graph nodes/edges)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    // Find and verify ownership
    const existing = await prisma.workflow.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.nodes !== undefined) updateData.nodes = body.nodes;
    if (body.edges !== undefined) updateData.edges = body.edges;

    const updated = await prisma.workflow.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH Workflow Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update workflow" }, { status: 500 });
  }
}

// 3. DELETE /api/workflows/[id] - Delete specific workflow
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.workflow.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    await prisma.workflow.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Workflow deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Workflow Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete workflow" }, { status: 500 });
  }
}
