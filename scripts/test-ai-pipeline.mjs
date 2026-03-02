/**
 * test-ai-pipeline.mjs — Test the SnelRIE AI pipeline end-to-end
 * 
 * Calls the ACTUAL AI pipeline (OpenRouter → Claude Haiku 4.5) for each paid tier,
 * validates the output against all business rules, and generates PDFs.
 * 
 * Usage:  node scripts/test-ai-pipeline.mjs [--tier basis|professional|enterprise] [--dry-run]
 * 
 * ⚠️  Each run costs real money (API calls). Use --dry-run to validate existing output files.
 */

import fs from 'fs';
import path from 'path';

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'REDACTED';
const MODEL = 'anthropic/claude-haiku-4.5';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const PDF_API_URL = 'https://snelrie.nl/api/rie/pdf';
const OUTPUT_DIR = path.resolve('C:\\Users\\Gebruiker\\.openclaw\\workspace\\output');

const INTAKE_DATA = {
  bedrijfsnaam: "Praesidion Security B.V.",
  branche: "Beveiliging",
  aantalMedewerkers: 15,
  aantalLocaties: 3,
  bhvAanwezig: true,
  aantalBhvers: 4,
  preventiemedewerker: true,
  eerderRie: false,
  werktijden: "24/7 operatie met wisselende diensten (dag, avond, nacht)",
  bijzonderheden: "Alleen werken tijdens nachtdiensten, regelmatig contact met agressieve personen, mobiele surveillance",
};

const KENNISBANK = {
  naam: "Particuliere Beveiliging",
  arbocatalogus: "Arbocatalogus Particuliere Beveiliging (Nederlandse Veiligheidsbranche)",
  cao: "CAO Particuliere Beveiliging",
  wettelijkeKaders: [
    { wet: "Arbowet", artikel: "art. 3 lid 2", beschrijving: "Beleid agressie en geweld" },
    { wet: "Arbowet", artikel: "art. 5", beschrijving: "RI&E verplichting" },
    { wet: "Arbowet", artikel: "art. 8", beschrijving: "Voorlichting en onderricht" },
    { wet: "Arbowet", artikel: "art. 15", beschrijving: "BHV-organisatie" },
    { wet: "Arbobesluit", artikel: "art. 2.15", beschrijving: "Maatregelen ter voorkoming van psychosociale arbeidsbelasting" },
    { wet: "Arbeidstijdenwet", artikel: "art. 5:8", beschrijving: "Nachtdienst" },
  ],
  risicoCategorieën: [
    { naam: "Fysieke belasting", beschrijving: "Langdurig staan, tillen hekwerken" },
    { naam: "Psychosociale arbeidsbelasting", beschrijving: "Agressie, werkdruk, nachtdiensten" },
    { naam: "Agressie en geweld", beschrijving: "Confrontaties met agressieve personen" },
    { naam: "Alleen werken", beschrijving: "Solo nacht-/weekenddiensten" },
    { naam: "BHV en noodprocedures", beschrijving: "Ontruiming, EHBO, brandbestrijding" },
  ],
};

const TIER_CONFIG = {
  BASIS:        { totalRisicos: 5,  maatregelenPerRisico: 1, pvaItems: 5,  wettelijk: 0 },
  PROFESSIONAL: { totalRisicos: 12, maatregelenPerRisico: 3, pvaItems: 12, wettelijk: 8 },
  ENTERPRISE:   { totalRisicos: 15, maatregelenPerRisico: 3, pvaItems: 15, wettelijk: 8 },
};

// ═══════════════════════════════════════════════════════════════
// Prompt builders (mirrored from lib/ai/prompts.ts)
// ═══════════════════════════════════════════════════════════════
function buildContext() {
  return `KENNISBANK BRANCHE: ${KENNISBANK.naam}
ARBOCATALOGUS: ${KENNISBANK.arbocatalogus}
CAO: ${KENNISBANK.cao}

WETTELIJKE KADERS:
${KENNISBANK.wettelijkeKaders.map(w => `- ${w.wet} ${w.artikel}: ${w.beschrijving}`).join('\n')}

RISICO CATEGORIEËN:
${KENNISBANK.risicoCategorieën.map(c => `- ${c.naam}: ${c.beschrijving}`).join('\n')}

BEDRIJFSGEGEVENS:
- Bedrijfsnaam: ${INTAKE_DATA.bedrijfsnaam}
- Branche: ${INTAKE_DATA.branche}
- Aantal medewerkers: ${INTAKE_DATA.aantalMedewerkers}
- Aantal locaties: ${INTAKE_DATA.aantalLocaties}
- BHV aanwezig: Ja
- Aantal BHV'ers: ${INTAKE_DATA.aantalBhvers}
- Preventiemedewerker: Ja
- Eerder RI&E gedaan: Nee
- Werktijden: ${INTAKE_DATA.werktijden}
- Bijzonderheden: ${INTAKE_DATA.bijzonderheden}`;
}

