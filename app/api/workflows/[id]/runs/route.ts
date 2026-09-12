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
        const runs = await prisma.run.findMany({
          where: { workflowId: id },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(runs);
      } catch (dbErr) {
        console.warn("DB find runs failed, falling back to local memory store:", dbErr);
      }
    }

    const runs = memoryStore.listRuns(id);
    return NextResponse.json(runs);
  } catch (error: any) {
    console.error("GET Runs Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load run history" }, { status: 500 });
  }
}

export async function POST(
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

    const status = body.status || "SUCCESS";
    const scope = body.scope || "FULL";
    const duration = body.duration !== undefined ? Number(body.duration) : 1.25;
    const nodesState = body.nodesState || {};

    if (process.env.DATABASE_URL) {
      try {
        const newRun = await prisma.run.create({
          data: {
            workflowId: id,
            userId: user.userId,
            status,
            scope,
            duration,
            nodesState,
          },
        });
        return NextResponse.json(newRun);
      } catch (dbErr) {
        console.warn("DB create run failed, falling back to local memory store:", dbErr);
      }
    }

    const newRun = memoryStore.createRun({
      workflowId: id,
      userId: user.userId,
      status,
      scope,
      duration,
      nodesState,
    });
    return NextResponse.json(newRun);
  } catch (error: any) {
    console.error("POST Run Error:", error);
    return NextResponse.json({ error: error.message || "Failed to log execution run" }, { status: 500 });
  }
}
