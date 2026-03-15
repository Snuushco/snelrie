import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

/**
 * Resend Webhook Receiver
 * Handles: email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained
 * Docs: https://resend.com/docs/dashboard/webhooks/introduction
 *
 * Resend signs webhooks using Svix. We verify using the svix-id, svix-timestamp, svix-signature headers.
 * Secret is the webhook signing secret from Resend dashboard (whsec_...).
 */

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || "";

// Svix signature verification
function verifyWebhookSignature(
  payload: string,
  headers: {
    svixId: string | null;
    svixTimestamp: string | null;
    svixSignature: string | null;
  }
): boolean {
  if (!WEBHOOK_SECRET) {
    // If no secret configured, skip verification (log warning)
    console.warn("[resend-webhook] No RESEND_WEBHOOK_SECRET set — skipping signature verification");
    return true;
  }

  const { svixId, svixTimestamp, svixSignature } = headers;
  if (!svixId || !svixTimestamp || !svixSignature) {
    return false;
  }

  // Check timestamp is within 5 minutes
  const timestamp = parseInt(svixTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    return false;
  }

  // Svix uses the format: whsec_<base64-encoded-secret>
  const secretBytes = Buffer.from(
    WEBHOOK_SECRET.startsWith("whsec_")
      ? WEBHOOK_SECRET.slice(6)
      : WEBHOOK_SECRET,
    "base64"
  );

  const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  // Svix sends multiple signatures separated by space, each prefixed with "v1,"
  const signatures = svixSignature.split(" ");
  for (const sig of signatures) {
    const sigValue = sig.startsWith("v1,") ? sig.slice(3) : sig;
    if (crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(sigValue))) {
      return true;
    }
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    // Verify signature
    if (
      !verifyWebhookSignature(payload, {
        svixId,
        svixTimestamp,
        svixSignature,
      })
    ) {
      console.error("[resend-webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventType: string = event.type;
    const data = event.data || {};

    // Extract common fields from Resend event payload
    const email = Array.isArray(data.to) ? data.to[0] : data.to || data.email || "";
    const subject = data.subject || null;
    const messageId = data.email_id || data.id || null;
    const link = data.click?.link || null;

    console.log(
      `[resend-webhook] ${eventType} | to=${email} | messageId=${messageId}${link ? ` | link=${link}` : ""}`
    );

    // Store in database
    await prisma.emailEvent.create({
      data: {
        type: eventType,
        email,
        subject,
        messageId,
        link,
        metadata: event,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[resend-webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Resend may send a GET to verify the endpoint exists
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "resend-webhook" });
}
