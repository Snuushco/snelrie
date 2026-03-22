"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Mail,
  Sparkles,
  Building2,
  Users,
  HardHat,
  Flame,
  Lock,
  Eye,
  FileText,
} from "lucide-react";
import {
  trackDemoStart,
  trackDemoStep,
  trackDemoPreviewView,
  trackDemoEmailCapture,
  trackDemoCtaClick,
} from "@/lib/analytics";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Branche =
  | "bouw"
  | "transport"
  | "horeca"
  | "detailhandel"
  | "zorg"
  | "kantoor"
  | "beveiliging"
  | "schoonmaak"
  | "kinderopvang"
  | "overig";

type Answers = {
  branche: Branche | "";
  medewerkers: string;
  fysiekWerk: "ja" | "nee";
  gevaarlijkeStoffen: "ja" | "nee";
  nachtwerk: "ja" | "nee";
};

type RiskItem = {
  categorie: string;
  risico: string;
  ernst: "hoog" | "midden" | "laag";
  maatregel: string;
  wettelijkeBasis: string;
};

type PreviewData = {
  samenvatting: string;
  risicos: RiskItem[];
  score: number;
  aanbeveling: string;
};

/* ------------------------------------------------------------------ */
/* Static risk preview data per branche (no API call needed)           */
/* ------------------------------------------------------------------ */

