import { buildRiePrompt } from "./prompts";
import { prisma } from "@/lib/db";
import { loadKennisbank } from "@/lib/kennisbank/loader";

// Model selection based on tier
function getModelConfig(tier: string) {
  switch (tier) {
    case "ENTERPRISE":
      return { model: "anthropic/claude-haiku-4.5", maxTokens: 6000 };
    case "PROFESSIONAL":
      return { model: "anthropic/claude-haiku-4.5", maxTokens: 6000 };
    case "BASIS":
      return { model: "anthropic/claude-haiku-4.5", maxTokens: 4000 };
    default:
      return { model: "anthropic/claude-haiku-4.5", maxTokens: 2500 };
  }
}

// Sanitize model output to valid JSON - fix common LLM issues
function sanitizeJsonString(str: string): string {
  // Fix unescaped control characters inside JSON strings
  let result = "";
  let inString = false;
  let escape = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (escape) {
      result += ch;
      escape = false;
      continue;
    }

    if (ch === "\\" && inString) {
      result += ch;
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString) {
      // Escape control characters that are invalid in JSON strings
      if (ch === "\n") { result += "\\n"; continue; }
      if (ch === "\r") { result += "\\r"; continue; }
      if (ch === "\t") { result += "\\t"; continue; }
      const code = ch.charCodeAt(0);
      if (code < 32) { result += "\\u" + code.toString(16).padStart(4, "0"); continue; }
    }

    result += ch;
  }

  return result;
}

// Repair truncated JSON by closing open structures
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

    // Non-streaming call — Haiku is fast enough (<60s)
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

    // Sanitize control characters in string values
    jsonStr = sanitizeJsonString(jsonStr);

    let generatedContent: any;
    try {
      generatedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.warn("JSON parse failed after sanitize, attempting repair...", (parseError as Error).message);
      const repaired = repairJson(jsonStr);
      generatedContent = JSON.parse(repaired);
    }

    const generationTimeMs = Date.now() - startTime;
    const tokensUsed = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);

    await prisma.rieReport.update({
      where: { id: reportId },
      data: {
        generatedContent,
        samenvatting: generatedContent.samenvatting || "RI&E gegenereerd.",
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
