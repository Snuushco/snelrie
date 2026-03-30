/**
 * Drip Engine — schedules and sends email drip sequences via Resend.
 *
 * Usage:
 *   await triggerDripSequence("FREE_SCAN_COMPLETED", userId, email, metadata)
 *   await processDueEmails()  // call from cron
 */

import { prisma } from "@/lib/db";
import { resend, EMAIL_FROM, EMAIL_REPLY_TO } from "@/lib/resend";
import { DripSequenceType } from "@prisma/client";
import {
  freeScanDay0,
  freeScanDay2,
  freeScanDay5,
  freeScanDay10,
  accountCreatedDay1,
  accountCreatedDay3,
  accountCreatedDay7,
  subscriptionDay0,
  subscriptionDay7,
  subscriptionDay30,
} from "@/lib/email-templates";

// ─── Sequence Definitions ────────────────────────────────────────────

interface SequenceStep {
  dayOffset: number;
  subject: string;
  getEmail: (meta: Record<string, unknown>) => {
    subject: string;
    html: string;
    text: string;
  };
}

const SEQUENCES: Record<DripSequenceType, SequenceStep[]> = {
  FREE_SCAN_COMPLETED: [
    {
      dayOffset: 0,
      subject: "Uw gratis RI&E scan resultaten",
      getEmail: (meta) => freeScanDay0(meta as { reportUrl?: string; risksFound?: number; bedrijfsnaam?: string }),
    },
    {
      dayOffset: 2,
      subject: "Wist u dat 60% van de bedrijven geen actuele RI&E heeft?",
      getEmail: () => freeScanDay2(),
    },
    {
      dayOffset: 5,
      subject: "Uw RI&E verloopt — voorkom boetes tot €4.500",
      getEmail: () => freeScanDay5(),
    },
    {
      dayOffset: 10,
      subject: "Laatste kans: 20% korting op uw eerste jaarabonnement",
      getEmail: () => freeScanDay10(),
    },
  ],
  ACCOUNT_CREATED: [
    {
      dayOffset: 1,
      subject: "Welkom bij SnelRIE — zo haalt u het meeste uit uw account",
      getEmail: (meta) => accountCreatedDay1(meta as { naam?: string }),
    },
    {
      dayOffset: 3,
      subject: "3 redenen waarom een RI&E-abonnement slimmer is dan eenmalig",
      getEmail: () => accountCreatedDay3(),
    },
    {
      dayOffset: 7,
      subject: "Uw branche in de spotlight: de 5 grootste risico's",
      getEmail: (meta) => accountCreatedDay7(meta as { branche?: string }),
    },
  ],
  SUBSCRIPTION_ACTIVE: [
    {
      dayOffset: 0,
      subject: "Welkom! Zo maakt u uw eerste RI&E rapport",
      getEmail: (meta) => subscriptionDay0(meta as { naam?: string; tier?: string }),
    },
    {
      dayOffset: 7,
      subject: "Tip: gebruik de Plan van Aanpak generator",
      getEmail: () => subscriptionDay7(),
    },
    {
      dayOffset: 30,
      subject: "Uw eerste maand — heeft u al uw rapport geüpdatet?",
      getEmail: (meta) => subscriptionDay30(meta as { reportsCount?: number }),
    },
  ],
};

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Start a drip sequence for a user. Idempotent — if sequence already exists
 * for this user, it won't create a duplicate.
 */
export async function triggerDripSequence(
  sequence: DripSequenceType,
  userId: string,
  email: string,
  metadata?: Record<string, unknown>
): Promise<{ created: boolean; dripId?: string }> {
  // Check for existing active drip of same type
  const existing = await prisma.emailDrip.findUnique({
    where: { userId_sequence: { userId, sequence } },
  });

  if (existing && existing.status === "ACTIVE") {
    console.log(`[drip] Sequence ${sequence} already active for ${email}, skipping`);
    return { created: false };
  }

  // If previous drip exists but is not active, delete it to allow re-creation
  if (existing) {
    await prisma.emailDrip.delete({ where: { id: existing.id } });
  }

  const steps = SEQUENCES[sequence];
  if (!steps || steps.length === 0) {
    console.error(`[drip] Unknown sequence: ${sequence}`);
    return { created: false };
  }

  const now = new Date();

  const drip = await prisma.emailDrip.create({
    data: {
      userId,
      email,
      sequence,
      metadata: (metadata || {}) as any,
      steps: {
        create: steps.map((step, index) => ({
          step: index,
          subject: step.subject,
          scheduledAt: new Date(now.getTime() + step.dayOffset * 24 * 60 * 60 * 1000),
          status: "scheduled",
        })),
      },
    },
  });

  console.log(`[drip] Created ${sequence} for ${email} with ${steps.length} steps`);

  // If first step is day 0, send immediately
  if (steps[0].dayOffset === 0) {
    await sendDripStep(drip.id, 0, email, sequence, metadata || {});
  }

  return { created: true, dripId: drip.id };
}

