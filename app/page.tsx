import Link from "next/link";
import { cookies } from "next/headers";
import {
  Shield,
  Zap,
  FileText,
  CheckCircle2,
  Clock,
  Building2,
  Scale,
  Star,
  ChevronDown,
  AlertTriangle,
  ShieldAlert,
  Timer,
  PiggyBank,
  CalendarCheck,
  Target,
  HardHat,
  Truck,
  UtensilsCrossed,
  Store,
  HeartPulse,
} from "lucide-react";
import { variantConfig, type ABVariant } from "@/lib/ab-variants";
import { ABTracker } from "@/components/ABTracker";
import { HeroCTA } from "@/components/HeroCTA";

type SectorKey = "bouw" | "transport" | "horeca" | "retail" | "zorg";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const pricingTiers = [
  {
    name: "Gratis Scan",
    price: "€0",
    description: "Ontdek je grootste risico's",
    features: [
      "3 risico's zichtbaar",
      "Geblurde preview van volledige RI&E",
      "Branchespecifieke analyse",
      "Geen account nodig",
    ],
    cta: "Start Gratis Scan",
    href: "/scan",
    highlighted: false,
    tier: "GRATIS",
  },
  {
    name: "Basis",
    price: "€99",
    description: "Volledige RI&E voor kleine bedrijven",
    features: [
      "Volledige risico-inventarisatie",
      "Alle risico's met maatregelen",
      "Professioneel PDF-rapport",
      "Wettelijke verwijzingen",
    ],
    cta: "Bestel Basis RI&E",
    href: "/scan?tier=BASIS",
    highlighted: false,
    tier: "BASIS",
  },
  {
    name: "Professional",
    price: "€249",
    description: "RI&E + Plan van Aanpak",
    features: [
      "Alles van Basis",
      "Uitgebreid Plan van Aanpak",
      "Prioriteitenmatrix",
      "Concrete deadlines & verantwoordelijken",
      "Kostenramingen per maatregel",
    ],
    cta: "Bestel Professional",
    href: "/scan?tier=PROFESSIONAL",
    highlighted: true,
    tier: "PROFESSIONAL",
  },
  {
    name: "Enterprise",
    price: "€499",
    description: "Voor grotere organisaties",
    features: [
      "Alles van Professional",
      "Uitgebreide rapportage",
      "AI Expert Chat (24/7)",
      "Jaarlijkse update-herinnering",
      "Persoonlijke AI-assistent met volledige kennis van uw RI&E",
    ],
    cta: "Bestel Enterprise",
    href: "/scan?tier=ENTERPRISE",
    highlighted: false,
    tier: "ENTERPRISE",
  },
];

const genericFaqs = [
  {
    q: "Is een RI&E verplicht?",
    a: "Ja. Volgens artikel 5 van de Arbowet is elke werkgever in Nederland verplicht een RI&E op te stellen. Dit geldt voor alle bedrijven met personeel, inclusief bedrijven met maar 1 werknemer.",
  },
  {
    q: "Wat is het verschil met een traditionele RI&E?",
    a: "Een traditionele RI&E wordt uitgevoerd door een externe arbodeskundige en kost €500 tot €5.000+. Dat duurt vaak weken. SnelRIE gebruikt AI om in minuten een branchespecifieke RI&E te genereren, op basis van dezelfde wettelijke kaders en arbocatalogi.",
  },
  {
    q: "Is deze RI&E rechtsgeldig?",
    a: "Een RI&E is een document dat de werkgever zelf moet opstellen (Arbowet art. 5). SnelRIE helpt u hierbij met een professioneel rapport. Voor bedrijven met meer dan 25 medewerkers moet de RI&E getoetst worden door een gecertificeerde arbodeskundige. Wij adviseren altijd om de RI&E te laten beoordelen door uw arbodienst.",
  },
  {
    q: "Hoe werkt de AI-analyse?",
    a: "U vult een intake-formulier in over uw bedrijf, werkzaamheden en huidige veiligheidsmaatregelen. Onze AI combineert deze informatie met de branchespecifieke arbocatalogus en wetgeving om een gepersonaliseerde RI&E te genereren.",
  },
  {
    q: "Welke branches worden ondersteund?",
    a: "We starten met de beveiligingsbranche en breiden snel uit naar horeca, bouw, kinderopvang, schoonmaak, detailhandel, transport en meer. Heeft u een specifieke branche nodig? Neem contact op.",
  },
  {
    q: "Wat zit er in het Plan van Aanpak?",
    a: "Het Plan van Aanpak (Professional en Enterprise tier) bevat concrete maatregelen per risico, geprioriteerd op urgentie, met deadlines, verantwoordelijken en kostenramingen. Dit is het document dat u aan de Inspectie SZW kunt tonen.",
  },
  {
    q: "Kan ik de RI&E later aanpassen?",
    a: "Ja. Na aankoop ontvangt u het volledige rapport als PDF. U kunt dit naar eigen inzicht aanpassen. De RI&E moet jaarlijks geactualiseerd worden of bij wijzigingen in uw bedrijfsvoering.",
  },
];

