import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Naam is verplicht").max(100),
  email: z.string().email("Ongeldig emailadres").max(200),
});

// In-memory rate limit (per IP, 5 requests per hour)
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 60 * 1000; // 1 hour
  const limit = 5;

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + window });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Te veel verzoeken. Probeer het later opnieuw." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Ongeldige invoer" },
        { status: 400 }
      );
    }

    const { name, email } = parsed.data;

    // Send checklist email via Resend
    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service is tijdelijk niet beschikbaar. Probeer het later." },
        { status: 503 }
      );
    }

    const checklistUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://snelrie.nl"}/rie-checklist.pdf`;

    const emailHtml = buildChecklistEmail(name, checklistUrl);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "SnelRIE <emily@snelrie.nl>",
        to: [email],
        subject: "Uw gratis RI&E Checklist — 20 controlepunten ✅",
        html: emailHtml,
        tags: [
          { name: "type", value: "lead_magnet" },
          { name: "asset", value: "rie_checklist" },
          { name: "segment", value: "nurture" },
        ],
      }),
    });

    if (!resendRes.ok) {
      const resendErr = await resendRes.text();
      console.error("Resend error:", resendRes.status, resendErr);
      return NextResponse.json(
        { error: "Email kon niet worden verzonden. Controleer uw emailadres." },
        { status: 500 }
      );
    }

    const resendData = await resendRes.json();

    // Add contact to nurture audience via Resend Contacts API
    try {
      await fetch("https://api.resend.com/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          email,
          first_name: name.split(" ")[0],
          last_name: name.split(" ").slice(1).join(" ") || undefined,
          unsubscribed: false,
          audience_id: process.env.RESEND_AUDIENCE_ID || undefined,
        }),
      });
    } catch (contactErr) {
      // Non-critical: log but don't fail the request
      console.error("Failed to add contact to Resend audience:", contactErr);
    }

    console.log(
      `[checklist] Lead captured: ${email} (name: ${name}) — Resend ID: ${resendData.id}`
    );

    return NextResponse.json({
      success: true,
      message: "Checklist is verzonden naar uw email.",
    });
  } catch (err) {
    console.error("[checklist] Unexpected error:", err);
    return NextResponse.json(
      { error: "Er ging iets mis. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}

function buildChecklistEmail(name: string, checklistUrl: string): string {
  const firstName = name.split(" ")[0];
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background:#fff;border-radius:12px;padding:40px;border:1px solid #e2e8f0;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:24px;font-weight:700;color:#1e293b;">Snel<span style="color:#2563eb;">RIE</span></span>
    </div>

    <h1 style="font-size:24px;color:#1e293b;margin:0 0 8px;">Hallo ${firstName}, hier is uw RI&E Checklist! ✅</h1>
    <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Bedankt voor uw aanvraag. Hieronder vindt u de download-link voor de gratis RI&E Checklist met 20 essentiële controlepunten.
    </p>

    <!-- Download button -->
    <div style="text-align:center;margin:32px 0;padding:24px;background:#f0f9ff;border-radius:8px;">
      <p style="color:#1e293b;font-weight:600;margin:0 0 16px;">Download uw checklist:</p>
      <a href="${checklistUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;font-weight:600;text-decoration:none;font-size:15px;">
        📋 Download PDF Checklist
      </a>
    </div>

    <!-- Wat nu -->
    <div style="background:#fefce8;border-left:4px solid #f59e0b;padding:16px;border-radius:0 8px 8px 0;margin:24px 0;">
      <h3 style="margin:0 0 8px;color:#92400e;font-size:15px;">💡 Tip: van checklist naar volledige RI&E</h3>
      <p style="margin:0;color:#78716c;font-size:14px;line-height:1.5;">
        Veel van de 20 punten vereisen een uitgewerkte analyse. Met SnelRIE genereert u in minuten een volledige RI&E 
        inclusief Plan van Aanpak — op maat voor uw branche.
      </p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://snelrie.nl/scan?utm_source=email&utm_medium=lead_magnet&utm_campaign=checklist" 
         style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">
        Start Gratis RI&E Scan →
      </a>
    </div>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">

    <div style="text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">
        U ontvangt deze email omdat u de RI&E Checklist heeft aangevraagd op SnelRIE.
        <br>
        <a href="https://snelrie.nl" style="color:#2563eb;text-decoration:none;">snelrie.nl</a> — 
        onderdeel van Praesidion Holding B.V.
      </p>
    </div>
  </div>
</div>
</body>
</html>`;
}
