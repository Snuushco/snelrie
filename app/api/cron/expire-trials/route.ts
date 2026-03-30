import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resend, EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/resend";
import { triggerDripSequence } from "@/lib/drip-engine";

const CRON_SECRET = process.env.CRON_SECRET || "";

/**
 * GET /api/cron/expire-trials
 * Daily cron: find users whose 14-day Professional trial has expired,
 * downgrade them to STARTER, and send a notification email.
 */
export async function GET(request: NextRequest) {
  // Auth check
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const auth = request.headers.get("authorization");
  const isAuthorized =
    !CRON_SECRET ||
    secret === CRON_SECRET ||
    auth === `Bearer ${CRON_SECRET}`;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find users with expired trials who still have PROFESSIONAL + TRIALING status
    // and no active Stripe subscription (no stripeSubscriptionId)
    const expiredTrialUsers = await prisma.user.findMany({
      where: {
        trialEndsAt: { lt: now },
        subscription: {
          tier: "PROFESSIONAL",
          status: "TRIALING",
          stripeSubscriptionId: null, // No paid Stripe subscription
        },
      },
      include: {
        subscription: true,
      },
    });

    let downgraded = 0;
    let emailsSent = 0;

    for (const user of expiredTrialUsers) {
      try {
        // Downgrade subscription to STARTER
        if (user.subscription) {
          await prisma.subscription.update({
            where: { id: user.subscription.id },
            data: {
              tier: "STARTER",
              status: "CANCELLED",
            },
          });
        }
        downgraded++;

        // Send trial expired email
        const pricingUrl = "https://www.snelrie.nl/pricing";
        const unsubscribeUrl = `https://www.snelrie.nl/api/email/unsubscribe?email=${encodeURIComponent(user.email)}`;

        const { error } = await resend.emails.send({
          from: EMAIL_FROM,
          replyTo: EMAIL_REPLY_TO,
          to: [user.email],
          subject: "Uw SnelRIE proefperiode is verlopen",
          html: trialExpiredEmailHtml(user.naam || undefined, pricingUrl, unsubscribeUrl),
          text: trialExpiredEmailText(user.naam || undefined, pricingUrl),
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
          tags: [
            { name: "type", value: "trial_expired" },
            { name: "userId", value: user.id },
          ],
        });

        if (!error) emailsSent++;
        else console.error(`[expire-trials] Email error for ${user.email}:`, error);
      } catch (err) {
        console.error(`[expire-trials] Failed for user ${user.id}:`, err);
      }
    }

    console.log(`[expire-trials] Downgraded ${downgraded}, emails sent ${emailsSent}`);

    return NextResponse.json({
      ok: true,
      processed: expiredTrialUsers.length,
      downgraded,
      emailsSent,
      processedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[expire-trials] Error:", error);
    return NextResponse.json(
      { error: "Failed to process expired trials" },
      { status: 500 }
    );
  }
}

// ─── Email Templates ─────────────────────────────────────────────────

function trialExpiredEmailHtml(naam: string | undefined, pricingUrl: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;">
<div style="font-family:'Segoe UI',system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;color:#1a1a1a;">
  <div style="padding:32px 24px;">
    <p style="font-size:20px;font-weight:700;color:#2563eb;margin:0;">Snel<span style="color:#1a1a1a;">RIE</span></p>

    <h1 style="font-size:22px;margin:24px 0 12px;">Uw proefperiode is verlopen</h1>

    <p>Beste${naam ? ` ${naam}` : ""},</p>

    <p>Uw 14-dagen gratis proefperiode van het <strong>Professional</strong> abonnement is vandaag verlopen. Uw account is teruggezet naar het <strong>Starter</strong> abonnement.</p>

    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:20px;margin:20px 0;">
      <p style="margin:0;font-weight:600;color:#92400e;">Wat u mist zonder Professional:</p>
      <ul style="margin:12px 0 0;padding-left:20px;color:#92400e;">
        <li>5 RI&E rapporten per maand (i.p.v. 1)</li>
        <li>AI Chat Assistent</li>
        <li>Plan van Aanpak generator</li>
        <li>Branding & huisstijl op rapporten</li>
        <li>Tot 3 locaties</li>
      </ul>
    </div>

    <p>Upgrade nu en ga direct verder waar u gebleven was — al uw eerdere rapporten blijven beschikbaar.</p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${pricingUrl}" style="display:inline-block;background:#2563eb;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Bekijk abonnementen →</a>
    </div>

    <p style="color:#6b7280;font-size:14px;">Vanaf slechts €49/maand heeft u weer volledige toegang tot alle Professional functies.</p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <div style="color:#9ca3af;font-size:12px;line-height:1.5;">
      <p style="margin:0;">SnelRIE — RI&E zonder gedoe</p>
      <p style="margin:4px 0;">Een dienst van Praesidion Holding B.V. | KvK 97640794 | BTW NL868152237B01</p>
      <p style="margin:4px 0;"><a href="${unsubscribeUrl}" style="color:#9ca3af;">Uitschrijven</a> | <a href="https://www.snelrie.nl/privacy" style="color:#9ca3af;">Privacybeleid</a></p>
    </div>
  </div>
</div>
</body>
</html>`;
}

function trialExpiredEmailText(naam: string | undefined, pricingUrl: string): string {
  return `Beste${naam ? ` ${naam}` : ""},

Uw 14-dagen gratis proefperiode van het Professional abonnement is vandaag verlopen. Uw account is teruggezet naar het Starter abonnement.

Wat u mist zonder Professional:
- 5 RI&E rapporten per maand (i.p.v. 1)
- AI Chat Assistent
- Plan van Aanpak generator
- Branding & huisstijl op rapporten
- Tot 3 locaties

Upgrade nu: ${pricingUrl}

Vanaf slechts €49/maand heeft u weer volledige toegang tot alle Professional functies.

Met vriendelijke groet,
Het SnelRIE team`;
}
