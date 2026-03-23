import type { Metadata } from "next";
import Link from "next/link";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Minus,
  Zap,
  Clock,
  FileText,
  Users,
  Bot,
  Building2,
  Scale,
  Star,
  TrendingDown,
} from "lucide-react";

export const metadata: Metadata = {
  title: "RI&E Tools Vergelijken 2026 — SnelRIE vs Arbodienst vs Zelf Doen | SnelRIE",
  description:
    "Vergelijk RI&E-instrumenten en methoden: SnelRIE (AI), traditionele arbodienst, branche-instrument of zelf doen. Kosten, doorlooptijd en kwaliteit op een rij.",
  keywords: [
    "RI&E vergelijken",
    "RI&E instrument vergelijken",
    "RI&E tool kiezen",
    "RI&E kosten vergelijken",
    "beste RI&E instrument 2026",
    "RI&E uitbesteden of zelf doen",
    "RI&E arbodienst vergelijken",
  ],
  openGraph: {
    title: "RI&E Tools Vergelijken 2026 — Welke Past bij Jouw Bedrijf?",
    description:
      "Onafhankelijke vergelijking van RI&E-instrumenten. SnelRIE vs arbodienst vs branche-instrument vs zelf doen.",
    url: "https://snelrie.nl/vergelijken",
    siteName: "SnelRIE",
    locale: "nl_NL",
    type: "website",
  },
  alternates: {
    canonical: "https://snelrie.nl/vergelijken",
  },
};

type FeatureStatus = "yes" | "no" | "partial" | string;

interface ComparisonFeature {
  feature: string;
  snelrie: FeatureStatus;
  arbodienst: FeatureStatus;
  brancheInstrument: FeatureStatus;
  zelfDoen: FeatureStatus;
}

const comparisonData: ComparisonFeature[] = [
  {
    feature: "Doorlooptijd",
    snelrie: "5–30 minuten",
    arbodienst: "2–6 weken",
    brancheInstrument: "4–8 uur",
    zelfDoen: "6–15 uur",
  },
  {
    feature: "Kosten (eenmalig)",
    snelrie: "€99 – €499",
    arbodienst: "€500 – €5.000+",
    brancheInstrument: "€0 – €250",
    zelfDoen: "€0 (eigen tijd)",
  },
  {
    feature: "Branchespecifiek",
    snelrie: "yes",
    arbodienst: "yes",
    brancheInstrument: "yes",
    zelfDoen: "partial",
  },
  {
    feature: "AI-ondersteuning",
    snelrie: "yes",
    arbodienst: "no",
    brancheInstrument: "no",
    zelfDoen: "no",
  },
  {
    feature: "Plan van Aanpak",
    snelrie: "yes",
    arbodienst: "yes",
    brancheInstrument: "partial",
    zelfDoen: "partial",
  },
  {
    feature: "Direct PDF-rapport",
    snelrie: "yes",
    arbodienst: "no",
    brancheInstrument: "partial",
    zelfDoen: "no",
  },
  {
    feature: "Wettelijk conform",
    snelrie: "yes",
    arbodienst: "yes",
    brancheInstrument: "yes",
    zelfDoen: "partial",
  },
  {
    feature: "Toetsing inbegrepen",
    snelrie: "no",
    arbodienst: "yes",
    brancheInstrument: "Vrijstelling*",
    zelfDoen: "no",
  },
  {
    feature: "24/7 beschikbaar",
    snelrie: "yes",
    arbodienst: "no",
    brancheInstrument: "yes",
    zelfDoen: "yes",
  },
  {
    feature: "Expert Chat / Advies",
    snelrie: "Enterprise",
    arbodienst: "yes",
    brancheInstrument: "no",
    zelfDoen: "no",
  },
  {
    feature: "Jaarlijkse updates",
    snelrie: "Enterprise",
    arbodienst: "Optioneel (€€)",
    brancheInstrument: "no",
    zelfDoen: "Zelf bijhouden",
  },
];

function StatusBadge({ status }: { status: FeatureStatus }) {
  if (status === "yes") {
    return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  }
  if (status === "no") {
    return <XCircle className="h-5 w-5 text-red-400" />;
  }
  if (status === "partial") {
    return <Minus className="h-5 w-5 text-amber-500" />;
  }
  return <span className="text-sm text-gray-700 font-medium">{status}</span>;
}

