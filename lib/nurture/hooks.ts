/**
 * lib/nurture/hooks.ts — Lead nurture event hooks (hb-041)
 *
 * Call these from existing flows to trigger nurture sequences:
 * - onLeadSignup: When a new lead signs up / completes free scan
 * - onDemoRequest: When a lead requests a demo
 * - onPricingAbandon: When a lead visits pricing without converting
 * - onTrialExpiry: When a trial period expires
 * - onConversion: When a lead converts to paid (stops nurture)
 */

import { createNurtureEvent, markNurtureConverted } from "./scheduler";

/**
 * Hook: New lead signs up or completes a free scan.
 * Triggers the full 5-step nurture sequence.
 */
export async function onLeadSignup(
  userId: string,
  email: string,
  metadata?: {
    bedrijfsnaam?: string;
    branche?: string;
    naam?: string;
    reportUrl?: string;
    risksFound?: number;
  }
) {
  return createNurtureEvent(userId, email, "SIGNUP", metadata);
}

/**
 * Hook: Lead requests a demo.
 */
export async function onDemoRequest(
  userId: string,
  email: string,
  metadata?: { bedrijfsnaam?: string; naam?: string }
) {
  return createNurtureEvent(userId, email, "DEMO_REQUEST", metadata);
}

/**
 * Hook: Lead visits pricing page without converting (abandonment).
 * Only trigger if they've been on pricing for >30s or visited 2+ times.
 */
export async function onPricingAbandon(
  userId: string,
  email: string,
  metadata?: { pricingPageVisits?: number; timeOnPage?: number }
) {
  return createNurtureEvent(userId, email, "PRICING_ABANDON", metadata);
}

/**
 * Hook: Trial period expires without conversion.
 */
export async function onTrialExpiry(
  userId: string,
  email: string,
  metadata?: { trialDays?: number; tier?: string }
) {
  return createNurtureEvent(userId, email, "TRIAL_EXPIRY", metadata);
}

/**
 * Hook: Lead converts to paid subscription.
 * Stops all active nurture sequences for this user.
 */
export async function onConversion(userId: string) {
  return markNurtureConverted(userId);
}
