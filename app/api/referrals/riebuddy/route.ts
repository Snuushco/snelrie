import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createRiebuddyReferral } from "@/lib/referrals/riebuddy";

const ADMIN_EMAILS = [
  "snuushco@gmail.com",
  "emily@snelrie.nl",
  "guus@praesidion.nl",
];

/**
 * POST /api/referrals/riebuddy — trigger a referral for a report
 */
export async function POST(req: NextRequest) {
  try {
    const { reportId } = await req.json();
    if (!reportId) {
      return NextResponse.json({ error: "reportId is verplicht" }, { status: 400 });
    }

    const result = await createRiebuddyReferral(reportId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      skipped: result.skipped || false,
      reason: result.reason,
      referralId: result.referralId,
    });
  } catch (error) {
    console.error("riebuddy referral POST error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}

/**
 * GET /api/referrals/riebuddy — list all referrals (admin only)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const [referrals, total] = await Promise.all([
    prisma.riebuddyReferral.findMany({
      where,
      orderBy: { referredAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.riebuddyReferral.count({ where }),
  ]);

  return NextResponse.json({
    referrals,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
