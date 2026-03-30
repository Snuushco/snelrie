import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Shield,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  HardHat,
  Truck,
  UtensilsCrossed,
  Store,
  HeartPulse,
  Building2,
  GraduationCap,
  Wrench,
  Scissors,
  Landmark,
  Tractor,
  Factory,
  Car,
  Zap,
  Home,
  Briefcase,
  PartyPopper,
  Baby,
  SprayCan,
  Monitor,
  LucideIcon,
} from "lucide-react";

/* ───────────────────────── sector data ───────────────────────── */

interface SectorData {
  slug: string;
  label: string;
  icon: LucideIcon;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  risks: { title: string; description: string }[];
  faq: { q: string; a: string }[];
  ctaLabel: string;
  /** Maps to ?sector= for the 5 hero sectors, or ?branche= for scan form */
  scanParam: string;
}

const SECTORS: SectorData[] = [
  {
    slug: "bouw",
    label: "Bouw & Installatie",
    icon: HardHat,
    metaTitle: "RI&E voor de Bouw — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "Genereer in minuten een branchespecifieke RI&E voor bouwbedrijven. Hoogtewerk, gevaarlijke stoffen en wisselende locaties — alles afgedekt. Vanaf €19/mnd.",
    h1: "RI&E voor de Bouw — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Bouwbedrijven en installateurs werken dagelijks met hoogtewerk, gevaarlijke stoffen en wisselende projectlocaties. Een generieke kantoor-RI&E volstaat dan niet. SnelRIE genereert binnen minuten een branchespecifieke risico-inventarisatie die direct past bij uw praktijk — van steiger tot bouwkeet.",
    risks: [
      {
        title: "Hoogtewerk & valgevaar",
        description:
          "Werken op steigers, daken en ladders is de nr. 1 oorzaak van ernstige arbeidsongevallen in de bouw. Uw RI&E moet concrete maatregelen bevatten voor valbeveiliging, keuringen en instructie.",
      },
      {
        title: "Gevaarlijke stoffen & stof",
        description:
          "Van kwartsstof tot oplosmiddelen: bouwvakkers worden dagelijks blootgesteld aan schadelijke stoffen. Een goede RI&E brengt de blootstelling in kaart en stelt grenswaarden en PBM-vereisten vast.",
      },
      {
        title: "Wisselende projectlocaties",
        description:
          "Elke bouwplaats brengt nieuwe risico's mee. Uw RI&E moet een werkwijze bevatten voor locatie-specifieke risicobeoordeling, inclusief coördinatie met onderaannemers.",
      },
    ],
    faq: [
      {
        q: "Is een RI&E verplicht voor mijn bouwbedrijf?",
        a: "Ja. Elke werkgever met personeel is verplicht een RI&E op te stellen (Arbowet art. 5). Voor de bouwsector gelden aanvullende eisen uit het Arbobesluit rondom hoogtewerk, asbest en gevaarlijke stoffen.",
      },
      {
        q: "Wat als ik met onderaannemers werk?",
        a: "Als hoofdaannemer bent u verantwoordelijk voor de coördinatie van veiligheid op de bouwplaats. Uw RI&E moet de samenwerking met onderaannemers en de verdeling van verantwoordelijkheden beschrijven.",
      },
      {
        q: "Hoe vaak moet ik mijn bouw-RI&E updaten?",
        a: "De RI&E moet actueel zijn. Bij nieuwe projecttypen, andere werkwijzen of na een incident moet u de RI&E herzien. SnelRIE maakt het makkelijk om snel een nieuwe versie te genereren.",
      },
    ],
    ctaLabel: "Start gratis bouw-RI&E",
    scanParam: "bouw",
  },
  {
    slug: "transport",
    label: "Transport & Logistiek",
    icon: Truck,
    metaTitle: "RI&E voor Transport & Logistiek — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor transportbedrijven en logistiek: chauffeurs, laden/lossen, nachtwerk en alleen rijden. Binnen minuten klaar. Vanaf €19/mnd.",
    h1: "RI&E voor Transport & Logistiek — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Transportbedrijven combineren routewerk, laden/lossen, nachtdiensten en alleen rijden. Toolboxmeetings zijn goed, maar vervangen geen actuele RI&E. SnelRIE helpt u in minuten een compleet risico-overzicht te maken dat past bij uw operatie — van chauffeur tot magazijn.",
    risks: [
      {
        title: "Alleen werken op route",
        description:
          "Chauffeurs zijn vaak alleen onderweg. Uw RI&E moet protocollen bevatten voor noodsituaties, communicatiemiddelen en maximale rijtijden.",
      },
      {
        title: "Laden, lossen & fysieke belasting",
        description:
          "Tillen van zware goederen, werken op laadperrons en gebruik van heftrucks brengen risico's op rugklachten en ongelukken mee. Ergonomische maatregelen en instructie zijn essentieel.",
      },
      {
        title: "Nachtdiensten & vermoeidheid",
        description:
          "Onregelmatige diensten verhogen het risico op vermoeidheid en verminderde alertheid. De RI&E moet werkroosters, rusttijden en signalering van vermoeidheid adresseren.",
      },
    ],
    faq: [
      {
        q: "Geldt de RI&E-plicht ook voor chauffeurs die alleen rijden?",
        a: "Ja. Juist bij alleen werken is een RI&E extra belangrijk. De risico's van alleen rijden, laden/lossen en nachtwerk moeten expliciet worden geïnventariseerd.",
      },
      {
        q: "Mijn chauffeurs hebben een toolbox. Is dat genoeg?",
        a: "Nee. Een toolboxmeeting is een goed aanvullend instrument, maar vervangt de wettelijk verplichte RI&E niet. De RI&E is het overkoepelende document waaruit toolbox-onderwerpen volgen.",
      },
      {
        q: "Dekt SnelRIE ook magazijn en distributiecentrum?",
        a: "Ja. De transport-variant houdt rekening met zowel routewerk als magazijnoperatie, intern transport en terreinverkeer.",
      },
    ],
    ctaLabel: "Start gratis transport-RI&E",
    scanParam: "transport",
  },
  {
    slug: "horeca",
    label: "Horeca & Hospitality",
    icon: UtensilsCrossed,
    metaTitle: "RI&E voor de Horeca — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor restaurants, hotels en hospitality: keuken, bediening, housekeeping en avondwerk. In minuten klaar. Vanaf €19/mnd.",
    h1: "RI&E voor de Horeca — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Van keuken tot bediening, van housekeeping tot events: horecabedrijven combineren meerdere werksoorten onder één dak. SnelRIE genereert een RI&E die rekening houdt met hitte, gladheid, piekdrukte, avondwerk en fysieke belasting — specifiek voor uw type horecazaak.",
    risks: [
      {
        title: "Hete vloeistoffen & gladde vloeren",
        description:
          "Brandwonden en valpartijen zijn veelvoorkomend in keukens. Uw RI&E moet antislipmaatregelen, PBM en werkprocedures voor hete apparatuur bevatten.",
      },
      {
        title: "Tillen, duwen & piekbelasting",
        description:
          "Kratten, vaten en meubilair verplaatsen zorgt voor rugklachten. Tijdens piekuren stijgt de werkdruk en daarmee het risico op fouten en blessures.",
      },
      {
        title: "Avond- en nachtdiensten",
        description:
          "Horeca draait vaak tot laat. Onregelmatige werktijden en werkdruk verhogen het risico op psychosociale arbeidsbelasting (PSA) en vermoeidheid.",
      },
    ],
    faq: [
      {
        q: "Is een RI&E verplicht voor mijn restaurant?",
        a: "Ja. Elk horecabedrijf met personeel moet een RI&E hebben. Dit geldt ook voor kleine restaurants en cafés met maar één medewerker.",
      },
      {
        q: "Past dit ook bij een hotel met keuken én housekeeping?",
        a: "Ja. SnelRIE combineert risico's voor keuken, bediening, housekeeping en events in één overzicht, zodat uw RI&E niet blijft steken in alleen keukenrisico's.",
      },
      {
        q: "Hoe zit het met seizoenswerk en piekdrukte?",
        a: "De RI&E moet ook rekening houden met piekperiodes en extra inhuurkrachten. SnelRIE vraagt hier specifiek naar zodat uw rapport de realiteit weerspiegelt.",
      },
    ],
    ctaLabel: "Start gratis horeca-RI&E",
    scanParam: "horeca",
  },
  {
    slug: "detailhandel",
    label: "Retail & Detailhandel",
    icon: Store,
    metaTitle: "RI&E voor Retail & Detailhandel — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor winkels en retail: winkelvloer, magazijn, bevoorrading en alleen werken. Binnen minuten klaar. Vanaf €19/mnd.",
    h1: "RI&E voor Retail & Detailhandel — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Winkels combineren klantcontact, kassawerk, bevoorrading en magazijnwerk. Risico's verschuiven per seizoen en per locatie. SnelRIE helpt u snel een actuele RI&E te genereren die winkelvloer én backoffice afdekt.",
    risks: [
      {
        title: "Tillen & bevoorrading",
        description:
          "Dozen, pallets en winkelstellingen verplaatsen zorgt voor fysieke belasting. Uw RI&E moet tilnormen, hulpmiddelen en instructie bevatten.",
      },
      {
        title: "Alleen openen & sluiten",
        description:
          "Medewerkers die alleen de winkel openen of sluiten lopen risico bij overvallen of onwelwording. Protocollen voor alleen werken zijn wettelijk vereist.",
      },
      {
        title: "Kassawerk & piekdrukte",
        description:
          "Langdurig staan, repeterende bewegingen en hoge werkdruk tijdens piekuren vragen om ergonomische maatregelen en voldoende pauzes.",
      },
    ],
    faq: [
      {
        q: "Is een RI&E verplicht voor mijn winkel?",
        a: "Ja. Elke werkgever met personeel — ook een kleine winkel — is verplicht een RI&E op te stellen volgens de Arbowet.",
      },
      {
        q: "Hoe ga ik om met overvalrisico in de RI&E?",
        a: "Overvalrisico valt onder agressie en geweld (PSA). Uw RI&E moet een overvalprotocol, instructie en nazorg beschrijven. SnelRIE neemt dit mee voor retail.",
      },
      {
        q: "Geldt dit ook voor webshops met magazijn?",
        a: "Ja. Zodra u personeel heeft dat in een magazijn of distributiecentrum werkt, is een RI&E verplicht — ook als u geen fysieke winkel heeft.",
      },
    ],
    ctaLabel: "Start gratis retail-RI&E",
    scanParam: "retail",
  },
  {
    slug: "zorg",
    label: "Zorg & Care",
    icon: HeartPulse,
    metaTitle: "RI&E voor de Zorg — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor zorginstellingen: tillen, nachtdiensten, agressie en biologisch materiaal. In minuten klaar. Vanaf €19/mnd.",
    h1: "RI&E voor de Zorg — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Zorginstellingen kennen unieke risico's: van patiëntentillen tot nachtdiensten, van agressie tot biologisch materiaal. SnelRIE genereert een RI&E die specifiek is afgestemd op uw type zorgorganisatie — van verpleeghuis tot huisartsenpraktijk.",
    risks: [
      {
        title: "Tillen & fysieke belasting",
        description:
          "Patiënten verplaatsen, bedden rijden en hulpmiddelen tillen zijn de belangrijkste oorzaken van rugklachten in de zorg. Uw RI&E moet tilprotocollen en hulpmiddelen bevatten.",
      },
      {
        title: "Nachtdiensten & vermoeidheid",
        description:
          "Onregelmatige diensten en nachtwerk verhogen het risico op fouten en burn-out. De RI&E moet werkroosters, minimale bezetting en rustperiodes adresseren.",
      },
      {
        title: "Agressie & biologisch materiaal",
        description:
          "Zorgmedewerkers hebben te maken met agressie van cliënten en blootstelling aan biologisch materiaal. Protocollen voor veilig werken en nazorg zijn essentieel.",
      },
    ],
    faq: [
      {
        q: "Is een RI&E verplicht voor mijn zorginstelling?",
        a: "Ja. Elke zorgorganisatie met personeel is verplicht een RI&E op te stellen. Voor instellingen met meer dan 25 medewerkers moet deze getoetst worden door een gecertificeerde arbodeskundige.",
      },
      {
        q: "Hoe adresseer ik psychosociale arbeidsbelasting (PSA)?",
        a: "PSA — werkdruk, agressie, intimidatie — is een verplicht onderdeel van elke RI&E. SnelRIE neemt PSA-risico's specifiek voor de zorg mee in de inventarisatie.",
      },
      {
        q: "Werkt dit ook voor kleinere praktijken?",
        a: "Ja. Of u nu een huisartsenpraktijk, fysiotherapiepraktijk of klein zorgteam heeft — SnelRIE past de RI&E aan op uw omvang en type zorg.",
      },
    ],
    ctaLabel: "Start gratis zorg-RI&E",
    scanParam: "zorg",
  },
  {
    slug: "beveiliging",
    label: "Beveiliging",
    icon: Shield,
    metaTitle: "RI&E voor Beveiliging — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor beveiligingsbedrijven: alleen werken, nachtdiensten en agressierisico. Branchespecifiek en in minuten klaar.",
    h1: "RI&E voor Beveiliging — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Beveiligers werken vaak alleen, 's nachts en op wisselende locaties. Agressie, fysiek geweld en onregelmatige diensten zijn dagelijkse risico's. SnelRIE genereert een RI&E die specifiek is afgestemd op de beveiligingsbranche.",
    risks: [
      {
        title: "Alleen werken",
        description:
          "Objectbeveiligers zijn vaak alleen op locatie. Uw RI&E moet protocollen bevatten voor noodsituaties, communicatiemiddelen en alarmering bij alleen werken.",
      },
      {
        title: "Nacht- en onregelmatige diensten",
        description:
          "Nachtwerk verhoogt het risico op vermoeidheid en verminderde alertheid. De RI&E moet werkroosters, rusttijden en verlichtingseisen adresseren.",
      },
      {
        title: "Agressie & fysiek geweld",
        description:
          "Beveiligers lopen verhoogd risico op confrontaties. Uw RI&E moet een agressieprotocol, nazorg en training in de-escalatie bevatten.",
      },
    ],
    faq: [
      {
        q: "Heeft een beveiligingsbedrijf een eigen RI&E nodig?",
        a: "Ja. Ook als uw beveiligers op locatie bij opdrachtgevers werken, bent u als werkgever verantwoordelijk voor hun veiligheid en gezondheid. Een eigen RI&E is verplicht.",
      },
      {
        q: "Hoe ga ik om met wisselende werklocaties?",
        a: "Uw RI&E moet een systematiek bevatten voor locatie-specifieke risicobeoordeling. SnelRIE helpt u een werkwijze op te stellen die per locatie kan worden toegepast.",
      },
    ],
    ctaLabel: "Start gratis beveiliging-RI&E",
    scanParam: "beveiliging",
  },
  {
    slug: "kinderopvang",
    label: "Kinderopvang",
    icon: Baby,
    metaTitle: "RI&E voor Kinderopvang — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor kinderopvang en BSO: tillen, alleen werken met kinderen en ergonomie. Branchespecifiek, in minuten klaar.",
    h1: "RI&E voor Kinderopvang — Wettelijk verplicht, nu eenvoudig",
    intro:
      "In de kinderopvang worden dagelijks kinderen getild, is de werkhouding vaak onergonomisch en werken medewerkers soms alleen met een groep. SnelRIE maakt een RI&E die past bij uw kinderopvangorganisatie.",
    risks: [
      {
        title: "Tillen van kinderen",
        description:
          "Kinderen optillen, verschonen en dragen is fysiek belastend. Uw RI&E moet tilnormen, hulpmiddelen en ergonomische inrichting bevatten.",
      },
      {
        title: "Alleen werken met kinderen",
        description:
          "Bij ziekte of onderbezetting werken medewerkers soms alleen. Dit brengt risico's mee voor zowel kinderen als medewerkers.",
      },
      {
        title: "Werkdruk & geluidsniveau",
        description:
          "Hoge werkdruk en constant geluid verhogen het risico op stress en gehoorschade. De RI&E moet geluidsniveaus en werkdrukmaatregelen adresseren.",
      },
    ],
    faq: [
      {
        q: "Is de RI&E ook verplicht voor gastouders?",
        a: "Gastouders zonder personeel zijn niet verplicht een RI&E op te stellen. Zodra u personeel in dienst heeft, geldt de verplichting wel.",
      },
      {
        q: "Hoe zit het met de GGD-inspectie?",
        a: "De GGD controleert kinderopvangorganisaties op veiligheid en gezondheid. Een actuele RI&E is een belangrijk onderdeel van deze inspectie.",
      },
    ],
    ctaLabel: "Start gratis kinderopvang-RI&E",
    scanParam: "kinderopvang",
  },
  {
    slug: "schoonmaak",
    label: "Schoonmaak",
    icon: SprayCan,
    metaTitle: "RI&E voor Schoonmaak — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor schoonmaakbedrijven: chemische middelen, fysieke belasting en alleen werken. In minuten klaar. Vanaf €19/mnd.",
    h1: "RI&E voor Schoonmaak — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Schoonmaakmedewerkers werken met chemische middelen, tillen en bukken veel, en zijn vaak alleen op locatie. SnelRIE maakt een RI&E die specifiek is afgestemd op de schoonmaakbranche.",
    risks: [
      {
        title: "Chemische schoonmaakmiddelen",
        description:
          "Blootstelling aan reinigingsmiddelen kan leiden tot huidirritatie, ademhalingsklachten en allergische reacties. Uw RI&E moet een stoffeninventarisatie en PBM-beleid bevatten.",
      },
      {
        title: "Fysieke belasting",
        description:
          "Tillen, bukken, reiken en repeterende bewegingen zijn dagelijkse bezigheden. Ergonomische hulpmiddelen en werkinstructies zijn essentieel.",
      },
      {
        title: "Alleen werken",
        description:
          "Schoonmakers werken vaak alleen in gebouwen, soms buiten kantooruren. Protocollen voor noodsituaties en bereikbaarheid zijn verplicht.",
      },
    ],
    faq: [
      {
        q: "Moet ik voor elke locatie een aparte RI&E maken?",
        a: "Nee, maar uw RI&E moet wel rekening houden met de verschillende typen locaties waar uw medewerkers werken. SnelRIE helpt u een overkoepelend document op te stellen.",
      },
      {
        q: "Hoe inventariseer ik gevaarlijke stoffen?",
        a: "Alle schoonmaakmiddelen met gevaarlijke eigenschappen moeten worden geïnventariseerd met bijbehorende veiligheidsinformatiebladen (VIB). SnelRIE wijst u hier automatisch op.",
      },
    ],
    ctaLabel: "Start gratis schoonmaak-RI&E",
    scanParam: "schoonmaak",
  },
  {
    slug: "kantoor",
    label: "Kantoor & ICT",
    icon: Monitor,
    metaTitle: "RI&E voor Kantoor & ICT — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor kantoren en ICT-bedrijven: beeldschermwerk, ergonomie en thuiswerken. Snel en branchespecifiek. Vanaf €19/mnd.",
    h1: "RI&E voor Kantoor & ICT — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Ook kantoorwerk kent risico's: langdurig beeldschermwerk, slechte ergonomie, thuiswerken zonder goede werkplek en werkdruk. SnelRIE helpt u deze risico's snel in kaart te brengen.",
    risks: [
      {
        title: "Beeldschermwerk & ergonomie",
        description:
          "Meer dan 2 uur per dag beeldschermwerk vereist een ergonomische werkplekbeoordeling. Nek-, rug- en oogklachten zijn veelvoorkomend zonder juiste inrichting.",
      },
      {
        title: "Thuiswerken",
        description:
          "De Arbowet geldt ook thuis. Uw RI&E moet het thuiswerkbeleid, werkplekinrichting en bereikbaarheid bij alleen werken adresseren.",
      },
      {
        title: "Werkdruk & PSA",
        description:
          "Hoge werkdruk, deadlines en altijd bereikbaar zijn leiden tot stress en burn-out. Psychosociale arbeidsbelasting (PSA) moet in elke RI&E.",
      },
    ],
    faq: [
      {
        q: "Is een RI&E ook verplicht voor een kantoor?",
        a: "Ja. Elk bedrijf met personeel moet een RI&E hebben, ook als het 'alleen kantoorwerk' betreft. Beeldschermwerk, ergonomie en PSA zijn wettelijk verplichte onderdelen.",
      },
      {
        q: "Hoe neem ik thuiswerken mee in de RI&E?",
        a: "De Arbowet geldt ook voor thuiswerken. Uw RI&E moet een thuiswerkbeleid bevatten met richtlijnen voor werkplekinrichting. SnelRIE vraagt hier specifiek naar.",
      },
    ],
    ctaLabel: "Start gratis kantoor-RI&E",
    scanParam: "kantoor",
  },
  {
    slug: "onderwijs",
    label: "Onderwijs",
    icon: GraduationCap,
    metaTitle: "RI&E voor Onderwijs — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor scholen en onderwijsinstellingen: werkdruk, beeldschermwerk en practicumrisico's. In minuten klaar.",
    h1: "RI&E voor Onderwijs — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Scholen en onderwijsinstellingen hebben te maken met werkdruk, beeldschermwerk, fysieke belasting en soms gevaarlijke stoffen in practica. SnelRIE maakt een RI&E die past bij uw onderwijsinstelling.",
    risks: [
      {
        title: "Werkdruk docenten",
        description:
          "Hoge werkdruk, grote klassen en administratieve last zijn veelvoorkomende klachten. De RI&E moet werkdrukoorzaken en maatregelen inventariseren.",
      },
      {
        title: "Beeldschermwerk",
        description:
          "Docenten en ondersteunend personeel werken steeds meer achter beeldschermen. Ergonomische werkplekken zijn wettelijk vereist.",
      },
      {
        title: "Practicumrisico's",
        description:
          "In techniek- en sciencepractica wordt gewerkt met chemicaliën, machines en gereedschap. Veiligheidsinstructies en noodprotocollen zijn essentieel.",
      },
    ],
    faq: [
      {
        q: "Geldt de RI&E-plicht ook voor basisscholen?",
        a: "Ja. Elke school met personeel in dienst is verplicht een RI&E op te stellen, ongeacht het onderwijsniveau.",
      },
      {
        q: "Hoe neem ik agressie door ouders of leerlingen mee?",
        a: "Agressie valt onder PSA en is een verplicht onderdeel van de RI&E. SnelRIE inventariseert dit automatisch voor onderwijsinstellingen.",
      },
    ],
    ctaLabel: "Start gratis onderwijs-RI&E",
    scanParam: "onderwijs",
  },
  {
    slug: "landbouw",
    label: "Landbouw & Agrarisch",
    icon: Tractor,
    metaTitle: "RI&E voor Landbouw — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor agrarische bedrijven: machines, bestrijdingsmiddelen en buitenwerk. Branchespecifiek, in minuten klaar.",
    h1: "RI&E voor Landbouw — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Agrarische bedrijven werken met zware machines, bestrijdingsmiddelen en zijn blootgesteld aan weersomstandigheden. SnelRIE genereert een RI&E die specifiek is afgestemd op uw agrarische situatie.",
    risks: [
      {
        title: "Machines & werktuigen",
        description:
          "Tractoren, oogstmachines en ander zwaar materieel zijn de belangrijkste oorzaak van ernstige arbeidsongevallen in de landbouw.",
      },
      {
        title: "Bestrijdingsmiddelen",
        description:
          "Blootstelling aan gewasbeschermingsmiddelen en meststoffen brengt gezondheidsrisico's mee. Uw RI&E moet een stoffeninventarisatie en PBM-beleid bevatten.",
      },
      {
        title: "Buitenwerk & weersomstandigheden",
        description:
          "Werken in hitte, kou, regen en UV-straling vraagt om beschermende maatregelen. De RI&E moet seizoensgebonden risico's adresseren.",
      },
    ],
    faq: [
      {
        q: "Is een RI&E verplicht voor mijn agrarisch bedrijf?",
        a: "Ja. Zodra u personeel heeft — ook seizoensarbeiders — bent u verplicht een RI&E op te stellen.",
      },
      {
        q: "Hoe ga ik om met seizoenarbeiders in de RI&E?",
        a: "Seizoenarbeiders moeten worden meegenomen in uw RI&E, inclusief instructie in de eigen taal en specifieke risico's van het seizoenswerk.",
      },
    ],
    ctaLabel: "Start gratis landbouw-RI&E",
    scanParam: "landbouw",
  },
  {
    slug: "industrie",
    label: "Industrie & Productie",
    icon: Factory,
    metaTitle: "RI&E voor Industrie & Productie — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor industriële bedrijven: machines, gevaarlijke stoffen en ploegendienst. In minuten een branchespecifiek rapport.",
    h1: "RI&E voor Industrie & Productie — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Industriële bedrijven werken met zware machines, gevaarlijke stoffen en ploegendiensten. SnelRIE helpt u snel een RI&E op te stellen die de specifieke risico's van uw productieomgeving afdekt.",
    risks: [
      {
        title: "Machines & productielijnen",
        description:
          "Beknelling, snijgevaar en aanrijdingsrisico bij machines en productielijnen. Uw RI&E moet machineveiligheid, afscherming en lockout/tagout-procedures bevatten.",
      },
      {
        title: "Gevaarlijke stoffen & dampen",
        description:
          "Blootstelling aan chemicaliën, dampen en fijnstof is een groot risico. Een stoffeninventarisatie met grenswaarden is wettelijk vereist.",
      },
      {
        title: "Ploegendienst",
        description:
          "Wisselende diensten en nachtwerk verhogen het risico op vermoeidheid en gezondheidsklachten. De RI&E moet werkroosters en rustperiodes adresseren.",
      },
    ],
    faq: [
      {
        q: "Hoe inventariseer ik machinerisico's?",
        a: "Elke machine moet een risicobeoordeling hebben volgens de Machinerichtlijn. SnelRIE helpt u de belangrijkste machinerisico's in uw RI&E op te nemen.",
      },
      {
        q: "Is ATEX-regelgeving onderdeel van de RI&E?",
        a: "Als er kans is op explosieve atmosferen moet dit in de RI&E worden meegenomen. SnelRIE vraagt naar de aanwezigheid van brandbare stoffen en stofvorming.",
      },
    ],
    ctaLabel: "Start gratis industrie-RI&E",
    scanParam: "industrie",
  },
  {
    slug: "automotive",
    label: "Automotive",
    icon: Car,
    metaTitle: "RI&E voor Automotive — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor garages en autobedrijven: tillen, oliën, uitlaatgassen en alleen werken. In minuten klaar.",
    h1: "RI&E voor Automotive — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Garages en autobedrijven kennen specifieke risico's: zwaar tillen, werken met oliën en smeermiddelen, uitlaatgassen en soms alleen werken. SnelRIE maakt een RI&E die past bij uw type autobedrijf.",
    risks: [
      {
        title: "Tillen & fysieke belasting",
        description:
          "Banden, onderdelen en gereedschap wegen veel. Uw RI&E moet tilnormen, hulpmiddelen en ergonomische werkplekken bevatten.",
      },
      {
        title: "Oliën, smeermiddelen & uitlaatgassen",
        description:
          "Blootstelling aan chemische stoffen en uitlaatgassen is dagelijks. Een stoffeninventarisatie en goede ventilatie zijn essentieel.",
      },
      {
        title: "Alleen werken in werkplaats",
        description:
          "Monteurs werken soms alleen, bijvoorbeeld bij avondwerk. Protocollen voor noodsituaties zijn verplicht in de RI&E.",
      },
    ],
    faq: [
      {
        q: "Is een RI&E ook verplicht voor een klein garagebedrijf?",
        a: "Ja. Elk bedrijf met personeel is verplicht een RI&E op te stellen, ook een garage met maar één monteur.",
      },
      {
        q: "Hoe ga ik om met klantenauto's op de brug?",
        a: "Hefbruggen en werkputten brengen specifieke risico's mee. SnelRIE neemt deze mee in de automotive-variant van de RI&E.",
      },
    ],
    ctaLabel: "Start gratis automotive-RI&E",
    scanParam: "automotive",
  },
  {
    slug: "installatietechniek",
    label: "Installatietechniek",
    icon: Zap,
    metaTitle: "RI&E voor Installatietechniek — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor installateurs: elektriciteit, gas, hoogtewerk en wisselende locaties. Branchespecifiek en in minuten klaar.",
    h1: "RI&E voor Installatietechniek — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Installateurs werken met elektriciteit, gas, op hoogte en in kruipruimtes op wisselende locaties. SnelRIE genereert een RI&E die specifiek past bij de risico's van uw installatiebedrijf.",
    risks: [
      {
        title: "Elektriciteit & gaswerk",
        description:
          "Werken aan elektrische installaties en gasleidingen brengt risico op elektrocutie en gaslekkage. Strikte veiligheidsprocedures zijn essentieel.",
      },
      {
        title: "Hoogtewerk & kruipruimtes",
        description:
          "Werken op zolders, daken en in kruipruimtes brengt val- en beknellingsgevaar mee. Uw RI&E moet specifieke maatregelen per werklocatie bevatten.",
      },
      {
        title: "Wisselende locaties",
        description:
          "Elke werklocatie brengt nieuwe risico's mee. Een systematische aanpak voor locatie-specifieke risicobeoordeling is noodzakelijk.",
      },
    ],
    faq: [
      {
        q: "Verschilt de RI&E per type installatie (elektra, gas, water)?",
        a: "De basis-RI&E is hetzelfde, maar de risico's verschillen per discipline. SnelRIE vraagt naar uw type installatiewerk om het rapport te personaliseren.",
      },
      {
        q: "Moet ik per project een nieuwe RI&E maken?",
        a: "Nee, maar uw RI&E moet een werkwijze bevatten voor locatie-specifieke risicobeoordeling per project.",
      },
    ],
    ctaLabel: "Start gratis installatie-RI&E",
    scanParam: "installatietechniek",
  },
  {
    slug: "kappers-beauty",
    label: "Kappers & Beauty",
    icon: Scissors,
    metaTitle: "RI&E voor Kappers & Beauty — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor kappers en schoonheidssalons: chemische producten, staand werk en huidcontact. In minuten klaar.",
    h1: "RI&E voor Kappers & Beauty — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Kappers en beautysalons werken met chemische producten, staan urenlang en hebben intensief cliëntcontact. SnelRIE maakt een branchespecifieke RI&E voor uw salon.",
    risks: [
      {
        title: "Chemische producten",
        description:
          "Haarverf, bleek, nagellak en andere producten bevatten schadelijke stoffen. Een stoffeninventarisatie en goede ventilatie zijn verplicht.",
      },
      {
        title: "Langdurig staan & repetitieve bewegingen",
        description:
          "Kappers staan de hele dag en maken repeterende bewegingen. Nek-, schouder- en rugklachten zijn veelvoorkomend.",
      },
      {
        title: "Huidcontact & allergieën",
        description:
          "Direct huidcontact met producten en water leidt tot beroepseczeem en allergieën. PBM (handschoenen) en huidverzorging zijn essentieel.",
      },
    ],
    faq: [
      {
        q: "Is een RI&E ook nodig als ik maar één medewerker heb?",
        a: "Ja. De RI&E-plicht geldt voor elke werkgever met personeel, ongeacht het aantal medewerkers.",
      },
      {
        q: "Hoe inventariseer ik chemische risico's in mijn salon?",
        a: "Alle producten met gevaarlijke eigenschappen moeten worden geïnventariseerd. SnelRIE wijst u automatisch op de benodigde veiligheidsinformatiebladen.",
      },
    ],
    ctaLabel: "Start gratis kappers-RI&E",
    scanParam: "kappersbeauty",
  },
  {
    slug: "vastgoed",
    label: "Vastgoed & Makelaardij",
    icon: Home,
    metaTitle: "RI&E voor Vastgoed & Makelaardij — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor makelaars en vastgoedbedrijven: alleen bezichtigen, beeldschermwerk en onveilige panden. Snel klaar.",
    h1: "RI&E voor Vastgoed & Makelaardij — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Vastgoedprofessionals combineren kantoorwerk met bezichtigingen op locatie — soms alleen, soms in onveilige panden. SnelRIE genereert een RI&E die rekening houdt met beide werksoorten.",
    risks: [
      {
        title: "Alleen bezichtigen",
        description:
          "Makelaars bezichtigen panden vaak alleen, inclusief leegstaande objecten. Protocollen voor noodsituaties en bereikbaarheid zijn essentieel.",
      },
      {
        title: "Beeldschermwerk",
        description:
          "Kantoorwerk met langdurig beeldschermgebruik vraagt om ergonomische werkplekken en regelmatige pauzes.",
      },
      {
        title: "Onveilige panden",
        description:
          "Bezichtigingen van verbouwingen, leegstand of verouderde panden brengen fysieke risico's mee (asbest, instortingsgevaar, gladheid).",
      },
    ],
    faq: [
      {
        q: "Is een RI&E verplicht voor een makelaarskantoor?",
        a: "Ja. Zodra u personeel heeft, is een RI&E verplicht — ook bij overwegend kantoorwerk.",
      },
      {
        q: "Hoe neem ik risico's bij bezichtigingen mee?",
        a: "SnelRIE inventariseert de risico's van alleen werken en locatiebezoeken specifiek voor de vastgoedbranche.",
      },
    ],
    ctaLabel: "Start gratis vastgoed-RI&E",
    scanParam: "vastgoed",
  },
  {
    slug: "financieel",
    label: "Financiële Dienstverlening",
    icon: Briefcase,
    metaTitle: "RI&E voor Financiële Dienstverlening — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor financiële bedrijven: beeldschermwerk, thuiswerken en werkdruk. Branchespecifiek en in minuten klaar.",
    h1: "RI&E voor Financiële Dienstverlening — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Accountantskantoren, verzekeraars en financieel adviseurs lijken veilige werkomgevingen, maar beeldschermwerk, werkdruk en thuiswerken brengen wel degelijk risico's mee. SnelRIE helpt u deze snel in kaart te brengen.",
    risks: [
      {
        title: "Beeldschermwerk & ergonomie",
        description:
          "Meer dan 6 uur per dag achter een scherm werken is standaard in de financiële sector. Goede werkplekken en regelmatige pauzes zijn wettelijk vereist.",
      },
      {
        title: "Thuiswerken",
        description:
          "Hybride werken is de norm. De RI&E moet thuiswerkbeleid, werkplekinrichting en ergonomische eisen bevatten.",
      },
      {
        title: "Werkdruk & PSA",
        description:
          "Deadlines, compliance-eisen en klanttevredenheid zorgen voor hoge werkdruk. PSA-risico's moeten in de RI&E.",
      },
    ],
    faq: [
      {
        q: "Mijn personeel werkt alleen op kantoor en thuis. Is een RI&E toch nodig?",
        a: "Ja. Beeldschermwerk, ergonomie en werkdruk zijn wettelijk verplichte onderdelen van de RI&E, ook voor kantoorwerk.",
      },
      {
        q: "Hoe neem ik compliance-stress mee?",
        a: "Compliance-druk valt onder werkdruk en PSA. SnelRIE inventariseert werkdrukbronnen specifiek voor uw branche.",
      },
    ],
    ctaLabel: "Start gratis financieel-RI&E",
    scanParam: "financieel",
  },
  {
    slug: "recreatie",
    label: "Recreatie & Evenementen",
    icon: PartyPopper,
    metaTitle: "RI&E voor Recreatie & Evenementen — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor recreatiebedrijven en evenementen: buitenwerk, fysieke belasting en avonddiensten. In minuten klaar.",
    h1: "RI&E voor Recreatie & Evenementen — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Recreatiebedrijven en evenementenorganisaties werken met buitenlocaties, zware materialen en onregelmatige diensten. SnelRIE genereert een RI&E die past bij uw specifieke activiteiten.",
    risks: [
      {
        title: "Opbouw & afbouw",
        description:
          "Podia, tenten en attracties opbouwen brengt val-, beknellings- en tilrisico's mee. Veiligheidsinstructies per opbouw zijn essentieel.",
      },
      {
        title: "Buitenwerk",
        description:
          "Werken bij wisselende weersomstandigheden (hitte, regen, wind) vraagt om beschermende maatregelen en noodprotocollen.",
      },
      {
        title: "Avond- en nachtdiensten",
        description:
          "Evenementen draaien vaak tot laat. Onregelmatige diensten en werkdruk verhogen het risico op vermoeidheid.",
      },
    ],
    faq: [
      {
        q: "Is een RI&E nodig voor eenmalige evenementen?",
        a: "Als u personeel in dienst heeft, is een RI&E altijd verplicht. Voor specifieke evenementen kunt u een aanvullende locatie-risicobeoordeling maken.",
      },
      {
        q: "Hoe ga ik om met vrijwilligers?",
        a: "Voor vrijwilligers gelden dezelfde arboregels als voor werknemers. Uw RI&E moet ook de risico's voor vrijwilligers inventariseren.",
      },
    ],
    ctaLabel: "Start gratis recreatie-RI&E",
    scanParam: "recreatie",
  },
  {
    slug: "overheid",
    label: "Overheid & Non-profit",
    icon: Landmark,
    metaTitle: "RI&E voor Overheid & Non-profit — Wettelijk verplicht, nu eenvoudig | SnelRIE",
    metaDescription:
      "RI&E voor overheidsorganisaties en non-profits: beeldschermwerk, publiekscontact en buitendienst. In minuten klaar.",
    h1: "RI&E voor Overheid & Non-profit — Wettelijk verplicht, nu eenvoudig",
    intro:
      "Overheidsorganisaties en non-profits combineren kantoorwerk met buitendienst en publiekscontact. SnelRIE helpt u een RI&E te genereren die past bij uw type organisatie.",
    risks: [
      {
        title: "Beeldschermwerk",
        description:
          "Langdurig werken achter beeldschermen is standaard. Ergonomische werkplekken en pauzesoftware zijn wettelijk vereist.",
      },
      {
        title: "Publiekscontact & agressie",
        description:
          "Baliewerk, handhaving en huisbezoeken brengen risico op agressie mee. Een agressieprotocol en nazorg zijn essentieel.",
      },
      {
        title: "Buitendienst",
        description:
          "Medewerkers in buitendienst werken alleen op locatie. Protocollen voor noodsituaties en bereikbaarheid zijn verplicht.",
      },
    ],
    faq: [
      {
        q: "Is een RI&E ook verplicht voor non-profitorganisaties?",
        a: "Ja. Elke organisatie met personeel is verplicht een RI&E op te stellen, ongeacht de rechtsvorm of winstoogmerk.",
      },
      {
        q: "Hoe neem ik agressie van burgers mee?",
        a: "Agressie en geweld door derden valt onder PSA. SnelRIE inventariseert dit automatisch voor organisaties met publiekscontact.",
      },
    ],
    ctaLabel: "Start gratis overheid-RI&E",
    scanParam: "overheid",
  },
];

