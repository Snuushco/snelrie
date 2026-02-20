import {
  buildProfielPrompt,
  buildRisicosPrompt,
  buildPvaPrompt,
  buildWettelijkPrompt,
} from "./prompts";
import { prisma } from "@/lib/db";
import { loadKennisbank } from "@/lib/kennisbank/loader";

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

  // Extract and parse JSON
  let jsonStr = text.trim();
  // Remove markdown code blocks
  const codeMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();
  // Find JSON structure
  const firstBrace = jsonStr.indexOf("{");
  const firstBracket = jsonStr.indexOf("[");
  const start = firstBrace === -1 ? firstBracket :
                firstBracket === -1 ? firstBrace :
                Math.min(firstBrace, firstBracket);
  if (start > 0) jsonStr = jsonStr.slice(start);
  // Find matching end
  const isArray = jsonStr.startsWith("[");
  const lastClose = jsonStr.lastIndexOf(isArray ? "]" : "}");
  if (lastClose !== -1) jsonStr = jsonStr.slice(0, lastClose + 1);

  // Sanitize control characters inside strings
  jsonStr = sanitizeJsonString(jsonStr);

  try {
    return { parsed: JSON.parse(jsonStr), tokens };
  } catch (e) {
    // Try repair
    const repaired = repairJson(jsonStr);
    return { parsed: JSON.parse(repaired), tokens };
  }
}

// Sanitize unescaped control chars in JSON string values
function sanitizeJsonString(str: string): string {
  let result = "";
  let inStr = false;
  let esc = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (esc) { result += ch; esc = false; continue; }
    if (ch === "\\" && inStr) { result += ch; esc = true; continue; }
    if (ch === '"') { inStr = !inStr; result += ch; continue; }
    if (inStr) {
      if (ch === "\n") { result += "\\n"; continue; }
      if (ch === "\r") { result += "\\r"; continue; }
      if (ch === "\t") { result += "\\t"; continue; }
      if (ch.charCodeAt(0) < 32) { result += "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0"); continue; }
    }
    result += ch;
  }
  return result;
}

// Close unclosed JSON structures
function repairJson(str: string): string {
  let braces = 0, brackets = 0, inStr = false, esc = false;
  for (const ch of str) {
    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{') braces++; else if (ch === '}') braces--;
    if (ch === '[') brackets++; else if (ch === ']') brackets--;
  }
  let r = str.replace(/,\s*$/, '');
  if (inStr) r += '"';
  for (let i = 0; i < brackets; i++) r += ']';
  for (let i = 0; i < braces; i++) r += '}';
  return r;
}

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
  content.risicos?.forEach((r: any, i: number) => {
    if (!r.categorie) errors.push(`Risico ${i + 1}: categorie ontbreekt`);
    if (!r.prioriteit) errors.push(`Risico ${i + 1}: prioriteit ontbreekt`);
    if (!r.maatregelen || r.maatregelen.length === 0) errors.push(`Risico ${i + 1}: geen maatregelen`);
    r.maatregelen?.forEach((m: any, j: number) => {
      if (!m.maatregel) errors.push(`Risico ${i + 1} maatregel ${j + 1}: beschrijving ontbreekt`);
      if (!m.termijn) errors.push(`Risico ${i + 1} maatregel ${j + 1}: termijn ontbreekt`);
    });
  });
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

    // Validate compliance
    const validation = validateRie(generatedContent, tier);
    if (!validation.valid) {
      console.warn(`[${reportId}] Validation warnings:`, validation.errors);
      // Store but mark as needing review if critical errors
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
