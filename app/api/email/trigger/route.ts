import { NextRequest, NextResponse } from "next/server";
import { triggerDripSequence, cancelDripSequence } from "@/lib/drip-engine";
import { DripSequenceType } from "@prisma/client";

const INTERNAL_SECRET = process.env.CRON_SECRET || process.env.RESEND_WEBHOOK_SECRET || "";

/**
 * POST /api/email/trigger
 * Trigger a drip sequence for a user.
 *
 * Body: { sequence, userId, email, metadata? }
 * Auth: Bearer token matching CRON_SECRET or internal call
 */
export async function POST(request: NextRequest) {
  try {
    // Simple auth check — this endpoint should only be called internally
    const auth = request.headers.get("authorization");
    const isInternal =
      request.headers.get("x-internal") === "true" ||
      (INTERNAL_SECRET && auth === `Bearer ${INTERNAL_SECRET}`);

    if (!isInternal && INTERNAL_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sequence, userId, email, metadata, action } = body as {
      sequence: string;
      userId: string;
      email: string;
      metadata?: Record<string, unknown>;
      action?: "start" | "cancel";
    };

    if (!sequence || !userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: sequence, userId, email" },
        { status: 400 }
      );
    }

    // Validate sequence type
    const validSequences: DripSequenceType[] = [
      "FREE_SCAN_COMPLETED",
      "ACCOUNT_CREATED",
      "SUBSCRIPTION_ACTIVE",
    ];
    if (!validSequences.includes(sequence as DripSequenceType)) {
      return NextResponse.json(
        { error: `Invalid sequence. Must be one of: ${validSequences.join(", ")}` },
        { status: 400 }
      );
    }

    if (action === "cancel") {
      const cancelled = await cancelDripSequence(userId, sequence as DripSequenceType);
      return NextResponse.json({ cancelled });
    }

    const result = await triggerDripSequence(
      sequence as DripSequenceType,
      userId,
      email,
      metadata
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[email/trigger] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
