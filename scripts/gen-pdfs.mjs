import fs from 'fs';
import path from 'path';

const outputDir = 'C:\\Users\\Gebruiker\\.openclaw\\workspace\\output';

// Generate realistic test data per tier
function generateTestData(tier) {
  const base = {
    bedrijfsnaam: "Praesidion Security B.V.",
    branche: "Beveiliging",
    aantalMedewerkers: 15,
    aantalLocaties: 3,
    tier: tier.toUpperCase(),
    datum: new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }),
  };

  const risicoCategorieën = [
    { cat: "Fysieke belasting", desc: "Beveiligers staan langdurig tijdens surveillance en objectbewaking, wat kan leiden tot rug-, knie- en voetklachten. Het regelmatig tillen van zware objecten zoals hekwerken en barriers verhoogt het risico op musculoskeletale aandoeningen.", wie: "Alle 15 beveiligers", freq: "Dagelijks, 8-12 uur", ernst: "Chronische rug- en knieklachten, langdurig verzuim", kans: 4, effect: 3, score: 12, prio: "midden", wet: "Arbobesluit art. 5.2 - Fysieke belasting", beheersing: "Basis instructie bij indiensttreding, geen periodieke evaluatie", gevaren: ["Langdurig staan", "Tillen zware objecten", "Repeterende bewegingen"] },
    { cat: "Psychosociale arbeidsbelasting", desc: "Beveiligers worden regelmatig geconfronteerd met agressief gedrag van bezoekers en omstanders. Nachtdiensten en wisselende roosters veroorzaken extra werkdruk en sociale isolatie.", wie: "Alle 15 beveiligers, vooral nachtdienstmedewerkers", freq: "Wekelijks, bij elk incident", ernst: "PTSS, burn-out, langdurig psychisch verzuim", kans: 4, effect: 4, score: 16, prio: "midden", wet: "Arbowet art. 3 lid 2 - Beleid agressie/geweld", beheersing: "Incidentenregistratie aanwezig, geen structureel nazorgbeleid", gevaren: ["Verbale agressie", "Fysiek geweld", "Werkdruk door onderbezetting"] },
    { cat: "Agressie en geweld", desc: "Beveiligers lopen een verhoogd risico op confrontaties met agressieve personen, met name bij evenementbeveiliging en horecabeveiliging. Dit kan leiden tot fysiek letsel en psychisch trauma.", wie: "12 operationele beveiligers", freq: "Wekelijks, variërend per locatie", ernst: "Fysiek letsel, PTSS, arbeidsongeschiktheid", kans: 5, effect: 4, score: 20, prio: "hoog", wet: "Arbowet art. 3 lid 2 - Agressie/geweld; Arbobesluit art. 2.15", beheersing: "Basis zelfverdedigingstraining, portofoons aanwezig", gevaren: ["Fysieke confrontatie", "Bedreiging met wapens", "Psychische belasting na incident"] },
    { cat: "BHV en noodprocedures", desc: "Op meerdere objecten ontbreekt een actueel ontruimingsplan en zijn onvoldoende BHV'ers beschikbaar. Bij nachtdiensten is er vaak slechts één beveiliger aanwezig.", wie: "Alle medewerkers en bezoekers op bewaakt object", freq: "Continue risico, oefening onvoldoende", ernst: "Letsel bij brand/ontruiming, dodelijk letsel bij vertraagde hulpverlening", kans: 3, effect: 5, score: 15, prio: "midden", wet: "Arbowet art. 15 - BHV; Arbobesluit art. 2.17", beheersing: "4 BHV'ers opgeleid, maar niet gelijkmatig verdeeld over locaties", gevaren: ["Ontbreken ontruimingsplan", "Onvoldoende BHV dekking", "Geen AED beschikbaar"] },
    { cat: "Alleen werken", desc: "Beveiligers werken regelmatig alleen, met name tijdens nacht- en weekenddiensten. Bij een noodsituatie kan hulp niet snel genoeg ter plaatse zijn.", wie: "8 beveiligers met solo-diensten", freq: "3-4 nachten per week", ernst: "Vertraagde hulpverlening, letsel zonder bijstand", kans: 4, effect: 4, score: 16, prio: "midden", wet: "Arbobesluit art. 3.1 - Alleen werken", beheersing: "Check-in procedure via telefoon, niet gestructureerd", gevaren: ["Geen directe hulp beschikbaar", "Communicatiestoring", "Gezondheidsincident zonder getuige"] },
    { cat: "Beeldschermwerk / ergonomie", desc: "Kantoorpersoneel en meldkamermedewerkers werken langdurig achter beeldschermen met onvoldoende ergonomische aanpassingen. Werkplekken zijn niet individueel ingesteld.", wie: "3 kantoormedewerkers, 2 meldkameroperators", freq: "Dagelijks, 6-8 uur", ernst: "RSI, oog- en nekklachten, chronische pijn", kans: 3, effect: 3, score: 9, prio: "laag", wet: "Arbobesluit art. 5.4 - Beeldschermwerk", beheersing: "Standaard kantoormeubilair, geen werkplekonderzoek uitgevoerd", gevaren: ["Verkeerde werkhouding", "Onvoldoende pauzes", "Reflectie op scherm"] },
    { cat: "Verkeer en transport", desc: "Beveiligers rijden dagelijks naar verschillende locaties en maken surveillance-rondes met bedrijfsvoertuigen. Vermoeidheid door nachtdiensten verhoogt het verkeersrisico.", wie: "10 beveiligers met rijdende diensten", freq: "Dagelijks, 50-100 km per dienst", ernst: "Verkeersongevallen, letsel, arbeidsongeschiktheid", kans: 3, effect: 4, score: 12, prio: "midden", wet: "Arbowet art. 3 lid 1 - Veiligheidsbeleid", beheersing: "Bedrijfswagens met basis uitrusting, geen vermoeidheidsprotocol", gevaren: ["Vermoeidheid achter stuur", "Slechte weersomstandigheden", "Onbekende routes"] },
    { cat: "Binnenklimaat en ventilatie", desc: "In de portiersloge en meldkamer is de ventilatie onvoldoende. Bij warm weer stijgt de temperatuur boven de 28°C, wat leidt tot concentratieverlies.", wie: "5 medewerkers in vaste locaties", freq: "Dagelijks in zomermaanden", ernst: "Concentratieverlies, hitteziekte, verminderde alertheid", kans: 3, effect: 2, score: 6, prio: "laag", wet: "Arbobesluit art. 6.1 - Binnenklimaat", beheersing: "Enkele ventilator beschikbaar, geen klimaatbeheersing", gevaren: ["Te hoge temperatuur", "Onvoldoende ventilatie", "Tocht"] },
    { cat: "Persoonlijke beschermingsmiddelen", desc: "Niet alle beveiligers beschikken over adequate PBM's voor hun specifieke werksituatie. Steekwerende vesten en veiligheidsschoenen worden niet standaard verstrekt.", wie: "15 beveiligers", freq: "Continue", ernst: "Verwondingen door steek- of snij-incidenten", kans: 3, effect: 4, score: 12, prio: "midden", wet: "Arbobesluit art. 8.1-8.3 - PBM", beheersing: "Reflectievesten en portofoons verstrekt, geen steekwerende middelen", gevaren: ["Onvoldoende bescherming", "Verouderde PBM's", "Geen PBM-registratie"] },
    { cat: "Voorlichting en onderricht", desc: "Nieuwe medewerkers krijgen een beperkte introductie over arborisico's. Er is geen structureel opleidingsprogramma voor veilig werken.", wie: "Alle medewerkers", freq: "Bij indiensttreding en jaarlijks", ernst: "Onveilig handelen door onwetendheid, ongevallen", kans: 3, effect: 3, score: 9, prio: "laag", wet: "Arbowet art. 8 - Voorlichting en onderricht", beheersing: "Inwerkperiode van 1 week, geen gestructureerd programma", gevaren: ["Onvoldoende kennis risico's", "Geen herhalingstraining", "Taalbarrière bij instructies"] },
    { cat: "Geluid", desc: "Bij evenementbeveiliging worden beveiligers blootgesteld aan hoge geluidsniveaus die de wettelijke grenswaarden kunnen overschrijden.", wie: "6 beveiligers bij evenementen", freq: "Wekelijks, 4-8 uur per evenement", ernst: "Gehoorschade, tinnitus", kans: 3, effect: 3, score: 9, prio: "laag", wet: "Arbobesluit art. 6.7-6.11 - Geluid", beheersing: "Geen gehoorbescherming verstrekt bij evenementen", gevaren: ["Geluidsniveau >85 dB", "Langdurige blootstelling", "Geen audiometrisch onderzoek"] },
    { cat: "Nachtarbeid en werktijden", desc: "Wisselende roosters met nacht- en weekenddiensten verstoren het bioritme en verhogen het risico op gezondheidsklachten en fouten door vermoeidheid.", wie: "10 beveiligers met wisselende roosters", freq: "3-4 nachtdiensten per week", ernst: "Slaapstoornissen, hart/vaatziekten, fouten door vermoeidheid", kans: 4, effect: 3, score: 12, prio: "midden", wet: "Arbeidstijdenwet art. 5:8 - Nachtdienst", beheersing: "Roosters conform ATW, geen aangepast nachtdienstbeleid", gevaren: ["Vermoeidheid", "Sociale isolatie", "Verminderde alertheid"] },
    { cat: "Brand- en explosiegevaar", desc: "Op bewakte objecten is de kennis over brandpreventie en -bestrijding onvoldoende. Beveiligers zijn vaak de eerste ter plaatse bij brand maar hebben beperkte brandbestrijdingstraining.", wie: "Alle beveiligers op objecten", freq: "Continue risico", ernst: "Brandwonden, rookinhalatie, dodelijk letsel", kans: 2, effect: 5, score: 10, prio: "laag", wet: "Arbobesluit art. 3.2 - Brandpreventie", beheersing: "BHV-opleiding inclusief basis brandbestrijding", gevaren: ["Onbekendheid met brandblusapparatuur", "Geen object-specifiek brandplan", "Late alarmering"] },
    { cat: "Infectierisico's", desc: "Beveiligers komen in contact met veel verschillende personen en locaties, wat het risico op infectieziekten verhoogt. Bij fouillering is er direct lichamelijk contact.", wie: "15 beveiligers", freq: "Dagelijks", ernst: "Besmetting met infectieziekten, griep, hepatitis", kans: 3, effect: 3, score: 9, prio: "laag", wet: "Arbobesluit art. 4.84 - Biologische agentia", beheersing: "Handdesinfectie beschikbaar, geen vaccinatiebeleid", gevaren: ["Direct lichamelijk contact", "Vele contactmomenten", "Onvoldoende hygiëneprotocol"] },
    { cat: "Elektriciteit", desc: "Bij bewaking van bouwterreinen en industriële objecten komen beveiligers in aanraking met elektrische installaties. Kennis over elektriciteitsrisico's ontbreekt.", wie: "4 beveiligers op industriële objecten", freq: "Wekelijks", ernst: "Elektrocutie, brandwonden, dodelijk letsel", kans: 2, effect: 5, score: 10, prio: "laag", wet: "Arbobesluit art. 3.4 - Elektrische installaties", beheersing: "Verbodsborden aanwezig, geen specifieke instructie", gevaren: ["Aanraking open installaties", "Beschadigde bekabeling", "Onbevoegd betreden technische ruimten"] },
  ];

  const tierRisicos = {
    BASIS: 5,
    PROFESSIONAL: 12,
    ENTERPRISE: 15,
  };

  const numRisicos = tierRisicos[tier.toUpperCase()] || 8;
  const risicos = risicoCategorieën.slice(0, numRisicos).map((r, i) => ({
    id: `risico_${i + 1}`,
    categorie: r.cat,
    beschrijving: r.desc,
    wieBlootgesteld: r.wie,
    frequentie: r.freq,
    ernst: r.ernst,
    kans: r.kans,
    effect: r.effect,
    risicoScore: r.score,
    prioriteit: r.prio,
    wettelijkKader: r.wet,
    huidigeBeheersing: r.beheersing,
    gevaren: r.gevaren,
    maatregelen: generateMaatregelen(r, tier),
  }));

  let pvaCounter = 0;
  const pva = risicos.flatMap((r, i) =>
    r.maatregelen.map((m, mi) => ({
      nummer: ++pvaCounter,
      gekoppeldRisico: r.id,
      risicoBeschrijving: r.categorie,
      maatregel: m.maatregel,
      typeMaatregel: m.type,
      prioriteit: m.prioriteit,
      verantwoordelijke: m.verantwoordelijke,
      deadline: m.deadline,
      kostenindicatie: m.kostenindicatie,
      status: "nog niet gestart",
    }))
  ).slice(0, numRisicos);

  const content = {
    samenvatting: `Deze Risico-Inventarisatie & Evaluatie is uitgevoerd voor Praesidion Security B.V., een beveiligingsbedrijf met 15 medewerkers verdeeld over 3 locaties in de regio Limburg. De inventarisatie is uitgevoerd conform de Arbeidsomstandighedenwet (Arbowet art. 5) en het Arbobesluit.\n\nUit de inventarisatie blijkt dat er ${numRisicos} risico's zijn geïdentificeerd, waarvan ${risicos.filter(r => r.prioriteit === 'hoog').length} met een hoge prioriteit. De belangrijkste aandachtspunten betreffen agressie en geweld, psychosociale arbeidsbelasting, en de organisatie van BHV en noodprocedures. Deze risico's vragen om directe aandacht en concrete maatregelen.\n\nHet bijbehorende Plan van Aanpak bevat ${pva.length} concrete actiepunten met verantwoordelijken, deadlines en kostenramingen. Aanbevolen wordt dit plan binnen 3 maanden te bespreken met de preventiemedewerker en de OR/PVT, en de voortgang kwartaalsgewijs te monitoren.`,
    bedrijfsprofiel: {
      naam: "Praesidion Security B.V.",
      branche: "Beveiliging",
      aantalMedewerkers: 15,
      aantalLocaties: 3,
      beschrijving: "Praesidion Security B.V. is een beveiligingsbedrijf gevestigd in Limburg, gespecialiseerd in objectbeveiliging, evenementbeveiliging en mobiele surveillance. Het bedrijf heeft 15 medewerkers in dienst, waarvan 12 operationele beveiligers en 3 kantoor-/meldkamermedewerkers. De dienstverlening vindt plaats op diverse locaties waaronder bedrijventerreinen, evenementenlocaties en horecagelegenheden.",
      organisatiestructuur: "Het bedrijf kent een platte organisatiestructuur met een directeur-eigenaar, een operationeel manager, en teamleiders per locatie. De preventiemedewerker is aangesteld in de functie van operationeel manager.",
      typeWerkzaamheden: ["Objectbeveiliging", "Evenementbeveiliging", "Mobiele surveillance", "Meldkamerdiensten", "Receptie- en portiersdiensten"],
      werktijden: "24/7 operatie met wisselende diensten (dag, avond, nacht). Kantoortijden 08:00-17:00 voor administratief personeel.",
      bijzonderheden: ["Alleen werken tijdens nacht- en weekenddiensten", "Regelmatig contact met publiek en potentieel agressieve personen", "Rijdende surveillance over meerdere locaties"],
    },
    risicos,
    planVanAanpak: pva,
  };

  // Add arbobeleid for Professional+ tiers
  if (tier.toUpperCase() !== 'GRATIS' && tier.toUpperCase() !== 'BASIS') {
    content.arbobeleid = {
      preventiemedewerker: {
        aanwezig: true,
        toelichting: "De operationeel manager fungeert als preventiemedewerker. Hoewel de functie formeel is ingevuld, is er geen specifieke opleiding als preventiemedewerker gevolgd. Aanbevolen wordt een erkende cursus preventiemedewerker te volgen om de taken conform Arbowet art. 13 adequaat te kunnen vervullen."
      },
      bhvOrganisatie: {
        aanwezig: true,
        aantalBhvers: 4,
        toelichting: "Er zijn 4 BHV'ers opgeleid, wat in principe voldoende is voor het totaal aantal medewerkers. Echter, door de spreiding over 3 locaties en wisselende diensten is niet op elk moment een BHV'er aanwezig. Dit is een aandachtspunt conform Arbowet art. 15."
      },
      arbodienst: {
        contractvorm: "Maatwerkregeling met een basiscontract bij een gecertificeerde arbodienst",
        toelichting: "Het contract omvat toegang tot een bedrijfsarts voor verzuimbegeleiding. Preventieve dienstverlening zoals werkplekonderzoeken en PMO zijn niet standaard opgenomen in het contract."
      },
      eerderRie: {
        uitgevoerd: false,
        toelichting: "Er is geen eerdere RI&E uitgevoerd. Dit is de eerste systematische risico-inventarisatie voor Praesidion Security B.V. Het bedrijf valt onder de verplichting van Arbowet art. 5 om een RI&E op te stellen en actueel te houden."
      },
      arbocatalogus: "Arbocatalogus Particuliere Beveiliging (brancheorganisatie Nederlandse Veiligheidsbranche)",
      ondernemingsraad: {
        aanwezig: false,
        toelichting: "Met 15 medewerkers is er geen verplichting tot het instellen van een ondernemingsraad (grens: 50 medewerkers). Wel is het aanbevolen een personeelsvertegenwoordiging (PVT) in te stellen bij meer dan 10 medewerkers, conform WOR art. 35c."
      }
    };
  }

  // Add aanbevelingen for Professional+ tiers
  if (tier.toUpperCase() !== 'GRATIS' && tier.toUpperCase() !== 'BASIS') {
    content.aanbevelingen = {
      conclusie: `Uit deze RI&E blijkt dat Praesidion Security B.V. op diverse vlakken aandacht moet besteden aan de arbeidsomstandigheden. Van de ${numRisicos} geïdentificeerde risico's hebben ${risicos.filter(r => r.prioriteit === 'hoog').length} een hoge prioriteit en vragen om directe actie. De risico's op het gebied van agressie/geweld en psychosociale belasting zijn het meest urgent.\n\nDe beveiligingsbranche kent inherent hogere risico's op het gebied van fysieke veiligheid en psychische belasting. Het is positief dat er een preventiemedewerker is aangesteld en BHV-organisatie bestaat, maar beide behoeven versterking.`,
      topPrioriteiten: [
        {
          nummer: 1,
          titel: "Agressieprotocol implementeren",
          beschrijving: "Ontwikkel en implementeer een compleet agressieprotocol inclusief preventie, de-escalatietechnieken, nazorg en registratie. Train alle medewerkers hierin.",
          verwachteImpact: "Reductie van geweldsincidenten met 40% en vermindering van psychisch verzuim door betere nazorg."
        },
        {
          nummer: 2,
          titel: "BHV-dekking optimaliseren",
          beschrijving: "Zorg dat op elke locatie en bij elke dienst minimaal één BHV'er aanwezig is. Leid 2 extra BHV'ers op en maak een BHV-rooster gekoppeld aan het dienstrooster.",
          verwachteImpact: "100% BHV-dekking op alle locaties, snellere hulpverlening bij incidenten."
        },
        {
          nummer: 3,
          titel: "Nachtdienstbeleid invoeren",
          beschrijving: "Stel een specifiek beleid op voor nachtarbeid met aandacht voor rusttijden, communicatiemiddelen, en periodieke gezondheidscontroles.",
          verwachteImpact: "Vermindering van vermoeidheidsgerelateerde incidenten en gezondheidsklachten."
        }
      ],
      aanbevelingToetsing: "Met 15 medewerkers is toetsing door een gecertificeerde arbodienst niet wettelijk verplicht (grens: 25 medewerkers, Arbowet art. 14). Gezien de aard van het werk in de beveiligingsbranche wordt toetsing echter sterk aanbevolen.",
      aanbevelingActualisatie: "Actualiseer de RI&E jaarlijks of eerder bij significante wijzigingen zoals: uitbreiding van het personeelsbestand, nieuwe objecten/locaties, gewijzigde werkprocessen, of na ernstige incidenten."
    };
  }

  // Add wettelijke verplichtingen for Professional+
  if (tier.toUpperCase() === 'PROFESSIONAL' || tier.toUpperCase() === 'ENTERPRISE') {
    content.wettelijkeVerplichtingen = [
      { verplichting: "RI&E-plicht", wet: "Arbowet art. 5 lid 1", status: "aandachtspunt", toelichting: "Met deze RI&E wordt voldaan aan de inventarisatieplicht. De RI&E dient echter jaarlijks geactualiseerd te worden en moet worden besproken met de medewerkers." },
      { verplichting: "Plan van Aanpak", wet: "Arbowet art. 5 lid 3", status: "voldoet", toelichting: "Het Plan van Aanpak is onderdeel van deze RI&E en bevat concrete maatregelen met deadlines en verantwoordelijken." },
      { verplichting: "BHV-organisatie", wet: "Arbowet art. 15", status: "aandachtspunt", toelichting: "Er zijn 4 BHV'ers opgeleid, maar de dekking over locaties en diensten is niet gegarandeerd. Aanvullende BHV'ers en een koppeling aan het dienstrooster zijn nodig." },
      { verplichting: "Preventiemedewerker", wet: "Arbowet art. 13", status: "aandachtspunt", toelichting: "De preventiemedewerker is aangesteld maar mist een specifieke opleiding. Een erkende cursus preventiemedewerker wordt aanbevolen." },
      { verplichting: "Voorlichting en onderricht", wet: "Arbowet art. 8", status: "niet_in_orde", toelichting: "Er is geen structureel voorlichtingsprogramma over arbeidsrisico's. Nieuwe medewerkers krijgen een beperkte introductie, herhalingstraining ontbreekt volledig." },
      { verplichting: "PAGO/PMO", wet: "Arbobesluit art. 2.14", status: "niet_in_orde", toelichting: "Er wordt geen Periodiek Arbeidsgezondheidskundig Onderzoek aangeboden aan medewerkers. Dit is verplicht en met name relevant voor nachtwerkers." },
      { verplichting: "Arbodienst/bedrijfsarts", wet: "Arbowet art. 14", status: "voldoet", toelichting: "Er is een maatwerkcontract met een gecertificeerde arbodienst voor verzuimbegeleiding. Preventieve diensten zijn beperkt opgenomen." },
      { verplichting: "Beleid agressie/geweld", wet: "Arbowet art. 3 lid 2", status: "niet_in_orde", toelichting: "Er is geen formeel beleid inzake agressie en geweld, terwijl dit gezien de branche essentieel is. Een integraal agressieprotocol dient te worden opgesteld." },
    ];

    if (tier.toUpperCase() === 'ENTERPRISE') content.aanbevelingen.implementatiepad = [
      {
        fase: "Fase 1: Direct (0-3 maanden)",
        acties: ["Agressieprotocol opstellen en implementeren", "Extra BHV'ers opleiden", "Alleen-werken protocol invoeren", "Noodcommunicatiemiddelen aanschaffen"],
        doel: "Aanpak van de hoogste risico's en wettelijke niet-conformiteiten"
      },
      {
        fase: "Fase 2: Korte termijn (3-6 maanden)",
        acties: ["PMO/PAGO organiseren voor alle medewerkers", "Voorlichtingsprogramma ontwikkelen", "Werkplekonderzoek kantoor en meldkamer", "PBM-beleid herzien en steekwerende vesten aanschaffen"],
        doel: "Structurele verbeteringen en naleving wettelijke verplichtingen"
      },
      {
        fase: "Fase 3: Middellange termijn (6-12 maanden)",
        acties: ["Nachtdienstbeleid implementeren", "Ergonomische aanpassingen doorvoeren", "Klimaatbeheersing verbeteren", "Jaarlijks RI&E-review plannen"],
        doel: "Continue verbetering en borging van het arbomanagementsysteem"
      }
    ];
  }

  return { ...base, generatedContent: content };
}

