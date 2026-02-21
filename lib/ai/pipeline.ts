import {
  buildProfielPrompt,
  buildRisicosPrompt,
  buildPvaPrompt,
  buildWettelijkPrompt,
} from "./prompts";
import { prisma } from "@/lib/db";
import { loadKennisbank } from "@/lib/kennisbank/loader";
import { jsonrepair } from "jsonrepair";

const MODEL = "anthropic/claude-haiku-4.5";

// Tier configuration
const TIER_CONFIG: Record<string, { risicos: number; batches: number; pva: boolean; wettelijk: boolean }> = {
  GRATIS:       { risicos: 4,  batches: 1, pva: false, wettelijk: false },
  BASIS:        { risicos: 6,  batches: 2, pva: false, wettelijk: false },
  PROFESSIONAL: { risicos: 8,  batches: 2, pva: true,  wettelijk: false },
  ENTERPRISE:   { risicos: 10, batches: 3, pva: true,  wettelijk: true  },
};

// Single AI call with sanitization and parsing
async function aiCall(system: string, user: string, maxTokens: number): Promise<any> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content;
  if (!text) throw new Error("Empty AI response");

  const tokens = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);

  // Extract and parse JSON using jsonrepair for robustness
  let jsonStr = text.trim();
  // Remove markdown code blocks
  const codeMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();
  // Find JSON structure start
  const firstBrace = jsonStr.indexOf("{");
  const firstBracket = jsonStr.indexOf("[");
  const start = firstBrace === -1 ? firstBracket :
                firstBracket === -1 ? firstBrace :
                Math.min(firstBrace, firstBracket);
  if (start > 0) jsonStr = jsonStr.slice(start);

  try {
    // Try direct parse first
    return { parsed: JSON.parse(jsonStr), tokens };
  } catch {
    // Use jsonrepair to fix common LLM JSON issues
    const repaired = jsonrepair(jsonStr);
    return { parsed: JSON.parse(repaired), tokens };
  }
}

// jsonrepair handles all JSON repair (unescaped chars, truncation, etc.)

