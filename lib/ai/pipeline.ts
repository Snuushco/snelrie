import {
  buildProfielPrompt,
  buildArbobeleidPrompt,
  buildRisicosPrompt,
  buildPvaPrompt,
  buildWettelijkPrompt,
  buildAanbevelingenPrompt,
  PROMPT_TIER_CONFIG,
} from "./prompts";
import { prisma } from "@/lib/db";
import { loadKennisbank } from "@/lib/kennisbank/loader";
import { jsonrepair } from "jsonrepair";

const MODEL = "anthropic/claude-haiku-4.5";

// ═══════════════════════════════════════════════════════════════
// Tier configuration — aligned with framework
// ═══════════════════════════════════════════════════════════════
const TIER_CONFIG: Record<string, {
  risicos: number;
  batches: number;
  pva: boolean;
  arbobeleid: boolean;
  wettelijk: boolean;
  aanbevelingen: boolean;
}> = {
  GRATIS:       { risicos: 3,  batches: 1, pva: false, arbobeleid: false, wettelijk: false, aanbevelingen: false },
  BASIS:        { risicos: 8,  batches: 2, pva: true,  arbobeleid: true,  wettelijk: false, aanbevelingen: true },
  PROFESSIONAL: { risicos: 12, batches: 3, pva: true,  arbobeleid: true,  wettelijk: false, aanbevelingen: true },
  ENTERPRISE:   { risicos: 15, batches: 3, pva: true,  arbobeleid: true,  wettelijk: true,  aanbevelingen: true },
};

// ═══════════════════════════════════════════════════════════════
// AI Call helper
// ═══════════════════════════════════════════════════════════════
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

  let jsonStr = text.trim();
  const codeMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();
  const firstBrace = jsonStr.indexOf("{");
  const firstBracket = jsonStr.indexOf("[");
  const start = firstBrace === -1 ? firstBracket :
                firstBracket === -1 ? firstBrace :
                Math.min(firstBrace, firstBracket);
  if (start > 0) jsonStr = jsonStr.slice(start);

  try {
    return { parsed: JSON.parse(jsonStr), tokens };
  } catch {
    const repaired = jsonrepair(jsonStr);
    return { parsed: JSON.parse(repaired), tokens };
  }
}

// ═══════════════════════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════════════════════
function validateRie(content: any, tier: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = TIER_CONFIG[tier] || TIER_CONFIG.GRATIS;
  const promptConfig = PROMPT_TIER_CONFIG[tier] || PROMPT_TIER_CONFIG.GRATIS;

  // Samenvatting
  if (!content.samenvatting || content.samenvatting.length < 50) {
    errors.push("Samenvatting ontbreekt of te kort");
  }

  // Bedrijfsprofiel
  if (!content.bedrijfsprofiel?.naam) {
    errors.push("Bedrijfsprofiel ontbreekt");
  }

  // Arbobeleid (paid tiers)
  if (config.arbobeleid && !content.arbobeleid) {
    errors.push("Arbobeleid sectie ontbreekt");
  }

  // Risico's — allow 75% minimum
  const minRisicos = Math.floor(config.risicos * 0.75);
  if (!content.risicos || content.risicos.length < minRisicos) {
    errors.push(`Te weinig risico's: ${content.risicos?.length || 0} (min ${minRisicos})`);
  }

  // Validate each risico has ALL required fields
  let totalMaatregelen = 0;
  content.risicos?.forEach((r: any, i: number) => {
    if (!r.categorie) errors.push(`Risico ${i + 1}: categorie ontbreekt`);
    if (!r.prioriteit) errors.push(`Risico ${i + 1}: prioriteit ontbreekt`);
    if (!r.beschrijving) errors.push(`Risico ${i + 1}: beschrijving ontbreekt`);
    
    // Ensure risicoScore exists and is valid
    if (r.kans && r.effect && !r.risicoScore) {
      r.risicoScore = r.kans * r.effect;
    }
    if (r.risicoScore && !r.prioriteit) {
      r.prioriteit = r.risicoScore >= 18 ? 'hoog' : r.risicoScore >= 12 ? 'midden' : 'laag';
    }

    // Normalize maatregelen
    const rawSource = r.maatregelen ?? r.maatregel;
    const raw = Array.isArray(rawSource)
      ? rawSource
      : rawSource && typeof rawSource === "object"
        ? Object.values(rawSource)
        : rawSource
          ? [rawSource]
          : [];

    const normalizeMaatregel = (item: any): any[] => {
      if (Array.isArray(item)) return item.flatMap(nested => normalizeMaatregel(nested));
      if (typeof item === "string") {
        const parts = item.split(/\n|;|\u2022|(?=\s*\d+[\).]\s+)/)
          .map(p => p.replace(/^\s*\d+[\).]\s*/, "").trim())
          .filter(Boolean);
        return parts.map(text => ({
          maatregel: text,
          type: "organisatorisch",
          prioriteit: r.prioriteit || "midden",
          verantwoordelijke: "Nader te bepalen",
          deadline: "Nader te bepalen",
          kostenindicatie: "Nader te bepalen",
        }));
      }
      if (!item || typeof item !== "object") return [];
      if (Array.isArray(item.maatregelen)) {
        return item.maatregelen.flatMap((nested: any) => normalizeMaatregel({ ...item, ...nested }));
      }

      const maatregelText = item.maatregel ?? item.beschrijving ?? item.actie ?? item.measure;
      const maatregel = typeof maatregelText === "string" ? maatregelText.trim() : "";
      if (!maatregel || /^geen\s+maatregel(en)?/i.test(maatregel)) return [];

      return [{
        maatregel,
        type: item.type || item.typeMaatregel || "organisatorisch",
        prioriteit: item.prioriteit || r.prioriteit || "midden",
        verantwoordelijke: item.verantwoordelijke || "Nader te bepalen",
        deadline: item.deadline || item.termijn || "Nader te bepalen",
        kostenindicatie: item.kostenindicatie || item.kosten || "Nader te bepalen",
      }];
    };

    const normalized = raw
      .flatMap((m: any) => normalizeMaatregel(m))
      .filter((m: any) => m?.maatregel && !/^geen\s+maatregel(en)?/i.test(m.maatregel));

    r.maatregelen = normalized;
    totalMaatregelen += normalized.length;
  });

  if (content.risicos?.length > 0 && totalMaatregelen < Math.floor(content.risicos.length * 0.5)) {
    errors.push(`Te weinig maatregelen totaal: ${totalMaatregelen}`);
  }

  // PvA
  if (config.pva) {
    const minPva = Math.floor(promptConfig.pvaItems * 0.6);
    if (!content.planVanAanpak || content.planVanAanpak.length < minPva) {
      errors.push(`PvA te kort: ${content.planVanAanpak?.length || 0} (min ${minPva})`);
    }
    // Validate PvA items have required fields
    content.planVanAanpak?.forEach((item: any, i: number) => {
      if (!item.maatregel) errors.push(`PvA ${i + 1}: maatregel ontbreekt`);
      if (!item.verantwoordelijke) item.verantwoordelijke = "Nader te bepalen";
      if (!item.deadline) item.deadline = "Nader te bepalen";
      if (!item.prioriteit) item.prioriteit = "midden";
      if (!item.status) item.status = "nog niet gestart";
    });
  }

  // Wettelijk
  if (config.wettelijk && (!content.wettelijkeVerplichtingen || content.wettelijkeVerplichtingen.length < 6)) {
    errors.push("Wettelijke verplichtingen ontbreekt of te kort");
  }

  return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════
