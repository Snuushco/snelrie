import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";

export async function POST(req: NextRequest) {
  try {
    const { reportId } = await req.json();
    if (!reportId) {
      return NextResponse.json({ error: "reportId is verplicht" }, { status: 400 });
    }

    const report = await prisma.rieReport.findUnique({
      where: { id: reportId },
      include: { user: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Rapport niet gevonden" }, { status: 404 });
    }

    const intakeData = (report.intakeData as any) || {};
    const referralOpportunity = Boolean(intakeData.referralOpportunity);

    if (!referralOpportunity) {
      return NextResponse.json({ ok: true, skipped: true, reason: "geen referral opportunity" });
    }

    const risicos = ((report.generatedContent as any)?.risicos || []) as any[];
    const riskSummary = risicos
      .slice(0, 3)
      .map((r) => `- ${r.titel || r.risico || "Onbekend risico"}`)
      .join("\n");

    const sector = report.branche;
    const company = report.bedrijfsnaam;
    const contactName = report.user?.naam || "Onbekend";
    const contactEmail = report.user?.email || "Onbekend";
    const partnerCode = intakeData.partnerCode || "geen";
    const utmSource = intakeData?.utm?.source || "geen";

    const html = `
      <h2>Nieuwe Riebuddy referral-opportunity vanuit SnelRIE</h2>
      <p><strong>Bedrijfsnaam:</strong> ${company}</p>
      <p><strong>Contact:</strong> ${contactName}</p>
      <p><strong>Email:</strong> ${contactEmail}</p>
      <p><strong>Sector:</strong> ${sector}</p>
      <p><strong>Heeft arbodienst:</strong> ${intakeData.heeftArbodienst ? "Ja" : "Nee"}</p>
      <p><strong>Partner code:</strong> ${partnerCode}</p>
      <p><strong>UTM source:</strong> ${utmSource}</p>
      <p><strong>Scan resultaat samenvatting:</strong></p>
      <pre>${report.samenvatting || "Geen samenvatting beschikbaar"}</pre>
      <p><strong>Top risico's:</strong></p>
      <pre>${riskSummary || "Nog geen risico's beschikbaar"}</pre>
      <p><strong>Rapport ID:</strong> ${report.id}</p>
    `;

    const sent = await sendEmail({
      to: "emily@snelrie.nl",
      subject: `SnelRIE referral-opportunity: ${company}`,
      html,
      tags: [
        { name: "type", value: "riebuddy_referral" },
        { name: "report_id", value: report.id },
      ],
    });

    if (!sent.success) {
      return NextResponse.json({ error: sent.error || "Email verzenden mislukt" }, { status: 500 });
    }

    await prisma.rieReport.update({
      where: { id: report.id },
      data: {
        intakeData: {
          ...(intakeData || {}),
          referralOpportunity: true,
          referralTriggeredAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ ok: true, emailed: true });
  } catch (error) {
    console.error("riebuddy referral trigger error", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