const PREVIEW_DATA: Record<string, PreviewData> = {
  bouw: {
    samenvatting:
      "Op basis van uw antwoorden detecteert SnelRIE significante risico's rondom hoogtewerk, fysieke belasting en blootstelling aan gevaarlijke stoffen. Het ontbreken van een actueel Plan van Aanpak vergroot de kans op handhaving door de Inspectie SZW.",
    risicos: [
      {
        categorie: "Valgevaar",
        risico: "Onvoldoende valbeveiliging bij werkzaamheden boven 2,5 meter",
        ernst: "hoog",
        maatregel: "Collectieve valbescherming (leuningen, vangnetten) installeren; PBM's (harnas) als terugvaloptie",
        wettelijkeBasis: "Arbobesluit art. 3.16",
      },
      {
        categorie: "Fysieke belasting",
        risico: "Tillen van lasten >25 kg zonder hulpmiddelen",
        ernst: "hoog",
        maatregel: "Tilhulpmiddelen beschikbaar stellen; maximale tilnormen communiceren",
        wettelijkeBasis: "Arbobesluit art. 5.2-5.3",
      },
      {
        categorie: "Gevaarlijke stoffen",
        risico: "Blootstelling aan kwartsstof bij slijp- en zaagwerkzaamheden",
        ernst: "hoog",
        maatregel: "Waterscheiding of stofafzuiging toepassen; grenswaarden monitoren",
        wettelijkeBasis: "Arbobesluit art. 4.1-4.18",
      },
      {
        categorie: "Bouwplaatsverkeer",
        risico: "Onvoldoende scheiding voetgangers en bouwverkeer",
        ernst: "midden",
        maatregel: "Verkeersplan opstellen met gescheiden routes en signalering",
        wettelijkeBasis: "Arbobesluit art. 3.2",
      },
      {
        categorie: "Nachtwerk",
        risico: "Verhoogd ongevalrisico door verminderde alertheid",
        ernst: "midden",
        maatregel: "Rotatiesysteem invoeren; adequate verlichting op bouwplaats",
        wettelijkeBasis: "ATW art. 5:8",
      },
    ],
    score: 38,
    aanbeveling:
      "Met een risicoscore van 38/100 adviseren wij dringend een volledige RI&E met Plan van Aanpak. De combinatie van hoogtewerk, stoffen en nachtwerk vereist directe aandacht.",
  },
  transport: {
    samenvatting:
      "Uw transportoperatie toont risico's rondom fysieke belasting bij laden/lossen, alleen werken op route en onregelmatige diensten. Een actuele RI&E ontbreekt in 68% van vergelijkbare transportbedrijven.",
    risicos: [
      {
        categorie: "Fysieke belasting",
        risico: "Repetitief tillen en sjorren bij laden/lossen boven tilnormen",
        ernst: "hoog",
        maatregel: "Mechanische laad-/loshulpmiddelen inzetten; tiltraining verplichten",
        wettelijkeBasis: "Arbobesluit art. 5.2-5.3",
      },
      {
        categorie: "Alleen werken",
        risico: "Chauffeur zonder alarmmogelijkheid bij pech of incident",
        ernst: "hoog",
        maatregel: "Man-down systeem of check-in protocol implementeren",
        wettelijkeBasis: "Arbowet art. 3 lid 1",
      },
      {
        categorie: "Vermoeidheid",
        risico: "Nachtritten zonder adequate rustcompensatie",
        ernst: "hoog",
        maatregel: "Rij- en rusttijden strikt naleven; vermoeidheidsdetectie overwegen",
        wettelijkeBasis: "ATW art. 5:8, EU Verordening 561/2006",
      },
      {
        categorie: "Verkeersveiligheid",
        risico: "Onvoldoende onderhoud en keuring van voertuigen",
        ernst: "midden",
        maatregel: "Preventief onderhoudsschema invoeren; dagelijkse voertuigcheck",
        wettelijkeBasis: "Wegenverkeerswet art. 5",
      },
      {
        categorie: "Psychosociale belasting",
        risico: "Werkdruk door krappe levertijden en piekmomenten",
        ernst: "midden",
        maatregel: "Planningsbuffer inbouwen; werkoverleg met chauffeurs structureren",
        wettelijkeBasis: "Arbowet art. 3 lid 2",
      },
    ],
    score: 42,
    aanbeveling:
      "Score 42/100 — de combinatie van fysiek laden/lossen, nachtritten en alleen werken vraagt om directe maatregelen en een formeel Plan van Aanpak.",
  },
  horeca: {
    samenvatting:
      "Uw horecabedrijf vertoont risico's rondom hitte en gladheid in de keuken, fysieke belasting en avond-/nachtdiensten. De Inspectie SZW intensiveert controles in de horeca in 2026.",
    risicos: [
      {
        categorie: "Brandgevaar & hitte",
        risico: "Werken met open vuur en hete vloeistoffen zonder adequate bescherming",
        ernst: "hoog",
        maatregel: "Blusmiddelen op strategische plekken; hittebestendige kleding bij frituren",
        wettelijkeBasis: "Arbobesluit art. 3.5",
      },
      {
        categorie: "Fysieke belasting",
        risico: "Tillen van kratten, vaten en meubilair boven tilnormen",
        ernst: "hoog",
        maatregel: "Gebruik van tilwagens en steekwagens; maximaal 15 kg per til",
        wettelijkeBasis: "Arbobesluit art. 5.2-5.3",
      },
      {
        categorie: "Gladde vloeren",
        risico: "Valgevaar door natte keukenvloeren en morsen",
        ernst: "midden",
        maatregel: "Antislipmatten plaatsen; direct opruimprotocol bij morsen",
        wettelijkeBasis: "Arbobesluit art. 3.2",
      },
      {
        categorie: "Werkdruk",
        risico: "Piekbelasting tijdens service zonder adequate bezetting",
        ernst: "midden",
        maatregel: "Minimale bezettingsnorm per shift; pauzeprotocol handhaven",
        wettelijkeBasis: "Arbowet art. 3 lid 2",
      },
      {
        categorie: "Nacht- en avondwerk",
        risico: "Structureel werken na 23:00 zonder rustcompensatie",
        ernst: "midden",
        maatregel: "Nachtdienstregeling conform ATW; compensatierust inplannen",
        wettelijkeBasis: "ATW art. 5:8",
      },
    ],
    score: 45,
    aanbeveling:
      "Score 45/100 — keukenveiligheid en fysieke belasting vragen prioriteit. Een Plan van Aanpak maakt uw maatregelen aantoonbaar voor de Inspectie.",
  },
  detailhandel: {
    samenvatting:
      "Uw retailbedrijf heeft risico's op het gebied van tillen bij bevoorrading, alleen werken en ergonomie bij kassawerk. Veel winkels onderschatten de RI&E-verplichting.",
    risicos: [
      {
        categorie: "Fysieke belasting",
        risico: "Dagelijks tillen van dozen en pallets bij bevoorrading",
        ernst: "hoog",
        maatregel: "Palletwagen en rolcontainers standaard beschikbaar; max 15 kg per til",
        wettelijkeBasis: "Arbobesluit art. 5.2-5.3",
      },
      {
        categorie: "Alleen werken",
        risico: "Alleen openen of sluiten zonder noodprocedure",
        ernst: "hoog",
        maatregel: "Check-in/check-out systeem; alarmknop beschikbaar",
        wettelijkeBasis: "Arbowet art. 3 lid 1",
      },
      {
        categorie: "Agressie",
        risico: "Verbale of fysieke agressie door klanten",
        ernst: "midden",
        maatregel: "Agressieprotocol opstellen; training voor medewerkers",
        wettelijkeBasis: "Arbobesluit art. 2.15",
      },
      {
        categorie: "Ergonomie",
        risico: "Langdurig staan en repetitieve bewegingen bij kassa",
        ernst: "midden",
        maatregel: "Antifatiguemat; afwisseling in werkzaamheden plannen",
        wettelijkeBasis: "Arbobesluit art. 5.4",
      },
      {
        categorie: "Brandveiligheid",
        risico: "Geblokkeerde vluchtwegen in magazijn",
        ernst: "midden",
        maatregel: "Maandelijkse controle vluchtwegen; BHV-oefening 2x per jaar",
        wettelijkeBasis: "Arbobesluit art. 3.5",
      },
    ],
    score: 52,
    aanbeveling:
      "Score 52/100 — de combinatie van alleen werken en fysieke belasting verdient directe aandacht. Een formeel Plan van Aanpak helpt bij Inspectie-bezoek.",
  },
  zorg: {
    samenvatting:
      "Uw zorginstelling toont significante risico's rondom tillen van patiënten, nachtdiensten en omgang met biologisch materiaal. Zorglocaties worden in 2026 extra gecontroleerd.",
    risicos: [
      {
        categorie: "Fysieke belasting",
        risico: "Tillen en verplaatsen van patiënten zonder tillift",
        ernst: "hoog",
        maatregel: "Tillift op elke afdeling; transfertraining verplicht voor alle medewerkers",
        wettelijkeBasis: "Arbobesluit art. 5.2-5.3",
      },
      {
        categorie: "Biologische agentia",
        risico: "Contact met bloed, lichaamsvloeistoffen of besmettelijk materiaal",
        ernst: "hoog",
        maatregel: "PBM-protocol (handschoenen, mondmaskers); prikaccidentenprocedure",
        wettelijkeBasis: "Arbobesluit art. 4.84-4.102",
      },
      {
        categorie: "Agressie",
        risico: "Verbale en fysieke agressie door patiënten/cliënten",
        ernst: "hoog",
        maatregel: "Agressieprotocol; alarmering; nazorgprocedure bij incidenten",
        wettelijkeBasis: "Arbobesluit art. 2.15",
      },
      {
        categorie: "Nacht- en weekenddiensten",
        risico: "Structurele onregelmatige diensten zonder herstelperiode",
        ernst: "midden",
        maatregel: "Roosterbeleid conform ATW; minimale rust tussen diensten",
        wettelijkeBasis: "ATW art. 5:8",
      },
      {
        categorie: "Psychosociale belasting",
        risico: "Emotionele belasting door stervensbegeleiding en werkdruk",
        ernst: "midden",
        maatregel: "Intervisie en supervisie structureel inplannen; vertrouwenspersoon",
        wettelijkeBasis: "Arbowet art. 3 lid 2",
      },
    ],
    score: 35,
    aanbeveling:
      "Score 35/100 — met 3 hoge risico's is direct handelen noodzakelijk. Een volledig Plan van Aanpak met prioriteitenmatrix is sterk aan te raden.",
  },
  kantoor: {
    samenvatting:
      "Uw kantooromgeving toont risico's op het gebied van beeldschermwerk, ergonomie en psychosociale arbeidsbelasting. Thuiswerken vergroot het aandachtsgebied.",
    risicos: [
      {
        categorie: "Beeldschermwerk",
        risico: "Meer dan 6 uur beeldschermwerk per dag zonder pauzeprotocol",
        ernst: "hoog",
        maatregel: "20-20-20 regel invoeren; beeldschermbril vergoeden waar nodig",
        wettelijkeBasis: "Arbobesluit art. 5.10-5.12",
      },
      {
        categorie: "Ergonomie",
        risico: "Niet-instelbare werkplekken veroorzaken nek- en rugklachten",
        ernst: "midden",
        maatregel: "Werkplekonderzoek uitvoeren; verstelbare stoelen en bureaus",
        wettelijkeBasis: "Arbobesluit art. 5.4",
      },
      {
        categorie: "Thuiswerken",
        risico: "Geen controle op ergonomische thuiswerkplek",
        ernst: "midden",
        maatregel: "Thuiswerkvergoeding; ergonomisch advies en basis-inventaris",
        wettelijkeBasis: "Arbowet art. 3 lid 1",
      },
      {
        categorie: "Werkdruk",
        risico: "Structureel overwerk en hoge werkdruk zonder signalering",
        ernst: "midden",
        maatregel: "Periodiek werkdrukonderzoek; gesprekscyclus met werkdruk als vast item",
        wettelijkeBasis: "Arbowet art. 3 lid 2",
      },
      {
        categorie: "Binnenklimaat",
        risico: "Onvoldoende ventilatie of temperatuurbeheersing",
        ernst: "laag",
        maatregel: "CO2-meter plaatsen; temperatuur tussen 20-24°C houden",
        wettelijkeBasis: "Arbobesluit art. 6.1-6.2",
      },
    ],
    score: 62,
    aanbeveling:
      "Score 62/100 — uw kantoorrisico's zijn beheersbaarder maar beeldschermwerk en thuiswerken vragen structurele aandacht.",
  },
  beveiliging: {
    samenvatting:
      "Uw beveiligingsorganisatie kent hoge risico's rondom alleen werken, confrontatie met agressie en nachtdiensten. De branche heeft één van de hoogste incidentenratio's.",
    risicos: [
      {
        categorie: "Alleen werken",
        risico: "Objectbeveiligers zonder directe collega of alarmsysteem",
        ernst: "hoog",
        maatregel: "Man-down systeem; periodieke check-ins; locatietracking",
        wettelijkeBasis: "Arbowet art. 3 lid 1",
      },
      {
        categorie: "Agressie & geweld",
        risico: "Confrontatie met indringers of agressieve personen",
        ernst: "hoog",
        maatregel: "Agressietraining; deëscalatieprotocol; body-worn camera overwegen",
        wettelijkeBasis: "Arbobesluit art. 2.15",
      },
      {
        categorie: "Nachtdiensten",
        risico: "Structurele nachtdiensten zonder adequate compensatie",
        ernst: "hoog",
        maatregel: "Nachtdienstbeleid conform ATW; maximaal 7 opeenvolgende nachtdiensten",
        wettelijkeBasis: "ATW art. 5:8",
      },
      {
        categorie: "Psychosociale belasting",
        risico: "Stress door confrontaties, bedreigingen en isolatie",
        ernst: "midden",
        maatregel: "Incidentopvang; vertrouwenspersoon; periodiek welzijnscheck",
        wettelijkeBasis: "Arbowet art. 3 lid 2",
      },
      {
        categorie: "Fysieke belasting",
        risico: "Langdurig staan en lopen tijdens rondes",
        ernst: "laag",
        maatregel: "Geschikt schoeisel vergoeden; rusttijd bij staand werk",
        wettelijkeBasis: "Arbobesluit art. 5.4",
      },
    ],
    score: 33,
    aanbeveling:
      "Score 33/100 — met 3 hoge risico's scoort uw branche onder het landelijk gemiddelde. Directe actie op alleen werken en agressie is noodzakelijk.",
  },
  schoonmaak: {
    samenvatting:
      "Uw schoonmaakbedrijf heeft risico's rondom chemische blootstelling, fysieke belasting en alleen werken. De schoonmaakbranche is een aandachtssector voor de Inspectie SZW.",
    risicos: [
      {
        categorie: "Gevaarlijke stoffen",
        risico: "Dagelijks contact met chemische schoonmaakmiddelen zonder PBM",
        ernst: "hoog",
        maatregel: "Veiligheidsinformatiebladen beschikbaar; handschoenen en ventilatie verplicht",
        wettelijkeBasis: "Arbobesluit art. 4.1-4.18",
      },
      {
        categorie: "Fysieke belasting",
        risico: "Repetitief bukken, tillen en boven schouderhoogte werken",
        ernst: "hoog",
        maatregel: "Ergonomische hulpmiddelen; taakroulatie invoeren",
        wettelijkeBasis: "Arbobesluit art. 5.2-5.3",
      },
      {
        categorie: "Alleen werken",
        risico: "Werken in lege kantoorpanden zonder directe hulp",
        ernst: "midden",
        maatregel: "Check-in systeem via app; noodprocedure per locatie",
        wettelijkeBasis: "Arbowet art. 3 lid 1",
      },
      {
        categorie: "Gladde vloeren",
        risico: "Valgevaar door natte vloeren tijdens werkzaamheden",
        ernst: "midden",
        maatregel: "Waarschuwingsborden; antislipschoeisel verplicht",
        wettelijkeBasis: "Arbobesluit art. 3.2",
      },
      {
        categorie: "Werkdruk",
        risico: "Te veel vierkante meters per uur gepland",
        ernst: "midden",
        maatregel: "Realistische taaktijd per object; periodiek overleg",
        wettelijkeBasis: "Arbowet art. 3 lid 2",
      },
    ],
    score: 40,
    aanbeveling:
      "Score 40/100 — chemische blootstelling en fysieke belasting zijn uw grootste aandachtspunten. Een Plan van Aanpak maakt uw maatregelen aantoonbaar.",
  },
  kinderopvang: {
    samenvatting:
      "Uw kinderopvanglocatie heeft risico's rondom fysieke belasting door tillen, ergonomie en alleen werken met groepen kinderen.",
    risicos: [
      {
        categorie: "Fysieke belasting",
        risico: "Frequent tillen van kinderen en laag werken aan kindertafels",
        ernst: "hoog",
        maatregel: "Verhoogde verschoontafels; ergonomisch meubilair op kinderniveau",
        wettelijkeBasis: "Arbobesluit art. 5.2-5.3",
      },
      {
        categorie: "Alleen werken",
        risico: "Alleen met groep kinderen zonder directe collega in bereik",
        ernst: "hoog",
        maatregel: "Minimale bezetting handhaven; noodknop of intercom beschikbaar",
        wettelijkeBasis: "Arbowet art. 3 lid 1; Wet kinderopvang",
      },
      {
        categorie: "Geluidshinder",
        risico: "Structurele blootstelling aan hoge geluidsniveaus",
        ernst: "midden",
        maatregel: "Geluidsabsorberend materiaal; rustige ruimtes voor pauzes",
        wettelijkeBasis: "Arbobesluit art. 6.7",
      },
      {
        categorie: "Infectieziekten",
        risico: "Verhoogde blootstelling aan infectieziekten via kinderen",
        ernst: "midden",
        maatregel: "Hygiëneprotocol; handenwassen; ziekmeldprotocol ouders",
        wettelijkeBasis: "Arbobesluit art. 4.84",
      },
      {
        categorie: "Psychosociale belasting",
        risico: "Werkdruk door onderbezetting en verwachtingen ouders",
        ernst: "midden",
        maatregel: "Structureel teamoverleg; signalering van werkdruk",
        wettelijkeBasis: "Arbowet art. 3 lid 2",
      },
    ],
    score: 48,
    aanbeveling:
      "Score 48/100 — tillen en alleen werken met kinderen zijn uw prioriteiten. Een formele RI&E helpt ook bij GGD-inspecties.",
  },
  overig: {
    samenvatting:
      "Op basis van uw antwoorden detecteert SnelRIE risico's op het gebied van fysieke belasting, werkplekergonomie en arbeidstijden. Een branchespecifieke analyse zou een completer beeld geven.",
    risicos: [
      {
        categorie: "Fysieke belasting",
        risico: "Tillen, duwen of trekken boven de aanbevolen normen",
        ernst: "hoog",
        maatregel: "Hulpmiddelen beschikbaar stellen; tiltraining organiseren",
        wettelijkeBasis: "Arbobesluit art. 5.2-5.3",
      },
      {
        categorie: "Werkplek",
        risico: "Niet-ergonomisch ingerichte werkplekken",
        ernst: "midden",
        maatregel: "Werkplekonderzoek uitvoeren; instelbaar meubilair",
        wettelijkeBasis: "Arbobesluit art. 5.4",
      },
      {
        categorie: "Gevaarlijke stoffen",
        risico: "Mogelijke blootstelling aan schadelijke stoffen",
        ernst: "midden",
        maatregel: "Stoffeninventarisatie uitvoeren; PBM's beschikbaar stellen",
        wettelijkeBasis: "Arbobesluit art. 4.1-4.18",
      },
      {
        categorie: "Nood & BHV",
        risico: "Geen of onvoldoende BHV-organisatie",
        ernst: "midden",
        maatregel: "BHV'ers opleiden; noodplan actualiseren; jaarlijkse oefening",
        wettelijkeBasis: "Arbowet art. 15",
      },
      {
        categorie: "Arbeidstijden",
        risico: "Onregelmatige diensten of overwerk zonder compensatie",
        ernst: "laag",
        maatregel: "Urenregistratie invoeren; ATW-normen communiceren",
        wettelijkeBasis: "ATW art. 5:7-5:8",
      },
    ],
    score: 55,
    aanbeveling:
      "Score 55/100 — een branchespecifieke RI&E zou een nauwkeuriger beeld geven. Fysieke belasting is uw eerste aandachtspunt.",
  },
};

