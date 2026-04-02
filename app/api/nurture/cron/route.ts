import { NextRequest, NextResponse } from "next/server";
import { processNurtureEmails } from "@/lib/nurture/scheduler";

const CRON_SECRET = process.env.CRON_SECRET || "";

/**
 * GET /api/nurture/cron
 * Process due nurture emails. Call via Vercel Cron or external scheduler.
 * Runs daily 09:00-11:00 CET, Mon-Fri only (enforced in scheduler).
 *
 * Auth: ?secret=CRON_SECRET or Authorization: Bearer CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const force = searchParams.get("force") === "true";
  const auth = request.headers.get("authorization");

  const isAuthorized =
    !CRON_SECRET ||
    secret === CRON_SECRET ||
    auth === `Bearer ${CRON_SECRET}`;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await processNurtureEmails({ force });
    return NextResponse.json({
      ok: true,
      ...stats,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[nurture/cron] Error:", error);
    return NextResponse.json(
      { error: "Failed to process nurture emails" },
      { status: 500 }
    );
  }
}
