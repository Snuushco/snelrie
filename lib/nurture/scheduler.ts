/**
 * lib/nurture/scheduler.ts — Lead Nurture Scheduler (hb-041)
 *
 * Manages the 5-step nurture sequence:
 *   T+0:  Welcome email (on signup)
 *   T+3:  Case study email (3 days after signup)
 *   T+5:  Urgency email (Arbeidsinspectie angle)
 *   T+7:  Free offer email (limited-time hook)
 *   T+14: Win-back email (if no conversion yet)
 *
 * Scheduler is idempotent — won't send duplicate emails.
 * Runs daily at 09:00-11:00 CET, Mon-Fri only.
 * Respects GDPR suppression list.
 */

import { prisma } from "@/lib/db";
import { sendTemplateEmail } from "@/lib/email/send";
import { NurtureEventType } from "@prisma/client";

// ─── Sequence Definition ────────────────────────────────────────────

interface NurtureStep {
  dayOffset: number;
  templateName: string; // maps to emails/snelrie-email-N.html
  subjectA: string;     // A/B variant A subject
  subjectB: string;     // A/B variant B subject
  description: string;
}

export const NURTURE_STEPS: NurtureStep[] = [
  {
    dayOffset: 0,
    templateName: "snelrie-email-1",
    subjectA: "Je hebt risico's gevonden — hier is wat je moet doen",
    subjectB: "⚠️ Belangrijke risico's gevonden in je bedrijf",
    description: "Welcome email — immediate after signup",
  },
  {
    dayOffset: 3,
    templateName: "snelrie-email-2",
    subjectA: "MKB bedrijf bespaart 20 uur/week met RI&E automatisering",
    subjectB: "Hoe een bakkerij haar RI&E in 5 minuten regelde",
    description: "Case study — 3 days after signup",
  },
  {
    dayOffset: 5,
    templateName: "snelrie-email-3",
    subjectA: "Arbeidsinspectie boetes 2026 — ben jij voorbereid?",
    subjectB: "🚨 Inspectie SZW verscherpt controles — jouw RI&E op orde?",
    description: "Urgency — Arbeidsinspectie angle, 5 days",
  },
  {
    dayOffset: 7,
    templateName: "snelrie-email-4",
    subjectA: "Gratis compliance check + rapport voor je team",
    subjectB: "Exclusief: gratis volledige RI&E check voor jouw bedrijf",
    description: "Free offer — limited-time hook, 7 days",
  },
  {
    dayOffset: 14,
    templateName: "snelrie-email-5",
    subjectA: "Laatste kans: 30 dagen gratis SnelRIE Premium",
    subjectB: "We missen je — 30 dagen gratis Premium als welkomstcadeau",
    description: "Win-back — 14 days, if no conversion",
  },
];

// ─── Create Nurture Event ───────────────────────────────────────────

/**
 * Create a new nurture event for a lead. Idempotent — won't create duplicate
 * for same userId + eventType combination within 30 days.
 */
export async function createNurtureEvent(
  userId: string,
  email: string,
  eventType: NurtureEventType,
  metadata?: Record<string, unknown>
): Promise<{ created: boolean; eventId?: string }> {
  // Check for existing active event of same type within 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const existing = await prisma.leadNurtureEvent.findFirst({
    where: {
      userId,
      eventType,
      triggeredAt: { gte: thirtyDaysAgo },
    },
  });

  if (existing) {
    console.log(
      `[nurture] Event ${eventType} already exists for ${email} (id: ${existing.id}), skipping`
    );
    return { created: false };
  }

  // Randomly assign A/B variant
  const abVariant = Math.random() < 0.5 ? "a" : "b";

  const event = await prisma.leadNurtureEvent.create({
    data: {
      userId,
      email,
      eventType,
      abVariant,
      metadata: (metadata || {}) as any,
      nextEmailDue: new Date(), // T+0 — due immediately
    },
  });

  console.log(
    `[nurture] Created ${eventType} event for ${email} (id: ${event.id}, variant: ${abVariant})`
  );

  // Send T+0 welcome email immediately
  await sendNurtureEmail(event.id, 0);

  return { created: true, eventId: event.id };
}