const SYSTEM_BASE = `Je bent een gecertificeerde arbodeskundige en RI&E-expert met ruime ervaring in het opstellen van risico-inventarisaties conform de Arbowet. Schrijf altijd in correct, professioneel Nederlands. Verwijs naar specifieke wetsartikelen (Arbowet, Arbobesluit, Arboregelingen). Antwoord UITSLUITEND met valide JSON. Geen tekst ervoor of erna. Begin direct met { of [.`;

function buildProfielPrompt() {
  return {
    system: SYSTEM_BASE,
    user: `${buildContext()}\n\nGenereer een uitgebreid bedrijfsprofiel en executive samenvatting voor de RI&E.\n\nJSON format:\n{\n  "samenvatting": "Executive summary (3-4 alinea's)",\n  "bedrijfsprofiel": {\n    "naam": "${INTAKE_DATA.bedrijfsnaam}",\n    "branche": "${INTAKE_DATA.branche}",\n    "aantalMedewerkers": ${INTAKE_DATA.aantalMedewerkers},\n    "aantalLocaties": ${INTAKE_DATA.aantalLocaties},\n    "beschrijving": "Uitgebreide beschrijving (min 100 woorden)",\n    "organisatiestructuur": "Beschrijving organisatiestructuur",\n    "typeWerkzaamheden": ["werkzaamheid1", "werkzaamheid2"],\n    "werktijden": "Beschrijving werktijden",\n    "bijzonderheden": ["bijzonderheid1"]\n  }\n}`
  };
}

function buildRisicosPrompt(tier, batchIndex, existingCategories = []) {
  const config = TIER_CONFIG[tier];
  const maxPerBatch = 5;
  const startIdx = batchIndex * maxPerBatch;
  const count = Math.min(maxPerBatch, config.totalRisicos - startIdx);
  const minMaatregelen = config.maatregelenPerRisico;

  return {
    system: SYSTEM_BASE,
    user: `${buildContext()}\n\nGenereer risico's ${startIdx + 1} t/m ${startIdx + count} van ${config.totalRisicos} totaal.\nBatch ${batchIndex + 1}. Gebruik UNIEKE categorieën.\n\n${existingCategories.length > 0 ? `AL GEBRUIKTE categorieën (NIET opnieuw gebruiken): ${existingCategories.join(', ')}\n\n` : ''}JSON format — array van EXACT ${count} risico objecten:\n[\n  {\n    "id": "risico_${startIdx + 1}",\n    "categorie": "Naam categorie (uniek)",\n    "beschrijving": "Gedetailleerde beschrijving (min 2 zinnen)",\n    "wieBlootgesteld": "Welke medewerkers",\n    "frequentie": "Hoe vaak",\n    "ernst": "Mogelijke gevolgen",\n    "kans": 1-5,\n    "effect": 1-5,\n    "risicoScore": "kans x effect (1-25)",\n    "prioriteit": "hoog|midden|laag",\n    "wettelijkKader": "Specifiek wetsartikel",\n    "huidigeBeheersing": "Wat bedrijf al doet",\n    "gevaren": ["gevaar1", "gevaar2", "gevaar3"],\n    "maatregelen": [\n      {\n        "maatregel": "Concrete maatregel",\n        "type": "bronmaatregel|collectief|individueel|organisatorisch",\n        "prioriteit": "hoog|midden|laag",\n        "verantwoordelijke": "Functie/rol",\n        "deadline": "Relatieve deadline (bijv. 'Binnen 1 maand')",\n        "kostenindicatie": "€500-1000"\n      }\n    ]\n  }\n]\n\nBELANGRIJK:\n- risicoScore = kans × effect\n- Prioriteit: hoog ≥18, midden 12-17, laag ≤11\n- ${tier === 'BASIS' ? '1 maatregel per risico' : `Minimaal ${minMaatregelen} maatregelen per risico`}\n- Alle 6 velden per maatregel verplicht\n- Gebruik relatieve deadlines, NOOIT absolute datums\n- EXACT ${count} risico's`
  };
}

