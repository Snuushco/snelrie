import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { RieDocument, getBranding } from "@/lib/pdf/rie-document";
import { validateRieData, categorizeIssues } from "@/lib/pdf/rie-qa-validator";
import { prisma } from "@/lib/db";

/**
 * POST /api/rie/pdf
 * Accepts JSON body and returns PDF.
 * 
 * Body: {
 *   bedrijfsnaam, branche, aantalMedewerkers, aantalLocaties,
 *   tier?,  // "ENTERPRISE" enables white-label
 *   generatedContent: { samenvatting, risicos, planVanAanpak, ... },
 *   whiteLabel?: { logoUrl?, primaryColor?, companyName? }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const data = {
      bedrijfsnaam: body.bedrijfsnaam || "Onbekend bedrijf",
      branche: body.branche || "Onbekend",
      aantalMedewerkers: body.aantalMedewerkers || 0,
      aantalLocaties: body.aantalLocaties || 1,
      tier: body.tier || "BASIS",
      generatedContent: body.generatedContent || body,
      datum: new Date().toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      whiteLabel: body.whiteLabel, // will be populated below for Enterprise
    };

    // Auto-load branding from database for Enterprise tier
    if (data.tier === "ENTERPRISE" && body.email && !data.whiteLabel) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: body.email },
          include: { branding: true },
        });
        if (user?.branding) {
          data.whiteLabel = {
            logoUrl: user.branding.logoUrl || undefined,
            primaryColor: user.branding.primaryColor || undefined,
            companyName: user.branding.companyName || undefined,
          };
        }
      } catch (e) {
        console.warn("Could not load branding:", e);
      }
    }

    // ── QA Validation ──
    const qaIssues = validateRieData(data as any);
    const qa = categorizeIssues(qaIssues);

    // Block PDF generation if there are errors (unless skipQa=true)
    if (qa.hasErrors && !body.skipQa) {
      return NextResponse.json(
        {
          error: "QA validatie gefaald",
          issues: qaIssues,
          summary: {
            errors: qa.errors.length,
            warnings: qa.warnings.length,
            info: qa.info.length,
          },
        },
        { status: 400 }
      );
    }

    // Build branding for Enterprise white-label
    const branding = data.tier === "ENTERPRISE" && data.whiteLabel?.companyName
      ? getBranding("ENTERPRISE", data.whiteLabel)
      : undefined;

    const element = React.createElement(RieDocument, { data, branding });
    const buffer = await renderToBuffer(element as any);

    const filename = `RIE-${data.bedrijfsnaam.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

    const headers: Record<string, string> = {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    };

    // Include QA summary in response headers
    if (qa.total > 0) {
      headers["X-QA-Issues"] = JSON.stringify({
        errors: qa.errors.length,
        warnings: qa.warnings.length,
        info: qa.info.length,
      });
    }

    return new NextResponse(new Uint8Array(buffer), { headers });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "PDF generatie mislukt", details: String(err) },
      { status: 500 }
    );
  }
}
