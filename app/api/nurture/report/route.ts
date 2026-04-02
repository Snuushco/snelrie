import { NextRequest, NextResponse } from "next/server";
import { getNurtureABReport } from "@/lib/nurture/scheduler";

const CRON_SECRET = process.env.CRON_SECRET || "";

/**
 * GET /api/nurture/report
 * Get A/B testing performance report for nurture emails.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const auth = request.headers.get("authorization");

  const isAuthorized =
    !CRON_SECRET ||
    secret === CRON_SECRET ||
    auth === `Bearer ${CRON_SECRET}`;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await getNurtureABReport();

    const convRateA = report.variantA.events > 0
      ? ((report.variantA.conversions / report.variantA.events) * 100).toFixed(1)
      : "0.0";
    const convRateB = report.variantB.events > 0
      ? ((report.variantB.conversions / report.variantB.events) * 100).toFixed(1)
      : "0.0";

    return NextResponse.json({
      ok: true,
      report,
      analysis: {
        variantA_conversionRate: `${convRateA}%`,
        variantB_conversionRate: `${convRateB}%`,
        winner:
          report.variantA.conversions === report.variantB.conversions
            ? "tie"
            : report.variantA.conversions > report.variantB.conversions
              ? "variant_a"
              : "variant_b",
        note: "Review after minimum 50 events per variant for statistical significance.",
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[nurture/report] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