function buildPvaPrompt(risicos, tier) {
  const config = TIER_CONFIG[tier];
  const isBasis = tier === 'BASIS';
  const isProfessional = tier === 'PROFESSIONAL' || tier === 'ENTERPRISE';
  
  const overzicht = risicos.map(r =>
    `- ${r.id}: ${r.categorie} (score: ${r.risicoScore}, prio: ${r.prioriteit})`
  ).join('\n');

  return {
    system: SYSTEM_BASE,
    user: `${buildContext()}\n\nRisico's:\n${overzicht}\n\nGenereer Plan van Aanpak met minimaal ${config.pvaItems} items.\nSorteer op prioriteit (hoog eerst).\n\nJSON array:\n[\n  {\n    "nummer": 1,\n    ${!isBasis ? '"gekoppeldRisico": "risico_1",\n    ' : ''}"risicoBeschrijving": "Beschrijving",\n    "maatregel": "Concrete maatregel",\n    ${!isBasis ? '"typeMaatregel": "bronmaatregel|collectief|individueel|organisatorisch",\n    ' : ''}"prioriteit": "hoog|midden|laag",\n    "verantwoordelijke": "Functie/rol",\n    "deadline": "Relatieve deadline (bijv. 'Binnen 3 maanden')",\n    ${isProfessional ? '"kostenindicatie": "€500-1000",\n    ' : ''}"status": "nog niet gestart"\n  }\n]\n\nGebruik ALTIJD relatieve deadlines (Binnen X maanden), NOOIT absolute datums.`
  };
}

function buildWettelijkPrompt() {
  return {
    system: SYSTEM_BASE,
    user: `${buildContext()}\n\nBeoordeel minimaal 8 wettelijke verplichtingen.\n\nJSON array:\n[\n  {\n    "verplichting": "Naam",\n    "wet": "Wet en artikel",\n    "status": "voldoet|aandachtspunt|niet_in_orde",\n    "toelichting": "Toelichting (min 2 zinnen)"\n  }\n]`
  };
}

function buildAanbevelingenPrompt(risicos, tier) {
  const topRisicos = risicos.sort((a, b) => (b.risicoScore || 0) - (a.risicoScore || 0)).slice(0, 5)
    .map(r => `- ${r.categorie}: score ${r.risicoScore} (${r.prioriteit})`).join('\n');

  return {
    system: SYSTEM_BASE,
    user: `${buildContext()}\n\nTop risico's:\n${topRisicos}\nTotaal ${risicos.length} risico's.\n\nGenereer aanbevelingen:\n{\n  "conclusie": "2-3 alinea's",\n  "topPrioriteiten": [{"nummer": 1, "titel": "...", "beschrijving": "...", "verwachteImpact": "..."}],\n  "aanbevelingToetsing": "...",\n  "aanbevelingActualisatie": "..."${tier === 'ENTERPRISE' ? ',\n  "implementatiepad": [{"fase": "Fase 1: Direct (0-3 maanden)", "acties": ["..."], "doel": "..."}]' : ''}\n}\n\nMinimaal 3 top-prioriteiten.${tier === 'ENTERPRISE' ? ' Minimaal 3 implementatiefasen.' : ''}`
  };
}

function buildArbobeleidPrompt() {
  return {
    system: SYSTEM_BASE,
    user: `${buildContext()}\n\nGenereer beoordeling arbobeleid.\n\nJSON:\n{\n  "arbobeleid": {\n    "preventiemedewerker": {"aanwezig": true, "toelichting": "..."},\n    "bhvOrganisatie": {"aanwezig": true, "aantalBhvers": 4, "toelichting": "..."},\n    "arbodienst": {"contractvorm": "...", "toelichting": "..."},\n    "eerderRie": {"uitgevoerd": false, "toelichting": "..."},\n    "arbocatalogus": "...",\n    "ondernemingsraad": {"aanwezig": false, "toelichting": "..."}\n  }\n}`
  };
}