// Main Pipeline
// ═══════════════════════════════════════════════════════════════
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

    // ── Step 1: Bedrijfsprofiel + Samenvatting ──
    console.log(`[${reportId}] Step 1: Profiel + Samenvatting`);
    const profielPrompt = buildProfielPrompt(kennisbank, intakeData);
    const { parsed: profiel, tokens: t1 } = await aiCall(profielPrompt.system, profielPrompt.user, 1500);
    totalTokens += t1;

    // ── Step 2: Arbobeleid & Organisatie (paid tiers) ──
    let arbobeleid: any = null;
    if (config.arbobeleid) {
      console.log(`[${reportId}] Step 2: Arbobeleid`);
      const arboPrompt = buildArbobeleidPrompt(kennisbank, intakeData);
      const { parsed: arbo, tokens: t2 } = await aiCall(arboPrompt.system, arboPrompt.user, 1200);
      totalTokens += t2;
      arbobeleid = arbo.arbobeleid || arbo;
    }

    // ── Step 3: Risico's in batches ──
    const allRisicos: any[] = [];
    for (let batch = 0; batch < config.batches; batch++) {
      console.log(`[${reportId}] Step 3.${batch + 1}: Risico's batch ${batch + 1}/${config.batches}`);
      const risicosPrompt = buildRisicosPrompt(kennisbank, intakeData, tier, batch, config.batches);
      const { parsed: risicos, tokens: t3 } = await aiCall(risicosPrompt.system, risicosPrompt.user, 3500);
      totalTokens += t3;
      const arr = Array.isArray(risicos) ? risicos : risicos.risicos || [risicos];
      allRisicos.push(...arr);
    }

    // ── Step 4: Plan van Aanpak ──
    let planVanAanpak: any[] = [];
    if (config.pva && allRisicos.length > 0) {
      console.log(`[${reportId}] Step 4: Plan van Aanpak`);
      const pvaPrompt = buildPvaPrompt(kennisbank, intakeData, allRisicos, tier);
      const { parsed: pva, tokens: t4 } = await aiCall(pvaPrompt.system, pvaPrompt.user, 3000);
      totalTokens += t4;
      planVanAanpak = Array.isArray(pva) ? pva : pva.planVanAanpak || [pva];
    }

    // ── Step 5: Wettelijke verplichtingen (Enterprise) ──
    let wettelijkeVerplichtingen: any[] = [];
    if (config.wettelijk) {
      console.log(`[${reportId}] Step 5: Wettelijke verplichtingen`);
      const wettelijkPrompt = buildWettelijkPrompt(kennisbank, intakeData);
      const { parsed: wv, tokens: t5 } = await aiCall(wettelijkPrompt.system, wettelijkPrompt.user, 2000);
      totalTokens += t5;
      wettelijkeVerplichtingen = Array.isArray(wv) ? wv : wv.wettelijkeVerplichtingen || [wv];
    }

    // ── Step 6: Aanbevelingen & Conclusie (paid tiers) ──
    let aanbevelingen: any = null;
    if (config.aanbevelingen && allRisicos.length > 0) {
      console.log(`[${reportId}] Step 6: Aanbevelingen`);
      const aanbPrompt = buildAanbevelingenPrompt(kennisbank, intakeData, allRisicos, tier);
      const { parsed: aanb, tokens: t6 } = await aiCall(aanbPrompt.system, aanbPrompt.user, 2000);
      totalTokens += t6;
      aanbevelingen = aanb;
    }

    // ── Assemble final document ──
    const generatedContent = {
      samenvatting: profiel.samenvatting,
      bedrijfsprofiel: profiel.bedrijfsprofiel,
      arbobeleid,
      risicos: allRisicos,
      planVanAanpak,
      wettelijkeVerplichtingen,
      aanbevelingen,
    };

    // ── Validate ──
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
