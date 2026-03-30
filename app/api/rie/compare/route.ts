import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const reportAId = searchParams.get("reportA");
  const reportBId = searchParams.get("reportB");

  if (!reportAId || !reportBId) {
    return NextResponse.json(
      { error: "Geef reportA en reportB parameters mee" },
      { status: 400 }
    );
  }

  const [reportA, reportB] = await Promise.all([
    prisma.rieReport.findFirst({
      where: { id: reportAId, userId: session.user.id, status: "COMPLETED" },
    }),
    prisma.rieReport.findFirst({
      where: { id: reportBId, userId: session.user.id, status: "COMPLETED" },
    }),
  ]);

  if (!reportA || !reportB) {
    return NextResponse.json(
      { error: "Een of beide rapporten niet gevonden" },
      { status: 404 }
    );
  }

  const contentA = reportA.generatedContent as any;
  const contentB = reportB.generatedContent as any;

  const risicosA = Array.isArray(contentA?.risicos) ? contentA.risicos : [];
  const risicosB = Array.isArray(contentB?.risicos) ? contentB.risicos : [];

  // Compare risks by name
  const risicoNamenA = new Set(risicosA.map((r: any) => (r.naam || r.titel || r.risico || "").toLowerCase()));
  const risicoNamenB = new Set(risicosB.map((r: any) => (r.naam || r.titel || r.risico || "").toLowerCase()));

  const nieuweRisicos = risicosB
    .filter((r: any) => !risicoNamenA.has((r.naam || r.titel || r.risico || "").toLowerCase()))
    .map((r: any) => ({
      naam: r.naam || r.titel || r.risico,
      score: r.score || r.risicoScore || null,
      prioriteit: r.prioriteit || null,
    }));

  const verwijderdeRisicos = risicosA
    .filter((r: any) => !risicoNamenB.has((r.naam || r.titel || r.risico || "").toLowerCase()))
    .map((r: any) => ({
      naam: r.naam || r.titel || r.risico,
      score: r.score || r.risicoScore || null,
      prioriteit: r.prioriteit || null,
    }));

  // Score changes for shared risks
  const scoreWijzigingen: Array<{
    naam: string;
    scoreA: number;
    scoreB: number;
    verschil: number;
  }> = [];

  for (const rB of risicosB) {
    const naamB = (rB.naam || rB.titel || rB.risico || "").toLowerCase();
    const rA = risicosA.find((r: any) => (r.naam || r.titel || r.risico || "").toLowerCase() === naamB);
    if (rA) {
      const scoreA = rA.score || rA.risicoScore || 0;
      const scoreB = rB.score || rB.risicoScore || 0;
      if (scoreA !== scoreB) {
        scoreWijzigingen.push({
          naam: rB.naam || rB.titel || rB.risico,
          scoreA,
          scoreB,
          verschil: scoreB - scoreA,
        });
      }
    }
  }

  // Average scores
  const avgScoreA = risicosA.length > 0
    ? risicosA.reduce((sum: number, r: any) => sum + (r.score || r.risicoScore || 0), 0) / risicosA.length
    : 0;
  const avgScoreB = risicosB.length > 0
    ? risicosB.reduce((sum: number, r: any) => sum + (r.score || r.risicoScore || 0), 0) / risicosB.length
    : 0;

  // PvA progress
  const pvaA = contentA?.planVanAanpak || contentA?.pva || [];
  const pvaB = contentB?.planVanAanpak || contentB?.pva || [];
  const pvaStatusesA = (reportA.pvaStatuses as any[]) || [];
  const pvaStatusesB = (reportB.pvaStatuses as any[]) || [];

  const pvaAfgerondA = pvaStatusesA.filter((s: any) => s.status === "afgerond").length;
  const pvaAfgerondB = pvaStatusesB.filter((s: any) => s.status === "afgerond").length;

  return NextResponse.json({
    reportA: {
      id: reportA.id,
      bedrijfsnaam: reportA.bedrijfsnaam,
      datum: reportA.createdAt,
      aantalRisicos: risicosA.length,
      gemiddeldeScore: Math.round(avgScoreA * 10) / 10,
      pvaItems: Array.isArray(pvaA) ? pvaA.length : 0,
      pvaAfgerond: pvaAfgerondA,
    },
    reportB: {
      id: reportB.id,
      bedrijfsnaam: reportB.bedrijfsnaam,
      datum: reportB.createdAt,
      aantalRisicos: risicosB.length,
      gemiddeldeScore: Math.round(avgScoreB * 10) / 10,
      pvaItems: Array.isArray(pvaB) ? pvaB.length : 0,
      pvaAfgerond: pvaAfgerondB,
    },
    vergelijking: {
      nieuweRisicos,
      verwijderdeRisicos,
      scoreWijzigingen,
      samenvatting: {
        nieuweRisicosAantal: nieuweRisicos.length,
        verwijderdeRisicosAantal: verwijderdeRisicos.length,
        gemiddeldeScoreA: Math.round(avgScoreA * 10) / 10,
        gemiddeldeScoreB: Math.round(avgScoreB * 10) / 10,
        scoreTrend: avgScoreB < avgScoreA ? "gedaald" : avgScoreB > avgScoreA ? "gestegen" : "gelijk",
      },
    },
  });
}
