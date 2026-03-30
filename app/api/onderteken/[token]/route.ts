import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ROLE_LABELS: Record<string, string> = {
  werkgever: "Werkgever",
  preventiemedewerker: "Preventiemedewerker",
  arbodeskundige: "Arbodeskundige / Toetser",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const signLink = await prisma.signLink.findUnique({
    where: { token },
    include: {
      report: {
        select: {
          id: true,
          bedrijfsnaam: true,
          signatures: true,
        },
      },
    },
  });

  if (!signLink) {
    return NextResponse.json(
      { error: "Ongeldige ondertekeningslink" },
      { status: 404 }
    );
  }

  const expired = signLink.expiresAt < new Date();
  const used = !!signLink.usedAt;

  // Check if this role already has a signature
  const signatures = (signLink.report.signatures as any[]) || [];
  const alreadySigned = signatures.some((s: any) => s.role === signLink.role);

  return NextResponse.json({
    reportId: signLink.report.id,
    bedrijfsnaam: signLink.report.bedrijfsnaam,
    role: signLink.role,
    roleLabel: ROLE_LABELS[signLink.role] || signLink.role,
    expired,
    used,
    alreadySigned,
  });
}
