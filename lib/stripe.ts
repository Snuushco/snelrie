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
    label: "Basis RI&E",
    description: "Volledige RI&E met risico-inventarisatie",
  },
  PROFESSIONAL: {
    price: 29900,
    label: "Professional RI&E",
    description: "RI&E + Plan van Aanpak + prioritering",
  },
  ENTERPRISE: {
    price: 49900,
    label: "Enterprise RI&E",
    description: "Uitgebreide RI&E + PvA + prioritair support",
  },
} as const;
