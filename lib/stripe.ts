import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia" as any,
    });
  }
  return _stripe;
}

// ═══════════════════════════════════════════════════════
// ONE-TIME REPORT PURCHASES (existing flow, updated prices)
// ═══════════════════════════════════════════════════════
export const PRICING = {
  BASIS: {
    price: 24900, // €249
    stripePriceId: "price_1TGPSJAoeXfGFNOALSvVaTCA",
    stripeProductId: "prod_U8cdRNIzAlDFfj",
    label: "Basis RI&E",
    description: "Volledige RI&E met risico-inventarisatie",
  },
  PROFESSIONAL: {
    price: 64900, // €649
    stripePriceId: "price_1TGPSKAoeXfGFNOAY8dCefVw",
    stripeProductId: "prod_U8cdtOkLOib1t1",
    label: "Professional RI&E",
    description: "RI&E + Plan van Aanpak + prioritering",
  },
  ENTERPRISE: {
    price: 149900, // €1.499
    stripePriceId: "price_1TGPSKAoeXfGFNOAnhQbhxBg",
    stripeProductId: "prod_U8cdbts7dRSjBR",
    label: "Enterprise RI&E",
    description: "Uitgebreide RI&E + PvA + 24/7 AI Expert Chat",
  },
} as const;

// ═══════════════════════════════════════════════════════
// SUBSCRIPTION PRICING
// ═══════════════════════════════════════════════════════
export const SUBSCRIPTION_PRICING = {
  STARTER: {
    name: "Starter",
    monthly: {
      amount: 1900, // €19
      stripePriceId: "price_1TGPS8AoeXfGFNOA7ETFArEm",
      label: "€19/maand",
    },
    yearly: {
      amount: 17900, // €179
      stripePriceId: "price_1TGPS9AoeXfGFNOAFPfIFyDw",
      label: "€179/jaar",
      monthlyCost: "€15/maand",
      savings: "€49",
    },
    stripeProductId: "prod_UEtE6rH3JaXBUT",
    features: [
      "1 RI&E rapport per maand",
      "Basis risico-analyse",
      "PDF download",
      "Email support",
    ],
    limits: {
      reportsPerMonth: 1,
      locations: 1,
      teamMembers: 1,
      aiChat: false,
      branding: false,
      planVanAanpak: false,
    },
  },
  PROFESSIONAL: {
    name: "Professional",
    monthly: {
      amount: 4900, // €49
      stripePriceId: "price_1TGPS9AoeXfGFNOA7wImxFaG",
      label: "€49/maand",
    },
    yearly: {
      amount: 46900, // €469
      stripePriceId: "price_1TGPSAAoeXfGFNOAHY32tFkn",
      label: "€469/jaar",
      monthlyCost: "€39/maand",
      savings: "€119",
    },
    stripeProductId: "prod_UEtEKNy8zaVtMT",
    features: [
      "5 RI&E rapporten per maand",
      "Uitgebreide risico-analyse",
      "Plan van Aanpak",
      "Branding & huisstijl",
      "Tot 3 locaties",
      "AI chat assistent",
      "Prioriteit support",
    ],
    limits: {
      reportsPerMonth: 5,
      locations: 3,
      teamMembers: 5,
      aiChat: true,
      branding: true,
      planVanAanpak: true,
    },
  },
  ENTERPRISE: {
    name: "Enterprise",
    monthly: {
      amount: 12900, // €129
      stripePriceId: "price_1TGPSAAoeXfGFNOA2onbSdyh",
      label: "€129/maand",
    },
    yearly: {
      amount: 124900, // €1.249
      stripePriceId: "price_1TGPSBAoeXfGFNOABl13e3iO",
      label: "€1.249/jaar",
      monthlyCost: "€104/maand",
      savings: "€299",
    },
    stripeProductId: "prod_UEtEDJ8ThQUIrd",
    features: [
      "Onbeperkt rapporten",
      "Uitgebreide rapportage",
      "Plan van Aanpak + prioritering",
      "Branding & huisstijl",
      "Onbeperkt locaties",
      "AI Expert Chat (24/7)",
      "Multi-user toegang",
      "API toegang",
      "Dedicated support",
    ],
    limits: {
      reportsPerMonth: -1, // unlimited
      locations: -1,
      teamMembers: -1,
      aiChat: true,
      branding: true,
      planVanAanpak: true,
    },
  },
} as const;

export type SubscriptionTierKey = keyof typeof SUBSCRIPTION_PRICING;
export type BillingCycleKey = "MONTHLY" | "YEARLY";

/**
 * Get the Stripe price ID for a subscription tier + billing cycle
 */
export function getSubscriptionPriceId(
  tier: SubscriptionTierKey,
  cycle: BillingCycleKey
): string {
  const tierPricing = SUBSCRIPTION_PRICING[tier];
  if (!tierPricing) throw new Error(`Invalid tier: ${tier}`);
  return cycle === "YEARLY"
    ? tierPricing.yearly.stripePriceId
    : tierPricing.monthly.stripePriceId;
}
