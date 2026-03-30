import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getEffectiveTier,
  getFeatureAccess,
  getRemainingReports,
  checkSubscriptionTier,
} from "@/lib/stripe-client";
import type { SubscriptionTierKey } from "@/lib/stripe";

const UPGRADE_URL = "/pricing";

/**
 * Create a 403 gate response with Dutch message and upgrade URL
 */
export function gateResponse(message: string, extra?: Record<string, unknown>) {
  console.log(`[Gate] Denied: ${message}`);
  return NextResponse.json(
    {
      error: message,
      upgradeUrl: UPGRADE_URL,
      gated: true,
      ...extra,
    },
    { status: 403 }
  );
}

/**
 * Check if the current user meets the required tier.
 * Returns null if access granted, or a NextResponse with 403 if denied.
 */
export async function requireTier(
  userId: string,
  requiredTier: SubscriptionTierKey
): Promise<NextResponse | null> {
  const hasAccess = await checkSubscriptionTier(userId, requiredTier);
  if (hasAccess) return null;

  const currentTier = await getEffectiveTier(userId);
  const tierNames: Record<SubscriptionTierKey, string> = {
    STARTER: "Starter",
    PROFESSIONAL: "Professional",
    ENTERPRISE: "Enterprise",
  };

  return gateResponse(
    `Deze functie is beschikbaar vanaf het ${tierNames[requiredTier]} abonnement. U heeft momenteel het ${tierNames[currentTier]} abonnement.`,
    { currentTier, requiredTier }
  );
}

/**
 * Check if user can generate more reports this month.
 * Returns null if allowed, or a NextResponse with 403 if limit reached.
 */
export async function requireReportQuota(
  userId: string
): Promise<NextResponse | null> {
  const { remaining, limit, unlimited } = await getRemainingReports(userId);

  if (unlimited || remaining > 0) return null;

  console.log(`[Gate] Report limit reached for user ${userId}: ${remaining}/${limit}`);
  return gateResponse(
    "U heeft uw maandelijkse limiet bereikt. Upgrade naar Professional voor meer rapporten.",
    { remaining: 0, limit, unlimited: false }
  );
}

/**
 * Check if user has access to AI Chat.
 * Returns null if allowed, or a NextResponse with 403 if denied.
 */
export async function requireAiChat(
  userId: string
): Promise<NextResponse | null> {
  const tier = await getEffectiveTier(userId);
  const access = getFeatureAccess(tier);

  if (!access.aiChat) {
    console.log(`[Gate] AI Chat denied for user ${userId} (tier: ${tier})`);
    return gateResponse(
      "AI Chat is beschikbaar vanaf het Professional abonnement.",
      { currentTier: tier }
    );
  }

  return null;
}

/**
 * Check if user has access to branding features.
 * Returns null if allowed, or a NextResponse with 403 if denied.
 */
export async function requireBranding(
  userId: string
): Promise<NextResponse | null> {
  const tier = await getEffectiveTier(userId);
  const access = getFeatureAccess(tier);

  if (!access.branding) {
    console.log(`[Gate] Branding denied for user ${userId} (tier: ${tier})`);
    return gateResponse(
      "Branding is beschikbaar vanaf het Professional abonnement. Upgrade om uw huisstijl toe te voegen aan rapporten.",
      { currentTier: tier }
    );
  }

  return null;
}

/**
 * Check if user has access to Plan van Aanpak.
 * Returns null if allowed, or a NextResponse with 403 if denied.
 */
export async function requirePlanVanAanpak(
  userId: string
): Promise<NextResponse | null> {
  const tier = await getEffectiveTier(userId);
  const access = getFeatureAccess(tier);

  if (!access.planVanAanpak) {
    console.log(`[Gate] Plan van Aanpak denied for user ${userId} (tier: ${tier})`);
    return gateResponse(
      "Het Plan van Aanpak is beschikbaar vanaf het Professional abonnement.",
      { currentTier: tier }
    );
  }

  return null;
}

/**
 * Get the authenticated user's ID from the session.
 * Returns [userId, null] on success, or [null, NextResponse] on failure.
 */
export async function getAuthenticatedUserId(): Promise<
  [string, null] | [null, NextResponse]
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [
      null,
      NextResponse.json(
        { error: "Niet ingelogd. Log in om verder te gaan." },
        { status: 401 }
      ),
    ];
  }
  return [session.user.id, null];
}
