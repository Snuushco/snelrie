import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return auth.response;

  try {
    const body = await req.json();
    const {
      bedrijfsnaam,
      branche,
      aantalMedewerkers,
      aantalLocaties,
      bhvAanwezig,
      aantalBhvers,
      preventiemedewerker,
      eerderRie,
      laatsteRie,
      typeWerkzaamheden,
      gevaarlijkeStoffen,
      beeldschermwerk,
      fysiekWerk,
      buitenwerk,
      nachtwerk,
      alleenWerken,
    } = body;

    if (!bedrijfsnaam || !branche || !aantalMedewerkers) {
      return NextResponse.json(
        {
          error: "Verplichte velden: bedrijfsnaam, branche, aantalMedewerkers",
        },
        { status: 400 }
      );
    }

    const report = await prisma.rieReport.create({
      data: {
        userId: auth.userId,
        bedrijfsnaam,
        branche,
        aantalMedewerkers: Number(aantalMedewerkers),
        aantalLocaties: Number(aantalLocaties) || 1,
        tier: "GRATIS",
        intakeData: {
          bedrijfsnaam,
          branche,
          aantalMedewerkers: Number(aantalMedewerkers),
          aantalLocaties: Number(aantalLocaties) || 1,
          bhvAanwezig: bhvAanwezig ?? false,
          aantalBhvers: aantalBhvers || null,
          preventiemedewerker: preventiemedewerker ?? false,
          eerderRie: eerderRie ?? false,
          laatsteRie: laatsteRie || null,
          werkplek: {
            typeWerkzaamheden: typeWerkzaamheden || [],
            gevaarlijkeStoffen: gevaarlijkeStoffen ?? false,
            beeldschermwerk: beeldschermwerk ?? false,
            fysiekWerk: fysiekWerk ?? false,
            buitenwerk: buitenwerk ?? false,
            nachtwerk: nachtwerk ?? false,
            alleenWerken: alleenWerken ?? false,
          },
        },
        status: "PENDING",
      },
    });

    // Trigger processing
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "https://snelrie.nl";
      await fetch(`${baseUrl}/api/rie/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id }),
      });
    } catch {
      // Process will be picked up later
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      status: "PENDING",
      message: "RI&E scan is gestart. Gebruik GET /api/v1/reports/{reportId} om de status te controleren.",
    });
  } catch (error) {
    console.error("V1 scan error:", error);
    return NextResponse.json(
      { error: "Er ging iets mis bij het aanmaken van de scan" },
      { status: 500 }
    );
  }
}
