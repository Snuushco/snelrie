import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Tier content limits for server-side filtering
const TIER_LIMITS: Record<string, { risicos: number; maatregelenPerRisico: number; pva: boolean; wettelijk: boolean }> = {
  GRATIS:       { risicos: 3,  maatregelenPerRisico: 1, pva: false, wettelijk: false },
  BASIS:        { risicos: 5,  maatregelenPerRisico: 1, pva: true,  wettelijk: false },
  PROFESSIONAL: { risicos: 12, maatregelenPerRisico: 3, pva: true,  wettelijk: true },
  ENTERPRISE:   { risicos: Infinity, maatregelenPerRisico: Infinity, pva: true, wettelijk: true },
};

function filterContentByTier(content: any, tier: string, hasPaid: boolean): any {
  if (!content || typeof content !== "object") return content;

  // Determine effective tier: if not paid and tier != GRATIS, downgrade to GRATIS
  const effectiveTier = (tier === "GRATIS" || hasPaid) ? tier : "GRATIS";
  const limits = TIER_LIMITS[effectiveTier] || TIER_LIMITS.GRATIS;

  const filtered = { ...content };

  // Filter risicos
  if (Array.isArray(filtered.risicos)) {
    filtered.risicos = filtered.risicos.slice(0, limits.risicos).map((r: any) => ({
      ...r,
      maatregelen: Array.isArray(r.maatregelen)
        ? r.maatregelen.slice(0, limits.maatregelenPerRisico)
        : r.maatregelen,
    }));
  }

  // Strip PvA if not allowed
  if (!limits.pva) {
    delete filtered.planVanAanpak;
    delete filtered.pva;
  }

  // Strip wettelijke verplichtingen if not allowed
  if (!limits.wettelijk) {
    delete filtered.wettelijkeVerplichtingen;
  }

  return filtered;
}

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

  const hasPaid = report.payments.length > 0;
  const filteredContent = filterContentByTier(
    report.generatedContent as any,
    report.tier,
    hasPaid
  );

  // Parse signatures for response
  const signatures = ((report as any).signatures as any[]) || [];
  const signatureSummary = signatures.map((s: any) => ({
    role: s.role,
    name: s.name,
    signedAt: s.signedAt,
  }));

  const intakeData = (report.intakeData as any) || {};

  return NextResponse.json({
    id: report.id,
    bedrijfsnaam: report.bedrijfsnaam,
    branche: report.branche,
    tier: report.tier,
    status: report.status,
    generatedContent: filteredContent,
    samenvatting: report.samenvatting,
    hasPaid,
    referralOpportunity: Boolean(intakeData.referralOpportunity),
    partnerCode: intakeData.partnerCode || null,
    heeftArbodienst: intakeData.heeftArbodienst ?? null,
    signatures: signatureSummary,
    verificationCode: report.verificationCode || null,
  });
}
