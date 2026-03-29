/**
 * Stripe 12-Month Commitment Enforcement for SnelRIE
 *
 * ═══════════════════════════════════════════════════════════════
 * WAAROM 12 MAANDEN MINIMALE LOOPTIJD?
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. WETTELIJKE RI&E-CYCLUS: Een RI&E moet jaarlijks worden geactualiseerd
 *    (Arbowet Art. 5 lid 4). Tegen de tijd dat je zou opzeggen, heb je de
 *    jaarlijkse update al nodig. 12 maanden = 1 volledige cyclus.
 *
 * 2. BUSINESS MODEL: De initiële RI&E-generatie kost significant meer dan
 *    de maandelijkse prijs dekt. Zonder commitment zou een klant na 1 maand
 *    opzeggen met een volledig RI&E-rapport terwijl de kosten niet gedekt zijn.
 *
 * 3. KLANTWAARDE: In 12 maanden bouwen klanten een compliance-historie op
 *    met updates, actiepunten-tracking, en een up-to-date risicoprofiel.
 *    Dit is de daadwerkelijke waarde — niet alleen het eerste rapport.
 *
 * ═══════════════════════════════════════════════════════════════
 * OPZEGREGELS:
 * - Binnen 12 maanden: opzeggen geblokkeerd
 * - Na 12 maanden: opzeggen mogelijk tot 30 dagen voor verlengdatum
 * - Na verlenging: nieuw 12-maanden commitment begint
 * - Stripe Portal: cancel-knop verborgen via Stripe Dashboard config
 * - Webhook: eventuele directe cancel-pogingen worden onderschept
 * ═══════════════════════════════════════════════════════════════
 */

import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

/** Minimum commitment period in months */
export const COMMITMENT_MONTHS = 12;

/** Required notice before renewal (in days) */
export const CANCEL_NOTICE_DAYS = 30;

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface CommitmentStatus {
  /** Does the user have an active subscription? */
  hasSubscription: boolean;
  /** Is the 12-month minimum commitment period still active? */
  withinCommitment: boolean;
  /** Date when the commitment period ends */
  commitmentEndDate: Date | null;
  /** Can the user cancel right now? */
  canCancel: boolean;
  /** If can't cancel, reason why (Dutch) */
  reason: string | null;
  /** Machine-readable reason code */
  reasonCode: CommitmentReasonCode | null;
  /** Days remaining in commitment */
  daysRemaining: number;
  /** Next renewal date */
  nextRenewalDate: Date | null;
  /** Subscription start date */
  subscriptionStartDate: Date | null;
}

export type CommitmentReasonCode =
  | "no_subscription"
  | "within_commitment"
  | "past_cancel_deadline"
  | "already_cancelling"
  | "can_cancel";

// ═══════════════════════════════════════════════════════
// DUTCH UI MESSAGE TEMPLATES
// ═══════════════════════════════════════════════════════

export const COMMITMENT_MESSAGES = {
  /** Shown when user tries to cancel within 12-month commitment */
  withinCommitment: (endDate: Date, daysRemaining: number) =>
    `Uw abonnement heeft een minimale looptijd van 12 maanden. ` +
    `U kunt opzeggen vanaf ${formatDateNL(endDate)}. ` +
    `Nog ${daysRemaining} ${daysRemaining === 1 ? "dag" : "dagen"} te gaan.`,

  /** Shown when the 30-day cancel notice period has passed */
  pastCancelDeadline: (renewalDate: Date) =>
    `De opzegtermijn van 30 dagen is verstreken. ` +
    `Uw abonnement wordt automatisch verlengd op ${formatDateNL(renewalDate)}. ` +
    `Na verlenging kunt u opnieuw opzeggen.`,

  /** Shown when cancellation is confirmed */
  cancellationConfirmed: (endDate: Date) =>
    `Uw abonnement is opgezegd. U heeft nog toegang tot ${formatDateNL(endDate)}. ` +
    `Daarna wordt uw account omgezet naar het gratis plan.`,

  /** Shown when subscription is already set to cancel */
  alreadyCancelling: (endDate: Date) =>
    `Uw abonnement wordt al beëindigd op ${formatDateNL(endDate)}.`,

  /** No subscription found */
  noSubscription: "Geen actief abonnement gevonden.",

  /** Generic error */
  error: "Er ging iets mis. Neem contact op met support via info@snelrie.nl.",

  /** Shown in the UI as commitment info */
  commitmentInfo:
    "Alle SnelRIE abonnementen hebben een minimale looptijd van 12 maanden, " +
    "passend bij de wettelijke RI&E-actualisatiecyclus. Opzeggen is mogelijk " +
    "tot 30 dagen voor de verlengdatum.",

  /** Renewal reminder */
  renewalReminder: (renewalDate: Date, tier: string) =>
    `Uw ${tier}-abonnement wordt automatisch verlengd op ${formatDateNL(renewalDate)}.`,
} as const;

