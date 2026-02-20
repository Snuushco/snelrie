import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const report = await prisma.rieReport.findUnique({
    where: { id },
    include: {
      payments: {
        where: { status: "PAID" },
        take: 1,
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  return NextResponse.json({
    id: report.id,
    bedrijfsnaam: report.bedrijfsnaam,
    branche: report.branche,
    tier: report.tier,
    status: report.status,
    generatedContent: report.generatedContent,
    samenvatting: report.samenvatting,
    hasPaid: report.payments.length > 0,
  });
}
