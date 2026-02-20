import Link from "next/link";
import {
  Shield,
  Zap,
  FileText,
  CheckCircle2,
  ArrowRight,
  Clock,
  Building2,
  Scale,
  Star,
  ChevronDown,
} from "lucide-react";

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
    price: "€299",
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

const faqs = [
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

export default function HomePage() {
  return (
    <main>
      {/* Navigation */}
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
          </div>
          <Link
            href="/scan"
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
          >
            Start Gratis Scan
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Scale className="h-4 w-4" />
            Wettelijk verplicht voor alle werkgevers
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            Je RI&E in minuten,{" "}
            <span className="text-brand-600">niet weken</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            AI-gestuurde Risico-Inventarisatie & Evaluatie. Branchespecifiek,
            professioneel, en direct klaar. Voldoe aan de Arbowet zonder weken
            te wachten op een adviseur.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/scan"
              className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-700 transition shadow-lg shadow-brand-600/25"
            >
              Start Gratis Scan
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#hoe-werkt-het"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold border border-gray-200 hover:bg-gray-50 transition"
            >
              Hoe werkt het?
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
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
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Waarom bedrijven kiezen voor SnelRIE
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "AI-gestuurd",
                desc: "Onze AI analyseert uw bedrijfssituatie en genereert een gepersonaliseerde RI&E op basis van de laatste arbocatalogi en wetgeving.",
              },
              {
                icon: Building2,
                title: "Branchespecifiek",
                desc: "Geen generiek verhaal. Uw RI&E is afgestemd op de specifieke risico's en maatregelen van uw branche.",
              },
              {
                icon: Clock,
                title: "Klaar in minuten",
                desc: "Traditioneel duurt een RI&E weken en kost het duizenden euro's. Bij SnelRIE heeft u binnen 5 minuten een professioneel rapport.",
              },
            ].map((usp) => (
              <div
                key={usp.title}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition"
              >
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                  <usp.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {usp.title}
                </h3>
                <p className="text-gray-600">{usp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="hoe-werkt-het" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Hoe werkt het?
          </h2>
          <div className="space-y-8">
            {[
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
            ].map((s) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {s.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="prijzen" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Transparante prijzen
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Geen verborgen kosten, geen abonnement. Eenmalige betaling voor uw
            complete RI&E.
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
                <h3
                  className={`text-lg font-semibold ${
                    tier.highlighted ? "text-white" : "text-gray-900"
                  }`}
                >
                  {tier.name}
                </h3>
                <div className="mt-2 mb-4">
                  <span
                    className={`text-3xl font-extrabold ${
                      tier.highlighted ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={`text-sm ml-1 ${
                      tier.highlighted ? "text-brand-200" : "text-gray-500"
                    }`}
                  >
                    eenmalig
                  </span>
                </div>
                <p
                  className={`text-sm mb-6 ${
                    tier.highlighted ? "text-brand-100" : "text-gray-600"
                  }`}
                >
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
                  href={tier.href}
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

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Veelgestelde vragen
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Klaar om uw RI&E op te stellen?
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            Begin met een gratis scan en ontdek de grootste risico's in uw
            bedrijf. In 5 minuten klaar.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-50 transition"
          >
            Start Nu — Gratis
            <ArrowRight className="h-5 w-5" />
          </Link>
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
            <a href="#" className="hover:text-white transition">
              Privacy
            </a>
            <Link href="/voorwaarden" className="hover:text-white transition">
              Voorwaarden
            </Link>
            <a href="#" className="hover:text-white transition">
              Contact
            </a>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} SnelRIE. Alle rechten voorbehouden.</p>
        </div>
      </footer>

      {/* Structured Data */}
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
