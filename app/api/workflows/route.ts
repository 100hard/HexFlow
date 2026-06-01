import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper to get or create a user in Neon DB based on Clerk session
async function getOrCreateDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser().catch(() => null);
  const email = clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@clerk.dev`;

  // Upsert user into database to ensure perfect state sync
  return await prisma.user.upsert({
    where: { id: userId },
    update: { email },
    create: { id: userId, email },
  });
}

// 1. GET /api/workflows - List all workflows for authenticated user
export async function GET() {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(workflows);
  } catch (error: any) {
    console.error("GET Workflows Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load workflows" }, { status: 500 });
  }
}

// 2. POST /api/workflows - Create a new workflow pre-populated with Request-Inputs and Response
export async function POST(request: Request) {
  try {
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name = body.name || "Untitled Workflow";

    // Initial pre-placed nodes according to specs
    const initialNodes = [
      {
        id: "node-request-inputs",
        type: "requestInputs",
        position: { x: 80, y: 150 },
        deletable: false,
        data: {
          fields: [
            {
              id: "field-text-0",
              type: "text_field",
              name: "text_field",
              value: "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.",
            },
            {
              id: "field-image-0",
              type: "image_field",
              name: "image_field",
              value: "",
            },
          ],
        },
      },
      {
        id: "node-response",
        type: "response",
        position: { x: 1050, y: 150 },
        deletable: false,
        data: {},
      },
    ];

    const initialEdges = [
      {
        id: "edge-1",
        source: "node-request-inputs",
        sourceHandle: "field-text-0",
        target: "node-response",
        targetHandle: "result",
        style: { stroke: "#818cf8", strokeWidth: 2.5 },
      },
    ];

    const workflow = await prisma.workflow.create({
      data: {
        name,
        userId: dbUser.id,
        nodes: initialNodes,
        edges: initialEdges,
      },
    });

    return NextResponse.json(workflow);
  } catch (error: any) {
    console.error("POST Workflows Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create workflow" }, { status: 500 });
  }
}
