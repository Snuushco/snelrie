import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { generateRie } from "@/lib/ai/pipeline";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ═══════════════════════════════════════════
      // CHECKOUT COMPLETED (both one-time + subscription)
      // ═══════════════════════════════════════════
      case "checkout.session.completed": {
        const session = event.data.object as any;

        if (session.mode === "subscription") {
          // Subscription checkout completed
          await handleSubscriptionCheckout(session);
        } else {
          // One-time payment (existing flow)
          await handleOneTimePayment(session);
        }
        break;
      }

      // ═══════════════════════════════════════════
      // SUBSCRIPTION EVENTS
      // ═══════════════════════════════════════════
      case "invoice.payment_succeeded": {
        await handleInvoicePaymentSucceeded(event.data.object as any);
        break;
      }

      case "invoice.payment_failed": {
        await handleInvoicePaymentFailed(event.data.object as any);
        break;
      }

      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(event.data.object as any);
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object as any);
        break;
      }

      // ═══════════════════════════════════════════
      // EXISTING ONE-TIME PAYMENT EVENTS
      // ═══════════════════════════════════════════
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as any;
        await prisma.payment.updateMany({
          where: { stripePaymentIntent: paymentIntent.id },
          data: { status: "FAILED" },
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as any;
        const payments = await prisma.payment.findMany({
          where: { stripePaymentIntent: charge.payment_intent },
        });
        for (const payment of payments) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "REFUNDED" },
          });
          if (payment.reportId) {
            await prisma.rieReport.update({
              where: { id: payment.reportId },
              data: { tier: "GRATIS" },
            });
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as any;
        await prisma.payment.updateMany({
          where: { stripeSessionId: session.id },
          data: { status: "EXPIRED" },
        });
        break;
      }
    }
  } catch (error) {
    console.error(`Error handling webhook ${event.type}:`, error);
    // Still return 200 to prevent Stripe retries for unrecoverable errors
  }

  return NextResponse.json({ received: true });
}

// ═══════════════════════════════════════════════════════
// HANDLER FUNCTIONS
// ═══════════════════════════════════════════════════════

async function handleSubscriptionCheckout(session: any) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("[webhook] No userId in subscription checkout metadata");
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  const tier = session.metadata?.tier || "STARTER";
  const billingCycle = session.metadata?.billingCycle || "MONTHLY";

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      tier: tier as any,
      status: "ACTIVE",
      billingCycle: billingCycle as any,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    },
    update: {
      tier: tier as any,
      status: "ACTIVE",
      billingCycle: billingCycle as any,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: false,
    },
  });

  console.log(`[webhook] Subscription activated: ${tier} ${billingCycle} for user ${userId}`);
}

async function handleOneTimePayment(session: any) {
  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        stripePaymentIntent: session.payment_intent,
      },
    });

    if (payment.reportId) {
      const currentReport = await prisma.rieReport.findUnique({
        where: { id: payment.reportId },
        select: { tier: true },
      });

      await prisma.rieReport.update({
        where: { id: payment.reportId },
        data: {
          tier: payment.tier,
          pdfGenerated: false,
        },
      });

      if (currentReport && currentReport.tier !== payment.tier) {
        console.log(`[webhook] Tier upgrade ${currentReport.tier} → ${payment.tier} for report ${payment.reportId}`);
        generateRie(payment.reportId).catch((err) => {
          console.error(`[webhook] Regeneration failed for report ${payment.reportId}:`, err);
        });
      }
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  if (!invoice.subscription) return;

  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription },
  });

  if (sub) {
    // Get subscription details for period end
    const stripe = getStripe();
    const stripeSub = await stripe.subscriptions.retrieve(invoice.subscription);

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "ACTIVE",
        currentPeriodStart: new Date((stripeSub as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSub as any).current_period_end * 1000),
      },
    });

    console.log(`[webhook] Invoice paid, subscription extended for user ${sub.userId}`);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  if (!invoice.subscription) return;

  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "PAST_DUE" },
    });

    console.log(`[webhook] Payment failed for user ${sub.userId}, status → PAST_DUE`);
    // TODO: Send email notification about failed payment
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (sub) {
    const updateData: any = {
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };

    // Map subscription status
    if (subscription.status === "active") updateData.status = "ACTIVE";
    else if (subscription.status === "past_due") updateData.status = "PAST_DUE";
    else if (subscription.status === "canceled") updateData.status = "CANCELLED";
    else if (subscription.status === "trialing") updateData.status = "TRIALING";

    // Check if price changed (tier/cycle change)
    if (subscription.items?.data?.[0]?.price?.id) {
      const newPriceId = subscription.items.data[0].price.id;
      const { SUBSCRIPTION_PRICING } = await import("@/lib/stripe");

      for (const [tier, config] of Object.entries(SUBSCRIPTION_PRICING)) {
        if (config.monthly.stripePriceId === newPriceId) {
          updateData.tier = tier;
          updateData.billingCycle = "MONTHLY";
          break;
        }
        if (config.yearly.stripePriceId === newPriceId) {
          updateData.tier = tier;
          updateData.billingCycle = "YEARLY";
          break;
        }
      }
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: updateData,
    });

    console.log(`[webhook] Subscription updated for user ${sub.userId}:`, updateData);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "CANCELLED",
        cancelAtPeriodEnd: false,
      },
    });

    console.log(`[webhook] Subscription cancelled for user ${sub.userId}`);
  }
}
