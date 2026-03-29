/**
 * Stripe 12-Month Commitment Enforcement
 *
 * Alle SnelRIE abonnementen hebben een minimale looptijd van 12 maanden.
 * Dit matcht de wettelijke RI&E-cyclus: tegen de tijd dat je zou opzeggen,
 * heb je de update al nodig. Na 12 maanden automatische verlenging.
 *
 * Opzeggen: alleen mogelijk tot 30 dagen voor verlengdatum, na minimale looptijd.
 */

import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const COMMITMENT_MONTHS = 12;
export const CANCEL_NOTICE_DAYS = 30;

export interface CommitmentStatus {
  /** Is the 12-month minimum commitment period still active? */
  withinCommitment: boolean;
  /** Date when the commitment period ends */
  commitmentEndDate: Date | null;
  /** Can the user cancel right now? */
  canCancel: boolean;
  /** If can't cancel, reason why */
  reason: string | null;
  /** Days remaining in commitment */
  daysRemaining: number;
  /** Next renewal date */
  nextRenewalDate: Date | null;
}

/**
 * Check if a subscription is within its 12-month commitment period
 */
export async function getCommitmentStatus(userId: string): Promise<CommitmentStatus> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || !subscription.stripeSubscriptionId) {
    return {
      withinCommitment: false,
      commitmentEndDate: null,
      canCancel: false,
      reason: "Geen actief abonnement gevonden",
      daysRemaining: 0,
      nextRenewalDate: null,
    };
  }

  // Get subscription start date from Stripe
  const stripe = getStripe();
  const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
  
  const startDate = new Date(stripeSub.start_date * 1000);
  const commitmentEndDate = new Date(startDate);
  commitmentEndDate.setMonth(commitmentEndDate.getMonth() + COMMITMENT_MONTHS);

  const now = new Date();
  const withinCommitment = now < commitmentEndDate;
  
  // Calculate days remaining in commitment
  const daysRemaining = withinCommitment
    ? Math.ceil((commitmentEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Next renewal date (current_period_end from Stripe)
  const nextRenewalDate = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : null;

  // Can cancel? Only if commitment period has passed
  // AND at least 30 days before next renewal
  let canCancel = false;
  let reason: string | null = null;

  if (withinCommitment) {
    canCancel = false;
    reason = `Uw abonnement heeft een minimale looptijd van 12 maanden. U kunt opzeggen vanaf ${commitmentEndDate.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}.`;
  } else if (nextRenewalDate) {
    const cancelDeadline = new Date(nextRenewalDate);
    cancelDeadline.setDate(cancelDeadline.getDate() - CANCEL_NOTICE_DAYS);
    
    if (now > cancelDeadline) {
      canCancel = false;
      reason = `De opzegtermijn van 30 dagen is verstreken. Uw abonnement wordt verlengd op ${nextRenewalDate.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}. U kunt opzeggen na de verlenging.`;
    } else {
      canCancel = true;
      reason = null;
    }
  }

  return {
    withinCommitment,
    commitmentEndDate,
    canCancel,
    reason,
    daysRemaining,
    nextRenewalDate,
  };
}

/**
 * Attempt to cancel a subscription. Returns success or error with reason.
 */
export async function cancelSubscription(userId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const status = await getCommitmentStatus(userId);

  if (!status.canCancel) {
    return {
      success: false,
      message: status.reason || "U kunt uw abonnement op dit moment niet opzeggen.",
    };
  }

  // Proceed with cancellation: cancel at period end (not immediately)
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeSubscriptionId) {
    return {
      success: false,
      message: "Geen actief abonnement gevonden.",
    };
  }

  const stripe = getStripe();
  
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
    metadata: {
      cancellation_requested: new Date().toISOString(),
      cancellation_reason: "user_requested",
    },
  });

  // Update local DB
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: "CANCELLED",
    },
  });

  return {
    success: true,
    message: `Uw abonnement is opgezegd en loopt door tot het einde van de huidige periode (${status.nextRenewalDate?.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}).`,
  };
}
