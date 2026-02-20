import { buildRiePrompt } from "./prompts";
import { prisma } from "@/lib/db";
import { loadKennisbank } from "@/lib/kennisbank/loader";

// Model selection based on tier — high token limits to prevent truncation
function getModelConfig(tier: string) {
  switch (tier) {
    case "ENTERPRISE":
      return { model: "anthropic/claude-sonnet-4.6", maxTokens: 16000 };
    case "PROFESSIONAL":
      return { model: "anthropic/claude-sonnet-4.6", maxTokens: 12000 };
    case "BASIS":
      return { model: "anthropic/claude-sonnet-4.6", maxTokens: 8000 };
    default: // GRATIS
      return { model: "anthropic/claude-3.5-haiku", maxTokens: 3000 };
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

  // Remove trailing comma before closing
  let repaired = str.replace(/,\s*$/, '');

  // Close any unclosed strings
  if (inString) repaired += '"';

  // Close open brackets and braces
  for (let i = 0; i < openBrackets; i++) repaired += ']';
  for (let i = 0; i < openBraces; i++) repaired += '}';

  return repaired;
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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
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

    const data = await response.json();
    const text = data.choices[0]?.message?.content;
    if (!text) throw new Error("No content in OpenRouter response");

    // Check if output was truncated (finish_reason != "stop")
    const finishReason = data.choices[0]?.finish_reason;
    const wasTruncated = finishReason === "length";

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = text.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();
    // Find first { and last }
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
    } else if (firstBrace !== -1) {
      // Truncated — no closing brace found
      jsonStr = jsonStr.slice(firstBrace);
    }

    let generatedContent: any;
    try {
      generatedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      // Try to repair truncated JSON
      console.warn("JSON parse failed, attempting repair...", (parseError as Error).message);
      const repaired = repairJson(jsonStr);
      generatedContent = JSON.parse(repaired);
    }

    const generationTimeMs = Date.now() - startTime;
    const tokensUsed = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);

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
