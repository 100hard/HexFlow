import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET /api/workflows/[id]/runs - Fetch history list of execution runs
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

    const runs = await prisma.run.findMany({
      where: {
        workflowId: id,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(runs);
  } catch (error: any) {
    console.error("GET Runs Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load run history" }, { status: 500 });
  }
}

// 2. POST /api/workflows/[id]/runs - Save a new execution run to Neon PostgreSQL database
export async function POST(
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

    const status = body.status || "SUCCESS";
    const scope = body.scope || "FULL";
    const duration = body.duration !== undefined ? Number(body.duration) : 1.25;
    const nodesState = body.nodesState || {};

    // Verify workflow ownership first
    const workflow = await prisma.workflow.findFirst({
      where: { id, userId },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const newRun = await prisma.run.create({
      data: {
        workflowId: id,
        userId,
        status,
        scope,
        duration,
        nodesState,
      },
    });

    return NextResponse.json(newRun);
  } catch (error: any) {
    console.error("POST Run Error:", error);
    return NextResponse.json({ error: error.message || "Failed to log execution run" }, { status: 500 });
  }
}