// ═══════════════════════════════════════════════════════════════
// OpenRouter API caller
// ═══════════════════════════════════════════════════════════════
async function callAI(prompt, label) {
  console.log(`  🤖 Calling AI: ${label}...`);
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://snelrie.nl',
      'X-Title': 'SnelRIE AI Pipeline Test',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      temperature: 0.3,
      max_tokens: 8000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err.substring(0, 300)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty AI response');

  // Strip markdown code fences if present
  const cleaned = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}

// ═══════════════════════════════════════════════════════════════
// AI Pipeline — runs all steps for a tier
// ═══════════════════════════════════════════════════════════════
async function runPipeline(tier) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Running AI pipeline for tier: ${tier}`);
  console.log(`${'═'.repeat(60)}`);

  const config = TIER_CONFIG[tier];

  // Step 1: Bedrijfsprofiel + Samenvatting
  const profiel = await callAI(buildProfielPrompt(), 'Bedrijfsprofiel');

  // Step 2: Arbobeleid (Professional+)
  let arbobeleid = null;
  if (tier !== 'BASIS') {
    arbobeleid = await callAI(buildArbobeleidPrompt(), 'Arbobeleid');
  }

  // Step 3: Risico's (in batches of 5)
  const totalBatches = Math.ceil(config.totalRisicos / 5);
  let allRisicos = [];
  let existingCategories = [];

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchResult = await callAI(
      buildRisicosPrompt(tier, batch, existingCategories),
      `Risico's batch ${batch + 1}/${totalBatches}`
    );
    const risicos = Array.isArray(batchResult) ? batchResult : [batchResult];
    allRisicos.push(...risicos);
    existingCategories.push(...risicos.map(r => r.categorie));
  }

  // Step 4: Plan van Aanpak
  const pva = await callAI(buildPvaPrompt(allRisicos, tier), 'Plan van Aanpak');

  // Step 5: Wettelijke verplichtingen (Professional+)
  let wettelijk = null;
  if (tier === 'PROFESSIONAL' || tier === 'ENTERPRISE') {
    wettelijk = await callAI(buildWettelijkPrompt(), 'Wettelijke verplichtingen');
  }

  // Step 6: Aanbevelingen (Professional+)
  let aanbevelingen = null;
  if (tier !== 'BASIS') {
    aanbevelingen = await callAI(buildAanbevelingenPrompt(allRisicos, tier), 'Aanbevelingen');
  }

  // Assemble final output
  const output = {
    ...profiel,
    risicos: allRisicos,
    planVanAanpak: Array.isArray(pva) ? pva : [],
  };
  if (arbobeleid) Object.assign(output, arbobeleid);
  if (wettelijk) output.wettelijkeVerplichtingen = Array.isArray(wettelijk) ? wettelijk : [];
  if (aanbevelingen) output.aanbevelingen = aanbevelingen;

  return output;
}

