import { NextRequest, NextResponse } from "next/server";
import { validateRieData, categorizeIssues } from "@/lib/pdf/rie-qa-validator";

/**
 * POST /api/rie/validate
 * Validates RI&E data without generating PDF.
 * Returns QA issues so the frontend can show them before download.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const data = {
      bedrijfsnaam: body.bedrijfsnaam || "",
      branche: body.branche || "",
      aantalMedewerkers: body.aantalMedewerkers || 0,
      aantalLocaties: body.aantalLocaties || 1,
      tier: body.tier || "BASIS",
      generatedContent: body.generatedContent || body,
      datum:
        body.datum ||
        new Date().toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
    };

    const issues = validateRieData(data as any);
    const summary = categorizeIssues(issues);

    return NextResponse.json({
      valid: !summary.hasErrors,
      issues,
      summary: {
        errors: summary.errors.length,
        warnings: summary.warnings.length,
        info: summary.info.length,
        total: summary.total,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Validatie mislukt", details: String(err) },
      { status: 500 }
    );
  }
}