const providers = [
  {
    name: "SnelRIE",
    subtitle: "AI-gestuurd",
    icon: Bot,
    color: "brand",
    bestFor: "MKB dat snel en betaalbaar wil starten",
    pros: [
      "Klaar in 5 minuten",
      "Vanaf €99 — 90% goedkoper dan arbodienst",
      "AI kent je branche",
      "Direct professioneel PDF-rapport",
      "Geen afspraak nodig",
    ],
    cons: [
      "Geen toetsing inbegrepen (>25 medewerkers)",
      "Geen fysieke rondgang",
    ],
  },
  {
    name: "Arbodienst",
    subtitle: "Traditioneel",
    icon: Users,
    color: "gray",
    bestFor: "Grote organisaties met complexe risico's",
    pros: [
      "Persoonlijk advies op locatie",
      "Gecertificeerde toetsing inbegrepen",
      "Diepgaande analyse",
    ],
    cons: [
      "€500 – €5.000+ per RI&E",
      "Weken wachttijd",
      "Jaarlijkse kosten bij updates",
      "Niet altijd branchespecifiek",
    ],
  },
  {
    name: "Branche-instrument",
    subtitle: "Via rie.nl / branchevereniging",
    icon: Building2,
    color: "gray",
    bestFor: "Bedrijven ≤25 medewerkers in erkende branche",
    pros: [
      "Vaak gratis of goedkoop",
      "Erkend = geen toetsing nodig",
      "Branchespecifiek",
    ],
    cons: [
      "Niet voor elke branche beschikbaar",
      "Vereist veel eigen tijd (4–8 uur)",
      "Geen Plan van Aanpak",
      "Vaak verouderde interfaces",
    ],
  },
  {
    name: "Zelf doen",
    subtitle: "Handmatig",
    icon: FileText,
    color: "gray",
    bestFor: "Wie het zelf wil begrijpen en tijd heeft",
    pros: [
      "Geen kosten (behalve tijd)",
      "Volledige controle",
      "Leerzaam proces",
    ],
    cons: [
      "6–15 uur werk",
      "Risico op onvolledige RI&E",
      "Geen automatische updates",
      "Toetsing apart regelen",
    ],
  },
];