// ═══════════════════════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════════════════════
function validate(content, tier) {
  const config = TIER_CONFIG[tier];
  const errors = [];
  const warnings = [];

  const fail = (msg) => errors.push(`❌ ${msg}`);
  const warn = (msg) => warnings.push(`⚠️  ${msg}`);
  const pass = (msg) => console.log(`  ✅ ${msg}`);

  console.log(`\n  📋 Validating ${tier}...`);

  // 1. Risico count
  const risicos = content.risicos || [];
  if (risicos.length === config.totalRisicos) pass(`Risico count: ${risicos.length}/${config.totalRisicos}`);
  else fail(`Risico count: got ${risicos.length}, expected ${config.totalRisicos}`);

  // 2. Duplicate categories
  const cats = risicos.map(r => r.categorie?.toLowerCase());
  const dupes = cats.filter((c, i) => cats.indexOf(c) !== i);
  if (dupes.length === 0) pass('No duplicate categories');
  else fail(`Duplicate categories: ${[...new Set(dupes)].join(', ')}`);

  // 3. Empty risico objects
  const emptyRisicos = risicos.filter(r => !r.categorie || !r.beschrijving);
  if (emptyRisicos.length === 0) pass('No empty risico objects');
  else fail(`${emptyRisicos.length} empty risico objects`);

  // 4. Required fields on risico
  const requiredRisicoFields = ['id', 'categorie', 'beschrijving', 'wieBlootgesteld', 'frequentie', 'ernst', 'kans', 'effect', 'risicoScore', 'prioriteit', 'wettelijkKader', 'huidigeBeheersing', 'gevaren', 'maatregelen'];
  let missingRisicoFields = 0;
  risicos.forEach((r, i) => {
    requiredRisicoFields.forEach(f => {
      if (r[f] === undefined || r[f] === null || r[f] === '') {
        fail(`risico[${i}] (${r.categorie || r.id || i}) missing field: ${f}`);
        missingRisicoFields++;
      }
    });
  });
  if (missingRisicoFields === 0) pass('All required risico fields present');

  // 5. Required fields on maatregelen
  const requiredMaatregelFields = ['maatregel', 'type', 'prioriteit', 'verantwoordelijke', 'deadline', 'kostenindicatie'];
  let missingMaatregelFields = 0;
  let maatregelCountIssues = 0;
  risicos.forEach((r, i) => {
    const maatregelen = r.maatregelen || [];
    if (maatregelen.length < config.maatregelenPerRisico) {
      fail(`risico[${i}] (${r.categorie}) has ${maatregelen.length} maatregelen, need ${config.maatregelenPerRisico}`);
      maatregelCountIssues++;
    }
    maatregelen.forEach((m, mi) => {
      requiredMaatregelFields.forEach(f => {
        if (m[f] === undefined || m[f] === null || m[f] === '') {
          fail(`risico[${i}].maatregelen[${mi}] missing: ${f}`);
          missingMaatregelFields++;
        }
      });
    });
  });
  if (missingMaatregelFields === 0 && maatregelCountIssues === 0) pass('All maatregel fields present and counts correct');

  // 6. PvA validation
  const pva = content.planVanAanpak || [];
  if (pva.length >= config.pvaItems) pass(`PvA items: ${pva.length}/${config.pvaItems}`);
  else fail(`PvA items: got ${pva.length}, need ${config.pvaItems}`);

  // Check PvA is flat array, not nested
  if (Array.isArray(pva) && pva.every(item => !Array.isArray(item))) pass('PvA is flat (not nested)');
  else fail('PvA appears nested — should be flat array');

  // Check PvA numbering is sequential
  const pvaNumbers = pva.map(p => p.nummer);
  const expectedNumbers = pva.map((_, i) => i + 1);
  if (JSON.stringify(pvaNumbers) === JSON.stringify(expectedNumbers)) pass('PvA numbering sequential');
  else warn(`PvA numbering gaps: [${pvaNumbers.join(',')}]`);

  // 7. Wettelijke verplichtingen (Professional+)
  if (tier === 'PROFESSIONAL' || tier === 'ENTERPRISE') {
    const wv = content.wettelijkeVerplichtingen || [];
    if (wv.length >= 8) pass(`Wettelijke verplichtingen: ${wv.length}`);
    else fail(`Wettelijke verplichtingen: got ${wv.length}, need 8+`);
  }

  // 8. No 'kostesindicatie' typo (should be 'kostenindicatie')
  const json = JSON.stringify(content);
  if (!json.includes('"kostesindicatie"')) pass('No kostesindicatie typo');
  else fail('Found "kostesindicatie" typo — should be "kostenindicatie"');

  // 9. No absolute dates (2024/2025/2026)
  const datePattern = /\b20(2[4-9]|[3-9]\d)\b/;
  let absoluteDates = 0;
  const checkDates = (obj, path = '') => {
    if (typeof obj === 'string' && datePattern.test(obj)) {
      // Allow in wettelijkKader references
      if (!path.includes('wettelijkKader') && !path.includes('wet') && !path.includes('toelichting')) {
        fail(`Absolute date found at ${path}: "${obj.substring(0, 80)}"`);
        absoluteDates++;
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((v, i) => checkDates(v, `${path}[${i}]`));
    } else if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([k, v]) => checkDates(v, `${path}.${k}`));
    }
  };
  // Check deadlines specifically
  const allDeadlines = [
    ...risicos.flatMap(r => (r.maatregelen || []).map(m => m.deadline)),
    ...pva.map(p => p.deadline),
  ].filter(Boolean);
  const badDeadlines = allDeadlines.filter(d => datePattern.test(d));
  if (badDeadlines.length === 0) pass('All deadlines are relative (no absolute dates)');
  else fail(`${badDeadlines.length} absolute date deadlines: ${badDeadlines.slice(0, 3).join(', ')}`);

  // 10. Samenvatting present
  if (content.samenvatting && content.samenvatting.length > 100) pass('Samenvatting present');
  else fail('Samenvatting missing or too short');

  // 11. Bedrijfsprofiel present
  if (content.bedrijfsprofiel?.naam) pass('Bedrijfsprofiel present');
  else fail('Bedrijfsprofiel missing');

  // Summary
  console.log(`\n  ${'─'.repeat(50)}`);
  console.log(`  Results for ${tier}: ${errors.length} errors, ${warnings.length} warnings`);
  if (errors.length > 0) {
    console.log(`\n  ERRORS:`);
    errors.forEach(e => console.log(`    ${e}`));
  }
  if (warnings.length > 0) {
    console.log(`\n  WARNINGS:`);
    warnings.forEach(w => console.log(`    ${w}`));
  }

  return { errors, warnings, passed: errors.length === 0 };
}

