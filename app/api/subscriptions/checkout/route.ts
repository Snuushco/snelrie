import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, getSubscriptionPriceId, type SubscriptionTierKey, type BillingCycleKey } from "@/lib/stripe";
import { prisma } from "@/lib/db";

const VALID_TIERS: SubscriptionTierKey[] = ["STARTER", "PROFESSIONAL", "ENTERPRISE"];
const VALID_CYCLES: BillingCycleKey[] = ["MONTHLY", "YEARLY"];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = await req.json();
    const { tier, billingCycle } = body as {
      tier: SubscriptionTierKey;
      billingCycle: BillingCycleKey;
    };

    if (!VALID_TIERS.includes(tier)) {
      return NextResponse.json({ error: "Ongeldige tier" }, { status: 400 });
    }
    if (!VALID_CYCLES.includes(billingCycle)) {
      return NextResponse.json({ error: "Ongeldige billing cycle" }, { status: 400 });
    }

    const stripe = getStripe();
    const priceId = getSubscriptionPriceId(tier, billingCycle);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.snelrie.nl";

    // Find or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id,
          project: "snelrie",
        },
      });
      customerId = customer.id;
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card", "ideal"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${appUrl}/dashboard/abonnement?checkout=success`,
      cancel_url: `${appUrl}/dashboard/abonnement?checkout=cancelled`,
      subscription_data: {
        metadata: {
          userId: session.user.id,
          tier,
          billingCycle,
          project: "snelrie",
        },
      },
      metadata: {
        userId: session.user.id,
        tier,
        billingCycle,
        type: "subscription",
        project: "snelrie",
      },
    });

    // Upsert subscription record as TRIALING/pending
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        tier: tier as any,
        status: "TRIALING",
        billingCycle: billingCycle as any,
        stripeCustomerId: customerId,
      },
      update: {
        tier: tier as any,
        billingCycle: billingCycle as any,
        stripeCustomerId: customerId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json(
      { error: "Abonnement kon niet worden gestart" },
      { status: 500 }
    );
  }
}