// Compliance validator
function validateRie(content: any, tier: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = TIER_CONFIG[tier] || TIER_CONFIG.GRATIS;

  if (!content.samenvatting || content.samenvatting.length < 50) {
    errors.push("Samenvatting ontbreekt of te kort");
  }
  if (!content.bedrijfsprofiel?.naam) {
    errors.push("Bedrijfsprofiel ontbreekt");
  }
  if (!content.risicos || content.risicos.length < Math.floor(config.risicos * 0.75)) {
    errors.push(`Te weinig risico's: ${content.risicos?.length || 0} (min ${Math.floor(config.risicos * 0.75)})`);
  }
  // Check each risico has required fields
  let totalMaatregelen = 0;
  content.risicos?.forEach((r: any, i: number) => {
    if (!r.categorie) errors.push(`Risico ${i + 1}: categorie ontbreekt`);
    if (!r.prioriteit) errors.push(`Risico ${i + 1}: prioriteit ontbreekt`);

    // Normalize maatregelen to robust object[] and ignore "geen maatregelen" placeholders
    const rawSource = r.maatregelen ?? r.maatregel;
    const raw = Array.isArray(rawSource)
      ? rawSource
      : rawSource && typeof rawSource === "object"
        ? Object.values(rawSource)
        : rawSource
          ? [rawSource]
          : [];

    const normalizeMaatregel = (item: any): any[] => {
      if (Array.isArray(item)) {
        return item.flatMap((nested) => normalizeMaatregel(nested));
      }

      if (typeof item === "string") {
        const parts = item
          .split(/\n|;|\u2022|(?=\s*\d+[\).]\s+)/)
          .map((p) => p.replace(/^\s*\d+[\).]\s*/, "").trim())
          .filter(Boolean);

        return parts.map((text) => ({ maatregel: text, termijn: "nader te bepalen" }));
      }

      if (!item || typeof item !== "object") return [];

      // Some models return `{ maatregelen: [...] }` or object maps; normalize recursively.
      if (Array.isArray(item.maatregelen)) {
        return item.maatregelen.flatMap((nested: any) => normalizeMaatregel({ ...item, ...nested }));
      }

      const maatregelSource =
        item.maatregel ??
        item.beschrijving ??
        item.actie ??
        item.maatregelTekst ??
        item.measure;

      const maatregel = typeof maatregelSource === "string" ? maatregelSource.trim() : "";
      if (!maatregel || /^geen\s+maatregel(en)?/i.test(maatregel)) return [];

      const termijnSource =
        item.termijn ??
        item.deadline ??
        item.planning ??
        item.implementatieTermijn ??
        item.streefdatum ??
        r.termijn ??
        r.deadline;

      const termijn = (typeof termijnSource === "string" || typeof termijnSource === "number") && String(termijnSource).trim()
        ? String(termijnSource).trim()
        : "nader te bepalen";

      return [{ ...item, maatregel, termijn }];
    };

    const normalized = raw
      .flatMap((m: any) => normalizeMaatregel(m))
      .filter((m: any) => m?.maatregel && !/^geen\s+maatregel(en)?/i.test(m.maatregel));

    r.maatregelen = normalized;
    totalMaatregelen += r.maatregelen.length;

    r.maatregelen.forEach((m: any, j: number) => {
      if (!m.maatregel) errors.push(`Risico ${i + 1} maatregel ${j + 1}: beschrijving ontbreekt`);
      if (!m.termijn) m.termijn = "nader te bepalen";
    });
  });
  // Ensure at least some maatregelen overall (not per-risico)
  if (content.risicos?.length > 0 && totalMaatregelen < Math.floor(content.risicos.length * 0.5)) {
    errors.push(`Te weinig maatregelen totaal: ${totalMaatregelen} (min ${Math.floor(content.risicos.length * 0.5)})`);
  }
  // PvA check for paid tiers
  if (config.pva && (!content.planVanAanpak || content.planVanAanpak.length < 3)) {
    errors.push("Plan van Aanpak ontbreekt of te kort");
  }
  // Wettelijk check for Enterprise
  if (config.wettelijk && (!content.wettelijkeVerplichtingen || content.wettelijkeVerplichtingen.length < 4)) {
    errors.push("Wettelijke verplichtingen ontbreekt of te kort");
  }

  return { valid: errors.length === 0, errors };
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
  let totalTokens = 0;

  try {
    const kennisbank = await loadKennisbank(report.branche);
    const intakeData = report.intakeData as any;
    const tier = report.tier;
    const config = TIER_CONFIG[tier] || TIER_CONFIG.GRATIS;

    // Step 1: Bedrijfsprofiel + Samenvatting
    console.log(`[${reportId}] Step 1: Profiel + Samenvatting`);
    const profielPrompt = buildProfielPrompt(kennisbank, intakeData);
    const { parsed: profiel, tokens: t1 } = await aiCall(profielPrompt.system, profielPrompt.user, 1000);
    totalTokens += t1;

    // Step 2: Risico's in batches
    const allRisicos: any[] = [];
    for (let batch = 0; batch < config.batches; batch++) {
      console.log(`[${reportId}] Step 2.${batch + 1}: Risico's batch ${batch + 1}/${config.batches}`);
      const risicosPrompt = buildRisicosPrompt(kennisbank, intakeData, tier, batch, config.batches);
      const { parsed: risicos, tokens: t2 } = await aiCall(risicosPrompt.system, risicosPrompt.user, 2500);
      totalTokens += t2;
      const arr = Array.isArray(risicos) ? risicos : risicos.risicos || [risicos];
      allRisicos.push(...arr);
    }

    // Step 3: Plan van Aanpak (if applicable)
    let planVanAanpak: any[] = [];
    if (config.pva && allRisicos.length > 0) {
      console.log(`[${reportId}] Step 3: Plan van Aanpak`);
      const pvaPrompt = buildPvaPrompt(kennisbank, intakeData, allRisicos, tier);
      const { parsed: pva, tokens: t3 } = await aiCall(pvaPrompt.system, pvaPrompt.user, 2000);
      totalTokens += t3;
      planVanAanpak = Array.isArray(pva) ? pva : pva.planVanAanpak || [pva];
    }

    // Step 4: Wettelijke verplichtingen (Enterprise only)
    let wettelijkeVerplichtingen: any[] = [];
    if (config.wettelijk) {
      console.log(`[${reportId}] Step 4: Wettelijke verplichtingen`);
      const wettelijkPrompt = buildWettelijkPrompt(kennisbank, intakeData);
      const { parsed: wv, tokens: t4 } = await aiCall(wettelijkPrompt.system, wettelijkPrompt.user, 1500);
      totalTokens += t4;
      wettelijkeVerplichtingen = Array.isArray(wv) ? wv : wv.wettelijkeVerplichtingen || [wv];
    }

    // Assemble final document
    const generatedContent = {
      samenvatting: profiel.samenvatting,
      bedrijfsprofiel: profiel.bedrijfsprofiel,
      risicos: allRisicos,
      planVanAanpak,
      wettelijkeVerplichtingen,
    };

    // Validate compliance gate (hard block)
    const validation = validateRie(generatedContent, tier);
    if (!validation.valid) {
      const reason = `VALIDATIE_GEFAALD: ${validation.errors.join(" | ")}`;
      console.warn(`[${reportId}] ${reason}`);

      await prisma.rieReport.update({
        where: { id: reportId },
        data: {
          generatedContent,
          samenvatting: reason,
          status: "FAILED",
          tokensUsed: totalTokens,
          generationTimeMs: Date.now() - startTime,
        },
      });

      throw new Error(reason);
    }

    const generationTimeMs = Date.now() - startTime;

    await prisma.rieReport.update({
      where: { id: reportId },
      data: {
        generatedContent,
        samenvatting: generatedContent.samenvatting || "RI&E gegenereerd.",
        status: "COMPLETED",
        tokensUsed: totalTokens,
        generationTimeMs,
      },
    });

    console.log(`[${reportId}] COMPLETED in ${generationTimeMs}ms, ${totalTokens} tokens, ${allRisicos.length} risico's`);
    return generatedContent;
  } catch (error) {
    console.error(`[${reportId}] FAILED:`, error);
    await prisma.rieReport.update({
      where: { id: reportId },
      data: { status: "FAILED" },
    });
    throw error;
  }
}
