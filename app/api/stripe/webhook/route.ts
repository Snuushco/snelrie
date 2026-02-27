import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

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
        await prisma.rieReport.update({
          where: { id: payment.reportId },
          data: {
            tier: payment.tier,
          },
        });
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as any;
    await prisma.payment.updateMany({
      where: { stripePaymentIntent: paymentIntent.id },
      data: { status: "FAILED" },
    });
  }

  if (event.type === "charge.refunded") {
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
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as any;
    await prisma.payment.updateMany({
      where: { stripeSessionId: session.id },
      data: { status: "EXPIRED" },
    });
  }

  return NextResponse.json({ received: true });
}
