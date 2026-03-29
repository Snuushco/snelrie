import { prisma } from "@/lib/db";
import { SUBSCRIPTION_PRICING, type SubscriptionTierKey } from "@/lib/stripe";

const TIER_HIERARCHY: SubscriptionTierKey[] = [
  "STARTER",
  "PROFESSIONAL",
  "ENTERPRISE",
];

export interface FeatureAccess {
  reportsPerMonth: number; // -1 = unlimited
  locations: number;
  teamMembers: number;
  aiChat: boolean;
  branding: boolean;
  planVanAanpak: boolean;
  tier: SubscriptionTierKey;
}

/**
 * Get a user's active subscription
 */
export async function getUserSubscription(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
  });
}

/**
 * Check if user's subscription tier >= required tier
 */
export async function checkSubscriptionTier(
  userId: string,
  requiredTier: SubscriptionTierKey
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  // No subscription = STARTER level (free tier)
  const currentTier: SubscriptionTierKey =
    subscription?.status === "ACTIVE" || subscription?.status === "TRIALING"
      ? (subscription.tier as SubscriptionTierKey)
      : "STARTER";

  const currentIndex = TIER_HIERARCHY.indexOf(currentTier);
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);

  return currentIndex >= requiredIndex;
}

/**
 * Get feature access for a given tier
 */
export function getFeatureAccess(
  tier: SubscriptionTierKey = "STARTER"
): FeatureAccess {
  const pricing = SUBSCRIPTION_PRICING[tier];
  if (!pricing) {
    return { ...SUBSCRIPTION_PRICING.STARTER.limits, tier: "STARTER" };
  }
  return { ...pricing.limits, tier };
}

/**
 * Get the effective tier for a user (considering subscription status)
 */
export async function getEffectiveTier(
  userId: string
): Promise<SubscriptionTierKey> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) return "STARTER";

  // Active or trialing subscriptions grant their tier
  if (
    subscription.status === "ACTIVE" ||
    subscription.status === "TRIALING"
  ) {
    return subscription.tier as SubscriptionTierKey;
  }

  // Past due: still grant access but should show warning
  if (subscription.status === "PAST_DUE") {
    return subscription.tier as SubscriptionTierKey;
  }

  // Cancelled: check if still within period
  if (
    subscription.status === "CANCELLED" &&
    subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd) > new Date()
  ) {
    return subscription.tier as SubscriptionTierKey;
  }

  return "STARTER";
}

/**
 * Check how many reports a user can still create this month
 */
export async function getRemainingReports(
  userId: string
): Promise<{ remaining: number; limit: number; unlimited: boolean }> {
  const tier = await getEffectiveTier(userId);
  const access = getFeatureAccess(tier);

  if (access.reportsPerMonth === -1) {
    return { remaining: -1, limit: -1, unlimited: true };
  }

  // Count reports created this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const reportsThisMonth = await prisma.rieReport.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
  });

  const remaining = Math.max(0, access.reportsPerMonth - reportsThisMonth);
  return {
    remaining,
    limit: access.reportsPerMonth,
    unlimited: false,
  };
}
