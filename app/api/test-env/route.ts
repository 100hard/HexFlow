import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, any> = {
    database: { status: "pending" },
    gemini: { status: "pending" },
    clerk: { status: "pending" },
  };

  // 1. Test Neon PostgreSQL DB via Prisma
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.database = {
      status: "SUCCESS",
      message: "Connected to Neon PostgreSQL database cleanly!",
    };
  } catch (error: any) {
    results.database = {
      status: "FAILED",
      error: error.message || String(error),
    };
  }

  // 2. Test Gemini API
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment.");
    }
    
    // Initialize standard GoogleGenerativeAI class
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello! Reply with exactly the word 'SUCCESS' if you receive this.");
    const response = await result.response;
    const text = response.text();

    results.gemini = {
      status: "SUCCESS",
      response: text?.trim(),
    };
  } catch (error: any) {
    results.gemini = {
      status: "FAILED",
      error: error.message || String(error),
    };
  }

  // 3. Check Clerk Keys Presence
  try {
    results.clerk = {
      status: "CONFIGURED",
      publishableKeyPresent: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      secretKeyPresent: !!process.env.CLERK_SECRET_KEY,
    };
  } catch (error: any) {
    results.clerk = {
      status: "FAILED",
      error: String(error),
    };
  }

  return NextResponse.json(results);
}