// ═══════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════

/**
 * Check the commitment status for a user's subscription.
 * This is the single source of truth for whether a user can cancel.
 */
export async function getCommitmentStatus(userId: string): Promise<CommitmentStatus> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || !subscription.stripeSubscriptionId) {
    return {
      hasSubscription: false,
      withinCommitment: false,
      commitmentEndDate: null,
      canCancel: false,
      reason: COMMITMENT_MESSAGES.noSubscription,
      reasonCode: "no_subscription",
      daysRemaining: 0,
      nextRenewalDate: null,
      subscriptionStartDate: null,
    };
  }

  // Get subscription details from Stripe (authoritative source for dates)
  const stripe = getStripe();
  const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

  const startDate = new Date(stripeSub.start_date * 1000);
  const commitmentEndDate = addMonths(startDate, COMMITMENT_MONTHS);
  const now = new Date();
  const withinCommitment = now < commitmentEndDate;

  const daysRemaining = withinCommitment
    ? Math.ceil((commitmentEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const nextRenewalDate = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : null;

  // Already set to cancel at period end?
  if (stripeSub.cancel_at_period_end) {
    return {
      hasSubscription: true,
      withinCommitment,
      commitmentEndDate,
      canCancel: false,
      reason: COMMITMENT_MESSAGES.alreadyCancelling(nextRenewalDate || commitmentEndDate),
      reasonCode: "already_cancelling",
      daysRemaining,
      nextRenewalDate,
      subscriptionStartDate: startDate,
    };
  }

  // Rule 1: Within 12-month commitment → block cancel
  if (withinCommitment) {
    return {
      hasSubscription: true,
      withinCommitment: true,
      commitmentEndDate,
      canCancel: false,
      reason: COMMITMENT_MESSAGES.withinCommitment(commitmentEndDate, daysRemaining),
      reasonCode: "within_commitment",
      daysRemaining,
      nextRenewalDate,
      subscriptionStartDate: startDate,
    };
  }

  // Rule 2: Past commitment but within 30-day notice window → block cancel
  if (nextRenewalDate) {
    const cancelDeadline = new Date(nextRenewalDate);
    cancelDeadline.setDate(cancelDeadline.getDate() - CANCEL_NOTICE_DAYS);

    if (now > cancelDeadline) {
      return {
        hasSubscription: true,
        withinCommitment: false,
        commitmentEndDate,
        canCancel: false,
        reason: COMMITMENT_MESSAGES.pastCancelDeadline(nextRenewalDate),
        reasonCode: "past_cancel_deadline",
        daysRemaining: 0,
        nextRenewalDate,
        subscriptionStartDate: startDate,
      };
    }
  }

  // All checks passed → user can cancel
  return {
    hasSubscription: true,
    withinCommitment: false,
    commitmentEndDate,
    canCancel: true,
    reason: null,
    reasonCode: "can_cancel",
    daysRemaining: 0,
    nextRenewalDate,
    subscriptionStartDate: startDate,
  };
}

/**
 * Attempt to cancel a subscription, enforcing commitment rules.
 *
 * On success: sets cancel_at_period_end in Stripe (subscription stays active
 * until period end, then Stripe fires customer.subscription.deleted).
 */
export async function cancelSubscription(userId: string): Promise<{
  success: boolean;
  message: string;
  reasonCode?: CommitmentReasonCode;
}> {
  const status = await getCommitmentStatus(userId);

  if (!status.canCancel) {
    return {
      success: false,
      message: status.reason || COMMITMENT_MESSAGES.error,
      reasonCode: status.reasonCode || undefined,
    };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeSubscriptionId) {
    return {
      success: false,
      message: COMMITMENT_MESSAGES.noSubscription,
      reasonCode: "no_subscription",
    };
  }

  const stripe = getStripe();

  // Set cancel_at_period_end in Stripe. This keeps the subscription ACTIVE
  // until the current billing period ends, then Stripe automatically cancels.
  // The customer.subscription.deleted webhook will then update our DB.
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
    metadata: {
      cancellation_requested: new Date().toISOString(),
      cancellation_reason: "user_requested",
    },
  });

  // Update local DB: keep status ACTIVE but flag cancelAtPeriodEnd.
  // Status changes to CANCELLED only when Stripe fires the deleted event.
  await prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: true,
      // DO NOT set status to CANCELLED here — subscription is still active
      // until period end. The webhook handler will set CANCELLED.
    },
  });

  const endDate = status.nextRenewalDate || status.commitmentEndDate;
  return {
    success: true,
    message: endDate
      ? COMMITMENT_MESSAGES.cancellationConfirmed(endDate)
      : "Uw abonnement is opgezegd.",
    reasonCode: "can_cancel",
  };
}