/**
 * Cancel an active drip sequence for a user.
 */
export async function cancelDripSequence(
  userId: string,
  sequence: DripSequenceType
): Promise<boolean> {
  const drip = await prisma.emailDrip.findUnique({
    where: { userId_sequence: { userId, sequence } },
  });

  if (!drip || drip.status !== "ACTIVE") return false;

  await prisma.emailDrip.update({
    where: { id: drip.id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  console.log(`[drip] Cancelled ${sequence} for userId=${userId}`);
  return true;
}

/**
 * Cancel all active drips for a user (e.g., when they unsubscribe from emails).
 */
export async function cancelAllDrips(userId: string): Promise<number> {
  const result = await prisma.emailDrip.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "UNSUBSCRIBED", cancelledAt: new Date() },
  });
  return result.count;
}

/**
 * Process all due email drip steps. Call this from a cron endpoint.
 * Returns the number of emails sent.
 */
export async function processDueEmails(): Promise<number> {
  const now = new Date();

  // Find all scheduled steps that are due and belong to active drips
  const dueSteps = await prisma.emailDripStep.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
      drip: { status: "ACTIVE" },
    },
    include: { drip: true },
    orderBy: { scheduledAt: "asc" },
    take: 50, // batch limit to avoid timeout
  });

  let sent = 0;

  for (const step of dueSteps) {
    try {
      await sendDripStep(
        step.dripId,
        step.step,
        step.drip.email,
        step.drip.sequence,
        (step.drip.metadata as Record<string, unknown>) || {}
      );
      sent++;
    } catch (error) {
      console.error(`[drip] Failed to send step ${step.step} for drip ${step.dripId}:`, error);
      await prisma.emailDripStep.update({
        where: { id: step.id },
        data: { status: "failed" },
      });
    }
  }

  console.log(`[drip] Processed ${sent}/${dueSteps.length} due emails`);
  return sent;
}

// ─── Internal ────────────────────────────────────────────────────────

async function sendDripStep(
  dripId: string,
  stepIndex: number,
  email: string,
  sequence: DripSequenceType,
  metadata: Record<string, unknown>
): Promise<void> {
  const sequenceDef = SEQUENCES[sequence];
  if (!sequenceDef || !sequenceDef[stepIndex]) {
    throw new Error(`Invalid step ${stepIndex} for sequence ${sequence}`);
  }

  const stepDef = sequenceDef[stepIndex];
  const emailContent = stepDef.getEmail(metadata);

  // Replace template variables
  const unsubscribeUrl = `https://www.snelrie.nl/api/email/unsubscribe?email=${encodeURIComponent(email)}&drip=${dripId}`;
  const html = emailContent.html
    .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl)
    .replace(/\{\{REPORT_URL\}\}/g, (metadata.reportUrl as string) || "https://www.snelrie.nl/dashboard");

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to: [email],
    subject: emailContent.subject,
    html,
    text: emailContent.text,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    tags: [
      { name: "sequence", value: sequence },
      { name: "step", value: String(stepIndex) },
      { name: "drip_id", value: dripId },
    ],
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  // Update step as sent
  await prisma.emailDripStep.update({
    where: { dripId_step: { dripId, step: stepIndex } },
    data: {
      status: "sent",
      sentAt: new Date(),
      messageId: data?.id || null,
    },
  });

  // Update drip progress
  const totalSteps = sequenceDef.length;
  if (stepIndex >= totalSteps - 1) {
    // Last step sent — mark drip as completed
    await prisma.emailDrip.update({
      where: { id: dripId },
      data: { currentStep: stepIndex, status: "COMPLETED", completedAt: new Date() },
    });
  } else {
    await prisma.emailDrip.update({
      where: { id: dripId },
      data: { currentStep: stepIndex },
    });
  }

  console.log(`[drip] Sent ${sequence} step ${stepIndex} to ${email} (messageId: ${data?.id})`);
}
