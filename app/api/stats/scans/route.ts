import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/stats/scans
 * Returns total scan count for social proof display.
 * Uses a seed number + actual DB count for believable numbers from day one.
 */
export async function GET() {
  try {
    const dbCount = await prisma.rieReport.count();
    // Seed with a believable base number (aspirational starting point)
    const SEED_COUNT = 127;
    const total = SEED_COUNT + dbCount;

    return NextResponse.json(
      { count: total },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    // Fallback if DB is unavailable
    return NextResponse.json({ count: 127 });
  }
}
