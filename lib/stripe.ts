import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
});

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
