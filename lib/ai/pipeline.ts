import { buildRiePrompt } from "./prompts";
import { prisma } from "@/lib/db";
import { loadKennisbank } from "@/lib/kennisbank/loader";

// Model selection based on tier
function getModelConfig(tier: string) {
  switch (tier) {
    case "ENTERPRISE":
    case "PROFESSIONAL":
      return { model: "anthropic/claude-sonnet-4.6", maxTokens: 4000 };
    case "BASIS":
      return { model: "anthropic/claude-sonnet-4.6", maxTokens: 3000 };
    default: // GRATIS
      return { model: "anthropic/claude-3.5-haiku", maxTokens: 2500 };
  }
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
          { role: "user", content: user },
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

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = text;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];

    const generatedContent = JSON.parse(jsonStr.trim());
    const generationTimeMs = Date.now() - startTime;
    const tokensUsed = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);

    await prisma.rieReport.update({
      where: { id: reportId },
      data: {
        generatedContent,
        samenvatting: generatedContent.samenvatting,
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
