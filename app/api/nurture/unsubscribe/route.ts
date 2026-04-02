import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/email/send";
import { suppressNurtureByEmail } from "@/lib/nurture/scheduler";
import { cancelAllDrips } from "@/lib/drip-engine";
import { prisma } from "@/lib/db";

/**
 * GET /api/nurture/unsubscribe?token=<signed_token>
 * GDPR-compliant unsubscribe with signed token verification.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(renderPage("Ongeldige link.", false), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
      status: 400,
    });
  }

  const { valid, email } = verifyUnsubscribeToken(token);

  if (!valid || !email) {
    return new NextResponse(
      renderPage("Deze link is verlopen of ongeldig. Neem contact op met emily@snelrie.nl.", false),
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 400 }
    );
  }

  try {
    // Suppress all nurture events
    await suppressNurtureByEmail(email);

    // Also cancel drip sequences for this user
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await cancelAllDrips(user.id);
    }

    // Log unsubscribe event
    await prisma.emailEvent.create({
      data: {
        type: "nurture_unsubscribed",
        email,
        metadata: { method: "signed_token" },
      },
    });

    return new NextResponse(
      renderPage("U bent uitgeschreven van alle SnelRIE nurture emails. U ontvangt geen verdere emails meer.", true),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (error) {
    console.error("[nurture/unsubscribe] Error:", error);
    return new NextResponse(
      renderPage("Er is iets misgegaan. Probeer het later opnieuw of mail emily@snelrie.nl.", false),
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 500 }
    );
  }
}

/**
 * POST /api/nurture/unsubscribe?token=<signed_token>
 * RFC 8058 List-Unsubscribe-Post: One-Click
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { valid, email } = verifyUnsubscribeToken(token);

  if (!valid || !email) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  await suppressNurtureByEmail(email);

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await cancelAllDrips(user.id);
  }

  await prisma.emailEvent.create({
    data: {
      type: "nurture_unsubscribed",
      email,
      metadata: { method: "one_click_rfc8058" },
    },
  });

  return NextResponse.json({ unsubscribed: true });
}

function renderPage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Uitschrijven — SnelRIE</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',system-ui,sans-serif;">
<div style="max-width:480px;margin:80px auto;text-align:center;padding:40px 24px;background:white;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
  <p style="font-size:24px;font-weight:700;color:#2563eb;margin:0;">Snel<span style="color:#1a1a1a;">RIE</span></p>
  <div style="margin:24px 0;">
    <p style="font-size:${success ? "48px" : "36px"};margin:0;">${success ? "✅" : "⚠️"}</p>
    <p style="font-size:18px;margin:16px 0 0;color:#1a1a1a;">${message}</p>
  </div>
  ${success ? '<p style="color:#6b7280;font-size:14px;">Conform de AVG/GDPR bent u direct uitgeschreven.</p>' : ""}
  <a href="https://www.snelrie.nl" style="color:#2563eb;font-size:14px;">Terug naar SnelRIE</a>
</div>
</body>
</html>`;
}
