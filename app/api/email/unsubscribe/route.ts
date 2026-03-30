import { NextRequest, NextResponse } from "next/server";
import { cancelAllDrips } from "@/lib/drip-engine";
import { prisma } from "@/lib/db";

/**
 * GET /api/email/unsubscribe?email=...&drip=...
 * One-click unsubscribe from all drip sequences.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const dripId = searchParams.get("drip");

  if (!email) {
    return new NextResponse(unsubscribePage("Ongeldige link.", false), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
      status: 400,
    });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      await cancelAllDrips(user.id);
    } else if (dripId) {
      // Cancel specific drip even without user match
      await prisma.emailDrip.updateMany({
        where: { id: dripId, email, status: "ACTIVE" },
        data: { status: "UNSUBSCRIBED", cancelledAt: new Date() },
      });
    }

    return new NextResponse(
      unsubscribePage("U bent uitgeschreven van alle SnelRIE emails.", true),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (error) {
    console.error("[unsubscribe] Error:", error);
    return new NextResponse(
      unsubscribePage("Er is iets misgegaan. Probeer het later opnieuw.", false),
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 500 }
    );
  }
}

/**
 * POST /api/email/unsubscribe
 * List-Unsubscribe-Post: One-Click RFC 8058
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await cancelAllDrips(user.id);
  }

  return NextResponse.json({ unsubscribed: true });
}

function unsubscribePage(message: string, success: boolean): string {
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
  <a href="https://www.snelrie.nl" style="color:#2563eb;font-size:14px;">Terug naar SnelRIE</a>
</div>
</body>
</html>`;
}
