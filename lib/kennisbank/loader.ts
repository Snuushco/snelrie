import fs from "fs";
import path from "path";

const kennisbankCache: Record<string, any> = {};

export async function loadKennisbank(branche: string): Promise<any> {
  if (kennisbankCache[branche]) return kennisbankCache[branche];

  const filePath = path.join(process.cwd(), "kennisbank", `${branche}.json`);

  if (!fs.existsSync(filePath)) {
    // Fallback to generic template
    return getGenericKennisbank(branche);
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  kennisbankCache[branche] = data;
  return data;
}

function getGenericKennisbank(branche: string) {
  return {
    slug: branche,
    naam: branche.charAt(0).toUpperCase() + branche.slice(1),
    beschrijving: `Generieke kennisbank voor de ${branche}`,
    wettelijkeKaders: [
      { wet: "Arbowet", artikel: "Artikel 5", beschrijving: "Verplichting tot het opstellen van een RI&E" },
      { wet: "Arbowet", artikel: "Artikel 8", beschrijving: "Voorlichting en onderricht" },
      { wet: "Arbobesluit", artikel: "Diverse", beschrijving: "Specifieke arbeidsomstandigheden" },
    ],
    risicoCategorieën: [
      { id: "fysieke_belasting", categorie: "Fysieke belasting", prioriteit: "midden", typischeRisicos: ["Tillen", "Lang staan/zitten", "Repeterende bewegingen"], standaardMaatregelen: [] },
      { id: "psychosociale_belasting", categorie: "Psychosociale arbeidsbelasting", prioriteit: "hoog", typischeRisicos: ["Werkdruk", "Agressie", "Ongewenst gedrag"], standaardMaatregelen: [] },
      { id: "beeldschermwerk", categorie: "Beeldschermwerk", prioriteit: "midden", typischeRisicos: ["RSI", "Oogklachten", "Verkeerde werkhouding"], standaardMaatregelen: [] },
      { id: "bhv", categorie: "BHV en noodprocedures", prioriteit: "hoog", typischeRisicos: ["Onvoldoende BHV", "Geen ontruimingsplan"], standaardMaatregelen: [] },
      { id: "gevaarlijke_stoffen", categorie: "Gevaarlijke stoffen", prioriteit: "midden", typischeRisicos: ["Blootstelling", "Opslag", "Etikettering"], standaardMaatregelen: [] },
      { id: "klimaat", categorie: "Binnenklimaat", prioriteit: "laag", typischeRisicos: ["Temperatuur", "Ventilatie", "Luchtvochtigheid"], standaardMaatregelen: [] },
    ],
    intakeVragen: [],
  };
}

export function getAvailableBranches(): string[] {
  const dir = path.join(process.cwd(), "kennisbank");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}