const uspIcons = {
  a: [Zap, Building2, Clock],
  b: [PiggyBank, CalendarCheck, Target],
  c: [AlertTriangle, ShieldAlert, Timer],
};

const heroBadge = {
  a: { icon: Scale, text: "Wettelijk verplicht voor alle werkgevers" },
  b: { icon: PiggyBank, text: "Bespaar €1.900+ op uw RI&E" },
  c: { icon: AlertTriangle, text: "Inspectie SZW controleert steeds vaker" },
};

const sectorIcons = {
  bouw: HardHat,
  transport: Truck,
  horeca: UtensilsCrossed,
  retail: Store,
  zorg: HeartPulse,
};

const sectorConfig: Record<
  SectorKey,
  {
    label: string;
    intro: string;
    hero: { badge: string; header: string; highlight: string; subtext: string; cta: string };
    stats: { value: string; label: string }[];
    risks: string[];
    proofTitle: string;
    proofText: string;
    howItWorks: { title: string; desc: string }[];
    midCta: { eyebrow: string; title: string; text: string; button: string };
    bottom: { title: string; text: string; button: string };
    faq: { q: string; a: string };
    trustPoints: string[];
    socialProof: { quote: string; source: string };
  }
> = {
  bouw: {
    label: "Bouw & installatie",
    intro: "Voor aannemers, installatiebedrijven en projectorganisaties met buitendienst, hoogtewerk en wisselende locaties.",
    hero: {
      badge: "Bouwbedrijven hebben vaak meerdere risicoplekken tegelijk: werkplaats, bus, projectlocatie en onderaannemers.",
      header: "Uw RI&E voor bouw- en installatiewerk",
      highlight: "zonder weken wachten op een adviseur",
      subtext:
        "Krijg in minuten een branchespecifieke RI&E voor hoogtewerk, buitenwerk, gevaarlijke stoffen en wisselende projectlocaties. Ideaal voor aannemers en installatiebedrijven die snel overzicht willen vóór de volgende klusstart.",
      cta: "Start gratis bouw-RI&E",
    },
    stats: [
      { value: "Hoogtewerk", label: "steigers, ladders, daken" },
      { value: "Buitenwerk", label: "weer, verkeer, wisselende locaties" },
      { value: "Stoffen", label: "verf, lijmen, oplosmiddelen" },
      { value: "<5 min", label: "tot eerste risico-overzicht" },
    ],
    risks: ["hoogtewerk en valgevaar", "gevaarlijke stoffen en stofbelasting", "wisselende projectlocaties en coördinatie"],
    proofTitle: "Gebouwd voor bedrijven waar veiligheid per project verschuift",
    proofText:
      "Dezelfde intake die werkt voor een kantoorpand is te vlak voor bouw en installatie. Daarom legt deze variant extra nadruk op hoogtewerk, buitenwerk, tijdelijke werkplekken en praktische maatregelen die direct in een Plan van Aanpak passen.",
    howItWorks: [
      { title: "Selecteer bouw of installatie", desc: "We vullen direct de meest voorkomende risicosignalen voor projectlocaties en buitendienst voor u in." },
      { title: "Beantwoord 3 praktijksituaties", desc: "Hoogtewerk, stoffen en buitenwerk zijn al voorgeselecteerd zodat u alleen hoeft te bevestigen of bij te sturen." },
      { title: "Bekijk de eerste projectrisico's", desc: "U ziet direct waar uw grootste gaten zitten voordat de volgende klus start." },
      { title: "Download rapport + Plan van Aanpak", desc: "Geschikt om intern te bespreken met uitvoering, planning of preventiemedewerker." },
    ],
    midCta: {
      eyebrow: "Veel bouwbedrijven actualiseren pas na een incident of auditvraag.",
      title: "Check nu waar uw bouw-RI&E dun of verouderd is",
      text: "U hoeft niet meteen het hele dossier te herbouwen. Start met een gratis scan en zie direct welke risicoblokken extra aandacht vragen.",
      button: "Start gratis bouwscan →",
    },
    bottom: {
      title: "Zet uw bouw-RI&E vandaag nog scherper.",
      text: "Begin gratis en ontdek binnen minuten waar hoogtewerk, buitenwerk en projectwissels extra risico creëren.",
      button: "Start gratis bouw-RI&E",
    },
    faq: {
      q: "Is dit ook geschikt voor installatiebedrijven met meerdere bussen en projectlocaties?",
      a: "Ja. Juist daarvoor is deze variant bedoeld. SnelRIE helpt risico's structureren rond buitendienst, hoogtewerk, gereedschap, verkeer en wisselende locaties zodat u sneller kunt actualiseren.",
    },
    trustPoints: [
      "Voorgeselecteerde risico's voor hoogtewerk, stoffen en buitenwerk",
      "Geschikt als snelle herijking vóór nieuwe klusstart of auditvraag",
      "Doorgifte naar scanflow met bouw-context actief",
    ],
    socialProof: {
      quote: "Voor bouwbedrijven werkt een generieke kantoor-RI&E gewoon niet. Deze variant dwingt direct naar projectrisico's en praktische maatregelen.",
      source: "SnelRIE bouwpropositie",
    },
  },
  transport: {
    label: "Transport & logistiek",
    intro: "Voor transporteurs, logistieke bedrijven, magazijnen en grondverzet met chauffeurs, laden/lossen en wisselende diensten.",
    hero: {
      badge: "Transport-RI&E's lopen vaak achter op de praktijk: alleen rijden, laadperrons, nachtwerk en seizoensdrukte veranderen continu.",
      header: "Uw RI&E voor transport en logistiek",
      highlight: "met focus op chauffeurs, laden/lossen en diensten",
      subtext:
        "Breng in minuten de grootste RI&E-risico's in kaart voor chauffeurs, magazijnteams en planners. Inclusief alleen werken, fysieke belasting, nachtdiensten en operationele piekdrukte.",
      cta: "Start gratis transport-RI&E",
    },
    stats: [
      { value: "Chauffeurs", label: "alleen op pad of op wisselende routes" },
      { value: "Laadperron", label: "fysieke belasting en verkeersbewegingen" },
      { value: "Nachtwerk", label: "onregelmatige diensten en vermoeidheid" },
      { value: "€99", label: "voor volledige RI&E" },
    ],
    risks: ["alleen werken op route of terrein", "laden/lossen en fysieke belasting", "nachtdiensten en vermoeidheid"],
    proofTitle: "Gemaakt voor operatie, niet alleen voor papier",
    proofText:
      "Transportbedrijven hebben vaak al losse veiligheidsafspraken, maar geen compact totaalbeeld dat echt aansluit op chauffeurs, loodsen en planning. Deze variant stuurt de intake precies daarop aan.",
    howItWorks: [
      { title: "Kies transport & logistiek", desc: "De scan zet direct de juiste defaults aan voor fysiek werk, nachtwerk en alleen rijden." },
      { title: "Bevestig uw werksituatie", desc: "Met 3 korte keuzes ziet de AI of uw grootste risico's in route, loods of laadperron zitten." },
      { title: "Ontvang uw risico-overzicht", desc: "Binnen minuten ziet u welke thema's prioriteit moeten krijgen in uw RI&E." },
      { title: "Werk door naar Plan van Aanpak", desc: "Upgrade wanneer u concrete maatregelen, prioriteiten en verantwoordelijken wilt vastleggen." },
    ],
    midCta: {
      eyebrow: "Veel logistieke bedrijven hebben wel toolboxen, maar geen actuele RI&E die de hele operatie dekt.",
      title: "Zie direct waar uw transport-RI&E achterloopt op de praktijk",
      text: "Start gratis en ontdek of juist chauffeurs, laden/lossen of diensten het grootste gat in uw huidige aanpak vormen.",
      button: "Start gratis transportscan →",
    },
    bottom: {
      title: "Maak uw transport-RI&E operationeel bruikbaar.",
      text: "Geen lang adviestraject eerst. Begin met een gratis scan en toets uw grootste logistieke risico's direct.",
      button: "Start gratis transport-RI&E",
    },
    faq: {
      q: "Werkt dit ook voor bedrijven met zowel chauffeurs als magazijnmedewerkers?",
      a: "Ja. De intake is juist geschikt voor combinaties van routewerk, laden/lossen, terreinverkeer en magazijnoperatie. Daardoor krijgt u een RI&E die beter aansluit op de praktijk dan een generiek sjabloon.",
    },
    trustPoints: [
      "Gericht op chauffeurs, loods, laadperron en nachtdiensten",
      "Helpt losse toolboxen vertalen naar één RI&E-overzicht",
      "Lage instap: gratis scan, daarna upgrade naar volledig Plan van Aanpak",
    ],
    socialProof: {
      quote: "Transportbedrijven hebben vaak wél veiligheidsafspraken, maar geen compact totaalbeeld voor route, loods en planning tegelijk.",
      source: "SnelRIE transportpropositie",
    },
  },
  horeca: {
    label: "Horeca & hospitality",
    intro: "Voor restaurants, hotels, brouwerijen en hospitalitylocaties met keuken, bediening, housekeeping, events en piekdrukte.",
    hero: {
      badge: "Horeca-risico's zitten niet alleen in de keuken: ook werkdruk, avonduren, housekeeping en piekdrukte horen in een goede RI&E.",
      header: "Uw RI&E voor horeca en hospitality",
      highlight: "van keuken tot bediening en backoffice",
      subtext:
        "Maak snel een branchespecifieke RI&E voor restaurants, hotels en hospitalityteams. Inclusief tillen, hete vloeistoffen, schoonmaakmiddelen, avond- en nachtdiensten en operationele piekmomenten.",
      cta: "Start gratis horeca-RI&E",
    },
    stats: [
      { value: "Keuken", label: "hitte, gladheid, snijrisico's" },
      { value: "Bediening", label: "piekdrukte en fysieke belasting" },
      { value: "Housekeeping", label: "schoonmaakmiddelen en tilwerk" },
      { value: "Gratis", label: "eerste risico-overzicht" },
    ],
    risks: ["hete vloeistoffen en gladde vloeren", "tillen, duwen en piekbelasting", "avond- en nachtdiensten"],
    proofTitle: "Voor hospitalitybedrijven waar de werkvloer elke dag anders voelt",
    proofText:
      "Restaurant, hotel en eventlocaties combineren vaak meerdere werksoorten in één RI&E. Deze variant helpt dat sneller concreet te maken, zonder te blijven hangen in alleen een keukenchecklist.",
    howItWorks: [
      { title: "Kies horeca", desc: "We zetten direct standaard aannames klaar voor fysieke belasting, schoonmaakmiddelen en avondwerk." },
      { title: "Controleer 3 werksituaties", desc: "Met een paar ja/nee-keuzes past de scan zich aan op keuken, bediening of hospitality-omgeving." },
      { title: "Bekijk uw eerste risico's", desc: "U ziet meteen welke horeca-risico's het meest urgent zijn voor uw team." },
      { title: "Upgrade naar volledig rapport", desc: "Download een RI&E en Plan van Aanpak dat u intern kunt bespreken of laten toetsen." },
    ],
    midCta: {
      eyebrow: "Piekdrukte maskeert vaak structurele RI&E-gaten.",
      title: "Check vandaag nog uw horeca-risico's",
      text: "Van keuken tot housekeeping: start gratis en zie waar uw huidige veiligheidsaanpak waarschijnlijk te generiek of te oud is.",
      button: "Start gratis horecascan →",
    },
    bottom: {
      title: "Maak uw horeca-RI&E concreet en actueel.",
      text: "Start gratis en ontdek direct waar keuken, bediening en hospitality extra risico opleveren.",
      button: "Start gratis horeca-RI&E",
    },
    faq: {
      q: "Past dit ook bij combinaties van restaurant, hotel en events?",
      a: "Ja. Dat is precies waar deze variant op inspeelt. SnelRIE helpt meerdere werksoorten in één overzicht te vangen, zodat uw RI&E niet blijft steken in alleen algemene horecamaatregelen.",
    },
    trustPoints: [
      "Specifiek voor keuken, bediening, housekeeping en events",
      "Pakt piekdrukte, gladheid, schoonmaakmiddelen en avonduren mee",
      "Goede instap voor hotels en restaurants met meerdere werksoorten",
    ],
    socialProof: {
      quote: "Hospitalitylocaties combineren keuken, housekeeping, events en avondwerk. Daarvoor is één generiek sjabloon meestal te mager.",
      source: "SnelRIE horecapropositie",
    },
  },
  retail: {
    label: "Retail & detailhandel",
    intro: "Voor winkels, tuincentra en retailketens met winkelvloer, magazijn, bevoorrading en piekdrukte.",
    hero: {
      badge: "Retail-risico's zitten in meer dan alleen de winkelvloer: denk aan bevoorrading, alleen openen/sluiten en seizoensdrukte.",
      header: "Uw RI&E voor retail en detailhandel",
      highlight: "van winkelvloer tot magazijn",
      subtext:
        "Krijg in minuten een branchespecifieke RI&E voor tillen, bevoorrading, kassawerk, alleen werken en piekmomenten. Geschikt voor winkels, tuincentra en retailbedrijven die snel willen zien waar hun RI&E nu gaten laat vallen.",
      cta: "Start gratis retail-RI&E",
    },
    stats: [
      { value: "Winkelvloer", label: "klantverkeer, gladheid, incidenten" },
      { value: "Magazijn", label: "dozen, pallets en bevoorrading" },
      { value: "Alleen werk", label: "openen, sluiten, rustige diensten" },
      { value: "<5 min", label: "tot eerste retailscan" },
    ],
    risks: ["tillen en bevoorrading", "alleen openen/sluiten", "kassawerk en piekdrukte"],
    proofTitle: "Gebouwd voor winkels waar front- en backoffice door elkaar lopen",
    proofText:
      "In retail verschuift risico snel tussen klantcontact, magazijn, bevoorrading en seizoensdrukte. Deze variant maakt die mix concreet zonder dat u eerst een lang traject met adviseur hoeft in te plannen.",
    howItWorks: [
      { title: "Kies retail", desc: "De scan zet direct aannames klaar voor winkelvloer, bevoorrading en alleen werken." },
      { title: "Beantwoord 3 korte praktijksituaties", desc: "We sturen op tillen, piekdrukte en kassawerk zodat de eerste risico's meteen scherp worden." },
      { title: "Bekijk uw eerste risicoblokken", desc: "U ziet snel of de grootste gaten in de winkelvloer, het magazijn of de personeelsbezetting zitten." },
      { title: "Werk door naar volledig rapport", desc: "Upgrade voor een RI&E en Plan van Aanpak dat u intern kunt gebruiken of laten toetsen." },
    ],
    midCta: {
      eyebrow: "Veel winkels hebben wel werkafspraken, maar geen actuele RI&E die winkelvloer én logistiek samenpakt.",
      title: "Zie waar uw retail-RI&E nu te generiek is",
      text: "Start gratis en ontdek direct of tillen, bevoorrading of alleen werken extra aandacht vraagt in uw huidige aanpak.",
      button: "Start gratis retailscan →",
    },
    bottom: {
      title: "Maak uw retail-RI&E vandaag praktischer.",
      text: "Start gratis en ontdek binnen minuten waar winkelvloer, magazijn en piekdrukte extra risico creëren.",
      button: "Start gratis retail-RI&E",
    },
    faq: {
      q: "Is dit ook geschikt voor winkels met zowel winkelvloer als magazijn?",
      a: "Ja. Juist die combinatie maakt retail-RI&E's vaak lastig. Deze variant helpt risico's rond bevoorrading, tillen, klantverkeer, kassawerk en alleen werken samen te structureren.",
    },
    trustPoints: [
      "Retailcopy sluit aan op winkelvloer, magazijn en bevoorrading",
      "Sterk voor tuincentra, detailhandel en multi-activiteit retail",
      "Direct inzetbaar als sectorspecifieke landingsvariant",
    ],
    socialProof: {
      quote: "Retailbedrijven hebben vaak geen gebrek aan procedures, maar wel aan één actuele RI&E die winkelvloer en logistiek samenpakt.",
      source: "SnelRIE retailpropositie",
    },
  },
  zorg: {
    label: "Zorg & care",
    intro: "Voor zorginstellingen, verpleeghuizen, GGZ, klinieken en zorgteams met tillen, nachtdiensten en cliëntcontact.",
    hero: {
      badge: "Zorg-RI&E's moeten rekening houden met fysieke belasting, nachtdiensten, agressie en werken met medische middelen.",
      header: "Uw RI&E voor zorg en care",
      highlight: "met focus op werkvloer, diensten en cliëntveiligheid",
      subtext:
        "Breng in minuten de grootste RI&E-risico's in kaart voor zorgteams. Inclusief tillen en verplaatsen, nachtdiensten, biologisch materiaal, agressie en werkdruk. Ideaal als snelle nulmeting of actualisatie.",
      cta: "Start gratis zorg-RI&E",
    },
    stats: [
      { value: "Tillen", label: "patiënten, bedden en hulpmiddelen" },
      { value: "Diensten", label: "nacht, weekend en onregelmaat" },
      { value: "Cliëntcontact", label: "agressie, PSA en belastbaarheid" },
      { value: "€99", label: "voor volledige zorg-RI&E" },
    ],
    risks: ["tillen en fysieke belasting", "nachtdiensten en vermoeidheid", "medicatie, biologisch materiaal en agressie"],
    proofTitle: "Gemaakt voor zorgorganisaties waar veiligheid en belastbaarheid samenkomen",
    proofText:
      "Zorg vraagt om meer dan een standaard checklist. Deze variant stuurt direct op tillen, diensten, cliëntcontact en middelengebruik zodat u sneller ziet waar uw actuele RI&E versterking nodig heeft.",
    howItWorks: [
      { title: "Kies zorg", desc: "De scan activeert direct de juiste uitgangspunten voor tillen, diensten en medische werkomgeving." },
      { title: "Controleer 3 praktijksituaties", desc: "Met korte keuzes past de intake zich aan op fysieke belasting, nachtdiensten en middelengebruik." },
      { title: "Zie uw eerste zorg-risico's", desc: "U krijgt snel zicht op de grootste hiaten in uw huidige RI&E of actualisatie." },
      { title: "Upgrade naar rapport + plan", desc: "Werk door naar een concreet document dat intern besproken of extern getoetst kan worden." },
    ],
    midCta: {
      eyebrow: "In zorg sluipen RI&E-gaten vaak in werkdruk, tillen en onregelmatige diensten.",
      title: "Check waar uw zorg-RI&E nu te oud of te algemeen is",
      text: "Start gratis en ontdek direct of fysieke belasting, PSA of diensten meer aandacht nodig hebben in uw huidige RI&E.",
      button: "Start gratis zorgscan →",
    },
    bottom: {
      title: "Maak uw zorg-RI&E sneller concreet.",
      text: "Begin gratis en toets in minuten waar werkvloer, diensten en cliëntcontact extra risico opleveren.",
      button: "Start gratis zorg-RI&E",
    },
    faq: {
      q: "Werkt dit ook voor kleinere zorglocaties of teams?",
      a: "Ja. De scan is juist bruikbaar voor zowel kleinere zorgteams als grotere organisaties die snel een actuele nulmeting of herijking willen doen rond tillen, diensten en middelengebruik.",
    },
    trustPoints: [
      "Toegespitst op tillen, diensten, PSA en medische werkomgeving",
      "Sterke insteek voor HR, teamleiding en preventiemedewerkers",
      "Praktische start voor actualisatie zonder eerst extern traject",
    ],
    socialProof: {
      quote: "Zorgorganisaties hebben vaak protocollen genoeg, maar missen een compacte RI&E-actualisatie die werkvloer, diensten en belastbaarheid echt samenbrengt.",
      source: "SnelRIE zorgpropositie",
    },
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const cookieStore = await cookies();
  const variant = (cookieStore.get("ab-variant")?.value || "a") as ABVariant;
  const v = variantConfig[variant];
  const badge = heroBadge[variant];
  const icons = uspIcons[variant];
  const resolvedParams = searchParams ? await searchParams : {};
  const sectorParam = Array.isArray(resolvedParams?.sector)
    ? resolvedParams?.sector?.[0]
    : resolvedParams?.sector;
  const activeSector = sectorParam && sectorParam in sectorConfig ? (sectorParam as SectorKey) : null;
  const sector = activeSector ? sectorConfig[activeSector] : null;
  const sectorHref = activeSector ? `/scan?sector=${activeSector}` : "/scan";
  const SectorIcon = activeSector ? sectorIcons[activeSector] : null;
  const pageFaqs = sector ? [...genericFaqs.slice(0, 3), sector.faq, ...genericFaqs.slice(3)] : genericFaqs;

  return (
    <main className={v.className}>
      <ABTracker variant={variant} />

      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-brand-600" />
            <span className="text-xl font-bold text-gray-900">
              Snel<span className="text-brand-600">RIE</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#hoe-werkt-het" className="text-sm text-gray-600 hover:text-gray-900">
              Hoe werkt het
            </a>
            <a href="#prijzen" className="text-sm text-gray-600 hover:text-gray-900">
              Prijzen
            </a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </a>
            <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
              Blog
            </Link>
          </div>
          <Link
            href={sectorHref}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
          >
            {sector ? sector.hero.cta : v.hero.cta}
          </Link>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            {sector && SectorIcon ? (
              <SectorIcon className="h-4 w-4" />
            ) : (
              <badge.icon className="h-4 w-4" />
            )}
            {sector ? sector.hero.badge : badge.text}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            {sector ? sector.hero.header : v.hero.header}{" "}
            <span className="text-brand-600">
              {sector ? sector.hero.highlight : v.hero.headerHighlight}
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            {sector ? sector.hero.subtext : v.hero.subtext}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <HeroCTA variant={variant} cta={sector ? sector.hero.cta : v.hero.cta} href={sectorHref} />
            <a
              href="#hoe-werkt-het"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold border border-gray-200 hover:bg-gray-50 transition"
            >
              Hoe werkt het?
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            {sector ? (
              sector.stats.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>
                    <strong className="text-gray-700">{item.value}</strong> {item.label}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Vanaf €99
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Klaar in 5 minuten
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Professioneel PDF-rapport
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {!sector && (
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Kies uw sector</p>
              <p className="text-gray-600 mt-2">Bekijk de RI&E-variant die het beste past bij uw branche.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {(
                Object.entries(sectorConfig) as Array<[SectorKey, (typeof sectorConfig)[SectorKey]]>
              ).map(([key, item]) => {
                const Icon = sectorIcons[key];
                return (
                  <Link
                    key={key}
                    href={`/?sector=${key}`}
                    className="rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-md transition p-5 text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-brand-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{item.label}</h2>
                    <p className="text-sm text-gray-600 mt-2">{item.intro}</p>
                    <div className="mt-4 text-sm font-medium text-brand-700">Bekijk sectorpagina →</div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {sector ? (
              sector.stats.map((item) => (
                <div key={item.label}>
                  <div className="text-3xl font-extrabold text-brand-600">{item.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{item.label}</div>
                </div>
              ))
            ) : (
              <>
                <div>
                  <div className="text-3xl font-extrabold text-brand-600">500+</div>
                  <div className="text-sm text-gray-500 mt-1">RI&E&apos;s gegenereerd</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-brand-600">4.8/5</div>
                  <div className="text-sm text-gray-500 mt-1">klantwaardering</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-brand-600">&lt;5 min</div>
                  <div className="text-sm text-gray-500 mt-1">gemiddelde doorlooptijd</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-brand-600">€1.900+</div>
                  <div className="text-sm text-gray-500 mt-1">bespaard vs. adviseur</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            <span>SSL Beveiligd</span>
          </div>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-brand-600" />
            <span>Arbowet-conform</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-400" />
            <span>KvK Geregistreerd</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            <span>AVG/GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            <span>Branche-erkend</span>
          </div>
        </div>
      </section>

      {sector && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">Waarom deze variant beter past</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{sector.proofTitle}</h2>
              <p className="text-gray-600 leading-relaxed">{sector.proofText}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {sector.risks.map((risk) => (
                  <span key={risk} className="inline-flex items-center rounded-full bg-brand-50 px-4 py-2 text-sm text-brand-700 border border-brand-100">
                    {risk}
                  </span>
                ))}
              </div>
              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                {sector.trustPoints.map((point) => (
                  <div key={point} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    <div className="font-semibold text-gray-900 mb-1">Trust</div>
                    {point}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 mb-3">Wat gebruikers zeggen</p>
                <blockquote className="text-sm text-gray-800 leading-relaxed">&ldquo;{sector.socialProof.quote}&rdquo;</blockquote>
                <div className="mt-3 text-xs text-gray-500">{sector.socialProof.source}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {v.usps.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {v.usps.items.map((usp, i) => {
              const Icon = icons[i];
              return (
                <div
                  key={usp.title}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition"
                >
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{usp.title}</h3>
                  <p className="text-gray-600">{usp.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      <section id="hoe-werkt-het" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Hoe werkt het?</h2>
          <div className="space-y-8">
            {(sector
              ? sector.howItWorks.map((item, index) => ({ step: String(index + 1), ...item }))
              : [
                  {
                    step: "1",
                    title: "Vul het intake-formulier in",
                    desc: "Beantwoord vragen over uw bedrijf, werkzaamheden en huidige veiligheidsmaatregelen. Duurt circa 3 minuten.",
                  },
                  {
                    step: "2",
                    title: "AI genereert uw RI&E",
                    desc: "Onze AI combineert uw antwoorden met de branchespecifieke kennisbank en wetgeving tot een compleet rapport.",
                  },
                  {
                    step: "3",
                    title: "Bekijk de preview",
                    desc: "U ziet direct een preview van uw RI&E. De gratis scan toont de eerste risico's. Upgrade voor het volledige rapport.",
                  },
                  {
                    step: "4",
                    title: "Download uw PDF-rapport",
                    desc: "Na betaling ontvangt u het professionele PDF-rapport met alle risico's, maatregelen en het Plan van Aanpak.",
                  },
                ]).map((s) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
                  <p className="text-gray-600 mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-brand-50 rounded-2xl p-8 sm:p-12 border border-brand-100">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <AlertTriangle className="h-3.5 w-3.5" />
              {sector ? sector.midCta.eyebrow : "Wist u dat? 72% van het MKB heeft geen geldige RI&E"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {sector ? sector.midCta.title : "Ontdek in 30 seconden uw grootste risico's"}
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              {sector
                ? sector.midCta.text
                : "Start met een gratis scan - geen account, geen verplichtingen. U ziet direct welke risico's in uw branche spelen."}
            </p>
            <HeroCTA
              variant={variant}
              cta={sector ? sector.midCta.button : "Start Gratis Risico-Scan →"}
              href={sectorHref}
            />
          </div>
        </div>
      </section>

      <section id="prijzen" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Transparante prijzen</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Geen verborgen kosten, geen abonnement. Eenmalige betaling voor uw complete RI&E.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 flex flex-col ${
                  tier.highlighted
                    ? "bg-brand-600 text-white ring-4 ring-brand-600/20 scale-105"
                    : "bg-white border border-gray-200"
                }`}
              >
                {tier.highlighted && (
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand-200 mb-2">
                    Meest gekozen
                  </div>
                )}
                <h3 className={`text-lg font-semibold ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
                  {tier.name}
                </h3>
                <div className="mt-2 mb-4">
                  <span className={`text-3xl font-extrabold ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
                    {tier.price}
                  </span>
                  <span className={`text-sm ml-1 ${tier.highlighted ? "text-brand-200" : "text-gray-500"}`}>
                    eenmalig
                  </span>
                </div>
                <p className={`text-sm mb-6 ${tier.highlighted ? "text-brand-100" : "text-gray-600"}`}>
                  {tier.description}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2
                        className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          tier.highlighted ? "text-brand-200" : "text-green-500"
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`${tier.href}${activeSector ? `${tier.href.includes("?") ? "&" : "?"}sector=${activeSector}` : ""}`}
                  className={`block text-center py-3 px-4 rounded-lg font-medium text-sm transition ${
                    tier.highlighted
                      ? "bg-white text-brand-600 hover:bg-brand-50"
                      : "bg-brand-600 text-white hover:bg-brand-700"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Veelgestelde vragen</h2>
          <div className="space-y-4">
            {pageFaqs.map((faq) => (
              <details key={faq.q} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="border-l-4 border-amber-500 bg-amber-50 p-6 rounded-r-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Disclaimer</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              De RI&amp;E is een hulpmiddel voor de werkgever. Voor bedrijven met meer dan 25 medewerkers dient de RI&amp;E getoetst te worden door een gecertificeerde arbodienst/arbodeskundige (Arbowet art. 14). Dit rapport vervangt geen professioneel arbo-advies.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {sector ? sector.bottom.title : v.bottomCta.title}
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            {sector ? sector.bottom.text : v.bottomCta.text}
          </p>
          <HeroCTA
            variant={variant}
            cta={sector ? sector.bottom.button : v.bottomCta.button}
            isBottom
            href={sectorHref}
          />
        </div>
      </section>

      {/* Blog Section - Internal Linking for SEO */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Laatste artikelen
              </h2>
              <p className="text-gray-600 mt-2">
                Tips, wet- en regelgeving en praktijkverhalen over de RI&E
              </p>
            </div>
            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center gap-1.5 text-brand-600 font-medium hover:text-brand-700 transition text-sm"
            >
              Alle artikelen →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "RI&E kosten 2026: wat betaal je en hoe kan het goedkoper?",
                description: "Actuele prijzen voor MKB (€400 - €5.000+) en 5 slimme manieren om te besparen.",
                href: "/blog/rie-kosten-2026-wat-betaal-je-en-hoe-goedkoper",
                date: "12 maart 2026",
              },
              {
                title: "Boete bij geen RI&E: wat riskeert u?",
                description: "De Arbeidsinspectie deelt boetes van €4.500+ uit. Zo voorkomt u problemen.",
                href: "/blog/boete-geen-rie-arbeidsinspectie-handhaving",
                date: "9 maart 2026",
              },
              {
                title: "RI&E voor kleine bedrijven (<25 medewerkers)",
                description: "Wat is er verplicht, wanneer mag je toetsing overslaan en hoe pak je het slim aan?",
                href: "/blog/rie-kleine-bedrijven-onder-25-medewerkers",
                date: "7 maart 2026",
              },
            ].map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="group rounded-2xl border border-gray-200 p-6 hover:border-brand-200 hover:shadow-md transition"
              >
                <p className="text-xs text-gray-400 mb-2">{post.date}</p>
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
              </Link>
            ))}
          </div>
          <Link
            href="/blog"
            className="sm:hidden mt-6 inline-flex items-center gap-1.5 text-brand-600 font-medium text-sm"
          >
            Alle artikelen →
          </Link>
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-400" />
            <span className="text-white font-bold">SnelRIE</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/blog" className="hover:text-white transition">
              Blog
            </Link>
            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="/voorwaarden" className="hover:text-white transition">
              Voorwaarden
            </Link>
            <a href="mailto:info@snelrie.nl" className="hover:text-white transition">
              Contact
            </a>
          </div>
          <div className="text-sm text-center md:text-right">
            <p>© {new Date().getFullYear()} SnelRIE - onderdeel van Praesidion Holding B.V.</p>
            <p className="text-gray-500 text-xs mt-1">KvK: 97640794 · BTW: NL868152237B01</p>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "SnelRIE",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "AggregateOffer",
              lowPrice: "0",
              highPrice: "499",
              priceCurrency: "EUR",
            },
            description:
              "AI-gestuurde Risico-Inventarisatie & Evaluatie (RI&E) voor Nederlandse bedrijven. Voldoe aan de Arbowet in minuten.",
          }),
        }}
      />
    </main>
  );
}
