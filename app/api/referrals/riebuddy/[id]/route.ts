import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

const ADMIN_EMAILS = [
  "snuushco@gmail.com",
  "emily@snelrie.nl",
  "guus@praesidion.nl",
];

const COMMISSION_RATE = 0.10; // 10% of first year revenue

/**
 * PATCH /api/referrals/riebuddy/[id] — update referral status, revenue, notes
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.riebuddyReferral.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Referral niet gevonden" }, { status: 404 });
  }

  const updateData: any = {};

  if (body.status && ["REFERRED", "CONTACTED", "CONVERTED", "LOST"].includes(body.status)) {
    updateData.status = body.status;
  }

  if (body.riebuddyResponse !== undefined) {
    updateData.riebuddyResponse = body.riebuddyResponse;
  }

  if (body.firstYearRevenue !== undefined) {
    const revenue = parseFloat(body.firstYearRevenue);
    if (!isNaN(revenue) && revenue >= 0) {
      updateData.firstYearRevenue = new Decimal(revenue);
      updateData.commissionAmount = new Decimal(revenue * COMMISSION_RATE);
    }
  }

  if (body.commissionPaid !== undefined) {
    updateData.commissionPaid = Boolean(body.commissionPaid);
  }

  if (body.notes !== undefined) {
    updateData.notes = body.notes;
  }

  const updated = await prisma.riebuddyReferral.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ ok: true, referral: updated });
}
