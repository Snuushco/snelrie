import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { RieDocument, getBranding } from "@/lib/pdf/rie-document";

/**
 * POST /api/rie/pdf
 *
 * Accepts JSON body with RIE data + optional white-label params.
 *
 * Body fields:
 *   - tier: "BASIS" | "PROFESSIONAL" | "ENTERPRISE" (default: "BASIS")
 *   - logoUrl: string (enterprise only — URL to client logo)
 *   - primaryColor: string (enterprise only — hex color e.g. "#ff6600")
 *   - companyName: string (enterprise only — client company name for branding)
 *   - bedrijfsnaam, branche, aantalMedewerkers, aantalLocaties: profile fields
 *   - generatedContent OR top-level fields (samenvatting, risicos, planVanAanpak, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract white-label params
    const tier = body.tier || "BASIS";
    const branding = getBranding(tier, {
      logoUrl: body.logoUrl,
      primaryColor: body.primaryColor,
      companyName: body.companyName,
    });

    // Build data object — support both nested (generatedContent) and flat formats
    const generatedContent = body.generatedContent || {
      samenvatting: body.samenvatting,
      bedrijfsprofiel: body.bedrijfsprofiel,
      risicos: body.risicos,
      planVanAanpak: body.planVanAanpak,
      wettelijkeVerplichtingen: body.wettelijkeVerplichtingen,
    };

    const data = {
      bedrijfsnaam:
        body.bedrijfsnaam ||
        body.bedrijfsprofiel?.naam ||
        generatedContent.bedrijfsprofiel?.naam ||
        "Onbekend bedrijf",
      branche:
        body.branche ||
        body.bedrijfsprofiel?.branche ||
        generatedContent.bedrijfsprofiel?.branche ||
        "Onbekend",
      aantalMedewerkers:
        body.aantalMedewerkers ||
        body.bedrijfsprofiel?.aantalMedewerkers ||
        generatedContent.bedrijfsprofiel?.aantalMedewerkers ||
        0,
      aantalLocaties: body.aantalLocaties || 1,
      generatedContent,
      datum: new Date().toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };

    const buffer = await renderToBuffer(
      React.createElement(RieDocument, { data, branding }) as any
    );

    const filename = `RIE-${data.bedrijfsnaam.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;

    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
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
