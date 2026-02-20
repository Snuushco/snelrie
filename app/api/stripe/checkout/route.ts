import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRICING } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { reportId, tier } = await req.json();

    if (!reportId || !tier || !PRICING[tier as keyof typeof PRICING]) {
      return NextResponse.json({ error: "Ongeldige tier" }, { status: 400 });
    }

    const report = await prisma.rieReport.findUnique({
      where: { id: reportId },
      include: { user: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Rapport niet gevonden" }, { status: 404 });
    }

    const pricing = PRICING[tier as keyof typeof PRICING];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: pricing.label,
              description: pricing.description,
            },
            unit_amount: pricing.price,
          },
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
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        stripeSessionId: session.id,
        amount: pricing.price,
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
