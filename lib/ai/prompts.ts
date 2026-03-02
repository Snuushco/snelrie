// ═══════════════════════════════════════════════════════════════
// SnelRIE AI Prompts — Framework-gebaseerd
// Conform rie-framework.md: vaste schema's per tier
// ═══════════════════════════════════════════════════════════════

function buildContext(kennisbank: any, intakeData: any): string {
  return `KENNISBANK BRANCHE: ${kennisbank.naam}
ARBOCATALOGUS: ${kennisbank.arbocatalogus || 'Niet beschikbaar'}
CAO: ${kennisbank.cao || 'Niet beschikbaar'}

WETTELIJKE KADERS:
${kennisbank.wettelijkeKaders?.map((w: any) => `- ${w.wet} ${w.artikel}: ${w.beschrijving}`).join('\n') || 'Geen specifieke kaders'}

RISICO CATEGORIEËN:
${kennisbank.risicoCategorieën?.map((c: any) => `- ${c.naam || c.categorie}: ${c.beschrijving || c.typischeRisicos?.join(', ') || ''}`).join('\n') || 'Algemeen'}

BEDRIJFSGEGEVENS:
- Bedrijfsnaam: ${intakeData.bedrijfsnaam}
- Branche: ${intakeData.branche}
- Aantal medewerkers: ${intakeData.aantalMedewerkers}
- Aantal locaties: ${intakeData.aantalLocaties || 1}
- BHV aanwezig: ${intakeData.bhvAanwezig ? 'Ja' : 'Nee'}
- Aantal BHV'ers: ${intakeData.aantalBhvers || 'Onbekend'}
- Preventiemedewerker: ${intakeData.preventiemedewerker ? 'Ja' : 'Nee'}
- Eerder RI&E gedaan: ${intakeData.eerderRie ? 'Ja' : 'Nee'}
- Werktijden: ${intakeData.werktijden || 'Reguliere kantoortijden'}
- Bijzonderheden: ${intakeData.bijzonderheden || 'Geen'}`;
}

const SYSTEM_BASE = `Je bent een gecertificeerde arbodeskundige en RI&E-expert met ruime ervaring in het opstellen van risico-inventarisaties conform de Arbowet. Schrijf altijd in correct, professioneel Nederlands. Verwijs naar specifieke wetsartikelen (Arbowet, Arbobesluit, Arboregelingen). Antwoord UITSLUITEND met valide JSON. Geen tekst ervoor of erna. Begin direct met { of [.`;

// ═══════════════════════════════════════════════════════════════
// Tier configuratie voor prompts
// ═══════════════════════════════════════════════════════════════
export const PROMPT_TIER_CONFIG: Record<string, {
  totalRisicos: number;
  maatregelenPerRisico: number;
  pvaItems: number;
  wettelijk: number;
}> = {
  GRATIS:       { totalRisicos: 3,  maatregelenPerRisico: 1, pvaItems: 0,  wettelijk: 0 },
  BASIS:        { totalRisicos: 5,  maatregelenPerRisico: 1, pvaItems: 5,  wettelijk: 0 },
  PROFESSIONAL: { totalRisicos: 12, maatregelenPerRisico: 3, pvaItems: 12, wettelijk: 8 },
  ENTERPRISE:   { totalRisicos: 15, maatregelenPerRisico: 3, pvaItems: 15, wettelijk: 8 },
};

