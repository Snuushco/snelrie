import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRICING, SUBSCRIPTION_PRICING } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { checkoutSchema, validationErrorResponse } from "@/lib/validate";

// Map tier names from scan result to subscription pricing
const TIER_MAP: Record<string, { subKey: keyof typeof SUBSCRIPTION_PRICING; mode: "subscription" } | { oneTimeKey: keyof typeof PRICING; mode: "payment" }> = {
  STARTER: { subKey: "STARTER", mode: "subscription" },
  PROFESSIONAL: { subKey: "PROFESSIONAL", mode: "subscription" },
  ENTERPRISE: { subKey: "ENTERPRISE", mode: "subscription" },
  // Legacy one-time tiers (keep for backward compatibility)
  BASIS: { oneTimeKey: "BASIS", mode: "payment" },
};

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = getClientIp(req);
  const rl = checkRateLimit(RATE_LIMITS.checkout, ip);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter);

  try {
    const body = await req.json();

    // Validate input
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { reportId, tier } = parsed.data;

    const tierConfig = TIER_MAP[tier];
    if (!tierConfig) {
      return NextResponse.json({ error: "Ongeldige tier" }, { status: 400 });
    }

    const report = await prisma.rieReport.findUnique({
      where: { id: reportId },
      include: { user: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Rapport niet gevonden" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.snelrie.nl";

    let session;
    let amount: number;

    if (tierConfig.mode === "subscription") {
      // Subscription checkout (monthly)
      const subPricing = SUBSCRIPTION_PRICING[tierConfig.subKey as keyof typeof SUBSCRIPTION_PRICING];
      amount = subPricing.monthly.amount;

      session = await getStripe().checkout.sessions.create({
        payment_method_types: ["card", "ideal"],
        line_items: [
          {
            price: subPricing.monthly.stripePriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${appUrl}/scan/resultaat/${reportId}?betaald=true`,
        cancel_url: `${appUrl}/scan/resultaat/${reportId}`,
        customer_email: report.user.email,
        metadata: {
          reportId,
          tier,
          project: "snelrie",
        },
      });
    } else {
      // One-time payment (legacy)
      const pricing = PRICING[tierConfig.oneTimeKey as keyof typeof PRICING];
      amount = pricing.price;

      session = await getStripe().checkout.sessions.create({
        payment_method_types: ["card", "ideal"],
        line_items: [
          {
            price: pricing.stripePriceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${appUrl}/scan/resultaat/${reportId}?betaald=true`,
        cancel_url: `${appUrl}/scan/resultaat/${reportId}`,
        customer_email: report.user.email,
        metadata: {
          reportId,
          tier,
          project: "snelrie",
        },
      });
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        stripeSessionId: session.id,
        amount,
        tier: tier as any,
        email: report.user.email,
        reportId,
        status: "PENDING",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Betaling kon niet worden gestart" },
      { status: 500 }
    );
  }
}
