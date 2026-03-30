import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { generateRieSchema, validationErrorResponse } from "@/lib/validate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireReportQuota } from "@/lib/gate";

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
      tier: _ignoredTier, // Security: ignore client-supplied tier
      ...werkplekData
    } = parsed.data;

    // Find or create user (anonymous if no email provided)
    const userEmail = email || `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@snelrie.nl`;
    let user = email ? await prisma.user.findUnique({ where: { email } }) : null;
    if (!user) {
      user = await prisma.user.create({
        data: { email: userEmail, naam: naam || null },
      });
    }

    // Check if authenticated user has remaining report quota
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const quotaGate = await requireReportQuota(session.user.id);
      if (quotaGate) return quotaGate;
    } else if (user) {
      // For non-session users (e.g. scan flow), check quota by user id
      const quotaGate = await requireReportQuota(user.id);
      if (quotaGate) return quotaGate;
    }

    // Create report record (fast DB operation only)
    const report = await prisma.rieReport.create({
      data: {
        userId: user.id,
        bedrijfsnaam,
        branche,
        aantalMedewerkers,
        aantalLocaties: aantalLocaties || 1,
        tier: "GRATIS", // Security: always start as GRATIS, upgrade only via Stripe webhook
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

    // Return immediately — client calls /api/rie/process to start generation
    return NextResponse.json({ reportId: report.id, status: "PENDING" });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Er ging iets mis bij het aanmaken" },
      { status: 500 }
    );
  }
}
