import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ADMIN_EMAILS = [
  "snuushco@gmail.com",
  "emily@snelrie.nl",
  "guus@praesidion.nl",
];

/**
 * GET /api/referrals/riebuddy/stats — referral dashboard stats
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 });
  }

  const [total, byStatus, financials] = await Promise.all([
    prisma.riebuddyReferral.count(),

    prisma.riebuddyReferral.groupBy({
      by: ["status"],
      _count: { id: true },
    }),

    prisma.riebuddyReferral.aggregate({
      _sum: {
        firstYearRevenue: true,
        commissionAmount: true,
      },
      where: {
        status: "CONVERTED",
      },
    }),
  ]);

  const commissionPaidTotal = await prisma.riebuddyReferral.aggregate({
    _sum: { commissionAmount: true },
    where: { commissionPaid: true },
  });

  const statusCounts = Object.fromEntries(
    byStatus.map((s) => [s.status, s._count.id])
  );

  return NextResponse.json({
    total,
    byStatus: statusCounts,
    totalRevenue: financials._sum.firstYearRevenue?.toString() || "0",
    totalCommission: financials._sum.commissionAmount?.toString() || "0",
    commissionPaid: commissionPaidTotal._sum.commissionAmount?.toString() || "0",
    commissionUnpaid: (
      parseFloat(financials._sum.commissionAmount?.toString() || "0") -
      parseFloat(commissionPaidTotal._sum.commissionAmount?.toString() || "0")
    ).toFixed(2),
  });
}
