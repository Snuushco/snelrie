import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Health check endpoint - also keeps Neon DB awake
export async function GET() {
  try {
    // Simple query to keep connection alive
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    return NextResponse.json({ 
      status: "ok", 
      db: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", db: "disconnected", error: String(error) },
      { status: 500 }
    );
  }
}
