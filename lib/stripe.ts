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

export const PRICING = {
  BASIS: {
    price: 9900, // cents
    stripePriceId: "price_1TALOHAoeXfGFNOAH7IwXWv6",
    stripeProductId: "prod_U8cdRNIzAlDFfj",
    label: "Basis RI&E",
    description: "Volledige RI&E met risico-inventarisatie",
  },
  PROFESSIONAL: {
    price: 24900,
    stripePriceId: "price_1TALOIAoeXfGFNOA0xBOVAOY",
    stripeProductId: "prod_U8cdtOkLOib1t1",
    label: "Professional RI&E",
    description: "RI&E + Plan van Aanpak + prioritering",
  },
  ENTERPRISE: {
    price: 49900,
    stripePriceId: "price_1TALOJAoeXfGFNOASkFbslmI",
    stripeProductId: "prod_U8cdbts7dRSjBR",
    label: "Enterprise RI&E",
    description: "Uitgebreide RI&E + PvA + 24/7 AI Expert Chat",
  },
} as const;
