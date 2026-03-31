/**
 * Generate a demo RI&E PDF using the exact same rendering pipeline as the app.
 * Usage: node scripts/generate-demo-pdf.mjs
 */
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// We need to use the compiled version or directly import
// Since this is a TSX component, we'll construct the data and call the API

const demoData = {
  bedrijfsnaam: "Bakkerij De Gouden Korst",
  branche: "Voedingsmiddelenindustrie / Ambachtelijke Bakkerij",
  aantalMedewerkers: 14,
  aantalLocaties: 1,
  tier: "PROFESSIONAL",
  generatedContent: {
    samenvatting: "Deze Risico-Inventarisatie & Evaluatie is uitgevoerd voor Bakkerij De Gouden Korst, een ambachtelijke bakkerij gevestigd aan de Industrieweg 12 te Roermond. Het bedrijf telt 14 medewerkers verdeeld over productie (8), verkoop (3), bezorging (2) en administratie (1). De inventarisatie heeft 24 risico's geïdentificeerd, waarvan 6 met hoge prioriteit. De belangrijkste aandachtspunten betreffen brandveiligheid (ontbrekende blusmiddelen bij ovens), blootstelling aan meelstof, onvoldoende afscherming van de snijmachine, hitte-belasting bij de ovens, fysieke belasting door tillen en verkeersveiligheid bij bezorging. Het Plan van Aanpak bevat 10 concrete actiepunten met verantwoordelijken, deadlines en kostenindicaties. Directe uitvoering van de hoog-prioriteit maatregelen wordt sterk aanbevolen.",
    bedrijfsprofiel: {
      beschrijving: "Bakkerij De Gouden Korst is een ambachtelijke bakkerij die sinds 2008 brood, banket en gebak produceert voor de regio Roermond. De productie vindt plaats in een bedrijfspand aan de Industrieweg met een productieruimte van circa 280 m², een winkelgedeelte en een opslagruimte. Dagelijks worden ongeveer 1.200 broden en 400 stuks banket geproduceerd.",
      organisatiestructuur: "Sandra Willems (eigenaar/directeur), 1 hoofdbakker, 7 productiemedewerkers, 3 verkoopmedewerkers, 2 bezorgers, 1 administratief medewerker.",
      typeWerkzaamheden: [
        "Brood- en banketproductie (kneden, vormen, bakken, afwerken)",
        "Bediening industriële ovens (3 etageovens, 1 steenoven)",
        "Bediening snij- en verpakkingsmachines",
        "Winkelverkoop en klantcontact",
        "Bezorging met bestelbus (2 routes, dagelijks)",
        "Schoonmaak en hygiënebeheer",
        "Voorraadbeheer en administratie"
      ],
      werktijden: "Productie: ma-za 03:00-12:00. Winkel: ma-za 07:00-18:00, zo 08:00-12:00. Bezorging: ma-za 06:00-10:00.",
      bijzonderheden: [
        "Nachtwerk/vroege ochtendshift productie (03:00-12:00)",
        "Seizoenspieken (Kerst, Pasen, carnaval) met tijdelijke extra krachten",
        "Hoge warmtebelasting door 4 industriële ovens in productieruimte",
        "Meelstof als inhaleerbaar gevaarlijk stof (MAC-waarde 4 mg/m³)"
      ]
    },
    arbobeleid: {
      preventiemedewerker: {
        aanwezig: true,
        toelichting: "Marco Hendrikx (hoofdbakker) is aangesteld als preventiemedewerker. Hij heeft in 2024 een basisopleiding preventiemedewerker gevolgd. Aandachtspunt: de preventiemedewerker heeft onvoldoende tijd voor preventietaken naast zijn reguliere werkzaamheden."
      },
      bhvOrganisatie: {
        aanwezig: true,
        aantalBhvers: 3,
        toelichting: "Drie medewerkers zijn opgeleid als BHV'er (productie, winkel, bezorging). Laatste herhalingscursus: september 2025. Ontruimingsplan is aanwezig maar niet geoefend in het afgelopen jaar."
      },
      arbodienst: {
        contractvorm: "Vangnetregeling",
        toelichting: "Contract met ArboNed voor verzuimbegeleiding en PAGO. Geen structureel arbeidsomstandighedenspreekuur ingepland."
      },
      eerderRie: {
        uitgevoerd: false,
        toelichting: "Er is niet eerder een formele RI&E uitgevoerd. Sandra Willems geeft aan 'het er altijd bij te hebben laten zitten'. Dit is de eerste volledige risico-inventarisatie."
      },
      ondernemingsraad: {
        aanwezig: false,
        toelichting: "Geen OR of PVT aanwezig (14 medewerkers, onder de grens van 50 voor OR). Medewerkers worden wel betrokken via werkoverleg."
      },
      arbocatalogus: "De branche-arbocatalogus voor de bakkerijsector (NBOV) is beschikbaar maar wordt niet actief gebruikt."
    },
    risicos: [
      {
        categorie: "Brandveiligheid — Ontbrekende blusmiddelen",
        prioriteit: "hoog",
        beschrijving: "Bij de 4 industriële ovens (3 Bongard etageovens bouwjaar 2011/2018 en 1 Miwe steenoven bouwjaar 2015) ontbreekt direct bereikbare blusapparatuur. De dichtstbijzijnde brandblusser hangt bij de nooduitgang, circa 12 meter van de ovens. Bij een brand moet kostbare tijd worden verloren om een blusser te halen.",
        wieBlootgesteld: "Alle productiemedewerkers (8 personen)",
        frequentie: "Dagelijks blootgesteld",
        ernst: "Potentieel ernstig letsel of overlijden",
        kans: 4,
        effect: 4,
        risicoScore: 16,
        wettelijkKader: "Arbobesluit art. 3.5 (Brandpreventie), Bouwbesluit 2012 art. 6.31",
        huidigeBeheersing: "Eén brandblusser bij nooduitgang, rookmelders aanwezig, jaarlijkse keuring ovens",
        gevaren: [
          "Brand in productieruimte met hoge temperaturen en meelstof",
          "Stofexplosierisico bij hoge concentratie meelstof nabij hittebronnen",
          "Vetbrand bij banketproductie"
        ],
        maatregelen: [
          {
            maatregel: "Plaatsen van 2 CO₂-blussers en 1 vetbrandblusser direct naast de ovens",
            type: "Technisch",
            prioriteit: "hoog",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 2 weken",
            kostenindicatie: "€ 350 - € 500"
          },
          {
            maatregel: "Brandoefening organiseren met specifiek scenario 'brand bij ovens'",
            type: "Organisatorisch",
            prioriteit: "hoog",
            verantwoordelijke: "Marco Hendrikx (preventiemedewerker)",
            deadline: "Binnen 1 maand",
            kostenindicatie: "€ 0 (eigen uitvoering)"
          }
        ]
      },
      {
        categorie: "Gevaarlijke stoffen — Meelstof blootstelling",
        prioriteit: "hoog",
        beschrijving: "Tijdens het afwegen, mengen en storten van meel ontstaat een aanzienlijke stofwolk. De huidige afzuiging boven de mengmachine is onvoldoende. Meelstof is een bekende veroorzaker van bakkersastma en bakkerseczeem. De MAC-waarde voor inhaleerbaar meelstof is 4 mg/m³; uit vergelijkbare bakkerijen blijkt dat zonder adequate beheersing concentraties tot 8-12 mg/m³ voorkomen.",
        wieBlootgesteld: "Productiemedewerkers, met name degenen die meel afwegen en mengen (4 personen)",
        frequentie: "Dagelijks, meerdere keren per shift",
        ernst: "Chronische luchtwegaandoeningen (bakkersastma)",
        kans: 5,
        effect: 3,
        risicoScore: 15,
        wettelijkKader: "Arbobesluit art. 4.2 (Gevaarlijke stoffen), art. 4.18 (Grenswaarden)",
        huidigeBeheersing: "Eén afzuigkap boven mengmachine, geen ademhalingsbescherming beschikbaar",
        gevaren: [
          "Bakkersastma door langdurige blootstelling aan meelstof",
          "Bakkerseczeem door huidcontact met meel en verbetermiddelen",
          "Stofexplosierisico bij hoge concentraties nabij ontstekingsbronnen"
        ],
        maatregelen: [
          {
            maatregel: "Luchtkwaliteitsmeting laten uitvoeren door gecertificeerd bureau (NEN-EN 689)",
            type: "Onderzoek",
            prioriteit: "hoog",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 1 maand",
            kostenindicatie: "€ 800 - € 1.200"
          },
          {
            maatregel: "Upgraden afzuiginstallatie boven mengmachine en bij meelstort",
            type: "Technisch",
            prioriteit: "hoog",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 3 maanden",
            kostenindicatie: "€ 2.500 - € 4.000"
          },
          {
            maatregel: "FFP2-maskers beschikbaar stellen voor meelverwerking als tussenoplossing",
            type: "PBM",
            prioriteit: "hoog",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Direct",
            kostenindicatie: "€ 150/jaar"
          }
        ]
      },
      {
        categorie: "Arbeidsmiddelen — Snijmachine onvoldoende afgeschermd",
        prioriteit: "hoog",
        beschrijving: "De Bongard broodsnijmachine (bouwjaar 2011) heeft een beschadigde veiligheidsklep die niet meer volledig sluit. Medewerkers kunnen met de hand bij het mes komen tijdens het snijproces. De noodstop functioneert wel correct.",
        wieBlootgesteld: "Verkoopmedewerkers en productiemedewerkers die de snijmachine bedienen (5 personen)",
        frequentie: "Dagelijks, continu tijdens winkelopeningstijden",
        ernst: "Amputatie of ernstig snijletsel",
        kans: 3,
        effect: 5,
        risicoScore: 15,
        wettelijkKader: "Arbobesluit art. 7.7 (Gevaarlijke bewegende delen), Machinerichtlijn 2006/42/EG",
        huidigeBeheersing: "Noodstop aanwezig en functioneel, instructie aan medewerkers gegeven",
        gevaren: [
          "Snijletsel door contact met onbeschermd mes",
          "Amputatie van vingers bij onverwachte activering",
          "Beklemming door defecte veiligheidsklep"
        ],
        maatregelen: [
          {
            maatregel: "Veiligheidsklep laten repareren of vervangen door erkend onderhoudsbedrijf",
            type: "Technisch",
            prioriteit: "hoog",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 1 week (machine buiten gebruik tot reparatie)",
            kostenindicatie: "€ 200 - € 600"
          }
        ]
      },
      {
        categorie: "Klimaat — Hitte-belasting bij ovens",
        prioriteit: "hoog",
        beschrijving: "De temperatuur in de directe omgeving van de 4 industriële ovens loopt op tot 35-42°C. Met name tijdens de zomermaanden overschrijdt de temperatuur structureel de 30°C in de gehele productieruimte. De huidige ventilatie (2 wandventilatoren) is onvoldoende om de warmtebelasting te compenseren. Medewerkers klagen over vermoeidheid, hoofdpijn en concentratieverlies.",
        wieBlootgesteld: "Alle productiemedewerkers (8 personen), met name de ovenisten",
        frequentie: "Dagelijks gedurende volledige shift",
        ernst: "Hittestress, uitdroging, verminderd concentratievermogen leidend tot ongevallen",
        kans: 4,
        effect: 3,
        risicoScore: 12,
        wettelijkKader: "Arbobesluit art. 6.1 (Temperatuur), WBGT-richtlijn",
        huidigeBeheersing: "2 wandventilatoren, gratis water beschikbaar, korte pauzes toegestaan",
        gevaren: [
          "Hittestress en uitdroging",
          "Verminderde concentratie met verhoogd ongevalsrisico",
          "Brandwonden bij direct contact met hete oppervlakken"
        ],
        maatregelen: [
          {
            maatregel: "WBGT-meting laten uitvoeren om hitte-belasting objectief vast te stellen",
            type: "Onderzoek",
            prioriteit: "hoog",
            verantwoordelijke: "Sandra Willems",
            deadline: "Vóór zomerseizoen (mei 2026)",
            kostenindicatie: "€ 400 - € 600"
          },
          {
            maatregel: "Professioneel ventilatiesysteem installeren met gerichte luchttoevoer",
            type: "Technisch",
            prioriteit: "hoog",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 3 maanden",
            kostenindicatie: "€ 3.000 - € 6.000"
          },
          {
            maatregel: "Hitteprotocol opstellen met werk-rustschema bij temperaturen boven 30°C",
            type: "Organisatorisch",
            prioriteit: "midden",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Binnen 1 maand",
            kostenindicatie: "€ 0"
          }
        ]
      },
      {
        categorie: "Fysieke belasting — Tillen meelzakken",
        prioriteit: "hoog",
        beschrijving: "Meelzakken van 25 kg worden handmatig getild van pallets en in de mengmachine gestort. Per shift worden gemiddeld 40-60 zakken verwerkt. De tilhoogte varieert van vloerniveau tot 120 cm (bovenzijde mengmachine). Er zijn geen hulpmiddelen beschikbaar.",
        wieBlootgesteld: "Productiemedewerkers die meel verwerken (4 personen)",
        frequentie: "Dagelijks, 40-60 keer per shift",
        ernst: "Chronische rugklachten, hernia",
        kans: 4,
        effect: 3,
        risicoScore: 12,
        wettelijkKader: "Arbobesluit art. 5.2 (Fysieke belasting), NIOSH-tilnorm",
        huidigeBeheersing: "Geen hulpmiddelen, geen tilinstructie gegeven",
        gevaren: [
          "Chronische lage rugklachten",
          "Hernia of andere rugaandoeningen",
          "Acute rugblessure bij ongunstige tilbeweging"
        ],
        maatregelen: [
          {
            maatregel: "Vacuümtilhulp of zakkenheffer aanschaffen voor meelverwerking",
            type: "Technisch",
            prioriteit: "hoog",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 2 maanden",
            kostenindicatie: "€ 1.500 - € 3.000"
          },
          {
            maatregel: "Overstappen op kleinere meelzakken (12,5 kg) waar mogelijk",
            type: "Organisatorisch",
            prioriteit: "midden",
            verantwoordelijke: "Sandra Willems",
            deadline: "Bij volgende leverancieronderhandeling",
            kostenindicatie: "€ 0 - € 200/jaar meerkosten"
          }
        ]
      },
      {
        categorie: "Verkeer — Bezorgactiviteiten",
        prioriteit: "hoog",
        beschrijving: "Twee bezorgers rijden dagelijks routes in een Renault Kangoo (bouwjaar 2014, 189.000 km) en een VW Caddy (bouwjaar 2019). De rijtijden beginnen om 06:00 uur (donker/schemering in wintermaanden). De Kangoo heeft versleten banden en een niet-functionerend achteruitrijlicht. Er is geen dashcam of rijstijlmonitoring.",
        wieBlootgesteld: "2 bezorgers",
        frequentie: "Dagelijks, 2-3 uur per shift",
        ernst: "Verkeersongeval met ernstig letsel",
        kans: 3,
        effect: 4,
        risicoScore: 12,
        wettelijkKader: "Arbowet art. 3 (Algemene zorgplicht), Wegenverkeerswet",
        huidigeBeheersing: "Jaarlijkse APK, navigatiesysteem aanwezig",
        gevaren: [
          "Verkeersongeval door technisch gebrek aan voertuig",
          "Letsel door slecht zicht bij vroege ochtendritten",
          "Overbelasting bezorger door tijdsdruk"
        ],
        maatregelen: [
          {
            maatregel: "Renault Kangoo direct laten keuren: banden vervangen, achteruitrijlicht repareren",
            type: "Technisch",
            prioriteit: "hoog",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 1 week",
            kostenindicatie: "€ 400 - € 800"
          },
          {
            maatregel: "Halfjaarlijkse voertuiginspectie invoeren naast APK",
            type: "Organisatorisch",
            prioriteit: "midden",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 1 maand",
            kostenindicatie: "€ 150/jaar"
          }
        ]
      },
      {
        categorie: "Gevaarlijke stoffen — Reinigingsmiddelen",
        prioriteit: "midden",
        beschrijving: "Voor dagelijkse reiniging worden Suma D10 (alkalisch reinigingsmiddel) en Suma Bac D10 (desinfectiemiddel) gebruikt. De veiligheidsinformatiebladen zijn aanwezig maar niet op de werkplek ingezien. Medewerkers gebruiken soms geen handschoenen bij het aanmaken van reinigingsoplossingen.",
        wieBlootgesteld: "Schoonmaakteam en productiemedewerkers (6 personen)",
        frequentie: "Dagelijks",
        ernst: "Huidirritatie, chemische brandwonden bij geconcentreerd product",
        kans: 3,
        effect: 3,
        risicoScore: 9,
        wettelijkKader: "Arbobesluit art. 4.2 (Gevaarlijke stoffen), CLP-verordening",
        huidigeBeheersing: "Veiligheidsinformatiebladen in kantoor aanwezig, handschoenen beschikbaar",
        gevaren: [
          "Huidirritatie en eczeem",
          "Chemische brandwonden bij onverdund product",
          "Oogletsel bij spatten"
        ],
        maatregelen: [
          {
            maatregel: "VIB-samenvatting ophangen bij reinigingskast en bij doseerpunt",
            type: "Organisatorisch",
            prioriteit: "midden",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Binnen 2 weken",
            kostenindicatie: "€ 0"
          },
          {
            maatregel: "Instructie geven over verplicht gebruik handschoenen en veiligheidsbril bij aanmaken",
            type: "Instructie",
            prioriteit: "midden",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Binnen 2 weken",
            kostenindicatie: "€ 0"
          }
        ]
      },
      {
        categorie: "Fysieke belasting — Langdurig staan",
        prioriteit: "midden",
        beschrijving: "Productiemedewerkers staan de volledige shift (8-9 uur) op een betonnen vloer met beperkte anti-vermoeidheidsmatten. Verkoopmedewerkers staan eveneens langdurig. Er zijn geen sta-zit-opties beschikbaar.",
        wieBlootgesteld: "Alle productie- en verkoopmedewerkers (11 personen)",
        frequentie: "Dagelijks, volledige shift",
        ernst: "Klachten aan benen, voeten en rug",
        kans: 3,
        effect: 3,
        risicoScore: 9,
        wettelijkKader: "Arbobesluit art. 5.4 (Ergonomie)",
        huidigeBeheersing: "Enkele anti-vermoeidheidsmatten bij mengmachine",
        maatregelen: [
          {
            maatregel: "Anti-vermoeidheidsmatten uitbreiden naar alle vaste werkplekken",
            type: "Technisch",
            prioriteit: "midden",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 2 maanden",
            kostenindicatie: "€ 600 - € 1.000"
          },
          {
            maatregel: "Zitgelegenheid aanbieden bij niet-actieve taken (verpakken, controleren)",
            type: "Organisatorisch",
            prioriteit: "laag",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Binnen 3 maanden",
            kostenindicatie: "€ 200 - € 400"
          }
        ]
      },
      {
        categorie: "Arbeidsmiddelen — Mengmachine",
        prioriteit: "midden",
        beschrijving: "De VMI Berto spiraalkneder (120 liter, bouwjaar 2016) is voorzien van een veiligheidsroooster dat automatisch vergrendelt tijdens werking. De vergrendeling functioneert correct. Echter, de noodstopknop is slecht zichtbaar door meelresidu en de onderhoudssticker is verlopen (laatste keuring: maart 2024).",
        wieBlootgesteld: "Productiemedewerkers die de mengmachine bedienen (4 personen)",
        frequentie: "Dagelijks, meerdere keren per shift",
        ernst: "Beklemming, fracturen, amputatie bij defect veiligheidsrooster",
        kans: 2,
        effect: 5,
        risicoScore: 10,
        wettelijkKader: "Arbobesluit art. 7.4a (Keuring arbeidsmiddelen), Machinerichtlijn",
        huidigeBeheersing: "Veiligheidsrooster met vergrendeling, noodstop aanwezig",
        maatregelen: [
          {
            maatregel: "Mengmachine laten keuren door erkende keuringsinstantie",
            type: "Technisch",
            prioriteit: "midden",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 1 maand",
            kostenindicatie: "€ 200 - € 400"
          },
          {
            maatregel: "Noodstopknop reinigen en markering vervangen (rood/geel)",
            type: "Technisch",
            prioriteit: "midden",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Binnen 1 week",
            kostenindicatie: "€ 0 - € 50"
          }
        ]
      },
      {
        categorie: "Biologische agentia — Ongediertebeheersing",
        prioriteit: "midden",
        beschrijving: "In de opslagruimte zijn sporen van muizenactiviteit waargenomen (keutels bij meelpallets). Er is een contract met een ongediertebestrijder (4 bezoeken per jaar), maar het laatste bezoek was 5 maanden geleden. De lokazen bij de buitendeuren worden niet maandelijks gecontroleerd.",
        wieBlootgesteld: "Alle medewerkers (hygiënerisico), consumenten (indirect)",
        frequentie: "Continu risico",
        ernst: "Besmetting producten, imagoschade, sluiting door NVWA",
        kans: 3,
        effect: 3,
        risicoScore: 9,
        wettelijkKader: "Warenwet, HACCP, Arbobesluit art. 4.84 (Biologische agentia)",
        huidigeBeheersing: "Contract ongediertebestrijder (4x/jaar), lokazen bij buitendeuren",
        maatregelen: [
          {
            maatregel: "Direct extra bezoek ongediertebestrijder inplannen voor opslagruimte",
            type: "Correctief",
            prioriteit: "midden",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 1 week",
            kostenindicatie: "€ 150"
          },
          {
            maatregel: "Frequentie ophogen naar maandelijkse controle en 6 bezoeken per jaar",
            type: "Organisatorisch",
            prioriteit: "midden",
            verantwoordelijke: "Sandra Willems",
            deadline: "Bij contractverlenging",
            kostenindicatie: "€ 300/jaar extra"
          }
        ]
      },
      {
        categorie: "Psychosociale arbeidsbelasting — Werkdruk",
        prioriteit: "midden",
        beschrijving: "Door de vroege starttijden (03:00 uur) en seizoenspieken ervaren productiemedewerkers hoge werkdruk. Tijdens piekmomenten (Kerst, Pasen) worden overuren gemaakt tot 55 uur per week. Er is geen structureel werkoverleg of verzuimbeleid.",
        wieBlootgesteld: "Productiemedewerkers (8 personen)",
        frequentie: "Dagelijks (vroege start), seizoensgebonden (pieken)",
        ernst: "Burnout, verhoogd verzuim, fouten door vermoeidheid",
        kans: 3,
        effect: 3,
        risicoScore: 9,
        wettelijkKader: "Arbowet art. 3 lid 2 (PSA), Arbobesluit art. 2.15",
        huidigeBeheersing: "Informeel overleg, pauzes conform CAO bakkerij",
        maatregelen: [
          {
            maatregel: "Maandelijks werkoverleg invoeren met agendapunt werkdruk en planning",
            type: "Organisatorisch",
            prioriteit: "midden",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 1 maand",
            kostenindicatie: "€ 0"
          },
          {
            maatregel: "Medewerkerstevredenheidsonderzoek uitvoeren (bijv. via arbodienst)",
            type: "Onderzoek",
            prioriteit: "midden",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 6 maanden",
            kostenindicatie: "€ 500 - € 1.000"
          }
        ]
      },
      {
        categorie: "Fysieke belasting — Repeterende bewegingen",
        prioriteit: "midden",
        beschrijving: "Bij het vormen van brood en afwerken van banket worden repeterende hand- en polsbewegingen gemaakt gedurende meerdere uren per shift. Met name de kruideniersbanketsectie vereist fijn motorisch werk.",
        wieBlootgesteld: "Productiemedewerkers banket (3 personen)",
        frequentie: "Dagelijks, 4-6 uur per shift",
        ernst: "RSI, carpaal tunnel syndroom",
        kans: 3,
        effect: 2,
        risicoScore: 6,
        wettelijkKader: "Arbobesluit art. 5.4 (Ergonomie)",
        huidigeBeheersing: "Afwisseling van taken binnen de shift",
        maatregelen: [
          {
            maatregel: "Taakroulatie formaliseren: maximaal 2 uur aaneengesloten dezelfde repeterende taak",
            type: "Organisatorisch",
            prioriteit: "midden",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Binnen 1 maand",
            kostenindicatie: "€ 0"
          }
        ]
      },
      {
        categorie: "Klimaat — Tocht bij laad- en losplaats",
        prioriteit: "midden",
        beschrijving: "De laad- en losplaats heeft een overheaddeur die tijdens leveringen langdurig openstaat. In de wintermaanden veroorzaakt dit koude tocht in het aangrenzende opslaggedeelte waar medewerkers werken.",
        wieBlootgesteld: "Magazijnmedewerker en bezorgers (3 personen)",
        frequentie: "Dagelijks tijdens leveringen (1-2 uur)",
        ernst: "Verkoudheid, spierspanningen",
        kans: 3,
        effect: 2,
        risicoScore: 6,
        wettelijkKader: "Arbobesluit art. 6.1 (Temperatuur)",
        huidigeBeheersing: "Geen maatregelen",
        maatregelen: [
          {
            maatregel: "Tochtgordijn of luchtgordijn installeren bij overheaddeur",
            type: "Technisch",
            prioriteit: "midden",
            verantwoordelijke: "Sandra Willems",
            deadline: "Vóór winterseizoen 2026",
            kostenindicatie: "€ 500 - € 1.500"
          }
        ]
      },
      {
        categorie: "Brandveiligheid — Ontruimingsplan niet geoefend",
        prioriteit: "midden",
        beschrijving: "Het ontruimingsplan is opgesteld in 2020 maar nooit geoefend. Nooduitgangen zijn gemarkeerd. De verzamelplaats is aangewezen maar niet bij alle medewerkers bekend. Nieuwe medewerkers krijgen geen specifieke BHV-instructie.",
        wieBlootgesteld: "Alle medewerkers en klanten in de winkel (14+ personen)",
        frequentie: "Bij calamiteit",
        ernst: "Letsel of overlijden bij gebrekkige ontruiming",
        kans: 2,
        effect: 4,
        risicoScore: 8,
        wettelijkKader: "Arbobesluit art. 2.5c (BHV), Bouwbesluit 2012",
        huidigeBeheersing: "Ontruimingsplan (2020), nooduitgangmarkeringen, 3 BHV'ers",
        maatregelen: [
          {
            maatregel: "Ontruimingsoefening uitvoeren met evaluatie",
            type: "Organisatorisch",
            prioriteit: "midden",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Binnen 2 maanden",
            kostenindicatie: "€ 0"
          },
          {
            maatregel: "Ontruimingsplan actualiseren en verspreiden aan alle medewerkers",
            type: "Organisatorisch",
            prioriteit: "midden",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Binnen 1 maand",
            kostenindicatie: "€ 0 - € 100"
          }
        ]
      },
      {
        categorie: "Gevaarlijke stoffen — Gist en verbetermiddelen",
        prioriteit: "laag",
        beschrijving: "Bij het verwerken van gist en broodverbetermiddelen (enzymen) kan huidcontact optreden. De producten worden met blote handen afgewogen. Allergische reacties zijn mogelijk bij herhaalde blootstelling.",
        wieBlootgesteld: "Productiemedewerkers (4 personen)",
        frequentie: "Dagelijks",
        ernst: "Huidallergie, lichte irritatie",
        kans: 2,
        effect: 2,
        risicoScore: 4,
        wettelijkKader: "Arbobesluit art. 4.2 (Gevaarlijke stoffen)",
        huidigeBeheersing: "Geen specifieke maatregelen",
        maatregelen: [
          {
            maatregel: "Handschoenen beschikbaar stellen bij het afwegen van gist en verbetermiddelen",
            type: "PBM",
            prioriteit: "laag",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Binnen 1 maand",
            kostenindicatie: "€ 50/jaar"
          }
        ]
      },
      {
        categorie: "Arbeidsmiddelen — Deeguitrolmachine",
        prioriteit: "laag",
        beschrijving: "De deeguitrolmachine (Rondo Seewer, bouwjaar 2018) is in goede staat en voorzien van een noodstop en afschermkap. Wel ontbreekt een schriftelijke werkinstructie bij de machine.",
        wieBlootgesteld: "Productiemedewerkers die de machine bedienen (3 personen)",
        frequentie: "Dagelijks",
        ernst: "Beklemming of snijletsel bij foutief gebruik",
        kans: 1,
        effect: 4,
        risicoScore: 4,
        wettelijkKader: "Arbobesluit art. 7.7, Machinerichtlijn",
        huidigeBeheersing: "Noodstop functioneel, afschermkap aanwezig, mondelinge instructie",
        maatregelen: [
          {
            maatregel: "Schriftelijke werkinstructie opstellen en bij machine ophangen",
            type: "Organisatorisch",
            prioriteit: "laag",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Binnen 2 maanden",
            kostenindicatie: "€ 0"
          }
        ]
      },
      {
        categorie: "Biologische agentia — Hygiëneprotocol",
        prioriteit: "laag",
        beschrijving: "Het hygiëneprotocol (handen wassen, werkkleding, haarnetten) wordt niet consequent nageleefd. Met name tijdens drukte in de ochtendshift worden stappen overgeslagen.",
        wieBlootgesteld: "Productiemedewerkers, consumenten (indirect)",
        frequentie: "Dagelijks",
        ernst: "Besmetting producten, NVWA-waarschuwing",
        kans: 2,
        effect: 3,
        risicoScore: 6,
        wettelijkKader: "Warenwet, HACCP, Hygiënecode bakkerij",
        huidigeBeheersing: "Hygiëneprotocol aanwezig, werkkleding beschikbaar",
        maatregelen: [
          {
            maatregel: "Hygiëne-audit invoeren (maandelijks, door preventiemedewerker)",
            type: "Organisatorisch",
            prioriteit: "laag",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Binnen 1 maand",
            kostenindicatie: "€ 0"
          }
        ]
      },
      {
        categorie: "Psychosociale arbeidsbelasting — Nachtwerk",
        prioriteit: "midden",
        beschrijving: "De productieshift start om 03:00 uur. Hoewel medewerkers hieraan gewend zijn, is nachtwerk een bewezen risicofactor voor gezondheidsklachten. Er wordt geen periodiek arbeidsgezondheidskundig onderzoek (PAGO) specifiek voor nachtwerkers aangeboden.",
        wieBlootgesteld: "Productiemedewerkers (8 personen)",
        frequentie: "Dagelijks",
        ernst: "Slaapstoornissen, verhoogd risico hart- en vaatziekten",
        kans: 3,
        effect: 3,
        risicoScore: 9,
        wettelijkKader: "Arbeidstijdenwet art. 7:2, Arbobesluit art. 2.15",
        huidigeBeheersing: "Vaste dienstroosters, geen wisselende nachtdiensten",
        maatregelen: [
          {
            maatregel: "PAGO specifiek voor nachtwerkers aanbieden via arbodienst",
            type: "Gezondheidsbewaking",
            prioriteit: "midden",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 6 maanden",
            kostenindicatie: "€ 75/medewerker"
          }
        ]
      },
      {
        categorie: "Elektriciteit — Installatiekeuring",
        prioriteit: "laag",
        beschrijving: "De elektrische installatie is in 2019 voor het laatst gekeurd (NEN 3140). De keuring is verlopen. Er zijn geen zichtbare gebreken, maar door de hoge luchtvochtigheid en meelstof in de productieruimte is periodieke keuring extra belangrijk.",
        wieBlootgesteld: "Alle medewerkers",
        frequentie: "Continu risico",
        ernst: "Elektrocutie, brand door kortsluiting",
        kans: 1,
        effect: 5,
        risicoScore: 5,
        wettelijkKader: "Arbobesluit art. 3.4 (Elektriciteit), NEN 3140",
        huidigeBeheersing: "Keuring 2019 (verlopen), aardlekschakelaars aanwezig",
        maatregelen: [
          {
            maatregel: "NEN 3140-keuring laten uitvoeren door erkend installateur",
            type: "Technisch",
            prioriteit: "laag",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 3 maanden",
            kostenindicatie: "€ 500 - € 800"
          }
        ]
      },
      {
        categorie: "Valgevaar — Opslagruimte",
        prioriteit: "laag",
        beschrijving: "In de opslagruimte worden pallets tot 2,5 meter hoog gestapeld. Er is geen ladder of trap beschikbaar; medewerkers klimmen soms op pallets om bovenste voorraad te bereiken.",
        wieBlootgesteld: "Magazijnmedewerker (1 persoon), incidenteel productiemedewerkers",
        frequentie: "Wekelijks",
        ernst: "Valletsel, fracturen",
        kans: 2,
        effect: 3,
        risicoScore: 6,
        wettelijkKader: "Arbobesluit art. 3.16 (Valgevaar)",
        huidigeBeheersing: "Geen specifieke maatregelen",
        maatregelen: [
          {
            maatregel: "Rolladder of traptrede aanschaffen voor opslagruimte",
            type: "Technisch",
            prioriteit: "laag",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 2 maanden",
            kostenindicatie: "€ 150 - € 300"
          }
        ]
      },
      {
        categorie: "Geluid — Productieomgeving",
        prioriteit: "laag",
        beschrijving: "Het geluidsniveau in de productieruimte is geschat op 75-80 dB(A) door de draaiende machines. Dit ligt onder de actiewaarde van 80 dB(A), maar langdurige blootstelling kan vermoeidheid en concentratieverlies veroorzaken.",
        wieBlootgesteld: "Productiemedewerkers (8 personen)",
        frequentie: "Dagelijks, volledige shift",
        ernst: "Gehoorschade bij langdurige blootstelling, vermoeidheid",
        kans: 2,
        effect: 2,
        risicoScore: 4,
        wettelijkKader: "Arbobesluit art. 6.7 (Geluid)",
        huidigeBeheersing: "Geen meting uitgevoerd, geen gehoorbescherming beschikbaar",
        maatregelen: [
          {
            maatregel: "Geluidsmeting laten uitvoeren ter objectivering",
            type: "Onderzoek",
            prioriteit: "laag",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 6 maanden",
            kostenindicatie: "€ 300 - € 500"
          }
        ]
      },
      {
        categorie: "Beeldschermwerk — Administratie",
        prioriteit: "laag",
        beschrijving: "De administratief medewerker werkt circa 7 uur per dag achter een beeldscherm. Het bureau en de stoel zijn niet ergonomisch ingesteld. Er is geen beeldschermbril aangeboden ondanks klachten over vermoeide ogen.",
        wieBlootgesteld: "Administratief medewerker (1 persoon)",
        frequentie: "Dagelijks, volledige werkdag",
        ernst: "RSI, oogklachten, nek-/schouderklachten",
        kans: 2,
        effect: 2,
        risicoScore: 4,
        wettelijkKader: "Arbobesluit art. 5.4 (Beeldschermwerk), art. 5.10",
        huidigeBeheersing: "Standaard bureau en bureaustoel, geen werkplekonderzoek uitgevoerd",
        maatregelen: [
          {
            maatregel: "Werkplekonderzoek laten uitvoeren door ergonoom",
            type: "Onderzoek",
            prioriteit: "laag",
            verantwoordelijke: "Sandra Willems",
            deadline: "Binnen 3 maanden",
            kostenindicatie: "€ 200 - € 400"
          },
          {
            maatregel: "Beeldschermbril aanbieden conform wettelijke verplichting",
            type: "PBM",
            prioriteit: "laag",
            verantwoordelijke: "Sandra Willems",
            deadline: "Na werkplekonderzoek",
            kostenindicatie: "€ 150 - € 250"
          }
        ]
      },
      {
        categorie: "Machineveiligheid — Verpakkingsmachine",
        prioriteit: "laag",
        beschrijving: "De sealverpakkingsmachine wordt dagelijks gebruikt voor het verpakken van gesneden brood. De machine is voorzien van een thermische beveiliging. Er is een risico op brandwonden bij het verwisselen van sealfolie terwijl de machine warm is.",
        wieBlootgesteld: "Verkoopmedewerkers (3 personen)",
        frequentie: "Dagelijks",
        ernst: "Lichte brandwonden",
        kans: 2,
        effect: 2,
        risicoScore: 4,
        wettelijkKader: "Arbobesluit art. 7.7",
        huidigeBeheersing: "Mondelinge instructie, thermische beveiliging aanwezig",
        maatregelen: [
          {
            maatregel: "Waarschuwingssticker 'Heet oppervlak' aanbrengen en hittebestendige handschoenen beschikbaar stellen",
            type: "PBM + Organisatorisch",
            prioriteit: "laag",
            verantwoordelijke: "Marco Hendrikx",
            deadline: "Binnen 1 maand",
            kostenindicatie: "€ 30 - € 50"
          }
        ]
      }
    ],
    planVanAanpak: [
      {
        nummer: 1,
        gekoppeldRisico: "Brandveiligheid — Ontbrekende blusmiddelen bij ovens",
        maatregel: "Plaatsen van 2 CO₂-blussers en 1 vetbrandblusser direct naast de ovens",
        typeMaatregel: "Technisch",
        prioriteit: "hoog",
        verantwoordelijke: "Sandra Willems",
        deadline: "Binnen 2 weken",
        kostenindicatie: "€ 350 - € 500",
        status: "Open"
      },
      {
        nummer: 2,
        gekoppeldRisico: "Arbeidsmiddelen — Snijmachine onvoldoende afgeschermd",
        maatregel: "Veiligheidsklep broodsnijmachine laten repareren of vervangen (machine buiten gebruik tot reparatie)",
        typeMaatregel: "Technisch",
        prioriteit: "hoog",
        verantwoordelijke: "Sandra Willems",
        deadline: "Binnen 1 week",
        kostenindicatie: "€ 200 - € 600",
        status: "Open"
      },
      {
        nummer: 3,
        gekoppeldRisico: "Verkeer — Bezorgactiviteiten",
        maatregel: "Renault Kangoo direct laten keuren: banden vervangen, achteruitrijlicht repareren",
        typeMaatregel: "Technisch",
        prioriteit: "hoog",
        verantwoordelijke: "Sandra Willems",
        deadline: "Binnen 1 week",
        kostenindicatie: "€ 400 - € 800",
        status: "Open"
      },
      {
        nummer: 4,
        gekoppeldRisico: "Gevaarlijke stoffen — Meelstof blootstelling",
        maatregel: "FFP2-maskers direct beschikbaar stellen + luchtkwaliteitsmeting plannen",
        typeMaatregel: "PBM + Onderzoek",
        prioriteit: "hoog",
        verantwoordelijke: "Sandra Willems / Marco Hendrikx",
        deadline: "Maskers: direct. Meting: binnen 1 maand",
        kostenindicatie: "€ 950 - € 1.350",
        status: "Open"
      },
      {
        nummer: 5,
        gekoppeldRisico: "Gevaarlijke stoffen — Meelstof blootstelling",
        maatregel: "Afzuiginstallatie upgraden boven mengmachine en bij meelstort",
        typeMaatregel: "Technisch",
        prioriteit: "hoog",
        verantwoordelijke: "Sandra Willems",
        deadline: "Binnen 3 maanden",
        kostenindicatie: "€ 2.500 - € 4.000",
        status: "Open"
      },
      {
        nummer: 6,
        gekoppeldRisico: "Fysieke belasting — Tillen meelzakken",
        maatregel: "Vacuümtilhulp of zakkenheffer aanschaffen voor meelverwerking",
        typeMaatregel: "Technisch",
        prioriteit: "hoog",
        verantwoordelijke: "Sandra Willems",
        deadline: "Binnen 2 maanden",
        kostenindicatie: "€ 1.500 - € 3.000",
        status: "Open"
      },
      {
        nummer: 7,
        gekoppeldRisico: "Klimaat — Hitte-belasting bij ovens",
        maatregel: "Professioneel ventilatiesysteem installeren met gerichte luchttoevoer",
        typeMaatregel: "Technisch",
        prioriteit: "hoog",
        verantwoordelijke: "Sandra Willems",
        deadline: "Binnen 3 maanden",
        kostenindicatie: "€ 3.000 - € 6.000",
        status: "Open"
      },
      {
        nummer: 8,
        gekoppeldRisico: "Brandveiligheid — Ontruimingsplan niet geoefend",
        maatregel: "Ontruimingsoefening uitvoeren en ontruimingsplan actualiseren",
        typeMaatregel: "Organisatorisch",
        prioriteit: "midden",
        verantwoordelijke: "Marco Hendrikx",
        deadline: "Binnen 2 maanden",
        kostenindicatie: "€ 0 - € 100",
        status: "Open"
      },
      {
        nummer: 9,
        gekoppeldRisico: "Psychosociale arbeidsbelasting — Werkdruk en nachtwerk",
        maatregel: "Maandelijks werkoverleg invoeren + PAGO nachtwerkers via arbodienst",
        typeMaatregel: "Organisatorisch + Gezondheidsbewaking",
        prioriteit: "midden",
        verantwoordelijke: "Sandra Willems",
        deadline: "Werkoverleg: 1 maand. PAGO: 6 maanden",
        kostenindicatie: "€ 600 - € 1.000",
        status: "Open"
      },
      {
        nummer: 10,
        gekoppeldRisico: "Elektriciteit — Installatiekeuring verlopen",
        maatregel: "NEN 3140-keuring laten uitvoeren door erkend installateur",
        typeMaatregel: "Technisch",
        prioriteit: "laag",
        verantwoordelijke: "Sandra Willems",
        deadline: "Binnen 3 maanden",
        kostenindicatie: "€ 500 - € 800",
        status: "Open"
      }
    ],
    wettelijkeVerplichtingen: [
      {
        verplichting: "RI&E met Plan van Aanpak",
        wet: "Arbowet art. 5",
        status: "aandachtspunt",
        toelichting: "Met deze RI&E wordt voor het eerst aan deze verplichting voldaan."
      },
      {
        verplichting: "Preventiemedewerker aangesteld",
        wet: "Arbowet art. 13",
        status: "voldoet",
        toelichting: "Marco Hendrikx is aangesteld en opgeleid (2024). Aandacht: voldoende tijd voor taken."
      },
      {
        verplichting: "BHV-organisatie",
        wet: "Arbowet art. 15",
        status: "aandachtspunt",
        toelichting: "3 BHV'ers opgeleid, certificering actueel. Ontruimingsoefening ontbreekt."
      },
      {
        verplichting: "Arbodienst / bedrijfsarts",
        wet: "Arbowet art. 14",
        status: "voldoet",
        toelichting: "Vangnetregeling met ArboNed. Spreekuur niet structureel ingepland."
      },
      {
        verplichting: "Voorlichting en instructie",
        wet: "Arbowet art. 8",
        status: "niet_in_orde",
        toelichting: "Geen schriftelijke werkinstructies bij machines, geen structureel introductieprogramma voor nieuwe medewerkers."
      },
      {
        verplichting: "Gevaarlijke stoffen registratie",
        wet: "Arbobesluit art. 4.2",
        status: "aandachtspunt",
        toelichting: "VIB's aanwezig in kantoor, niet op de werkplek. Geen blootstellingsbeoordeling uitgevoerd."
      },
      {
        verplichting: "Keuring arbeidsmiddelen",
        wet: "Arbobesluit art. 7.4a",
        status: "niet_in_orde",
        toelichting: "Mengmachine keuring verlopen (maart 2024). Snijmachine veiligheidsklep defect."
      },
      {
        verplichting: "PAGO / PMO",
        wet: "Arbowet art. 18",
        status: "niet_in_orde",
        toelichting: "Geen PAGO aangeboden aan medewerkers. Specifiek voor nachtwerkers is dit extra relevant."
      }
    ],
    aanbevelingen: {
      conclusie: "Bakkerij De Gouden Korst heeft een betrokken eigenaar en team, maar heeft tot op heden geen formeel arbobeleid gevoerd. Deze eerste RI&E legt een stevige basis. De 6 hoog-prioriteit risico's vragen om directe actie — met name de brandveiligheid bij de ovens, de defecte snijmachine en het technisch gebrek aan de bezorgbus. Het geschatte totaalbudget voor alle maatregelen ligt tussen € 10.000 en € 20.000, waarvan het merendeel besteed wordt aan structurele verbeteringen (ventilatie, tilhulp) die zich op langere termijn terugverdienen in lager verzuim en hogere productiviteit.",
      topPrioriteiten: [
        {
          nummer: 1,
          titel: "Brandveiligheid bij ovens",
          beschrijving: "Direct blusmiddelen plaatsen bij de ovens. Kosten laag, impact hoog. Voorkomt potentieel fatale situatie.",
          verwachteImpact: "Directe verlaging van brandrisico van score 16 naar geschat 8"
        },
        {
          nummer: 2,
          titel: "Snijmachine reparatie",
          beschrijving: "Machine buiten gebruik stellen tot veiligheidsklep gerepareerd. Eén week reparatietijd is acceptabel; amputatierisico is dat niet.",
          verwachteImpact: "Eliminatie van direct gevaar op amputatieletsel"
        },
        {
          nummer: 3,
          titel: "Meelstofbeheersing",
          beschrijving: "Combineer directe PBM (FFP2) met structurele oplossing (afzuiging). Bakkersastma is een beroepsziekte die volledig te voorkomen is.",
          verwachteImpact: "Verlaging blootstelling van geschat 8-12 mg/m³ naar onder MAC-waarde (4 mg/m³)"
        }
      ],
      aanbevelingToetsing: "Hoewel Bakkerij De Gouden Korst met 14 medewerkers niet verplicht is de RI&E te laten toetsen door een gecertificeerde arbodeskundige, wordt dit wel aanbevolen gezien het diverse risicoprofiel (gevaarlijke stoffen, machines, fysieke belasting, nachtwerk). Een toetsing versterkt de juridische positie van de werkgever.",
      aanbevelingActualisatie: "Deze RI&E dient minimaal jaarlijks te worden geactualiseerd, of eerder bij significante wijzigingen in werkprocessen, machines, personeel of huisvesting. De seizoenspieken (Kerst, Pasen) vormen een goed moment voor tussentijdse evaluatie van de werkdrukmaatregelen.",
      implementatiepad: [
        {
          fase: "Fase 1: Direct (0-2 weken)",
          doel: "Elimineer acute gevaren",
          acties: [
            "Blusmiddelen plaatsen bij ovens",
            "Snijmachine buiten gebruik / repareren",
            "Bezorgbus laten keuren en repareren",
            "FFP2-maskers beschikbaar stellen"
          ]
        },
        {
          fase: "Fase 2: Korte termijn (1-3 maanden)",
          doel: "Structurele verbeteringen implementeren",
          acties: [
            "Afzuiginstallatie upgraden",
            "Tilhulp aanschaffen",
            "Ventilatiesysteem installeren",
            "Mengmachine laten keuren",
            "Ontruimingsoefening uitvoeren",
            "Werkoverleg invoeren"
          ]
        },
        {
          fase: "Fase 3: Middellange termijn (3-6 maanden)",
          doel: "Preventieve maatregelen en monitoring",
          acties: [
            "PAGO nachtwerkers uitvoeren",
            "NEN 3140-keuring plannen",
            "Medewerkerstevredenheidsonderzoek",
            "Werkplekonderzoek administratie",
            "Geluidsmeting productieruimte"
          ]
        }
      ]
    }
  },
  datum: "31 maart 2026"
};

// Output as JSON for the API
const outputPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '.openclaw', 'workspace-emily', 'output', 'snelrie', 'demo-rie-payload.json');
writeFileSync(outputPath, JSON.stringify(demoData, null, 2));
console.log(`Payload written to: ${outputPath}`);