// ═══════════════════════════════════════════════════════════════
// Step 1: Bedrijfsprofiel + Samenvatting
// ═══════════════════════════════════════════════════════════════
export function buildProfielPrompt(kennisbank: any, intakeData: any) {
  return {
    system: SYSTEM_BASE,
    user: `${buildContext(kennisbank, intakeData)}

Genereer een uitgebreid bedrijfsprofiel en executive samenvatting voor de RI&E.

JSON format (houd je EXACT aan dit schema):
{
  "samenvatting": "Executive summary van de RI&E (3-4 alinea's). Beschrijf: 1) aanleiding en doel, 2) scope van de inventarisatie, 3) belangrijkste bevindingen op hoofdlijnen, 4) urgentie en aanbeveling voor opvolging.",
  "bedrijfsprofiel": {
    "naam": "${intakeData.bedrijfsnaam}",
    "branche": "${intakeData.branche}",
    "aantalMedewerkers": ${intakeData.aantalMedewerkers},
    "aantalLocaties": ${intakeData.aantalLocaties || 1},
    "beschrijving": "Uitgebreide beschrijving van het bedrijf, werkzaamheden, type werkplekken, werktijden en bijzonderheden (min 100 woorden)",
    "organisatiestructuur": "Beschrijving van relevante organisatiestructuur voor arbo-verantwoordelijkheden",
    "typeWerkzaamheden": ["werkzaamheid1", "werkzaamheid2", "werkzaamheid3"],
    "werktijden": "Beschrijving werktijden (dag/nacht/onregelmatig)",
    "bijzonderheden": ["bijzonderheid1", "bijzonderheid2"]
  }
}`
  };
}

// ═══════════════════════════════════════════════════════════════
// Step 2: Arbobeleid & Organisatie
// ═══════════════════════════════════════════════════════════════
export function buildArbobeleidPrompt(kennisbank: any, intakeData: any) {
  return {
    system: SYSTEM_BASE,
    user: `${buildContext(kennisbank, intakeData)}

Genereer een beoordeling van het arbobeleid en de arbo-organisatie van dit bedrijf.
Baseer je op de intake-gegevens en vul aan met wat gangbaar is in de branche.

JSON format (houd je EXACT aan dit schema):
{
  "arbobeleid": {
    "preventiemedewerker": {
      "aanwezig": ${intakeData.preventiemedewerker ? 'true' : 'false'},
      "toelichting": "Beschrijving van de rol en taken van de preventiemedewerker, of advies als er geen is"
    },
    "bhvOrganisatie": {
      "aanwezig": ${intakeData.bhvAanwezig ? 'true' : 'false'},
      "aantalBhvers": ${intakeData.aantalBhvers || 0},
      "toelichting": "Beoordeling of het aantal BHV'ers voldoende is conform Arbowet art. 15"
    },
    "arbodienst": {
      "contractvorm": "Beschrijving van de contractvorm (maatwerkregeling/vangnetregeling)",
      "toelichting": "Advies over de contractvorm"
    },
    "eerderRie": {
      "uitgevoerd": ${intakeData.eerderRie ? 'true' : 'false'},
      "toelichting": "Relevante context over eerdere RI&E of het ontbreken daarvan"
    },
    "arbocatalogus": "${kennisbank.arbocatalogus || 'Niet specifiek van toepassing'}",
    "ondernemingsraad": {
      "aanwezig": ${(intakeData.aantalMedewerkers || 0) >= 50 ? 'true' : 'false'},
      "toelichting": "Of een OR/PVT verplicht is en wat de rol is bij de RI&E"
    }
  }
}`
  };
}