/* ------------------------------------------------------------------ */
/* Streaming AI preview hook                                           */
/* ------------------------------------------------------------------ */

function useStreamingSummary() {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ttft, setTtft] = useState<number | null>(null);
  const abortRef = useState<AbortController | null>(null);

  const startStream = async (answers: Answers) => {
    // Abort any existing stream
    if (abortRef[0]) abortRef[0].abort();
    const controller = new AbortController();
    abortRef[1](controller);

    setText("");
    setDone(false);
    setLoading(true);
    setTtft(null);

    const clientStart = performance.now();

    try {
      const res = await fetch("/api/demo/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branche: answers.branche,
          medewerkers: answers.medewerkers,
          fysiekWerk: answers.fysiekWerk,
          gevaarlijkeStoffen: answers.gevaarlijkeStoffen,
          nachtwerk: answers.nachtwerk,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setDone(true);
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let firstText = true;

      while (true) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") {
            setDone(true);
            setLoading(false);
            return;
          }

          try {
            const parsed = JSON.parse(payload);
            if (parsed.meta?.ttft) {
              setTtft(parsed.meta.ttft);
            }
            if (parsed.text) {
              if (firstText) {
                const clientTtft = Math.round(performance.now() - clientStart);
                if (!ttft) setTtft(clientTtft);
                firstText = false;
              }
              setText((prev) => prev + parsed.text);
            }
          } catch {
            // skip
          }
        }
      }

      setDone(true);
      setLoading(false);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setDone(true);
        setLoading(false);
      }
    }
  };

  return { text, done, loading, ttft, startStream };
}

