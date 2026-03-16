import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Lightbulb,
  Users,
  ClipboardList,
  Zap,
  BookOpen,
  Scale,
} from "lucide-react";

export const metadata: Metadata = {
  title: "RI&E Zelf Maken — Stappenplan + Gratis Scan | SnelRIE",
  description:
    "Leer hoe je zelf een RI&E maakt met dit complete stappenplan. Gebruik de gratis AI-scan van SnelRIE en bespaar duizenden euro's op je risico-inventarisatie.",
  keywords: [
    "RI&E zelf maken",
    "risico-inventarisatie zelf opstellen",
    "RI&E stappenplan",
    "RI&E maken zonder arbodienst",
    "RI&E kosten besparen",
    "RI&E template",
  ],
  openGraph: {
    title: "RI&E Zelf Maken — Stappenplan + Gratis Scan | SnelRIE",
    description:
      "Complete gids voor het zelf opstellen van je RI&E. Inclusief gratis AI-scan.",
    url: "https://snelrie.nl/rie-zelf-maken",
    siteName: "SnelRIE",
    locale: "nl_NL",
    type: "website",
  },
  alternates: {
    canonical: "https://snelrie.nl/rie-zelf-maken",
  },
};

const steps = [
  {
    number: 1,
    title: "Inventariseer alle werkzaamheden",
    icon: ClipboardList,
    time: "30–60 min",
    description:
      "Loop je bedrijf door en noteer álle werkzaamheden, werkplekken en processen. Denk aan kantoorwerk, fysiek werk, klantcontact, transport, gevaarlijke stoffen en werken op hoogte.",
    tip: "Betrek medewerkers bij deze stap — zij weten het beste welke risico's ze dagelijks tegenkomen.",
  },
  {
    number: 2,
    title: "Identificeer de gevaren en risico's",
    icon: AlertTriangle,
    time: "1–2 uur",
    description:
      "Koppel aan elke werkzaamheid de mogelijke gevaren. Gebruik de arbocatalogus van je branche als leidraad. Denk aan fysieke belasting, psychosociale arbeidsbelasting (PSA), geluid, beeldschermwerk en biologische agentia.",
    tip: "De Arbowet onderscheidt 14 risicothema's. Zorg dat je ze allemaal langsloopt.",
  },
  {
    number: 3,
    title: "Beoordeel de ernst en waarschijnlijkheid",
    icon: Scale,
    time: "1–2 uur",
    description:
      "Geef elk risico een score op ernst (hoe erg is het als het misgaat?) en waarschijnlijkheid (hoe vaak kan het voorkomen?). Dit bepaalt de prioriteit van je maatregelen.",
    tip: "Gebruik een simpele 3×3 matrix: laag-midden-hoog voor beide assen.",
  },
  {
    number: 4,
    title: "Stel een Plan van Aanpak op",
    icon: FileText,
    time: "2–4 uur",
    description:
      "Beschrijf per risico welke maatregelen je neemt, wie verantwoordelijk is, wanneer het klaar moet zijn en wat het kost. Begin met de rode items — die zijn het urgentst.",
    tip: "De Inspectie kijkt specifiek naar je Plan van Aanpak. Zonder PvA is je RI&E onvolledig.",
  },
  {
    number: 5,
    title: "Laat de RI&E toetsen (indien verplicht)",
    icon: Users,
    time: "Variabel",
    description:
      "Bedrijven met meer dan 25 medewerkers zijn verplicht de RI&E te laten toetsen door een gecertificeerde arbodeskundige. Kleinere bedrijven die een erkend branche-instrument gebruiken zijn hiervan vrijgesteld.",
    tip: "Controleer op rie.nl of er een erkend instrument voor jouw branche beschikbaar is.",
  },
  {
    number: 6,
    title: "Implementeer, evalueer en actualiseer",
    icon: CheckCircle2,
    time: "Doorlopend",
    description:
      "Voer je maatregelen uit volgens het Plan van Aanpak. Evalueer jaarlijks of bij veranderingen in je bedrijf. De RI&E is een levend document — niet iets dat in een la belandt.",
    tip: "Zet een jaarlijkse herinnering. De Inspectie kan controleren of je RI&E actueel is.",
  },
];

const timeComparison = [
  { method: "Zelf handmatig (deze gids)", time: "6–15 uur", cost: "€0 (eigen tijd)" },
  { method: "Arbodienst / extern adviseur", time: "2–6 weken", cost: "€500 – €5.000+" },
  { method: "SnelRIE (AI-gestuurd)", time: "5–30 minuten", cost: "Vanaf €99" },
];