/**
 * Enforce commitment on a Stripe subscription update event.
 * Called from the webhook handler when customer.subscription.updated fires.
 *
 * If someone tries to cancel via Stripe Dashboard/API directly (bypassing
 * our cancel endpoint), this will REVERT the cancellation if within commitment.
 */
export async function enforceCommitmentOnUpdate(stripeSubscription: any): Promise<{
  enforced: boolean;
  action: string;
}> {
  // Only intervene if cancel_at_period_end was just set to true
  if (!stripeSubscription.cancel_at_period_end) {
    return { enforced: false, action: "none" };
  }

  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!sub) {
    return { enforced: false, action: "subscription_not_found" };
  }

  const startDate = new Date(stripeSubscription.start_date * 1000);
  const commitmentEndDate = addMonths(startDate, COMMITMENT_MONTHS);
  const now = new Date();

  // If within commitment period and cancel was NOT requested through our endpoint
  if (now < commitmentEndDate) {
    // Check metadata to see if cancellation came from our endpoint
    const cancelledViaOurEndpoint =
      stripeSubscription.metadata?.cancellation_reason === "user_requested" &&
      stripeSubscription.metadata?.cancellation_requested;

    if (!cancelledViaOurEndpoint) {
      // REVERT: someone tried to cancel via Stripe Dashboard/API
      const stripe = getStripe();
      await stripe.subscriptions.update(stripeSubscription.id, {
        cancel_at_period_end: false,
        metadata: {
          commitment_enforced: new Date().toISOString(),
          commitment_end: commitmentEndDate.toISOString(),
        },
      });

      // Ensure our DB reflects the revert
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { cancelAtPeriodEnd: false },
      });

      console.log(
        `[commitment] REVERTED unauthorized cancel for user ${sub.userId}. ` +
        `Commitment ends ${commitmentEndDate.toISOString()}`
      );

      return { enforced: true, action: "cancel_reverted" };
    }
  }

  return { enforced: false, action: "none" };
}

// ═══════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════

/** Format a date in Dutch locale */
function formatDateNL(date: Date): string {
  return date.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Add months to a date (handles edge cases like Jan 31 + 1 month) */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Pure/testable version of commitment check (no DB/Stripe calls).
 * Used in unit tests.
 */
export function checkCommitmentPure(params: {
  subscriptionStartDate: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  now?: Date;
}): {
  withinCommitment: boolean;
  canCancel: boolean;
  reasonCode: CommitmentReasonCode;
  daysRemaining: number;
  commitmentEndDate: Date;
} {
  const now = params.now || new Date();
  const commitmentEndDate = addMonths(params.subscriptionStartDate, COMMITMENT_MONTHS);
  const withinCommitment = now < commitmentEndDate;

  const daysRemaining = withinCommitment
    ? Math.ceil((commitmentEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (params.cancelAtPeriodEnd) {
    return {
      withinCommitment,
      canCancel: false,
      reasonCode: "already_cancelling",
      daysRemaining,
      commitmentEndDate,
    };
  }

  if (withinCommitment) {
    return {
      withinCommitment: true,
      canCancel: false,
      reasonCode: "within_commitment",
      daysRemaining,
      commitmentEndDate,
    };
  }

  const cancelDeadline = new Date(params.currentPeriodEnd);
  cancelDeadline.setDate(cancelDeadline.getDate() - CANCEL_NOTICE_DAYS);

  if (now > cancelDeadline) {
    return {
      withinCommitment: false,
      canCancel: false,
      reasonCode: "past_cancel_deadline",
      daysRemaining: 0,
      commitmentEndDate,
    };
  }

  return {
    withinCommitment: false,
    canCancel: true,
    reasonCode: "can_cancel",
    daysRemaining: 0,
    commitmentEndDate,
  };
}