// ═══════════════════════════════════════════════════════════════
// Step 3: Risico's per batch
// ═══════════════════════════════════════════════════════════════
export function buildRisicosPrompt(
  kennisbank: any,
  intakeData: any,
  tier: string,
  batchIndex: number,
  totalBatches: number
) {
  const config = PROMPT_TIER_CONFIG[tier] || PROMPT_TIER_CONFIG.GRATIS;
  const maxPerBatch = 5;
  const startIdx = batchIndex * maxPerBatch;
  const count = Math.min(maxPerBatch, config.totalRisicos - startIdx);
  const minMaatregelen = config.maatregelenPerRisico;

  const categorieHints = [
    "Fysieke belasting", "Psychosociale arbeidsbelasting", "Veiligheid / valgevaar",
    "BHV en noodprocedures", "Beeldschermwerk / ergonomie", "Gevaarlijke stoffen",
    "Binnenklimaat / ventilatie", "Geluid en trillingen", "Machineveiligheid",
    "Biologische agentia", "Elektriciteit", "Brand en explosie",
    "Verkeer en transport", "Alleen werken", "Zwangerschap en arbeid",
  ];

  return {
    system: SYSTEM_BASE,
    user: `${buildContext(kennisbank, intakeData)}

Genereer risico's ${startIdx + 1} t/m ${startIdx + count} van ${config.totalRisicos} totaal.
Dit is batch ${batchIndex + 1} van ${totalBatches}. Gebruik UNIEKE categorieën per batch.

Mogelijke categorieën (kies de meest relevante voor deze branche):
${categorieHints.slice(startIdx, startIdx + count + 3).map(c => `- ${c}`).join('\n')}

VERPLICHTE VELDEN per risico — SLAAG GEEN ENKEL VELD OVER:

JSON format — een array van EXACT ${count} risico objecten:
[
  {
    "id": "risico_${startIdx + 1}",
    "categorie": "Naam categorie (uniek per risico)",
    "beschrijving": "Gedetailleerde beschrijving van het risico, wat het gevaar is en hoe het zich manifesteert (min 2 zinnen)",
    "wieBlootgesteld": "Welke medewerkers worden blootgesteld en hoeveel (bijv. 'Alle 15 kantoormedewerkers')",
    "frequentie": "Hoe vaak en hoe lang is de blootstelling (bijv. 'Dagelijks, 6-8 uur')",
    "ernst": "Wat kan het gevolg zijn (bijv. 'Chronische rugklachten, langdurig verzuim')",
    "kans": 1-5,
    "effect": 1-5,
    "risicoScore": 1-25,
    "prioriteit": "hoog|midden|laag",
    "wettelijkKader": "Specifiek wetsartikel (bijv. 'Arbobesluit art. 5.4 - Beeldschermwerk')",
    "huidigeBeheersing": "Wat het bedrijf al doet om dit risico te beheersen (concreet, niet 'onbekend')",
    "gevaren": ["gevaar1", "gevaar2", "gevaar3"],
    "maatregelen": [
      {
        "maatregel": "Concrete, uitvoerbare maatregel (geen vage beschrijving)",
        "type": "bronmaatregel|collectief|individueel|organisatorisch",
        "prioriteit": "hoog|midden|laag",
        "verantwoordelijke": "Concrete functie/rol (bijv. 'Preventiemedewerker', 'Leidinggevende', 'HR-manager')",
        "deadline": "Concrete termijn (bijv. 'Binnen 3 maanden', 'Q2 2025', 'Direct')",
        "kostenindicatie": "Geschatte kosten (bijv. '€500-1000', 'Geen extra kosten', '€2000 eenmalig')"
      }
    ]
  }
]

BELANGRIJK:
- risicoScore = kans × effect (1-25 schaal)
- Prioriteit: hoog bij score ≥18, midden bij 12-17, laag bij ≤11
- Elke risico MOET minimaal ${minMaatregelen} maatregelen hebben
- Elke maatregel MOET alle 6 velden bevatten (maatregel, type, prioriteit, verantwoordelijke, deadline, kostenindicatie)
- Maak maatregelen concreet en branche-specifiek, niet generiek
- Genereer EXACT ${count} risico's`
  };
}

