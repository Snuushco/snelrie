import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Email tracking stats endpoint
 * GET /api/webhooks/resend/stats
 * Query params:
 *   - days: number of days to look back (default 30)
 *   - format: "json" (default) or "csv"
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30", 10);
  const format = searchParams.get("format") || "json";
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const events = await prisma.emailEvent.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });

  // Aggregate stats
  const stats = {
    period: `Last ${days} days`,
    since: since.toISOString(),
    total: events.length,
    byType: {} as Record<string, number>,
    uniqueRecipients: new Set<string>(),
    recentEvents: events.slice(0, 50).map((e) => ({
      type: e.type,
      email: e.email,
      subject: e.subject,
      link: e.link,
      messageId: e.messageId,
      timestamp: e.createdAt.toISOString(),
    })),
  };

  for (const event of events) {
    stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
    if (event.email) stats.uniqueRecipients.add(event.email);
  }

  if (format === "csv") {
    const csvRows = [
      "timestamp,type,email,subject,messageId,link",
      ...events.map(
        (e) =>
          `"${e.createdAt.toISOString()}","${e.type}","${e.email}","${e.subject || ""}","${e.messageId || ""}","${e.link || ""}"`
      ),
    ];
    return new NextResponse(csvRows.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="email-events-${days}d.csv"`,
      },
    });
  }

  return NextResponse.json({
    ...stats,
    uniqueRecipients: stats.uniqueRecipients.size,
  });
}
