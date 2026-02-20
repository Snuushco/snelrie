import { buildRiePrompt } from "./prompts";
import { prisma } from "@/lib/db";
import { loadKennisbank } from "@/lib/kennisbank/loader";

// Model selection based on tier
function getModelConfig(tier: string) {
  // Haiku 4.5 for all tiers — fast enough for serverless, quality is excellent
  // Sonnet takes >120s for large JSON which exceeds Vercel Pro function limit
  switch (tier) {
    case "ENTERPRISE":
      return { model: "anthropic/claude-haiku-4.5", maxTokens: 8000 };
    case "PROFESSIONAL":
      return { model: "anthropic/claude-haiku-4.5", maxTokens: 6000 };
    case "BASIS":
      return { model: "anthropic/claude-haiku-4.5", maxTokens: 4000 };
    default: // GRATIS
      return { model: "anthropic/claude-haiku-4.5", maxTokens: 2500 };
  }
}

// Attempt to repair truncated JSON by closing open brackets/braces
function repairJson(str: string): string {
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;

  for (const ch of str) {
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') openBraces++;
    else if (ch === '}') openBraces--;
    else if (ch === '[') openBrackets++;
    else if (ch === ']') openBrackets--;
  }

  let repaired = str.replace(/,\s*$/, '');
  if (inString) repaired += '"';
  for (let i = 0; i < openBrackets; i++) repaired += ']';
  for (let i = 0; i < openBraces; i++) repaired += '}';

  return repaired;
}

// Stream response from OpenRouter to avoid idle timeout
async function streamOpenRouterResponse(
  model: string,
  maxTokens: number,
  system: string,
  user: string
): Promise<{ text: string; promptTokens: number; completionTokens: number }> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user + "\n\nANTWOORD UITSLUITEND MET VALIDE JSON. Geen tekst ervoor of erna. Begin direct met {" },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errBody}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body stream");

  const decoder = new TextDecoder();
  let fullText = "";
  let promptTokens = 0;
  let completionTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) fullText += delta;

        // Capture usage from final chunk
        if (parsed.usage) {
          promptTokens = parsed.usage.prompt_tokens || 0;
          completionTokens = parsed.usage.completion_tokens || 0;
        }
      } catch {
        // Skip unparseable chunks
      }
    }
  }

  return { text: fullText, promptTokens, completionTokens };
}

export async function generateRie(reportId: string) {
  const report = await prisma.rieReport.findUniqueOrThrow({
    where: { id: reportId },
  });

  await prisma.rieReport.update({
    where: { id: reportId },
    data: { status: "GENERATING" },
  });

  const startTime = Date.now();

  try {
    const kennisbank = await loadKennisbank(report.branche);
    const intakeData = report.intakeData as any;
    const { system, user } = buildRiePrompt(kennisbank, intakeData, report.tier);
    const { model, maxTokens } = getModelConfig(report.tier);

    // Use streaming to avoid serverless idle timeout
    const { text, promptTokens, completionTokens } = await streamOpenRouterResponse(
      model, maxTokens, system, user
    );

    if (!text) throw new Error("No content in OpenRouter response");

    // Extract JSON from response
    let jsonStr = text.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
    } else if (firstBrace !== -1) {
      jsonStr = jsonStr.slice(firstBrace);
    }

    let generatedContent: any;
    try {
      generatedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.warn("JSON parse failed, attempting repair...", (parseError as Error).message);
      const repaired = repairJson(jsonStr);
      generatedContent = JSON.parse(repaired);
    }

    const generationTimeMs = Date.now() - startTime;
    const tokensUsed = promptTokens + completionTokens;

    await prisma.rieReport.update({
      where: { id: reportId },
      data: {
        generatedContent,
        samenvatting: generatedContent.samenvatting || "RI&E gegenereerd — samenvatting niet beschikbaar.",
        status: "COMPLETED",
        tokensUsed,
        generationTimeMs,
      },
    });

    return generatedContent;
  } catch (error) {
    console.error("RI&E generation failed:", error);
    await prisma.rieReport.update({
      where: { id: reportId },
      data: { status: "FAILED" },
    });
    throw error;
  }
}