// ═══════════════════════════════════════════════════════════════
// Step 4: Plan van Aanpak
// ═══════════════════════════════════════════════════════════════
export function buildPvaPrompt(kennisbank: any, intakeData: any, risicos: any[], tier: string) {
  const config = PROMPT_TIER_CONFIG[tier] || PROMPT_TIER_CONFIG.BASIS;
  
  const risicosOverzicht = risicos.map(r =>
    `- ${r.id}: ${r.categorie} (score: ${r.risicoScore || '?'}, prio: ${r.prioriteit}) — Maatregelen: ${r.maatregelen?.map((m: any) => m.maatregel).join('; ') || 'geen'}`
  ).join('\n');

  const isBasis = tier === 'BASIS';
  const isEnterprise = tier === 'ENTERPRISE';
  const isProfessional = tier === 'PROFESSIONAL' || isEnterprise;
  const showKosten = isProfessional;

  const professionalExtra = isProfessional ? `
- "risicoBeschrijving" moet een VOLLEDIGE beschrijving zijn van het gekoppelde risico (2-3 zinnen), niet slechts de categorienaam
- Maak elke maatregel UITGEBREID en specifiek (minimaal 2 zinnen): wat precies moet er gebeuren, hoe, en wat is het verwachte resultaat
- Voeg bij elke maatregel een realistische kostenindicatie toe met een bereik (bijv. '€500-1500')` : '';

  const enterpriseExtra = isEnterprise ? `
- Voeg per item een "implementatieStappen" array toe met 2-4 concrete stappen om de maatregel te implementeren
- Voeg "verwachtResultaat" toe: wat levert deze maatregel concreet op (meetbaar indien mogelijk)
- Kostenindicatie MOET een numeriek bereik bevatten (bijv. '€500-1500') voor budgetberekening` : '';

  return {
    system: SYSTEM_BASE,
    user: `${buildContext(kennisbank, intakeData)}

Op basis van deze geïdentificeerde risico's:
${risicosOverzicht}

Genereer een Plan van Aanpak met minimaal ${config.pvaItems} concrete actiepunten.
Sorteer op prioriteit (hoog eerst), daarna op risicoscore (hoog eerst).

VERPLICHTE VELDEN per PvA-item — SLAAG GEEN ENKEL VELD OVER:

JSON format — een array:
[
  {
    "nummer": 1,
    ${isBasis ? '' : '"gekoppeldRisico": "risico_1",\n    '}"risicoBeschrijving": "${isProfessional ? 'Volledige beschrijving van het gekoppelde risico en waarom dit prioriteit heeft (2-3 zinnen)' : 'Korte beschrijving'}",
    "maatregel": "${isProfessional ? 'Uitgebreide, concrete en uitvoerbare maatregel met specifieke acties en verwacht resultaat (min 2 zinnen)' : 'Concrete, uitvoerbare maatregel (1 zin)'}",
    ${isBasis ? '' : '"typeMaatregel": "bronmaatregel|collectief|individueel|organisatorisch",\n    '}"prioriteit": "hoog|midden|laag",
    "verantwoordelijke": "Concrete functie/rol",
    "deadline": "Concrete datum of periode (bijv. 'Q2 2025', 'Binnen 1 maand')",
    ${showKosten ? `"kostenindicatie": "Geschatte kosten met bereik (bijv. '€500-1000', 'Geen extra kosten')",` : ''}
    ${isEnterprise ? `"implementatieStappen": ["Stap 1: ...", "Stap 2: ...", "Stap 3: ..."],
    "verwachtResultaat": "Meetbaar resultaat van deze maatregel",` : ''}
    "status": "nog niet gestart"
  }
]

BELANGRIJK:
- Minimaal ${config.pvaItems} items
- Elk item MOET alle verplichte velden bevatten
- Deadlines moeten realistisch en concreet zijn
- Verantwoordelijke moet een functie/rol zijn, niet "het bedrijf"
- Sorteer: hoog prioriteit eerst
- Volg de arbeidshygiënische strategie: bronmaatregelen > collectief > individueel > organisatorisch${professionalExtra}${enterpriseExtra}`
  };
}

