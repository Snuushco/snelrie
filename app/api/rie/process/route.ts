import { NextRequest, NextResponse } from "next/server";
import { generateRie } from "@/lib/ai/pipeline";
import { prisma } from "@/lib/db";

// This route has its own 60s timeout dedicated to AI generation
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { reportId } = await req.json();

    if (!reportId || typeof reportId !== "string") {
      return NextResponse.json({ error: "reportId is required" }, { status: 400 });
    }

    // Check report exists and is in PENDING state
    const report = await prisma.rieReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report niet gevonden" }, { status: 404 });
    }

    if (report.status === "COMPLETED") {
      return NextResponse.json({ reportId, status: "COMPLETED" });
    }

    if (report.status === "GENERATING") {
      return NextResponse.json({ reportId, status: "GENERATING" });
    }

    // Run AI generation (this is the heavy operation)
    await generateRie(reportId);

    return NextResponse.json({ reportId, status: "COMPLETED" });
  } catch (error) {
    console.error("Process error:", error);
    return NextResponse.json(
      { error: "Generatie mislukt", details: String(error) },
      { status: 500 }
    );
  }
}
