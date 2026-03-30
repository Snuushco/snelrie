import { NextRequest } from "next/server";
import { generateRie } from "@/lib/ai/pipeline";
import { prisma } from "@/lib/db";
import { triggerDripSequence } from "@/lib/drip-engine";

// Pro plan allows up to 120s proxy timeout
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { reportId } = await req.json();

    if (!reportId || typeof reportId !== "string") {
      return new Response(JSON.stringify({ error: "reportId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const report = await prisma.rieReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return new Response(JSON.stringify({ error: "Report niet gevonden" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (report.status === "COMPLETED") {
      return new Response(JSON.stringify({ reportId, status: "COMPLETED" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Use streaming response to keep connection alive during AI generation
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial status
        controller.enqueue(encoder.encode(`data: {"status":"GENERATING"}\n\n`));

        // Send heartbeat every 5s to prevent timeout
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`data: {"status":"GENERATING","heartbeat":true}\n\n`));
          } catch {
            clearInterval(heartbeat);
          }
        }, 5000);

        try {
          await generateRie(reportId);
          clearInterval(heartbeat);
          controller.enqueue(encoder.encode(`data: {"status":"COMPLETED","reportId":"${reportId}"}\n\n`));

          // Trigger Free Scan drip if report is GRATIS tier (non-blocking)
          const completedReport = await prisma.rieReport.findUnique({
            where: { id: reportId },
            include: { user: true },
          });
          if (completedReport && completedReport.tier === "GRATIS" && completedReport.user) {
            triggerDripSequence("FREE_SCAN_COMPLETED", completedReport.userId, completedReport.user.email, {
              reportUrl: `https://www.snelrie.nl/rapport/${reportId}`,
              risksFound: Array.isArray((completedReport.generatedContent as any)?.risicos) ? (completedReport.generatedContent as any).risicos.length : 8,
              bedrijfsnaam: completedReport.bedrijfsnaam,
              branche: completedReport.branche,
            }).catch((err: unknown) => console.error("[rie/process] Failed to trigger drip:", err));
          }
        } catch (error) {
          clearInterval(heartbeat);
          controller.enqueue(encoder.encode(`data: {"status":"FAILED","error":"${String(error).replace(/"/g, '\\"')}"}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Process error:", error);
    return new Response(JSON.stringify({ error: "Generatie mislukt" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