// ═══════════════════════════════════════════════════════════════
// Step 5: Wettelijke verplichtingen (Enterprise)
// ═══════════════════════════════════════════════════════════════
export function buildWettelijkPrompt(kennisbank: any, intakeData: any) {
  return {
    system: SYSTEM_BASE,
    user: `${buildContext(kennisbank, intakeData)}

Beoordeel de wettelijke verplichtingen voor dit bedrijf op het gebied van arbeidsomstandigheden.
Controleer minimaal 8 verplichtingen.

JSON format — een array:
[
  {
    "verplichting": "Naam van de verplichting",
    "wet": "Specifieke wet en artikel (bijv. 'Arbowet art. 5 lid 1')",
    "status": "voldoet|aandachtspunt|niet_in_orde",
    "toelichting": "Concrete toelichting waarom deze status, en wat eventueel moet verbeteren (min 2 zinnen)"
  }
]

Beoordeel minimaal deze verplichtingen:
1. RI&E-plicht (Arbowet art. 5)
2. Plan van Aanpak (Arbowet art. 5 lid 3)
3. BHV-organisatie (Arbowet art. 15)
4. Preventiemedewerker (Arbowet art. 13)
5. Voorlichting en onderricht (Arbowet art. 8)
6. PAGO/PMO (Arbobesluit art. 2.14)
7. Arbodienst/bedrijfsarts (Arbowet art. 14)
8. Beleid agressie/geweld (Arbowet art. 3 lid 2)
Plus eventueel branchespecifieke verplichtingen.`
  };
}

// ═══════════════════════════════════════════════════════════════
// Step 6: Aanbevelingen & Conclusie
// ═══════════════════════════════════════════════════════════════
export function buildAanbevelingenPrompt(kennisbank: any, intakeData: any, risicos: any[], tier: string) {
  const config = PROMPT_TIER_CONFIG[tier] || PROMPT_TIER_CONFIG.BASIS;
  
  const topRisicos = risicos
    .sort((a: any, b: any) => (b.risicoScore || 0) - (a.risicoScore || 0))
    .slice(0, 5)
    .map(r => `- ${r.categorie}: score ${r.risicoScore || '?'} (${r.prioriteit})`)
    .join('\n');

  return {
    system: SYSTEM_BASE,
    user: `${buildContext(kennisbank, intakeData)}

Top risico's gevonden:
${topRisicos}

Totaal ${risicos.length} risico's geïnventariseerd.

Genereer aanbevelingen en een conclusie voor de RI&E.

JSON format:
{
  "conclusie": "Samenvatting van de bevindingen in 2-3 alinea's. Benoem het totaal aantal risico's, de verdeling over prioriteiten, en de algehele arbo-situatie.",
  "topPrioriteiten": [
    {
      "nummer": 1,
      "titel": "Kort en krachtig (bijv. 'Verbetering BHV-organisatie')",
      "beschrijving": "Waarom dit prioriteit heeft en wat er moet gebeuren (2-3 zinnen)",
      "verwachteImpact": "Wat het oplevert als dit wordt opgelost"
    }
  ],
  "aanbevelingToetsing": "${intakeData.aantalMedewerkers > 25 ? 'Verplichte toetsing door gecertificeerde arbodienst conform Arbowet art. 14' : 'Toetsing aanbevolen maar niet wettelijk verplicht (<25 medewerkers)'}",
  "aanbevelingActualisatie": "Advies over wanneer en hoe de RI&E te actualiseren"${tier === 'ENTERPRISE' ? `,
  "implementatiepad": [
    {
      "fase": "Fase 1: Direct (0-3 maanden)",
      "acties": ["actie1", "actie2"],
      "doel": "Wat bereikt moet worden in deze fase"
    }
  ]` : ''}
}

Genereer minimaal 3 top-prioriteiten.${tier === 'ENTERPRISE' ? ' Genereer minimaal 3 implementatiefasen.' : ''}`
  };
}

// Legacy compatibility
export function buildRiePrompt(kennisbank: any, intakeData: any, tier: string) {
  return buildProfielPrompt(kennisbank, intakeData);
}