// ═══════════════════════════════════════════════════════════════
// PDF generation
// ═══════════════════════════════════════════════════════════════
async function generatePdf(content, tier) {
  console.log(`  📄 Generating PDF for ${tier}...`);
  
  const payload = {
    bedrijfsnaam: INTAKE_DATA.bedrijfsnaam,
    branche: INTAKE_DATA.branche,
    aantalMedewerkers: INTAKE_DATA.aantalMedewerkers,
    aantalLocaties: INTAKE_DATA.aantalLocaties,
    tier: tier,
    datum: new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }),
    generatedContent: content,
  };

  if (tier === 'ENTERPRISE') {
    payload.whiteLabel = { companyName: INTAKE_DATA.bedrijfsnaam, primaryColor: "#1e3a5f" };
  }

  const res = await fetch(PDF_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`  ❌ PDF failed: ${res.status} - ${err.substring(0, 200)}`);
    return;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(OUTPUT_DIR, `RIE-AI-${tier}.pdf`);
  fs.writeFileSync(outPath, buffer);
  console.log(`  ✅ PDF saved: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// ═══════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const tierArg = args.find(a => !a.startsWith('--'))?.toUpperCase();
const tiers = tierArg ? [tierArg] : ['BASIS', 'PROFESSIONAL', 'ENTERPRISE'];

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║          SnelRIE AI Pipeline Test                       ║');
console.log(`║  Mode: ${dryRun ? 'DRY RUN (validate existing)' : '⚠️  LIVE (costs money!)   '}              ║`);
console.log(`║  Tiers: ${tiers.join(', ').padEnd(47)}║`);
console.log('╚══════════════════════════════════════════════════════════╝');

const results = {};

for (const tier of tiers) {
  if (!TIER_CONFIG[tier]) {
    console.error(`Unknown tier: ${tier}`);
    continue;
  }

  let content;
  const jsonPath = path.join(OUTPUT_DIR, `snelrie-ai-${tier.toLowerCase()}.json`);

  if (dryRun) {
    if (!fs.existsSync(jsonPath)) {
      console.log(`\n  ⏭️  Skipping ${tier}: no existing output at ${jsonPath}`);
      continue;
    }
    content = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`\n  📂 Loaded existing output for ${tier}`);
  } else {
    content = await runPipeline(tier);
    fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2));
    console.log(`  💾 Saved: ${jsonPath}`);
  }

  // Validate
  results[tier] = validate(content, tier);

  // Generate PDF
  if (!dryRun) {
    try { await generatePdf(content, tier); }
    catch (e) { console.error(`  ❌ PDF error: ${e.message}`); }
  }
}

// Final report
console.log(`\n${'═'.repeat(60)}`);
console.log('  FINAL REPORT');
console.log(`${'═'.repeat(60)}`);
for (const [tier, result] of Object.entries(results)) {
  const icon = result.passed ? '✅' : '❌';
  console.log(`  ${icon} ${tier}: ${result.errors.length} errors, ${result.warnings.length} warnings`);
}
const allPassed = Object.values(results).every(r => r.passed);
console.log(`\n  ${allPassed ? '🎉 All tiers passed!' : '💥 Some tiers failed.'}`);
process.exit(allPassed ? 0 : 1);
