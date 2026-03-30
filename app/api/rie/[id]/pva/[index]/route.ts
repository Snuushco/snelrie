import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; index: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { id, index: indexStr } = await params;
  const itemIndex = parseInt(indexStr, 10);

  if (isNaN(itemIndex) || itemIndex < 0) {
    return NextResponse.json({ error: "Ongeldig index" }, { status: 400 });
  }

  const body = await req.json();
  const { status } = body;

  const validStatuses = ["niet_gestart", "in_behandeling", "afgerond"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Ongeldige status. Gebruik: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  // Verify report belongs to user
  const report = await prisma.rieReport.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!report) {
    return NextResponse.json({ error: "Rapport niet gevonden" }, { status: 404 });
  }

  // Update PvA statuses
  const currentStatuses = (report.pvaStatuses as any[]) || [];
  const existingIndex = currentStatuses.findIndex((s: any) => s.index === itemIndex);

  if (existingIndex >= 0) {
    currentStatuses[existingIndex].status = status;
  } else {
    currentStatuses.push({ index: itemIndex, status });
  }

  await prisma.rieReport.update({
    where: { id },
    data: { pvaStatuses: currentStatuses },
  });

  return NextResponse.json({ success: true, index: itemIndex, status });
}