export default function RieZelfMakenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-600" />
            <span className="text-lg font-bold">
              Snel<span className="text-brand-600">RIE</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/blog" className="hover:text-gray-900">Blog</Link>
            <Link href="/checklist" className="hover:text-gray-900">Gratis Checklist</Link>
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
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm">
            <BookOpen className="h-4 w-4" />
            Zoekvolume: 2.400+ zoekopdrachten per maand
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
            RI&E Zelf Maken:{" "}
            <span className="text-brand-200">
              Het Complete Stappenplan voor 2026
            </span>
          </h1>
          <p className="text-lg md:text-xl text-brand-100 max-w-2xl mx-auto mb-8">
            Elke werkgever in Nederland is verplicht een RI&E te hebben. In deze gids leer je
            stap voor stap hoe je er zelf een opstelt — of hoe je het in 5 minuten laat doen door AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/scan"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-50 transition shadow-lg"
            >
              <Zap className="h-5 w-5" />
              Liever snel? Start de AI-scan
            </Link>
            <a
              href="#stappenplan"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition"
            >
              Lees het stappenplan
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Wettelijk kader */}
      <section className="py-12 bg-amber-50 border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-sm border border-amber-200">
            <AlertTriangle className="h-8 w-8 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Wettelijke verplichting</h2>
              <p className="text-gray-700">
                Volgens <strong>artikel 5 van de Arbowet</strong> is iedere werkgever verplicht een
                Risico-Inventarisatie & Evaluatie (RI&E) op te stellen. Dit geldt voor álle bedrijven
                met personeel — ook met maar 1 werknemer. Geen RI&E? Dan riskeer je boetes tot{" "}
                <strong>€4.500 per overtreding</strong> van de Nederlandse Arbeidsinspectie (NLA).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stappenplan */}
      <section id="stappenplan" className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-4">
            RI&E Zelf Maken in 6 Stappen
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Met dit stappenplan kun je als werkgever zelf een RI&E opstellen. Reken op 6 tot 15 uur
            werk, afhankelijk van de grootte en complexiteit van je bedrijf.
          </p>

          <div className="space-y-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                      <span className="text-brand-700 font-bold text-lg">{step.number}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">{step.title}</h3>
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          <Clock className="h-3 w-3" />
                          {step.time}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      <div className="flex items-start gap-2 bg-brand-50 rounded-lg p-3">
                        <Lightbulb className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-brand-800">
                          <strong>Tip:</strong> {step.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tijdvergelijking */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-4">
            Hoeveel Tijd en Geld Kost een RI&E?
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            De kosten variëren enorm. Dit is wat je kunt verwachten:
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {timeComparison.map((item, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 border ${
                  i === 2
                    ? "bg-brand-50 border-brand-200 ring-2 ring-brand-500/20"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <h3 className="font-bold text-gray-900 mb-4">{item.method}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Doorlooptijd</p>
                    <p className={`text-lg font-bold ${i === 2 ? "text-brand-700" : "text-gray-900"}`}>
                      {item.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Kosten</p>
                    <p className={`text-lg font-bold ${i === 2 ? "text-brand-700" : "text-gray-900"}`}>
                      {item.cost}
                    </p>
                  </div>
                </div>
                {i === 2 && (
                  <Link
                    href="/scan"
                    className="mt-4 inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition w-full justify-center"
                  >
                    Start Gratis Scan
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waarom SnelRIE */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-4">
            Geen Tijd om het Zelf te Doen?
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            SnelRIE doet in 5 minuten wat handmatig 6–15 uur kost. Met dezelfde kwaliteit,
            op basis van de Arbowet en branchespecifieke arbocatalogi.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {[
              {
                icon: Zap,
                title: "Klaar in 5 minuten",
                text: "Vul een korte intake in, de AI doet de rest. Direct PDF-rapport.",
              },
              {
                icon: FileText,
                title: "Professioneel rapport",
                text: "Volledig conform de wettelijke eisen, klaar voor de Inspectie.",
              },
              {
                icon: Scale,
                title: "Wettelijk onderbouwd",
                text: "Gebaseerd op Arbowet art. 5, arbocatalogi en actuele wetgeving.",
              },
              {
                icon: CheckCircle2,
                title: "Inclusief Plan van Aanpak",
                text: "Met maatregelen, prioriteiten, deadlines en kostenramingen (Professional+).",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <Icon className="h-8 w-8 text-brand-600 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.text}</p>
                </div>
              );
            })}
          </div>

          {/* Prijzen compact */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Pakketten & Prijzen</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { tier: "Gratis Scan", price: "€0", desc: "Top 3 risico's zichtbaar, geen account nodig" },
                { tier: "Basis", price: "€99", desc: "Volledige RI&E met alle risico's + PDF-rapport" },
                { tier: "Professional", price: "€249", desc: "RI&E + Plan van Aanpak + prioriteitenmatrix", highlighted: true },
                { tier: "Enterprise", price: "€499", desc: "Alles + AI Expert Chat (24/7) + jaarlijkse updates" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-6 py-4 ${
                    item.highlighted ? "bg-brand-50" : ""
                  }`}
                >
                  <div>
                    <span className="font-semibold text-gray-900">{item.tier}</span>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <span className={`text-lg font-bold ${item.highlighted ? "text-brand-700" : "text-gray-900"}`}>
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            Start Nu — Gratis en Vrijblijvend
          </h2>
          <p className="text-brand-100 mb-8 text-lg">
            Doe de gratis scan en ontdek je 3 grootste risico's in 5 minuten.
            Geen account nodig. Upgrade alleen als je tevreden bent.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-white text-brand-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-50 transition shadow-lg"
          >
            Start Gratis RI&E Scan
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-brand-200 text-sm mt-4">
            Al 500+ bedrijven gingen je voor. Gemiddelde score: 4,7/5.
          </p>
        </div>
      </section>

      {/* FAQ Schema + FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">
            Veelgestelde Vragen over RI&E Zelf Maken
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Mag ik als werkgever zelf een RI&E opstellen?",
                a: "Ja. De Arbowet zegt dat de werkgever verantwoordelijk is voor het opstellen van de RI&E. Je mag dit zelf doen of uitbesteden. Bij bedrijven met meer dan 25 medewerkers moet de RI&E wél getoetst worden door een gecertificeerde arbodeskundige.",
              },
              {
                q: "Hoe lang duurt het om zelf een RI&E te maken?",
                a: "Handmatig kost het 6 tot 15 uur, afhankelijk van de grootte en complexiteit van je bedrijf. Met SnelRIE ben je in 5 tot 30 minuten klaar.",
              },
              {
                q: "Wat als ik geen verstand heb van arbo-wetgeving?",
                a: "Dat hoeft geen probleem te zijn. SnelRIE stelt de juiste vragen en genereert automatisch een RI&E op basis van je antwoorden, de Arbowet en je branchespecifieke arbocatalogus.",
              },
              {
                q: "Is een AI-gegenereerde RI&E geldig?",
                a: "Ja. De RI&E is een werkgeversdocument — de wet schrijft niet voor hóé je het maakt, alleen dát je het hebt. SnelRIE genereert een professioneel rapport dat voldoet aan de wettelijke eisen.",
              },
              {
                q: "Moet mijn RI&E getoetst worden?",
                a: "Bedrijven met meer dan 25 medewerkers moeten de RI&E laten toetsen door een gecertificeerde arbodeskundige (kerndeskundige). Kleinere bedrijven die een erkend branche-instrument gebruiken zijn vrijgesteld van toetsing.",
              },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-200 group">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-gray-900 font-semibold hover:text-brand-700">
                  {faq.q}
                  <ArrowRight className="h-4 w-4 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
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
            <Link href="/blog" className="hover:text-gray-900">Blog</Link>
          </div>
          <p>© {new Date().getFullYear()} SnelRIE — Een product van Praesidion Holding B.V.</p>
        </div>
      </footer>

      {/* FAQ Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Mag ik als werkgever zelf een RI&E opstellen?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Ja. De Arbowet zegt dat de werkgever verantwoordelijk is voor het opstellen van de RI&E. Je mag dit zelf doen of uitbesteden. Bij bedrijven met meer dan 25 medewerkers moet de RI&E wél getoetst worden door een gecertificeerde arbodeskundige.",
                },
              },
              {
                "@type": "Question",
                name: "Hoe lang duurt het om zelf een RI&E te maken?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Handmatig kost het 6 tot 15 uur. Met SnelRIE ben je in 5 tot 30 minuten klaar.",
                },
              },
              {
                "@type": "Question",
                name: "Is een AI-gegenereerde RI&E geldig?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Ja. De RI&E is een werkgeversdocument — de wet schrijft niet voor hóé je het maakt, alleen dát je het hebt.",
                },
              },
              {
                "@type": "Question",
                name: "Moet mijn RI&E getoetst worden?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Bedrijven met meer dan 25 medewerkers moeten de RI&E laten toetsen door een gecertificeerde arbodeskundige. Kleinere bedrijven die een erkend branche-instrument gebruiken zijn vrijgesteld.",
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
