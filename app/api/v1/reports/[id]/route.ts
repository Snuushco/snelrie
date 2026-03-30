import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return auth.response;

  const { id } = await params;

  const report = await prisma.rieReport.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!report) {
    return NextResponse.json({ error: "Rapport niet gevonden" }, { status: 404 });
  }

  const content = report.generatedContent as any;
  const signatures = (report.signatures as any[]) || [];

  return NextResponse.json({
    id: report.id,
    bedrijfsnaam: report.bedrijfsnaam,
    branche: report.branche,
    aantalMedewerkers: report.aantalMedewerkers,
    aantalLocaties: report.aantalLocaties,
    status: report.status,
    tier: report.tier,
    samenvatting: report.samenvatting,
    risicos: content?.risicos || [],
    planVanAanpak: content?.planVanAanpak || content?.pva || [],
    wettelijkeVerplichtingen: content?.wettelijkeVerplichtingen || [],
    ondertekeningen: signatures.map((s: any) => ({
      rol: s.role,
      naam: s.name,
      ondertekendOp: s.signedAt,
    })),
    verificationCode: report.verificationCode || null,
    aangemaakt: report.createdAt,
    bijgewerkt: report.updatedAt,
  });
}