function generateMaatregelen(risico, tier) {
  const maatregelenMap = {
    "Fysieke belasting": [
      { maatregel: "Voer een werkplekonderzoek uit op alle objecten en stel per locatie een schema op voor taakroulatie zodat beveiligers niet langer dan 2 uur aaneengesloten staan", type: "bronmaatregel", prioriteit: "midden", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 3 maanden", kostenindicatie: "€800-1200" },
      { maatregel: "Richt rustpunten in op elke bewakingslocatie met zit-/stamogelijkheden en anti-vermoeidheidsmatten bij vaste posten", type: "collectief", prioriteit: "midden", verantwoordelijke: "Operationeel manager", deadline: "Binnen 6 maanden", kostenindicatie: "€1500-3000" },
      { maatregel: "Organiseer halfjaarlijkse training 'Ergonomisch werken in de beveiliging' met aandacht voor tiltechnieken bij het plaatsen van hekwerken en barriers", type: "individueel", prioriteit: "midden", verantwoordelijke: "HR-manager", deadline: "Binnen 3 maanden", kostenindicatie: "€1000-2000" },
    ],
    "Psychosociale arbeidsbelasting": [
      { maatregel: "Stel een vertrouwenspersoon aan en implementeer een structureel nazorgprotocol (inclusief defusing en debriefing) na geweldsincidenten", type: "bronmaatregel", prioriteit: "hoog", verantwoordelijke: "Directeur", deadline: "Binnen 1 maand", kostenindicatie: "€1500-2500" },
      { maatregel: "Voer een medewerkers-tevredenheidsonderzoek (MTO) uit met specifieke vragen over werkdruk, agressie-ervaringen en roosterbelasting", type: "organisatorisch", prioriteit: "midden", verantwoordelijke: "HR-manager", deadline: "Binnen 3 maanden", kostenindicatie: "€500-1000" },
      { maatregel: "Bied alle nachtdienstmedewerkers toegang tot een psycholoog via het EAP (Employee Assistance Program) en communiceer dit actief", type: "individueel", prioriteit: "midden", verantwoordelijke: "HR-manager", deadline: "Binnen 3 maanden", kostenindicatie: "€2000-3500 per jaar" },
    ],
    "Agressie en geweld": [
      { maatregel: "Ontwikkel een integraal agressieprotocol met escalatieladder, de-escalatietechnieken en een meldingssysteem voor alle incidenten", type: "bronmaatregel", prioriteit: "hoog", verantwoordelijke: "Operationeel manager", deadline: "Binnen 1 maand", kostenindicatie: "€2000-3000" },
      { maatregel: "Organiseer per kwartaal een verplichte training conflicthantering en zelfverdediging bij een SVNL-gecertificeerd opleidingsinstituut", type: "collectief", prioriteit: "hoog", verantwoordelijke: "Operationeel manager", deadline: "Binnen 3 maanden", kostenindicatie: "€3000-5000 per jaar" },
      { maatregel: "Verstrek steekwerende vesten (klasse KR1) en bodycams aan alle beveiligers bij hoog-risico objecten en evenementen", type: "individueel", prioriteit: "hoog", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 1 maand", kostenindicatie: "€5000-8000" },
    ],
    "BHV en noodprocedures": [
      { maatregel: "Stel per locatie een actueel ontruimingsplan op en hang deze zichtbaar op, inclusief verzamelplaatsen en vluchtwegen", type: "bronmaatregel", prioriteit: "hoog", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 1 maand", kostenindicatie: "€500-1000" },
      { maatregel: "Leid minimaal 2 extra BHV'ers op en maak een BHV-rooster dat gekoppeld is aan het dienstrooster zodat er altijd minimaal 1 BHV'er per locatie beschikbaar is", type: "organisatorisch", prioriteit: "hoog", verantwoordelijke: "HR-manager", deadline: "Binnen 3 maanden", kostenindicatie: "€1500-2500" },
      { maatregel: "Plaats een AED op elke vaste bewakingslocatie en train alle beveiligers in het gebruik ervan", type: "collectief", prioriteit: "midden", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 3 maanden", kostenindicatie: "€3000-4500" },
    ],
    "Alleen werken": [
      { maatregel: "Implementeer een digitaal check-in systeem (bijv. man-down app) dat automatisch alarm slaat als een beveiliger niet binnen 30 minuten incheckt", type: "bronmaatregel", prioriteit: "hoog", verantwoordelijke: "Operationeel manager", deadline: "Binnen 1 maand", kostenindicatie: "€1500-2500" },
      { maatregel: "Stel een protocol 'Alleen werken' op met risicoanalyse per locatie, maximale diensttijden en verplichte communicatiechecks", type: "organisatorisch", prioriteit: "hoog", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 3 maanden", kostenindicatie: "€300-500" },
      { maatregel: "Voorzie solo-beveiligers van een noodknop-portofoon met GPS-tracking en directe verbinding met de meldkamer", type: "collectief", prioriteit: "midden", verantwoordelijke: "Operationeel manager", deadline: "Binnen 3 maanden", kostenindicatie: "€2000-3500" },
    ],
    "Beeldschermwerk / ergonomie": [
      { maatregel: "Laat een gecertificeerde ergonoom werkplekonderzoek uitvoeren voor alle kantoor- en meldkamerwerkplekken en pas werkplekken aan op basis van individuele behoeften", type: "bronmaatregel", prioriteit: "laag", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 3 maanden", kostenindicatie: "€1500-3000" },
      { maatregel: "Installeer verstelbare bureaus, ergonomische stoelen en monitorarmen op alle meldkamer- en kantoorwerkplekken", type: "collectief", prioriteit: "laag", verantwoordelijke: "Operationeel manager", deadline: "Binnen 6 maanden", kostenindicatie: "€3000-5000" },
      { maatregel: "Implementeer software die meldkameroperators herinnert aan beeldschermpauzes (5 min per uur) en beweegmomenten", type: "individueel", prioriteit: "laag", verantwoordelijke: "HR-manager", deadline: "Binnen 3 maanden", kostenindicatie: "€200-400" },
    ],
    "Verkeer en transport": [
      { maatregel: "Stel een vermoeidheidsprotocol op: maximaal 2 uur aaneengesloten rijden tijdens nachtdiensten en verplichte rustpauzes bij surveillance-rondes", type: "bronmaatregel", prioriteit: "midden", verantwoordelijke: "Operationeel manager", deadline: "Binnen 1 maand", kostenindicatie: "Geen extra kosten" },
      { maatregel: "Rust alle bedrijfsvoertuigen uit met dashcams, EHBO-sets en gevarendriehoeken en voer halfjaarlijkse voertuigcontroles in", type: "collectief", prioriteit: "midden", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 3 maanden", kostenindicatie: "€2000-3500" },
      { maatregel: "Organiseer jaarlijks een rijvaardigheidstraining met focus op rijden bij nacht, vermoeidheid en slechte weersomstandigheden", type: "individueel", prioriteit: "laag", verantwoordelijke: "HR-manager", deadline: "Binnen 6 maanden", kostenindicatie: "€1500-2500" },
    ],
    "Binnenklimaat en ventilatie": [
      { maatregel: "Installeer airconditioning of mobiele koelunits in de portiersloge en meldkamer met thermostaatregeling op maximaal 25°C", type: "bronmaatregel", prioriteit: "laag", verantwoordelijke: "Operationeel manager", deadline: "Binnen 6 maanden", kostenindicatie: "€2000-4000" },
      { maatregel: "Stel een hitteprotocol op met maatregelen bij temperaturen boven 28°C: extra pauzes, koude dranken en mogelijkheid tot taakverlichting", type: "organisatorisch", prioriteit: "laag", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 3 maanden", kostenindicatie: "€200-500" },
      { maatregel: "Plaats CO2-meters in de meldkamer en portiersloge en ventileer bij overschrijding van 1200 ppm", type: "collectief", prioriteit: "laag", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 3 maanden", kostenindicatie: "€300-600" },
    ],
    "Persoonlijke beschermingsmiddelen": [
      { maatregel: "Voer een PBM-inventarisatie uit per functie en locatie en stel een PBM-verstrekkingsbeleid op inclusief registratie en vervangingsschema", type: "bronmaatregel", prioriteit: "midden", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 1 maand", kostenindicatie: "€500-800" },
      { maatregel: "Schaf steekwerende vesten (VPAM klasse KR1+SP1) en veiligheidsschoenen (S3) aan voor alle operationele beveiligers", type: "collectief", prioriteit: "midden", verantwoordelijke: "Operationeel manager", deadline: "Binnen 3 maanden", kostenindicatie: "€6000-10000" },
      { maatregel: "Train alle beveiligers in het juiste gebruik, onderhoud en controle van hun PBM's en documenteer dit in het personeelsdossier", type: "individueel", prioriteit: "midden", verantwoordelijke: "HR-manager", deadline: "Binnen 3 maanden", kostenindicatie: "€500-1000" },
    ],
    "Voorlichting en onderricht": [
      { maatregel: "Ontwikkel een gestructureerd inwerkprogramma van minimaal 2 weken met modules over arborisico's, noodprocedures en veilig werken in de beveiliging", type: "bronmaatregel", prioriteit: "midden", verantwoordelijke: "HR-manager", deadline: "Binnen 3 maanden", kostenindicatie: "€1000-1500" },
      { maatregel: "Plan halfjaarlijkse Toolbox-meetings per team over actuele arbo-onderwerpen zoals agressiehantering, ergonomie en BHV", type: "organisatorisch", prioriteit: "midden", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 3 maanden", kostenindicatie: "€500-800" },
      { maatregel: "Maak instructiekaarten in meerdere talen (Nederlands, Engels, Arabisch) voor de belangrijkste veiligheidsprocedures op elke locatie", type: "collectief", prioriteit: "laag", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 6 maanden", kostenindicatie: "€300-600" },
    ],
    "Geluid": [
      { maatregel: "Voer geluidsmetingen uit op alle evenementenlocaties waar beveiligers worden ingezet en documenteer de blootstellingsniveaus", type: "bronmaatregel", prioriteit: "laag", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 3 maanden", kostenindicatie: "€500-1000" },
      { maatregel: "Verstrek gehoorbescherming (otoplastieken op maat) aan alle beveiligers die werken bij evenementen met geluidsniveaus boven 80 dB(A)", type: "collectief", prioriteit: "laag", verantwoordelijke: "Operationeel manager", deadline: "Binnen 3 maanden", kostenindicatie: "€1200-2000" },
      { maatregel: "Bied jaarlijks audiometrisch onderzoek aan voor beveiligers die regelmatig bij evenementen worden ingezet", type: "individueel", prioriteit: "laag", verantwoordelijke: "HR-manager", deadline: "Binnen 6 maanden", kostenindicatie: "€800-1500" },
    ],
    "Nachtarbeid en werktijden": [
      { maatregel: "Ontwikkel een nachtdienstbeleid conform de Arbeidstijdenwet met voorwaartse roosterrotatie en minimaal 11 uur rust tussen diensten", type: "bronmaatregel", prioriteit: "midden", verantwoordelijke: "Operationeel manager", deadline: "Binnen 3 maanden", kostenindicatie: "€500-800" },
      { maatregel: "Bied nachtwerkers jaarlijks een aanvullend arbeidsgezondheidskundig onderzoek aan conform Arbeidstijdenwet art. 4:9", type: "organisatorisch", prioriteit: "midden", verantwoordelijke: "HR-manager", deadline: "Binnen 6 maanden", kostenindicatie: "€1500-2500" },
      { maatregel: "Zorg voor gezonde voeding en warme dranken tijdens nachtdiensten en richt een geschikte rustfaciliteit in op elke locatie", type: "collectief", prioriteit: "laag", verantwoordelijke: "Operationeel manager", deadline: "Binnen 3 maanden", kostenindicatie: "€800-1500" },
    ],
    "Brand- en explosiegevaar": [
      { maatregel: "Stel per bewaakt object een beknopt brandbestrijdingsplan op en zorg dat elke beveiliger weet waar blusmiddelen en brandmeldcentrale zich bevinden", type: "bronmaatregel", prioriteit: "laag", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 3 maanden", kostenindicatie: "€500-1000" },
      { maatregel: "Organiseer jaarlijks een praktische brandblus-oefening op locatie, aanvullend op de reguliere BHV-herhalingscursus", type: "collectief", prioriteit: "laag", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 6 maanden", kostenindicatie: "€1000-1500" },
      { maatregel: "Leg per object vast welke specifieke brandrisico's er zijn (bijv. chemische stoffen, serverruimten) en neem dit op in de locatie-instructie", type: "organisatorisch", prioriteit: "laag", verantwoordelijke: "Operationeel manager", deadline: "Binnen 3 maanden", kostenindicatie: "€300-500" },
    ],
    "Infectierisico's": [
      { maatregel: "Stel een hygiëneprotocol op voor fouillering en lichamelijk contact, inclusief het verplicht gebruik van wegwerphandschoenen", type: "bronmaatregel", prioriteit: "laag", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 1 maand", kostenindicatie: "€300-600" },
      { maatregel: "Plaats handdesinfectiestations bij elke in-/uitgang van bewakte objecten en in alle bedrijfsvoertuigen", type: "collectief", prioriteit: "laag", verantwoordelijke: "Operationeel manager", deadline: "Binnen 1 maand", kostenindicatie: "€400-800" },
      { maatregel: "Bied vrijwillige vaccinatie (griep, hepatitis B) aan voor alle beveiligers en neem dit op in het PAGO-programma", type: "individueel", prioriteit: "laag", verantwoordelijke: "HR-manager", deadline: "Binnen 6 maanden", kostenindicatie: "€1000-2000" },
    ],
    "Elektriciteit": [
      { maatregel: "Maak per industrieel/bouwterrein-object een instructiekaart met aanduiding van gevaarlijke elektrische installaties en verboden zones", type: "bronmaatregel", prioriteit: "laag", verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 3 maanden", kostenindicatie: "€300-500" },
      { maatregel: "Neem basiskennis elektrische veiligheid (NEN 3140-bewustzijn) op in het inwerkprogramma voor beveiligers op industriële objecten", type: "organisatorisch", prioriteit: "laag", verantwoordelijke: "HR-manager", deadline: "Binnen 6 maanden", kostenindicatie: "€800-1200" },
      { maatregel: "Verstrek isolerende handschoenen en een zaklamp met voldoende lichtsterkte aan beveiligers op bouw- en industrieterreinen", type: "collectief", prioriteit: "laag", verantwoordelijke: "Operationeel manager", deadline: "Binnen 3 maanden", kostenindicatie: "€500-800" },
    ],
  };

  const fallback = [
    { maatregel: `Voer een specifieke risicoanalyse uit voor ${risico.cat.toLowerCase()} en stel een gericht actieplan op`, type: "bronmaatregel", prioriteit: risico.prio, verantwoordelijke: "Preventiemedewerker", deadline: "Binnen 3 maanden", kostenindicatie: "€500-1500" },
    { maatregel: `Ontwikkel een protocol voor ${risico.cat.toLowerCase()} met duidelijke procedures en verantwoordelijkheden`, type: "organisatorisch", prioriteit: risico.prio, verantwoordelijke: "Operationeel manager", deadline: "Binnen 6 maanden", kostenindicatie: "€200-500" },
    { maatregel: `Organiseer een praktijkgerichte training over ${risico.cat.toLowerCase()} voor alle betrokken medewerkers`, type: "individueel", prioriteit: "midden", verantwoordelijke: "HR-manager", deadline: "Binnen 3 maanden", kostenindicatie: "€1000-2000" },
  ];

  const maatregelen = maatregelenMap[risico.cat] || fallback;
  const num = tier === 'ENTERPRISE' ? 3 : tier === 'PROFESSIONAL' ? 3 : 1;
  return maatregelen.slice(0, num);
}

const tiers = ['basis', 'professional', 'enterprise'];

for (const tier of tiers) {
  const data = generateTestData(tier);
  
  if (tier === 'enterprise') {
    data.whiteLabel = {
      companyName: "Praesidion Security B.V.",
      primaryColor: "#1e3a5f",
    };
  }

  console.log(`Generating PDF for ${tier.toUpperCase()} (${data.generatedContent.risicos.length} risico's)...`);
  
  try {
    const res = await fetch('https://snelrie.nl/api/rie/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`  ❌ ${tier}: ${res.status} - ${err.substring(0, 200)}`);
      continue;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const outPath = path.join(outputDir, `RIE-Praesidion-${tier.toUpperCase()}.pdf`);
    fs.writeFileSync(outPath, buffer);
    console.log(`  ✅ ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  } catch (e) {
    console.error(`  ❌ ${tier}: ${e.message}`);
  }
}

console.log('Done!');
