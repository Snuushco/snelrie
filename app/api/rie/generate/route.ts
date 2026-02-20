import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateRie } from "@/lib/ai/pipeline";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bedrijfsnaam,
      branche,
      aantalMedewerkers,
      aantalLocaties,
      email,
      naam,
      tier,
      ...werkplekData
    } = body;

    if (!bedrijfsnaam || !branche || !aantalMedewerkers || !email) {
      return NextResponse.json(
        { error: "Vul alle verplichte velden in" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, naam: naam || null },
      });
    }

    // Create report
    const report = await prisma.rieReport.create({
      data: {
        userId: user.id,
        bedrijfsnaam,
        branche,
        aantalMedewerkers,
        aantalLocaties: aantalLocaties || 1,
        tier: tier || "GRATIS",
        intakeData: {
          bedrijfsnaam,
          branche,
          aantalMedewerkers,
          aantalLocaties: aantalLocaties || 1,
          bhvAanwezig: werkplekData.bhvAanwezig === "ja",
          aantalBhvers: werkplekData.aantalBhvers || null,
          preventiemedewerker: werkplekData.preventiemedewerker === "ja",
          eerderRie: werkplekData.eerderRie === "ja",
          laatsteRie: werkplekData.laatsteRie || null,
          werkplek: {
            typeWerkzaamheden: werkplekData.typeWerkzaamheden || [],
            gevaarlijkeStoffen: werkplekData.gevaarlijkeStoffen === "ja",
            beeldschermwerk: werkplekData.beeldschermwerk === "ja",
            fysiekWerk: werkplekData.fysiekWerk === "ja",
            buitenwerk: werkplekData.buitenwerk === "ja",
            nachtwerk: werkplekData.nachtwerk === "ja",
            alleenWerken: werkplekData.alleenWerken === "ja",
          },
        },
        status: "PENDING",
      },
    });

    // Generate async (don't await in request)
    generateRie(report.id).catch(console.error);

    return NextResponse.json({ reportId: report.id });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Er ging iets mis bij het aanmaken" },
      { status: 500 }
    );
  }
}