export default function VergelijkenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-600" />
            <span className="text-lg font-bold">
              Snel<span className="text-brand-600">RIE</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/rie-zelf-maken" className="hover:text-gray-900">RI&E Zelf Maken</Link>
            <Link href="/blog" className="hover:text-gray-900">Blog</Link>
            <Link href="/#prijzen" className="hover:text-gray-900">Prijzen</Link>
            <Link
              href="/scan"
              className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition"
            >
              Start Gratis Scan
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm">
            <Scale className="h-4 w-4" />
            Onafhankelijke vergelijking — actueel voor 2026
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
            RI&E Instrumenten Vergelijken:{" "}
            <span className="text-brand-300">Welke Past bij Jouw Bedrijf?</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            AI-tool, arbodienst, branche-instrument of zelf doen? Vergelijk kosten, doorlooptijd
            en kwaliteit. Maak een weloverwogen keuze.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-500 transition shadow-lg shadow-brand-600/25"
          >
            <Zap className="h-5 w-5" />
            Probeer SnelRIE Gratis
          </Link>
        </div>
      </section>

      {/* Vergelijkingstabel */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-10">
            Feature-voor-Feature Vergelijking
          </h2>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-1/5">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-brand-700 bg-brand-50 w-1/5">
                    <div className="flex items-center justify-center gap-2">
                      <Bot className="h-4 w-4" />
                      SnelRIE
                    </div>
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-700 w-1/5">
                    Arbodienst
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-700 w-1/5">
                    Branche-instrument
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-700 w-1/5">
                    Zelf doen
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center bg-brand-50/50">
                      <div className="flex justify-center">
                        <StatusBadge status={row.snelrie} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <StatusBadge status={row.arbodienst} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <StatusBadge status={row.brancheInstrument} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <StatusBadge status={row.zelfDoen} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-3">
              * Branche-instrumenten erkend door Steunpunt RI&E (rie.nl) geven vrijstelling van toetsingsplicht
              voor bedrijven met ≤25 medewerkers.
            </p>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {comparisonData.map((row, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{row.feature}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={row.snelrie} />
                    <span className="text-brand-700 font-medium">SnelRIE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={row.arbodienst} />
                    <span className="text-gray-600">Arbodienst</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={row.brancheInstrument} />
                    <span className="text-gray-600">Branche</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={row.zelfDoen} />
                    <span className="text-gray-600">Zelf doen</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Per provider detail */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-12">
            Elke Methode in Detail
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {providers.map((provider, i) => {
              const Icon = provider.icon;
              const isSnelrie = i === 0;
              return (
                <div
                  key={i}
                  className={`rounded-2xl p-6 border ${
                    isSnelrie
                      ? "bg-brand-50 border-brand-200 ring-2 ring-brand-500/20"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSnelrie ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{provider.name}</h3>
                      <p className="text-xs text-gray-500">{provider.subtitle}</p>
                    </div>
                    {isSnelrie && (
                      <span className="ml-auto inline-flex items-center gap-1 bg-brand-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        <Star className="h-3 w-3" /> Aanbevolen
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Best voor:</strong> {provider.bestFor}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-medium">
                        Voordelen
                      </p>
                      <ul className="space-y-1.5">
                        {provider.pros.map((pro, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-medium">
                        Nadelen
                      </p>
                      <ul className="space-y-1.5">
                        {provider.cons.map((con, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                            <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Keuzehulp */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-4">
            Welke Methode Past bij Jou?
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Beantwoord deze 3 vragen en je weet welke optie het beste past.
          </p>

          <div className="space-y-6">
            {[
              {
                question: "Heb je meer dan 25 medewerkers?",
                yes: "Je hebt toetsing nodig. Gebruik SnelRIE voor de RI&E + laat apart toetsen, óf ga naar een arbodienst voor het totaalpakket.",
                no: "Gebruik SnelRIE of een branche-instrument. Toetsing is niet verplicht als je een erkend instrument gebruikt.",
              },
              {
                question: "Wil je het snel (< 1 uur) geregeld hebben?",
                yes: "SnelRIE is je beste optie — klaar in 5 tot 30 minuten, direct PDF.",
                no: "Overweeg een branche-instrument (4–8 uur) of doe het zelf als je de kennis hebt.",
              },
              {
                question: "Is budget belangrijk?",
                yes: "SnelRIE (vanaf €99) of een gratis branche-instrument. Arbodienst is het duurst.",
                no: "Investeer in een arbodienst als je persoonlijk advies en toetsing wilt in één pakket.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">{item.question}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <p className="text-xs text-green-700 font-bold uppercase mb-1">Ja →</p>
                    <p className="text-sm text-gray-700">{item.yes}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Nee →</p>
                    <p className="text-sm text-gray-700">{item.no}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prijzen CTA */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-4">
            SnelRIE Pakketten
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Start gratis en upgrade pas als je tevreden bent met de resultaten.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                name: "Basis",
                price: "€99",
                features: ["Volledige RI&E", "Alle risico's + maatregelen", "PDF-rapport"],
                highlighted: false,
              },
              {
                name: "Professional",
                price: "€249",
                features: [
                  "Alles van Basis",
                  "Plan van Aanpak",
                  "Prioriteitenmatrix",
                  "Deadlines & verantwoordelijken",
                ],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "€499",
                features: [
                  "Alles van Professional",
                  "24/7 AI Expert Chat",
                  "Jaarlijkse update-herinnering",
                  "Persoonlijke AI-assistent",
                ],
                highlighted: false,
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 border text-center ${
                  tier.highlighted
                    ? "bg-brand-50 border-brand-200 ring-2 ring-brand-500/20"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h3 className="font-bold text-gray-900 text-lg">{tier.name}</h3>
                <p
                  className={`text-3xl font-extrabold my-3 ${
                    tier.highlighted ? "text-brand-700" : "text-gray-900"
                  }`}
                >
                  {tier.price}
                </p>
                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/scan"
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition w-full ${
                    tier.highlighted
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Start Gratis Scan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            Klaar om te Beginnen?
          </h2>
          <p className="text-brand-100 mb-8 text-lg">
            Doe de gratis scan en ontdek in 5 minuten of SnelRIE bij jouw bedrijf past.
            Geen account, geen verplichtingen.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-white text-brand-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-50 transition shadow-lg"
          >
            Start Gratis RI&E Scan
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <StickyMobileCTA href="/scan" label="Start Gratis Scan" />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-600" />
            <span className="font-bold text-gray-900">
              Snel<span className="text-brand-600">RIE</span>
            </span>
          </Link>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/voorwaarden" className="hover:text-gray-900">Voorwaarden</Link>
            <Link href="/rie-zelf-maken" className="hover:text-gray-900">RI&E Zelf Maken</Link>
          </div>
          <p>© {new Date().getFullYear()} SnelRIE — Een product van Praesidion Holding B.V.</p>
        </div>
      </footer>

      {/* Comparison schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "RI&E Instrumenten Vergelijken 2026",
            description:
              "Vergelijk RI&E-instrumenten: SnelRIE (AI), arbodienst, branche-instrument of zelf doen.",
            url: "https://snelrie.nl/vergelijken",
            publisher: {
              "@type": "Organization",
              name: "SnelRIE",
              url: "https://snelrie.nl",
            },
          }),
        }}
      />
    </div>
  );
}
