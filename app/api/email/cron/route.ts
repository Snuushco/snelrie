import { NextRequest, NextResponse } from "next/server";
import { processDueEmails } from "@/lib/drip-engine";

const CRON_SECRET = process.env.CRON_SECRET || "";

/**
 * GET /api/email/cron
 * Process due drip emails. Call via Vercel Cron or external scheduler.
 *
 * Auth: ?secret=CRON_SECRET or Authorization: Bearer CRON_SECRET
 */
export async function GET(request: NextRequest) {
  // Auth check
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
    const sent = await processDueEmails();
    return NextResponse.json({
      ok: true,
      sent,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[email/cron] Error:", error);
    return NextResponse.json(
      { error: "Failed to process drip emails" },
      { status: 500 }
    );
  }
}
