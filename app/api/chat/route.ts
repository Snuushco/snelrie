import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { chatSchema, validationErrorResponse, stripHtml } from "@/lib/validate";

export async function POST(req: NextRequest) {
  // Rate limiting (per IP)
  const ip = getClientIp(req);
  const rl = checkRateLimit(RATE_LIMITS.chat, ip);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter);

  try {
    const body = await req.json();

    // Validate input
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { reportId, messages } = parsed.data;

    const report = await prisma.rieReport.findUnique({
      where: { id: reportId },
      include: { payments: true },
    });

    if (!report) {
      return new Response(JSON.stringify({ error: "Rapport niet gevonden" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (report.tier !== "ENTERPRISE") {
      return new Response(
        JSON.stringify({ error: "AI Chat is alleen beschikbaar voor Enterprise klanten" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const hasPaid = report.payments.some((p) => p.status === "PAID");
    if (!hasPaid) {
      return new Response(
        JSON.stringify({ error: "Betaling niet gevonden" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanitize messages: strip role manipulation attempts, limit to last 50
    const sanitizedMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: m.role === "user"
          ? stripHtml(m.content)
              .replace(/^(system|assistant):/gi, "")
              .slice(0, 500)
          : m.content,
      }))
      .slice(-50); // Keep last 50 messages only

    const intake = report.intakeData as any;
    const content = report.generatedContent as any;

    const intakeText = `
Bedrijfsnaam: ${report.bedrijfsnaam}
Branche: ${report.branche}
Aantal medewerkers: ${report.aantalMedewerkers}
Aantal locaties: ${report.aantalLocaties}
BHV aanwezig: ${intake?.bhvAanwezig ? "Ja" : "Nee"}
Aantal BHV'ers: ${intake?.aantalBhvers || "Onbekend"}
Preventiemedewerker: ${intake?.preventiemedewerker ? "Ja" : "Nee"}
Eerder RI&E: ${intake?.eerderRie ? "Ja" : "Nee"}
Laatste RI&E: ${intake?.laatsteRie || "Onbekend"}
Beeldschermwerk: ${intake?.werkplek?.beeldschermwerk ? "Ja" : "Nee"}
Fysiek werk: ${intake?.werkplek?.fysiekWerk ? "Ja" : "Nee"}
Buitenwerk: ${intake?.werkplek?.buitenwerk ? "Ja" : "Nee"}
Nachtwerk: ${intake?.werkplek?.nachtwerk ? "Ja" : "Nee"}
Alleen werken: ${intake?.werkplek?.alleenWerken ? "Ja" : "Nee"}
Gevaarlijke stoffen: ${intake?.werkplek?.gevaarlijkeStoffen ? "Ja" : "Nee"}`;

    const risicosText = content?.risicos
      ?.map(
        (r: any, i: number) =>
          `${i + 1}. ${r.categorie} (prioriteit: ${r.prioriteit}, score: ${r.risicoScore || "n.v.t."})
   ${r.beschrijving}
   Wettelijk kader: ${r.wettelijkKader || "n.v.t."}
   Maatregelen: ${r.maatregelen?.map((m: any) => `${m.maatregel} (${m.termijn})`).join("; ") || "n.v.t."}`
      )
      .join("\n\n") || "Geen risico's beschikbaar";

    const pvaText = content?.planVanAanpak
      ?.map(
        (item: any, i: number) =>
          `${item.nummer || i + 1}. ${item.maatregel} — Prioriteit: ${item.prioriteit}, Termijn: ${item.termijn}, Verantwoordelijke: ${item.verantwoordelijke}`
      )
      .join("\n") || "Geen plan van aanpak beschikbaar";

    const systemPrompt = `Je bent een RI&E expert-assistent van SnelRIE. Je hebt volledige kennis van de RI&E die is opgesteld voor dit bedrijf.

BEDRIJFSGEGEVENS:
${intakeText}

RISICO-INVENTARISATIE:
${risicosText}

PLAN VAN AANPAK:
${pvaText}

Beantwoord vragen over de RI&E, risico's, maatregelen, en Arbo-wetgeving. Wees specifiek en verwijs naar de concrete risico's en maatregelen uit dit rapport. Antwoord altijd in het Nederlands.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4-20250514",
          max_tokens: 1000,
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            ...sanitizedMessages,
          ],
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      return new Response(
        JSON.stringify({ error: `AI fout: ${response.status}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream the response through
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (e) {
          // ignore
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message || "Interne fout" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