/* ------------------------------------------------------------------ */
/* Animated typing fallback for recommendation text                    */
/* ------------------------------------------------------------------ */

function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return { displayed, done };
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ScoreBadge({ score }: { score: number }) {
  const color =
    score < 40
      ? "text-red-600 bg-red-50 border-red-200"
      : score < 60
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-green-600 bg-green-50 border-green-200";
  const label = score < 40 ? "Onvoldoende" : score < 60 ? "Matig" : "Redelijk";
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${color}`}>
      <span className="text-2xl">{score}</span>
      <span>/100 — {label}</span>
    </div>
  );
}

function RiskRow({ item, blurred }: { item: RiskItem; blurred: boolean }) {
  const ernstColor =
    item.ernst === "hoog"
      ? "bg-red-100 text-red-700"
      : item.ernst === "midden"
      ? "bg-amber-100 text-amber-700"
      : "bg-green-100 text-green-700";
  return (
    <div className={`border border-gray-200 rounded-xl p-4 space-y-2 ${blurred ? "blur-content" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900">{item.categorie}</span>
        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${ernstColor}`}>
          {item.ernst}
        </span>
      </div>
      <p className="text-sm text-gray-700">{item.risico}</p>
      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <p className="text-gray-600">
          <strong className="text-gray-800">Maatregel:</strong> {item.maatregel}
        </p>
        <p className="text-gray-500 text-xs mt-1">{item.wettelijkeBasis}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Question components                                                 */
/* ------------------------------------------------------------------ */

const BRANCHES: { value: Branche; label: string; icon: typeof Building2 }[] = [
  { value: "bouw", label: "Bouw & installatie", icon: HardHat },
  { value: "transport", label: "Transport & logistiek", icon: Building2 },
  { value: "horeca", label: "Horeca & hospitality", icon: Flame },
  { value: "detailhandel", label: "Retail & detailhandel", icon: Building2 },
  { value: "zorg", label: "Zorg & care", icon: Building2 },
  { value: "kantoor", label: "Kantoor & ICT", icon: Building2 },
  { value: "beveiliging", label: "Beveiliging", icon: Shield },
  { value: "schoonmaak", label: "Schoonmaak", icon: Building2 },
  { value: "kinderopvang", label: "Kinderopvang", icon: Building2 },
  { value: "overig", label: "Overig", icon: Building2 },
];

const MEDEWERKER_OPTIONS = [
  { value: "1-5", label: "1 – 5 medewerkers" },
  { value: "6-15", label: "6 – 15 medewerkers" },
  { value: "16-25", label: "16 – 25 medewerkers" },
  { value: "26-50", label: "26 – 50 medewerkers" },
  { value: "50+", label: "50+ medewerkers" },
];

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function DemoFlow() {
  const [step, setStep] = useState(0); // 0-4 = questions, 5 = AI preview, 6 = email capture
  const [answers, setAnswers] = useState<Answers>({
    branche: "",
    medewerkers: "",
    fysiekWerk: "nee",
    gevaarlijkeStoffen: "nee",
    nachtwerk: "nee",
  });
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [showingPreview, setShowingPreview] = useState(false);

  // Track demo page load (once)
  const startTracked = useState(false);
  useEffect(() => {
    if (!startTracked[0]) {
      trackDemoStart();
      startTracked[1](true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preview = PREVIEW_DATA[answers.branche || "overig"] || PREVIEW_DATA.overig;
  const {
    text: streamedSummary,
    done: summaryDone,
    loading: summaryLoading,
    ttft: summaryTtft,
    startStream,
  } = useStreamingSummary();

  const goNext = () => {
    if (step < 4) {
      const nextStep = step + 1;
      trackDemoStep(nextStep, answers.branche || "unknown", {
        medewerkers: answers.medewerkers,
        fysiekWerk: answers.fysiekWerk,
        gevaarlijkeStoffen: answers.gevaarlijkeStoffen,
        nachtwerk: answers.nachtwerk,
      });
      setStep(nextStep);
    } else if (step === 4) {
      const previewData = PREVIEW_DATA[answers.branche || "overig"] || PREVIEW_DATA.overig;
      trackDemoStep(5, answers.branche || "unknown", {
        medewerkers: answers.medewerkers,
        fysiekWerk: answers.fysiekWerk,
        gevaarlijkeStoffen: answers.gevaarlijkeStoffen,
        nachtwerk: answers.nachtwerk,
      });
      trackDemoPreviewView(answers.branche || "overig", previewData.score);
      setStep(5);
      setShowingPreview(true);
      // Start streaming AI summary
      startStream(answers);
    }
  };

  const goPrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const canNext = () => {
    switch (step) {
      case 0:
        return answers.branche !== "";
      case 1:
        return answers.medewerkers !== "";
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleEmailSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Vul een geldig emailadres in.");
      return;
    }
    setEmailLoading(true);
    setEmailError("");
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, branche: answers.branche, medewerkers: answers.medewerkers }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Er ging iets mis.");
      }
      trackDemoEmailCapture(answers.branche || "overig", answers.medewerkers);
      setEmailSent(true);
    } catch (e: any) {
      setEmailError(e.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const progressPct = Math.min(((step + 1) / 6) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-600" />
            <span className="text-lg font-bold">
              Snel<span className="text-brand-600">RIE</span>
            </span>
          </Link>
          {step <= 4 && (
            <span className="text-sm text-gray-500">
              Vraag {step + 1} van 5
            </span>
          )}
          {step === 5 && (
            <span className="text-sm text-brand-600 font-medium flex items-center gap-1">
              <Sparkles className="h-4 w-4" /> AI Preview
            </span>
          )}
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </nav>

      <div className="flex-1 flex flex-col">
        <div className="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
          {/* ---- Q1: Branche ---- */}
          {step === 0 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Vraag 1 van 5</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">In welke branche is uw bedrijf actief?</h2>
                <p className="text-gray-500 mt-2">We passen de risicoanalyse aan op uw sector.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BRANCHES.map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setAnswers({ ...answers, branche: b.value })}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition font-medium text-sm ${
                      answers.branche === b.value
                        ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ---- Q2: Medewerkers ---- */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Vraag 2 van 5</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Hoeveel medewerkers heeft u?</h2>
                <p className="text-gray-500 mt-2">Dit beïnvloedt de complexiteit en wettelijke eisen.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MEDEWERKER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAnswers({ ...answers, medewerkers: opt.value })}
                    className={`p-4 rounded-xl border transition font-medium text-sm ${
                      answers.medewerkers === opt.value
                        ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Users className="h-5 w-5 mb-1 text-gray-400" />
                    {opt.label}
                  </button>
                ))}
              </div>
              {["26-50", "50+"].includes(answers.medewerkers) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  <strong>⚠️ Let op:</strong> Bij meer dan 25 medewerkers moet uw RI&E getoetst worden door een gecertificeerde arbodeskundige (Arbowet art. 14).
                </div>
              )}
            </div>
          )}

          {/* ---- Q3: Fysiek werk ---- */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Vraag 3 van 5</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Is er sprake van zwaar fysiek werk?</h2>
                <p className="text-gray-500 mt-2">Denk aan tillen, duwen, trekken of langdurig staan.</p>
              </div>
              <div className="flex gap-4">
                {(["ja", "nee"] as const).map((val) => (
                  <button
                    key={val}
                    onClick={() => setAnswers({ ...answers, fysiekWerk: val })}
                    className={`flex-1 py-6 rounded-xl border transition font-semibold text-lg ${
                      answers.fysiekWerk === val
                        ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {val === "ja" ? "✅ Ja" : "❌ Nee"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ---- Q4: Gevaarlijke stoffen ---- */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Vraag 4 van 5</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Wordt er gewerkt met gevaarlijke stoffen?</h2>
                <p className="text-gray-500 mt-2">Chemicaliën, oplosmiddelen, stof, biologisch materiaal, etc.</p>
              </div>
              <div className="flex gap-4">
                {(["ja", "nee"] as const).map((val) => (
                  <button
                    key={val}
                    onClick={() => setAnswers({ ...answers, gevaarlijkeStoffen: val })}
                    className={`flex-1 py-6 rounded-xl border transition font-semibold text-lg ${
                      answers.gevaarlijkeStoffen === val
                        ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {val === "ja" ? "✅ Ja" : "❌ Nee"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ---- Q5: Nachtwerk ---- */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">Vraag 5 van 5</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Zijn er nacht- of onregelmatige diensten?</h2>
                <p className="text-gray-500 mt-2">Avondwerk na 21:00, nachtdiensten of wisselende roosters.</p>
              </div>
              <div className="flex gap-4">
                {(["ja", "nee"] as const).map((val) => (
                  <button
                    key={val}
                    onClick={() => setAnswers({ ...answers, nachtwerk: val })}
                    className={`flex-1 py-6 rounded-xl border transition font-semibold text-lg ${
                      answers.nachtwerk === val
                        ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-200"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {val === "ja" ? "✅ Ja" : "❌ Nee"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ---- Navigation buttons (Q1-Q5) ---- */}
          {step <= 4 && (
            <div className="mt-10 flex justify-between items-center">
              {step > 0 ? (
                <button
                  onClick={goPrev}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition font-medium"
                >
                  <ArrowLeft className="h-4 w-4" /> Vorige
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={goNext}
                disabled={!canNext()}
                className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand-600/20"
              >
                {step === 4 ? (
                  <>
                    Bekijk AI-analyse <Sparkles className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Volgende <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ---- AI Preview Section ---- */}
          {step === 5 && (
            <div className="space-y-8 animate-fadeIn">
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  AI-gegenereerde RI&E Preview
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Uw risicoanalyse voor{" "}
                  <span className="text-brand-600">
                    {BRANCHES.find((b) => b.value === answers.branche)?.label || "uw bedrijf"}
                  </span>
                </h2>
              </div>

              {/* Score */}
              <div className="flex justify-center">
                <ScoreBadge score={preview.score} />
              </div>

              {/* AI Summary with streaming */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-brand-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">AI Samenvatting</span>
                  {summaryTtft !== null && (
                    <span className="text-xs text-gray-400 ml-auto">
                      {summaryTtft < 1000 ? `${summaryTtft}ms` : `${(summaryTtft / 1000).toFixed(1)}s`} first token
                    </span>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {streamedSummary || (summaryLoading ? "" : preview.samenvatting)}
                  {!summaryDone && <span className="animate-pulse text-brand-600">▊</span>}
                </p>
              </div>

              {/* Risk items: first 2 visible, rest blurred */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Gedetecteerde risico's ({preview.risicos.length})
                </h3>
                <div className="space-y-4">
                  {preview.risicos.map((item, i) => (
                    <RiskRow key={i} item={item} blurred={i >= 2} />
                  ))}
                </div>
              </div>

              {/* Blur overlay CTA */}
              <div className="relative -mt-20 pt-24 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent">
                <div className="bg-white rounded-2xl border-2 border-brand-200 p-8 text-center shadow-lg">
                  <Lock className="h-8 w-8 text-brand-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Wilt u alle {preview.risicos.length} risico's zien?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Laat uw emailadres achter en ontvang de volledige demo-analyse. Of start direct een gratis scan voor uw complete RI&E.
                  </p>

                  {!emailSent ? (
                    <div className="space-y-4 max-w-sm mx-auto">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="uw@email.nl"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                            onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                          />
                        </div>
                        <button
                          onClick={handleEmailSubmit}
                          disabled={emailLoading}
                          className="px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 transition disabled:opacity-50 whitespace-nowrap"
                        >
                          {emailLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Verstuur"
                          )}
                        </button>
                      </div>
                      {emailError && (
                        <p className="text-red-600 text-sm">{emailError}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        We sturen max. 1 email. Geen spam, uitschrijven altijd mogelijk.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-sm mx-auto">
                      <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      <p className="text-green-800 font-medium">Verstuurd!</p>
                      <p className="text-green-600 text-sm mt-1">
                        U ontvangt de volledige demo-analyse per email.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/scan"
                      onClick={() => trackDemoCtaClick("start_volledige_rie", answers.branche || "overig")}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
                    >
                      <FileText className="h-4 w-4" />
                      Start volledige RI&E — Gratis
                    </Link>
                    <Link
                      href="/"
                      onClick={() => trackDemoCtaClick("bekijk_prijzen", answers.branche || "overig")}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                    >
                      Bekijk prijzen
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6">
                <h3 className="font-semibold text-brand-800 mb-2 flex items-center gap-2">
                  <Eye className="h-5 w-5" /> Aanbeveling
                </h3>
                <p className="text-brand-700 text-sm leading-relaxed">{preview.aanbeveling}</p>
              </div>

              {/* Back to questions */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setStep(0);
                    setShowingPreview(false);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 transition underline"
                >
                  ← Opnieuw beginnen met andere antwoorden
                </button>
                {/* Debug: timing info (visible in dev) */}
                {process.env.NODE_ENV === "development" && summaryTtft !== null && (
                  <p className="text-xs text-gray-300 mt-2">
                    TTFT: {summaryTtft}ms | Target: &lt;1000ms | {summaryTtft < 1000 ? "✅ PASS" : "⚠️ OVER TARGET"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 px-4 text-center text-sm text-gray-400">
        <p>
          © {new Date().getFullYear()} SnelRIE — onderdeel van Praesidion Holding B.V.{" "}
          <Link href="/privacy" className="underline hover:text-gray-600">
            Privacy
          </Link>
        </p>
      </footer>

      {/* Fade-in animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
