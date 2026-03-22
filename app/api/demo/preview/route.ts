import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Streaming AI preview for /demo flow.
 * Sends personalized RI&E summary via Server-Sent Events.
 * Falls back to static text if OpenRouter is unavailable.
 */

const STATIC_FALLBACKS: Record<string, string> = {
  bouw: "Op basis van uw antwoorden detecteert SnelRIE significante risico's rondom hoogtewerk, fysieke belasting en blootstelling aan gevaarlijke stoffen. Het ontbreken van een actueel Plan van Aanpak vergroot de kans op handhaving door de Inspectie SZW.",
  transport: "Uw transportoperatie toont risico's rondom fysieke belasting bij laden/lossen, alleen werken op route en onregelmatige diensten. Een actuele RI&E ontbreekt in 68% van vergelijkbare transportbedrijven.",
  horeca: "Uw horecabedrijf vertoont risico's rondom hitte en gladheid in de keuken, fysieke belasting en avond-/nachtdiensten. De Inspectie SZW intensiveert controles in de horeca in 2026.",
  detailhandel: "Uw retailbedrijf heeft risico's op het gebied van tillen bij bevoorrading, alleen werken en ergonomie bij kassawerk. Veel winkels onderschatten de RI&E-verplichting.",
  zorg: "Uw zorginstelling toont significante risico's rondom tillen van patiënten, nachtdiensten en omgang met biologisch materiaal. Zorglocaties worden in 2026 extra gecontroleerd.",
  kantoor: "Uw kantooromgeving toont risico's op het gebied van beeldschermwerk, ergonomie en psychosociale arbeidsbelasting. Thuiswerken vergroot het aandachtsgebied.",
  beveiliging: "Uw beveiligingsorganisatie kent hoge risico's rondom alleen werken, confrontatie met agressie en nachtdiensten. De branche heeft één van de hoogste incidentenratio's.",
  schoonmaak: "Uw schoonmaakbedrijf heeft risico's rondom chemische blootstelling, fysieke belasting en alleen werken. De schoonmaakbranche is een aandachtssector voor de Inspectie SZW.",
  kinderopvang: "Uw kinderopvanglocatie heeft risico's rondom fysieke belasting door tillen, ergonomie en alleen werken met groepen kinderen.",
  overig: "Op basis van uw antwoorden detecteert SnelRIE risico's op het gebied van fysieke belasting, werkplekergonomie en arbeidstijden. Een branchespecifieke analyse zou een completer beeld geven.",
};

function buildPrompt(data: {
  branche: string;
  medewerkers: string;
  fysiekWerk: string;
  gevaarlijkeStoffen: string;
  nachtwerk: string;
}): string {
  return `Je bent een RI&E-expert van SnelRIE. Schrijf een korte, overtuigende samenvatting (max 3 zinnen, ~60 woorden) van de belangrijkste arbeidsrisico's voor dit bedrijf. Wees specifiek en noem concrete risico's. Verwijs naar de Inspectie SZW. Gebruik een professionele maar toegankelijke toon.

Bedrijfsgegevens:
- Branche: ${data.branche}
- Aantal medewerkers: ${data.medewerkers}
- Zwaar fysiek werk: ${data.fysiekWerk}
- Gevaarlijke stoffen: ${data.gevaarlijkeStoffen}
- Nacht-/onregelmatige diensten: ${data.nachtwerk}

Schrijf ALLEEN de samenvatting, geen titel, geen opsomming, geen JSON. Begin direct met de inhoud.`;
}

function createSSEStream(text: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      // Send static text as a single chunk for instant display
      const words = text.split(" ");
      let i = 0;
      const interval = setInterval(() => {
        if (i < words.length) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
          );
          i++;
        } else {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          clearInterval(interval);
        }
      }, 20); // ~20ms per word for fast but readable stream
    },
  });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(
    { name: "demo-preview", maxRequests: 10, windowSeconds: 3600 },
    ip
  );

  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfter);
  }

  let data: {
    branche: string;
    medewerkers: string;
    fysiekWerk: string;
    gevaarlijkeStoffen: string;
    nachtwerk: string;
  };

  try {
    data = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
    });
  }

  const branche = data.branche || "overig";
  const apiKey = process.env.OPENROUTER_API_KEY;

  // If no API key, stream static fallback immediately
  if (!apiKey) {
    const fallback = STATIC_FALLBACKS[branche] || STATIC_FALLBACKS.overig;
    return new Response(createSSEStream(fallback), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  }

  // Call OpenRouter with streaming
  try {
    const startTime = Date.now();
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4.6",
          max_tokens: 150,
          stream: true,
          messages: [
            {
              role: "user",
              content: buildPrompt(data),
            },
          ],
        }),
      }
    );

    if (!response.ok || !response.body) {
      // Fallback to static on API error
      const fallback = STATIC_FALLBACKS[branche] || STATIC_FALLBACKS.overig;
      return new Response(createSSEStream(fallback), {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Transform OpenRouter SSE to our simpler SSE format
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let buffer = "";
    let firstTokenSent = false;

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(payload);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) {
                if (!firstTokenSent) {
                  const ttft = Date.now() - startTime;
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ meta: { ttft } })}\n\n`
                    )
                  );
                  firstTokenSent = true;
                }
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ text })}\n\n`
                  )
                );
              }
            } catch {
              // Skip unparseable chunks
            }
          }
        } catch {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  } catch {
    // Final fallback
    const fallback = STATIC_FALLBACKS[branche] || STATIC_FALLBACKS.overig;
    return new Response(createSSEStream(fallback), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }
}
