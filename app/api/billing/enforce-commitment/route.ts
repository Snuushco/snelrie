/**
 * POST /api/billing/enforce-commitment
 *
 * Admin/internal endpoint to check and enforce 12-month commitment
 * for a given subscription or user.
 *
 * Use cases:
 * - Check if a user's commitment is still active
 * - Force-check commitment status (e.g., from admin panel)
 * - Validate before showing cancel UI
 *
 * GET: Check commitment status for current user
 * POST: Check commitment status for a specific userId (admin) or current user
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCommitmentStatus, COMMITMENT_MESSAGES } from "@/lib/stripe-commitment";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const status = await getCommitmentStatus(session.user.id);

    return NextResponse.json({
      hasSubscription: status.hasSubscription,
      canCancel: status.canCancel,
      withinCommitment: status.withinCommitment,
      commitmentEndDate: status.commitmentEndDate?.toISOString() || null,
      daysRemaining: status.daysRemaining,
      nextRenewalDate: status.nextRenewalDate?.toISOString() || null,
      subscriptionStartDate: status.subscriptionStartDate?.toISOString() || null,
      reason: status.reason,
      reasonCode: status.reasonCode,
      commitmentInfo: COMMITMENT_MESSAGES.commitmentInfo,
    });
  } catch (error) {
    console.error("Commitment status check error:", error);
    return NextResponse.json(
      { error: COMMITMENT_MESSAGES.error },
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

    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId || session.user.id;

    // Only allow checking other users if admin (basic check)
    if (targetUserId !== session.user.id) {
      // TODO: Add proper admin role check
      return NextResponse.json(
        { error: "Geen toegang" },
        { status: 403 }
      );
    }

    const status = await getCommitmentStatus(targetUserId);

    return NextResponse.json({
      userId: targetUserId,
      hasSubscription: status.hasSubscription,
      canCancel: status.canCancel,
      withinCommitment: status.withinCommitment,
      commitmentEndDate: status.commitmentEndDate?.toISOString() || null,
      daysRemaining: status.daysRemaining,
      nextRenewalDate: status.nextRenewalDate?.toISOString() || null,
      subscriptionStartDate: status.subscriptionStartDate?.toISOString() || null,
      reason: status.reason,
      reasonCode: status.reasonCode,
      // Include action guidance for the frontend
      action: status.canCancel
        ? "show_cancel_button"
        : status.withinCommitment
          ? "show_commitment_notice"
          : "show_renewal_notice",
    });
  } catch (error) {
    console.error("Commitment enforcement error:", error);
    return NextResponse.json(
      { error: COMMITMENT_MESSAGES.error },
      { status: 500 }
    );
  }
}