// ─── Process Due Nurture Emails ─────────────────────────────────────

/**
 * Process all due nurture emails. Call from cron endpoint.
 * Only processes during business hours (09:00-11:00 CET, Mon-Fri).
 *
 * Returns number of emails sent.
 */
export async function processNurtureEmails(
  options: { force?: boolean } = {}
): Promise<{ sent: number; skipped: number; errors: number }> {
  const now = new Date();
  const stats = { sent: 0, skipped: 0, errors: 0 };

  // Check business hours unless forced
  if (!options.force) {
    const cetHour = getCETHour(now);
    const dayOfWeek = getCETDayOfWeek(now);

    // Only Mon-Fri (1-5), 09:00-11:00 CET
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log("[nurture] Skipping — weekend");
      return stats;
    }
    if (cetHour < 9 || cetHour >= 11) {
      console.log(`[nurture] Skipping — outside business hours (CET hour: ${cetHour})`);
      return stats;
    }
  }

  // Find all active (non-suppressed, non-converted) nurture events that have a due email
  const dueEvents = await prisma.leadNurtureEvent.findMany({
    where: {
      suppressed: false,
      convertedAt: null,
      nextEmailDue: { lte: now },
    },
    take: 50, // batch limit
    orderBy: { nextEmailDue: "asc" },
  });

  console.log(`[nurture] Found ${dueEvents.length} due nurture events`);

  for (const event of dueEvents) {
    const stepIndex = event.emailsSent;

    // No more steps to send
    if (stepIndex >= NURTURE_STEPS.length) {
      // Mark as done by clearing nextEmailDue
      await prisma.leadNurtureEvent.update({
        where: { id: event.id },
        data: { nextEmailDue: null },
      });
      stats.skipped++;
      continue;
    }

    try {
      const success = await sendNurtureEmail(event.id, stepIndex);
      if (success) {
        stats.sent++;
      } else {
        stats.errors++;
      }
    } catch (err) {
      console.error(`[nurture] Error processing event ${event.id}:`, err);
      stats.errors++;
    }
  }

  console.log(
    `[nurture] Processed: ${stats.sent} sent, ${stats.skipped} skipped, ${stats.errors} errors`
  );
  return stats;
}

// ─── Send Individual Nurture Email ──────────────────────────────────

async function sendNurtureEmail(eventId: string, stepIndex: number): Promise<boolean> {
  const event = await prisma.leadNurtureEvent.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    console.error(`[nurture] Event ${eventId} not found`);
    return false;
  }

  if (event.suppressed) {
    console.log(`[nurture] Event ${eventId} is suppressed (GDPR), skipping`);
    return false;
  }

  if (event.convertedAt) {
    console.log(`[nurture] Event ${eventId} already converted, skipping`);
    return false;
  }

  if (stepIndex >= NURTURE_STEPS.length) {
    console.log(`[nurture] No more steps for event ${eventId}`);
    return false;
  }

  const step = NURTURE_STEPS[stepIndex];
  const subject = event.abVariant === "b" ? step.subjectB : step.subjectA;
  const meta = (event.metadata as Record<string, string>) || {};

  const result = await sendTemplateEmail({
    to: event.email,
    templateName: step.templateName,
    subject,
    replacements: {
      BEDRIJFSNAAM: meta.bedrijfsnaam || "",
      NAAM: meta.naam || "",
      BRANCHE: meta.branche || "",
      REPORT_URL: meta.reportUrl || "https://www.snelrie.nl/dashboard",
    },
    tags: [
      { name: "nurture_sequence", value: event.eventType },
      { name: "nurture_step", value: String(stepIndex) },
    ],
    nurtureEventId: eventId,
    abVariant: event.abVariant || undefined,
  });

  if (!result.success) {
    console.error(
      `[nurture] Failed to send step ${stepIndex} for event ${eventId}: ${result.error}`
    );
    return false;
  }

  // Calculate next email due date
  const nextStepIndex = stepIndex + 1;
  let nextEmailDue: Date | null = null;
  if (nextStepIndex < NURTURE_STEPS.length) {
    const currentDayOffset = step.dayOffset;
    const nextDayOffset = NURTURE_STEPS[nextStepIndex].dayOffset;
    const daysDiff = nextDayOffset - currentDayOffset;
    nextEmailDue = new Date(Date.now() + daysDiff * 24 * 60 * 60 * 1000);
  }

  // Update event
  await prisma.leadNurtureEvent.update({
    where: { id: eventId },
    data: {
      emailsSent: stepIndex + 1,
      lastEmailAt: new Date(),
      nextEmailDue,
    },
  });

  console.log(
    `[nurture] Sent step ${stepIndex} (${step.description}) to ${event.email}`
  );
  return true;
}

