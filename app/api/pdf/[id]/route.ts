import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { RieDocument } from "@/lib/pdf/rie-document";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting
  const ip = getClientIp(req);
  const rl = checkRateLimit(RATE_LIMITS.pdf, ip);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter);

  const { id } = await params;

  const report = await prisma.rieReport.findUnique({
    where: { id },
    include: {
      payments: { where: { status: "PAID" }, take: 1 },
      user: true,
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  if (report.payments.length === 0) {
    return NextResponse.json({ error: "Betaling vereist" }, { status: 403 });
  }

  if (!report.generatedContent) {
    return NextResponse.json({ error: "Rapport nog niet gereed" }, { status: 400 });
  }

  const content = report.generatedContent as any;
  const datum = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  try {
    const element = React.createElement(RieDocument, {
      data: {
        bedrijfsnaam: report.bedrijfsnaam,
        branche: report.branche,
        aantalMedewerkers: report.aantalMedewerkers,
        aantalLocaties: report.aantalLocaties,
        generatedContent: content,
        datum,
      },
    });
    const buffer = await renderToBuffer(element as any);

    const filename = `RIE-${report.bedrijfsnaam.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "PDF generatie mislukt", details: String(err) },
      { status: 500 }
    );
  }
}
