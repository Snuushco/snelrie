import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/lib/rate-limit";

const demoSchema = z.object({
  email: z.string().email("Vul een geldig emailadres in."),
  branche: z.string().min(1).max(100),
  medewerkers: z.string().min(1).max(50),
});

type DemoLead = {
  email: string;
  branche: string;
  medewerkers: string;
  createdAt: string;
  source: string;
  ip: string;
  userAgent: string;
};

const demoLeads: DemoLead[] = [];

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(
    {
      name: "demo-capture",
      maxRequests: 5,
      windowSeconds: 3600,
    },
    ip
  );

  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfter);
  }

  try {
    const body = await req.json();
    const data = demoSchema.parse(body);

    const exists = demoLeads.some(
      (lead) => lead.email.toLowerCase() === data.email.toLowerCase()
    );

    if (!exists) {
      demoLeads.push({
        email: data.email,
        branche: data.branche,
        medewerkers: data.medewerkers,
        createdAt: new Date().toISOString(),
        source: "demo-page",
        ip,
        userAgent: req.headers.get("user-agent") || "unknown",
      });
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Demo lead opgeslagen.",
        deduped: exists,
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Ongeldige invoer." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Er ging iets mis bij het opslaan van uw demo-aanvraag." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    count: demoLeads.length,
    leads: demoLeads,
  });
}
