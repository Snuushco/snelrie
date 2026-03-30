import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code || code.length < 10) {
    return NextResponse.json(
      { valid: false, error: "Ongeldige verificatiecode" },
      { status: 400 }
    );
  }

  const report = await prisma.rieReport.findUnique({
    where: { verificationCode: code },
    select: {
      id: true,
      bedrijfsnaam: true,
      branche: true,
      aantalMedewerkers: true,
      tier: true,
      signatures: true,
      verificationCode: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!report) {
    return NextResponse.json(
      { valid: false, error: "Verificatiecode niet gevonden" },
      { status: 404 }
    );
  }

  const signatures = (report.signatures as any[]) || [];

  return NextResponse.json({
    valid: true,
    document: {
      bedrijfsnaam: report.bedrijfsnaam,
      branche: report.branche,
      aantalMedewerkers: report.aantalMedewerkers,
      tier: report.tier,
      verificationCode: report.verificationCode,
      aangemaakt: report.createdAt.toISOString(),
      laatstGewijzigd: report.updatedAt.toISOString(),
    },
    ondertekeningen: signatures.map((s: any) => ({
      rol: s.role,
      naam: s.name,
      functie: s.functie,
      datum: s.signedAt,
    })),
  });
}
