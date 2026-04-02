/**
 * lib/email/send.ts — SnelRIE email sender via Resend (hb-041)
 *
 * Centralised email sending with:
 * - Template loading from emails/ directory
 * - Signed unsubscribe tokens (GDPR)
 * - A/B subject line support
 * - Email event logging
 */

import { resend, EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/resend";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// ─── Types ───────────────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: { name: string; value: string }[];
  nurtureEventId?: string;
  abVariant?: string;
}

export interface SendTemplateOptions {
  to: string;
  templateName: string; // e.g. "snelrie-email-1" (without .html)
  subject: string;
  replacements?: Record<string, string>;
  tags?: { name: string; value: string }[];
  nurtureEventId?: string;
  abVariant?: string;
}

// ─── Unsubscribe Token ──────────────────────────────────────────────

const UNSUBSCRIBE_SECRET =
  process.env.UNSUBSCRIBE_SECRET || process.env.NEXTAUTH_SECRET || "snelrie-default-secret";

export function generateUnsubscribeToken(email: string): string {
  const payload = `${email}:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", UNSUBSCRIBE_SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${hmac}`).toString("base64url");
  return token;
}

export function verifyUnsubscribeToken(token: string): { valid: boolean; email?: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 3) return { valid: false };

    const email = parts[0];
    const timestamp = parts[1];
    const hmac = parts.slice(2).join(":");

    // Verify HMAC
    const expectedHmac = crypto
      .createHmac("sha256", UNSUBSCRIBE_SECRET)
      .update(`${email}:${timestamp}`)
      .digest("hex");

    if (hmac !== expectedHmac) return { valid: false };

    // Token valid for 365 days
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > 365 * 24 * 60 * 60 * 1000) return { valid: false };

    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}

// ─── Template Loading ───────────────────────────────────────────────

function loadTemplate(templateName: string): string {
  // Try emails/ directory first, then fallback
  const emailsDir = path.join(process.cwd(), "emails");
  const filePath = path.join(emailsDir, `${templateName}.html`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Email template not found: ${filePath}`);
  }

  return fs.readFileSync(filePath, "utf-8");
}

function applyReplacements(html: string, replacements: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

// ─── Core Send Function ─────────────────────────────────────────────

export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const { to, subject, html, text, tags = [], nurtureEventId, abVariant } = options;

  // Generate signed unsubscribe URL
  const unsubscribeToken = generateUnsubscribeToken(to);
  const unsubscribeUrl = `https://www.snelrie.nl/api/nurture/unsubscribe?token=${unsubscribeToken}`;

  // Inject unsubscribe URL into HTML
  const finalHtml = html
    .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl)
    .replace(/\{\{UNSUBSCRIBE_TOKEN\}\}/g, unsubscribeToken);

  // Add nurture tags
  const allTags = [...tags];
  if (nurtureEventId) {
    allTags.push({ name: "nurture_event_id", value: nurtureEventId });
  }
  if (abVariant) {
    allTags.push({ name: "ab_variant", value: abVariant });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      replyTo: EMAIL_REPLY_TO,
      to: [to],
      subject,
      html: finalHtml,
      text: text || stripHtml(finalHtml),
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: allTags,
    });

    if (error) {
      console.error(`[email/send] Resend error for ${to}:`, error);
      return { success: false, error: error.message };
    }

    // Log email event
    await prisma.emailEvent.create({
      data: {
        type: "nurture_sent",
        email: to,
        subject,
        messageId: data?.id,
        metadata: {
          nurtureEventId,
          abVariant,
          tags: allTags,
        },
      },
    });

    console.log(`[email/send] Sent "${subject}" to ${to} (messageId: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email/send] Exception for ${to}:`, message);
    return { success: false, error: message };
  }
}

// ─── Template Send Function ─────────────────────────────────────────

export async function sendTemplateEmail(options: SendTemplateOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const { to, templateName, subject, replacements = {}, tags, nurtureEventId, abVariant } = options;

  try {
    let html = loadTemplate(templateName);
    html = applyReplacements(html, replacements);

    return await sendEmail({
      to,
      subject,
      html,
      tags,
      nurtureEventId,
      abVariant,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[email/send] Template error (${templateName}):`, message);
    return { success: false, error: message };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
