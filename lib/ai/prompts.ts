// Shared context builder for all prompts
function buildContext(kennisbank: any, intakeData: any): string {
  return `KENNISBANK BRANCHE: ${kennisbank.naam}
ARBOCATALOGUS: ${kennisbank.arbocatalogus || 'Niet beschikbaar'}
CAO: ${kennisbank.cao || 'Niet beschikbaar'}

WETTELIJKE KADERS:
${kennisbank.wettelijkeKaders?.map((w: any) => `- ${w.wet} ${w.artikel}: ${w.beschrijving}`).join('\n') || 'Geen specifieke kaders'}

RISICO CATEGORIEËN:
${kennisbank.risicoCategorieën?.map((c: any) => `- ${c.naam}: ${c.beschrijving || ''}`).join('\n') || 'Algemeen'}

BEDRIJFSGEGEVENS:
- Bedrijfsnaam: ${intakeData.bedrijfsnaam}
- Branche: ${intakeData.branche}
- Aantal medewerkers: ${intakeData.aantalMedewerkers}
- Aantal locaties: ${intakeData.aantalLocaties || 1}
- BHV aanwezig: ${intakeData.bhvAanwezig ? 'Ja' : 'Nee'}
- Aantal BHV'ers: ${intakeData.aantalBhvers || 'Onbekend'}
- Preventiemedewerker: ${intakeData.preventiemedewerker ? 'Ja' : 'Nee'}
- Eerder RI&E gedaan: ${intakeData.eerderRie ? 'Ja' : 'Nee'}`;
}

const SYSTEM_BASE = `Je bent een gecertificeerde arbodeskundige en RI&E-expert. Schrijf altijd in correct Nederlands. Verwijs naar specifieke wetsartikelen (Arbowet, Arbobesluit). Antwoord UITSLUITEND met valide JSON. Geen tekst ervoor of erna. Begin direct met {`;

// Step 1: Bedrijfsprofiel + Samenvatting (klein, snel)
export function buildProfielPrompt(kennisbank: any, intakeData: any) {
  return {
    system: SYSTEM_BASE,
    user: `${buildContext(kennisbank, intakeData)}

Genereer een bedrijfsprofiel en samenvatting. JSON format:
{
  "samenvatting": "Executive summary van de RI&E (2-3 alinea's, beschrijf de belangrijkste bevindingen)",
  "bedrijfsprofiel": {
    "naam": "bedrijfsnaam",
    "branche": "branche",
    "aantalMedewerkers": getal,
    "beschrijving": "Korte beschrijving van het bedrijf en werkzaamheden"
  }
}`
  };
}

// Step 2: Risico's per batch (kernstap)
export function buildRisicosPrompt(
  kennisbank: any,
  intakeData: any,
  tier: string,
  batchIndex: number,
  totalBatches: number
) {
  const maxPerBatch = 4;
  const tierConfig: Record<string, { total: number; maatregelen: number }> = {
    GRATIS: { total: 4, maatregelen: 1 },
    BASIS: { total: 6, maatregelen: 2 },
    PROFESSIONAL: { total: 8, maatregelen: 2 },
    ENTERPRISE: { total: 10, maatregelen: 3 },
  };
  const config = tierConfig[tier] || tierConfig.GRATIS;
  const startIdx = batchIndex * maxPerBatch;
  const count = Math.min(maxPerBatch, config.total - startIdx);

  return {
    system: SYSTEM_BASE,
    user: `${buildContext(kennisbank, intakeData)}

Genereer risico's ${startIdx + 1} t/m ${startIdx + count} van ${config.total} totaal voor dit bedrijf.
Elk risico moet ${config.maatregelen} of meer maatregelen bevatten.
Gebruik UNIEKE categorieën (niet herhalen uit eerdere batches).

JSON format — een array van risico objecten:
[
  {
    "id": "risico_${startIdx + 1}",
    "categorie": "Naam categorie",
    "prioriteit": "hoog|midden|laag",
    "risicoScore": 1-25,
    "beschrijving": "Beschrijving van het risico",
    "wettelijkKader": "Relevante wet/artikel",
    "gevaren": ["gevaar1", "gevaar2"],
    "huidigeBeheersing": "Wat het bedrijf al doet",
    "maatregelen": [
      {
        "maatregel": "Concrete maatregel",
        "type": "bronmaatregel|collectief|individueel|organisatorisch",
        "prioriteit": "hoog|midden|laag",
        "termijn": "direct|kort|middel",
        "verantwoordelijke": "Wie",
        "kostenindicatie": "indicatie"
      }
    ]
  }
]

Genereer EXACT ${count} risico's. Antwoord met een JSON array.`
  };
}

// Step 3: Plan van Aanpak (alleen betaalde tiers)
export function buildPvaPrompt(kennisbank: any, intakeData: any, risicos: any[], tier: string) {
  const risicosOverzicht = risicos.map(r =>
    `- ${r.id}: ${r.categorie} (${r.prioriteit}) — ${r.maatregelen?.map((m: any) => m.maatregel).join('; ')}`
  ).join('\n');

  return {
    system: SYSTEM_BASE,
    user: `${buildContext(kennisbank, intakeData)}

Op basis van deze geïdentificeerde risico's en maatregelen:
${risicosOverzicht}

Genereer een Plan van Aanpak. JSON format — een array:
[
  {
    "nummer": 1,
    "maatregel": "Concrete maatregel uit risico",
    "risico": "Gekoppeld risico categorie",
    "prioriteit": "hoog|midden|laag",
    "termijn": "direct|kort|middel",
    "verantwoordelijke": "Functie/rol",
    "deadline": "Concrete periode (bijv. Q2 2025)",
    "status": "nog niet gestart"
  }
]

Genereer minimaal ${tier === 'ENTERPRISE' ? 8 : 5} items, gesorteerd op prioriteit (hoog eerst).`
  };
}

// Step 4: Wettelijke verplichtingen (alleen ENTERPRISE)
export function buildWettelijkPrompt(kennisbank: any, intakeData: any) {
  return {
    system: SYSTEM_BASE,
    user: `${buildContext(kennisbank, intakeData)}

Beoordeel de wettelijke verplichtingen voor dit bedrijf. JSON format — een array:
[
  {
    "verplichting": "Naam van de verplichting",
    "wet": "Specifieke wet en artikel",
    "status": "voldoet|aandachtspunt|niet_in_orde",
    "toelichting": "Korte toelichting"
  }
]

Beoordeel minimaal 6 verplichtingen (RI&E plicht, BHV, preventiemedewerker, voorlichting, PAGO, etc.).`
  };
}

// Legacy single-prompt (kept for reference, not used)
export function buildRiePrompt(kennisbank: any, intakeData: any, tier: string) {
  return buildProfielPrompt(kennisbank, intakeData);
}
