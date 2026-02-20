import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateRie } from "@/lib/ai/pipeline";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { generateRieSchema, validationErrorResponse } from "@/lib/validate";

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = getClientIp(req);
  const rl = checkRateLimit(RATE_LIMITS.generate, ip);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter);

  try {
    const body = await req.json();

    // Validate & sanitize input
    const parsed = generateRieSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const {
      bedrijfsnaam,
      branche,
      aantalMedewerkers,
      aantalLocaties,
      email,
      naam,
      tier,
      ...werkplekData
    } = parsed.data;

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

    // Generate in-request (serverless won't reliably continue after response)
    await generateRie(report.id);

    return NextResponse.json({ reportId: report.id });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Er ging iets mis bij het aanmaken" },
      { status: 500 }
    );
  }
}
