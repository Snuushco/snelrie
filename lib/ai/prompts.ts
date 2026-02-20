export function buildRiePrompt(
  kennisbank: any,
  intakeData: any,
  tier: string
): { system: string; user: string } {
  const system = `Je bent een gecertificeerde arbodeskundige en RI&E-expert. Je genereert professionele Risico-Inventarisaties & Evaluaties (RI&E) voor Nederlandse bedrijven.

REGELS:
- Schrijf altijd in correct Nederlands
- Verwijs naar specifieke wetsartikelen (Arbowet, Arbobesluit, etc.)
- Gebruik de kennisbank als basis, maar personaliseer op basis van de intake
- Prioriteer risico's: hoog/midden/laag met onderbouwing
- Geef concrete, uitvoerbare maatregelen
- Voeg termijnen toe: direct (< 1 maand), kort (1-3 maanden), middel (3-12 maanden)

KENNISBANK BRANCHE: ${kennisbank.naam}
ARBOCATALOGUS: ${kennisbank.arbocatalogus || 'Niet beschikbaar'}
CAO: ${kennisbank.cao || 'Niet beschikbaar'}

WETTELIJKE KADERS:
${kennisbank.wettelijkeKaders?.map((w: any) => `- ${w.wet} ${w.artikel}: ${w.beschrijving}`).join('\n')}

RISICO CATEGORIEËN:
${JSON.stringify(kennisbank.risicoCategorieën, null, 2)}

OUTPUT FORMAT (JSON):
{
  "samenvatting": "Executive summary van de RI&E (2-3 alinea's)",
  "bedrijfsprofiel": {
    "naam": "...",
    "branche": "...",
    "aantalMedewerkers": ...,
    "beschrijving": "Korte beschrijving van het bedrijf op basis van intake"
  },
  "risicos": [
    {
      "id": "uniek_id",
      "categorie": "Naam categorie",
      "prioriteit": "hoog|midden|laag",
      "risicoScore": 1-25,
      "beschrijving": "Uitgebreide beschrijving van het risico voor dit specifieke bedrijf",
      "wettelijkKader": "Relevante wet/artikel",
      "gevaren": ["gevaar1", "gevaar2"],
      "huidigeBeheersing": "Wat het bedrijf al doet (op basis van intake)",
      "maatregelen": [
        {
          "maatregel": "Concrete maatregel",
          "type": "bronmaatregel|collectief|individueel|organisatorisch",
          "prioriteit": "hoog|midden|laag",
          "termijn": "direct|kort|middel",
          "verantwoordelijke": "Wie",
          "kostenindicatie": "€-indicatie"
        }
      ]
    }
  ],
  "planVanAanpak": [
    {
      "nummer": 1,
      "maatregel": "...",
      "risico": "Gekoppeld risico",
      "prioriteit": "hoog|midden|laag",
      "termijn": "direct|kort|middel",
      "verantwoordelijke": "...",
      "deadline": "Concrete datum/periode",
      "status": "nog niet gestart"
    }
  ],
  "wettelijkeVerplichtingen": [
    {
      "verplichting": "...",
      "wet": "...",
      "status": "voldoet|aandachtspunt|niet_in_orde",
      "toelichting": "..."
    }
  ]
}

${tier === 'GRATIS' ? 'BELANGRIJK: Genereer een beknopte RI&E. Maximaal 5 risico categorieën, elk met 1-2 maatregelen. Laat planVanAanpak en wettelijkeVerplichtingen als lege arrays.' : ''}
${tier === 'BASIS' ? 'BELANGRIJK: Genereer GEEN Plan van Aanpak voor de Basis tier. Laat planVanAanpak als lege array. Maximaal 8 risico categorieën.' : ''}
${tier === 'PROFESSIONAL' ? 'Genereer een volledige, professionele RI&E. Minimaal 8 risico categorieën, elk met minimaal 2 maatregelen. Inclusief Plan van Aanpak.' : ''}
${tier === 'ENTERPRISE' ? 'Genereer een uitgebreide, professionele RI&E. Minimaal 10 risico categorieën, elk met minimaal 3 maatregelen. Inclusief uitgebreid Plan van Aanpak en wettelijke verplichtingen.' : ''}
BELANGRIJK: Antwoord UITSLUITEND met valide JSON. Geen tekst ervoor of erna.`;

  const user = `Genereer een RI&E voor het volgende bedrijf:

BEDRIJFSGEGEVENS:
- Bedrijfsnaam: ${intakeData.bedrijfsnaam}
- Branche: ${intakeData.branche}
- Aantal medewerkers: ${intakeData.aantalMedewerkers}
- Aantal locaties: ${intakeData.aantalLocaties || 1}

WERKPLEKINFORMATIE:
${JSON.stringify(intakeData.werkplek || {}, null, 2)}

HUIDIGE SITUATIE:
- BHV aanwezig: ${intakeData.bhvAanwezig ? 'Ja' : 'Nee'}
- Aantal BHV'ers: ${intakeData.aantalBhvers || 'Onbekend'}
- Preventiemedewerker: ${intakeData.preventiemedewerker ? 'Ja' : 'Nee'}
- Eerder RI&E gedaan: ${intakeData.eerderRie ? 'Ja' : 'Nee'}
${intakeData.eerderRie ? `- Laatste RI&E: ${intakeData.laatsteRie || 'Onbekend'}` : ''}

BRANCHE-SPECIFIEKE ANTWOORDEN:
${JSON.stringify(intakeData.brancheSpecifiek || {}, null, 2)}

Genereer nu de volledige RI&E in het gevraagde JSON-format.`;

  return { system, user };
}