// ─── Suppress (GDPR Unsubscribe) ───────────────────────────────────

/**
 * Suppress all nurture events for an email address (GDPR unsubscribe).
 */
export async function suppressNurtureByEmail(email: string): Promise<number> {
  const result = await prisma.leadNurtureEvent.updateMany({
    where: { email, suppressed: false },
    data: { suppressed: true },
  });
  console.log(`[nurture] Suppressed ${result.count} events for ${email}`);
  return result.count;
}

/**
 * Mark a lead as converted (stops nurture sequence).
 */
export async function markNurtureConverted(userId: string): Promise<number> {
  const result = await prisma.leadNurtureEvent.updateMany({
    where: { userId, convertedAt: null },
    data: { convertedAt: new Date(), nextEmailDue: null },
  });
  console.log(`[nurture] Marked ${result.count} events as converted for userId=${userId}`);
  return result.count;
}

// ─── A/B Testing Report ────────────────────────────────────────────

/**
 * Generate A/B test performance report for nurture emails.
 */
export async function getNurtureABReport(): Promise<{
  variantA: { events: number; emailsSent: number; conversions: number };
  variantB: { events: number; emailsSent: number; conversions: number };
}> {
  const [variantA, variantB] = await Promise.all([
    prisma.leadNurtureEvent.aggregate({
      where: { abVariant: "a" },
      _count: true,
      _sum: { emailsSent: true },
    }),
    prisma.leadNurtureEvent.aggregate({
      where: { abVariant: "b" },
      _count: true,
      _sum: { emailsSent: true },
    }),
  ]);

  const [conversionsA, conversionsB] = await Promise.all([
    prisma.leadNurtureEvent.count({
      where: { abVariant: "a", convertedAt: { not: null } },
    }),
    prisma.leadNurtureEvent.count({
      where: { abVariant: "b", convertedAt: { not: null } },
    }),
  ]);

  return {
    variantA: {
      events: variantA._count,
      emailsSent: variantA._sum.emailsSent || 0,
      conversions: conversionsA,
    },
    variantB: {
      events: variantB._count,
      emailsSent: variantB._sum.emailsSent || 0,
      conversions: conversionsB,
    },
  };
}

// ─── Helpers ────────────────────────────────────────────────────────

function getCETHour(date: Date): number {
  // CET = UTC+1, CEST = UTC+2
  const utcHour = date.getUTCHours();
  const month = date.getUTCMonth(); // 0-indexed
  // Rough DST check (March last Sunday to October last Sunday)
  const isDST = month >= 2 && month <= 9; // Simplified
  return (utcHour + (isDST ? 2 : 1)) % 24;
}

function getCETDayOfWeek(date: Date): number {
  // Adjust for CET timezone
  const cetDate = new Date(date.getTime() + getCETOffset(date) * 60 * 60 * 1000);
  return cetDate.getUTCDay();
}

function getCETOffset(date: Date): number {
  const month = date.getUTCMonth();
  return month >= 2 && month <= 9 ? 2 : 1;
}
