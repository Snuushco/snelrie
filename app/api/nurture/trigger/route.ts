import { NextRequest, NextResponse } from "next/server";
import { createNurtureEvent, markNurtureConverted } from "@/lib/nurture/scheduler";
import { NurtureEventType } from "@prisma/client";

const INTERNAL_SECRET = process.env.CRON_SECRET || "";

/**
 * POST /api/nurture/trigger
 * Create a new nurture event for a lead.
 *
 * Body: { eventType, userId, email, metadata? }
 * Auth: Bearer CRON_SECRET or x-internal: true
 */
export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    const isInternal =
      request.headers.get("x-internal") === "true" ||
      (INTERNAL_SECRET && auth === `Bearer ${INTERNAL_SECRET}`);

    if (!isInternal && INTERNAL_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventType, userId, email, metadata, action } = body as {
      eventType: string;
      userId: string;
      email: string;
      metadata?: Record<string, unknown>;
      action?: "create" | "convert";
    };

    if (action === "convert") {
      if (!userId) {
        return NextResponse.json({ error: "Missing userId for convert" }, { status: 400 });
      }
      const count = await markNurtureConverted(userId);
      return NextResponse.json({ converted: true, count });
    }

    if (!eventType || !userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: eventType, userId, email" },
        { status: 400 }
      );
    }

    const validTypes: NurtureEventType[] = [
      "SIGNUP",
      "DEMO_REQUEST",
      "PRICING_ABANDON",
      "TRIAL_EXPIRY",
    ];
    if (!validTypes.includes(eventType as NurtureEventType)) {
      return NextResponse.json(
        { error: `Invalid eventType. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await createNurtureEvent(
      userId,
      email,
      eventType as NurtureEventType,
      metadata
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[nurture/trigger] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