/* Slug-to-sector lookup */
const SECTOR_MAP = new Map(SECTORS.map((s) => [s.slug, s]));

/* ───────────────────────── static params ───────────────────────── */

export function generateStaticParams() {
  return SECTORS.map((s) => ({ slug: s.slug }));
}

/* ───────────────────────── metadata ───────────────────────── */

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sector = SECTOR_MAP.get(slug);
  if (!sector) return {};

  return {
    title: sector.metaTitle,
    description: sector.metaDescription,
    alternates: {
      canonical: `https://www.snelrie.nl/sector/${sector.slug}`,
    },
    openGraph: {
      title: sector.metaTitle,
      description: sector.metaDescription,
      url: `https://www.snelrie.nl/sector/${sector.slug}`,
      siteName: "SnelRIE",
      type: "website",
      locale: "nl_NL",
    },
  };
}

/* ───────────────────────── page component ───────────────────────── */

export default async function SectorPage({ params }: Props) {
  const { slug } = await params;
  const sector = SECTOR_MAP.get(slug);
  if (!sector) notFound();

  const Icon = sector.icon;
  const scanHref = `/scan?sector=${sector.scanParam}`;

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-brand-600" />
            <span className="text-xl font-bold text-gray-900">
              Snel<span className="text-brand-600">RIE</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#hoe-werkt-het" className="text-sm text-gray-600 hover:text-gray-900">Hoe werkt het</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Prijzen</Link>
            <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">Blog</Link>
          </div>
          <Link
            href={scanHref}
            className="hidden md:inline-block bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
          >
            {sector.ctaLabel}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Icon className="h-4 w-4" />
            {sector.label}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            {sector.h1}
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {sector.intro}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={scanHref}
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-brand-700 transition shadow-lg shadow-brand-600/25"
            >
              {sector.ctaLabel}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <span className="text-sm text-gray-500">Gratis — geen account nodig</span>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Klaar in 5 minuten
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Branchespecifiek
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Arbowet-conform
            </div>
          </div>
        </div>
      </section>

      {/* Top 3 Risks */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
            Top 3 risico&apos;s in de {sector.label.toLowerCase()}
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Deze risico&apos;s komen het vaakst voor in uw branche en moeten in uw RI&E staan.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {sector.risks.map((risk, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 p-6 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                  <span className="text-red-600 font-bold text-lg">{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{risk.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{risk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            Hoe werkt SnelRIE voor {sector.label.toLowerCase()}?
          </h2>
          <div className="space-y-8">
            {[
              { step: "1", title: `Selecteer ${sector.label}`, desc: "We vullen automatisch de branchespecifieke risicovelden in. U hoeft alleen te bevestigen of bij te sturen." },
              { step: "2", title: "Beantwoord 3 situatievragen", desc: `Specifieke vragen voor de ${sector.label.toLowerCase()} over uw werkwijze, locatie en medewerkers.` },
              { step: "3", title: "Bekijk uw risico-overzicht", desc: "U ziet direct de belangrijkste risico's en waar uw RI&E versterking nodig heeft." },
              { step: "4", title: "Download uw rapport", desc: "Upgrade voor een volledig RI&E-rapport met Plan van Aanpak, prioriteiten en concrete maatregelen." },
            ].map((s) => (
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

      {/* Mid CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 mb-3">
            Wettelijk verplicht
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Check nu waar uw {sector.label.toLowerCase()}-RI&E staat
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Start gratis en ontdek direct welke risico&apos;s in uw branche de meeste aandacht vragen. Geen account nodig.
          </p>
          <Link
            href={scanHref}
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-brand-700 transition shadow-lg shadow-brand-600/25"
          >
            {sector.ctaLabel}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            Veelgestelde vragen over RI&E voor {sector.label.toLowerCase()}
          </h2>
          <div className="space-y-4">
            {sector.faq.map((item) => (
              <details key={item.q} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium text-gray-900">{item.q}</span>
                  <ChevronDown className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Maak uw {sector.label.toLowerCase()}-RI&E vandaag nog.
          </h2>
          <p className="text-brand-100 mb-8 max-w-xl mx-auto">
            Begin gratis en ontdek binnen minuten waar uw organisatie extra aandacht aan moet besteden. Geen account, geen verplichtingen.
          </p>
          <Link
            href={scanHref}
            className="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-brand-50 transition"
          >
            {sector.ctaLabel}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
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

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-400" />
            <span className="text-white font-bold">SnelRIE</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/blog" className="hover:text-white transition">Blog</Link>
            <Link href="/pricing" className="hover:text-white transition">Prijzen</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/voorwaarden" className="hover:text-white transition">Voorwaarden</Link>
            <a href="mailto:info@snelrie.nl" className="hover:text-white transition">Contact</a>
          </div>
          <div className="text-sm text-center md:text-right">
            <p>© {new Date().getFullYear()} SnelRIE — onderdeel van Praesidion Holding B.V.</p>
            <p className="text-gray-500 text-xs mt-1">KvK: 97640794 · BTW: NL868152237B01</p>
          </div>
        </div>
      </footer>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: sector.metaTitle,
            description: sector.metaDescription,
            url: `https://www.snelrie.nl/sector/${sector.slug}`,
            mainEntity: {
              "@type": "FAQPage",
              mainEntity: sector.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.a,
                },
              })),
            },
          }),
        }}
      />
    </main>
  );
}
