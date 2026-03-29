import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCommitmentStatus, cancelSubscription } from "@/lib/stripe-commitment";

/**
 * GET /api/subscriptions/cancel — Check if user can cancel
 * POST /api/subscriptions/cancel — Request cancellation
 */

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const status = await getCommitmentStatus(session.user.id);

    return NextResponse.json({
      canCancel: status.canCancel,
      withinCommitment: status.withinCommitment,
      commitmentEndDate: status.commitmentEndDate?.toISOString() || null,
      daysRemaining: status.daysRemaining,
      nextRenewalDate: status.nextRenewalDate?.toISOString() || null,
      reason: status.reason,
    });
  } catch (error) {
    console.error("Cancel status check error:", error);
    return NextResponse.json(
      { error: "Kan opzegstatus niet ophalen" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const result = await cancelSubscription(session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, canCancel: false },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Opzeggen is niet gelukt. Neem contact op met support." },
      { status: 500 }
    );
  }
}
