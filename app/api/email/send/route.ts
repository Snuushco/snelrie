import { NextRequest, NextResponse } from "next/server";
import { resend, EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/resend";

const INTERNAL_SECRET = process.env.CRON_SECRET || process.env.RESEND_WEBHOOK_SECRET || "";

/**
 * POST /api/email/send
 * Send a single email via Resend. Internal use only.
 *
 * Body: { to, subject, html, text?, replyTo?, tags? }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    const isInternal =
      request.headers.get("x-internal") === "true" ||
      (INTERNAL_SECRET && auth === `Bearer ${INTERNAL_SECRET}`);

    if (!isInternal && INTERNAL_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, html, text, replyTo, tags } = body as {
      to: string;
      subject: string;
      html: string;
      text?: string;
      replyTo?: string;
      tags?: Array<{ name: string; value: string }>;
    };

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      replyTo: replyTo || EMAIL_REPLY_TO,
      to: [to],
      subject,
      html,
      text: text || undefined,
      tags: tags || undefined,
    });

    if (error) {
      console.error("[email/send] Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messageId: data?.id, sent: true });
  } catch (error) {
    console.error("[email/send] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
