import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  // Get the most recent completed report
  const latestReport = await prisma.rieReport.findFirst({
    where: { userId: session.user.id, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    include: {
      complianceChecks: true,
      payments: { where: { status: "PAID" }, take: 1 },
    },
  });

  if (!latestReport) {
    return NextResponse.json({
      hasReport: false,
      message: "Nog geen afgeronde RI&E gevonden.",
    });
  }

  const content = latestReport.generatedContent as any;
  const signatures = (latestReport.signatures as any[]) || [];
  const pvaStatuses = (latestReport.pvaStatuses as any[]) || [];
  const pvaItems = content?.planVanAanpak || content?.pva || [];

  // RI&E status
  const createdAt = new Date(latestReport.createdAt);
  const oneYearLater = new Date(createdAt);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  const isExpired = new Date() > oneYearLater;

  // Signature status
  const werkgeverSigned = signatures.some((s: any) => s.role === "werkgever");
  const preventiemedewerkerSigned = signatures.some((s: any) => s.role === "preventiemedewerker");
  const toetserSigned = signatures.some((s: any) => s.role === "arbodeskundige");

  // PvA progress
  const totalPva = Array.isArray(pvaItems) ? pvaItems.length : 0;
  const pvaWithStatus = pvaItems.map((item: any, index: number) => {
    const statusEntry = pvaStatuses.find((s: any) => s.index === index);
    return {
      index,
      titel: item.maatregel || item.titel || item.actie || `Actiepunt ${index + 1}`,
      risico: item.risico || item.risicoNaam || "",
      prioriteit: item.prioriteit || "midden",
      deadline: item.deadline || null,
      status: statusEntry?.status || "niet_gestart",
    };
  });

  const afgerond = pvaWithStatus.filter((p: any) => p.status === "afgerond").length;
  const inBehandeling = pvaWithStatus.filter((p: any) => p.status === "in_behandeling").length;
  const nietGestart = pvaWithStatus.filter((p: any) => p.status === "niet_gestart").length;

  // Compliance checklist (auto-check where possible)
  const checklistItems = [
    { id: "rie_opgesteld", label: "RI&E opgesteld", autoChecked: true },
    { id: "rie_ondertekend", label: "RI&E ondertekend", autoChecked: werkgeverSigned },
    { id: "rie_getoetst", label: "RI&E getoetst (indien >25 medewerkers)", autoChecked: toetserSigned, conditie: latestReport.aantalMedewerkers > 25 },
    { id: "pva_opgesteld", label: "Plan van Aanpak opgesteld", autoChecked: totalPva > 0 },
    { id: "or_pvt_geinformeerd", label: "OR/PVT geïnformeerd", autoChecked: false },
    { id: "medewerkers_geinformeerd", label: "Medewerkers geïnformeerd", autoChecked: false },
    { id: "bhv_plan_actueel", label: "BHV-plan actueel", autoChecked: false },
  ];

  // Merge with stored compliance checks
  const storedChecks = latestReport.complianceChecks || [];
  const checklist = checklistItems
    .filter(item => item.conditie === undefined || item.conditie)
    .map(item => {
      const stored = storedChecks.find((c: any) => c.item === item.id);
      return {
        id: item.id,
        label: item.label,
        checked: item.autoChecked || stored?.checked || false,
        autoChecked: item.autoChecked,
        checkedAt: stored?.checkedAt || null,
      };
    });

  // Reminders
  const herinneringen: string[] = [];
  if (isExpired) {
    herinneringen.push("Uw RI&E is verlopen — tijd voor actualisatie.");
  } else {
    const daysUntilExpiry = Math.ceil((oneYearLater.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30) {
      herinneringen.push(`Uw RI&E verloopt over ${daysUntilExpiry} dagen — plan een actualisatie.`);
    }
  }
  if (nietGestart > 0) {
    herinneringen.push(`${nietGestart} actiepunt${nietGestart > 1 ? "en" : ""} ${nietGestart > 1 ? "zijn" : "is"} nog niet gestart.`);
  }
  if (!werkgeverSigned) {
    herinneringen.push("De werkgever heeft de RI&E nog niet ondertekend.");
  }

  return NextResponse.json({
    hasReport: true,
    reportId: latestReport.id,
    bedrijfsnaam: latestReport.bedrijfsnaam,
    aantalMedewerkers: latestReport.aantalMedewerkers,
    rie: {
      laatsteDatum: latestReport.createdAt,
      geldigTot: oneYearLater.toISOString(),
      isActueel: !isExpired,
    },
    ondertekening: {
      werkgever: werkgeverSigned,
      preventiemedewerker: preventiemedewerkerSigned,
      toetser: toetserSigned,
      toetserVereist: latestReport.aantalMedewerkers > 25,
    },
    planVanAanpak: {
      totaal: totalPva,
      afgerond,
      inBehandeling,
      nietGestart,
      items: pvaWithStatus,
    },
    checklist,
    herinneringen,
  });
}
