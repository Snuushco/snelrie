import Link from "next/link";
import { Shield, CheckCircle2, ArrowRight, Star, Zap, Building2, Users } from "lucide-react";

const pricingTiers = [
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
    cta: "Start Gratis Scan",
    href: "/scan",
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
    cta: "Start Gratis Scan",
    href: "/scan",
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
    cta: "Start Gratis Scan",
    href: "/scan",
    highlighted: false,
    tier: "ENTERPRISE",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen">
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
            <Link href="/#hoe-werkt-het" className="text-sm text-gray-600 hover:text-gray-900">
              Hoe werkt het
            </Link>
            <Link href="/pricing" className="text-sm text-brand-700 hover:text-brand-800 font-medium">
              Prijzen
            </Link>
            <Link href="/#faq" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </Link>
            <Link href="/checklist" className="text-sm text-gray-600 hover:text-gray-900">
              Gratis Checklist
            </Link>
            <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
              Blog
            </Link>
          </div>
          <Link
            href="/scan"
            className="hidden md:inline-block bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
          >
            Start Gratis Scan
          </Link>
          <div className="md:hidden">
            <Link
              href="/scan"
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Start Scan
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Geen abonnement · Eenmalige betaling
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            Transparante{" "}
            <span className="text-brand-600">prijzen</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Iedereen begint met een gratis scan. Na uw scan kiest u het pakket dat past. 
            Geen verrassingen, geen verborgen kosten.
          </p>
          <div className="mt-10">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-700 transition shadow-lg shadow-brand-600/25"
            >
              Start met gratis scan
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Gratis eerste risico-overzicht
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

          {/* Social Proof */}
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-0.5">
                <Users className="h-4 w-4 text-brand-600 mr-1" />
                <span className="font-semibold text-gray-900">127+</span>
              </div>
              <span>RI&E scans deze maand</span>
              <span className="mx-2 text-gray-300">·</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-medium text-gray-700">4.8/5</span>
            </div>
            <div className="max-w-lg bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/60 px-6 py-4">
              <p className="text-sm text-gray-700 italic leading-relaxed">
                &ldquo;Binnen 10 minuten had ik een complete RI&E. Scheelt mij €1.500 en weken wachten op een adviseur.&rdquo;
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                  JV
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">J. de Vries</span> — Aannemer, 12 medewerkers
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 flex flex-col ${
                  tier.highlighted
                    ? "bg-brand-600 text-white ring-4 ring-brand-600/20 scale-105 shadow-2xl"
                    : "bg-white border border-gray-200 shadow-sm hover:shadow-md transition"
                }`}
              >
                {tier.highlighted && (
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand-200 mb-2">
                    Meest gekozen
                  </div>
                )}
                <h3 className={`text-2xl font-semibold ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
                  {tier.name}
                </h3>
                <div className="mt-4 mb-4">
                  <span className={`text-5xl font-extrabold ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
                    {tier.price}
                  </span>
                  <span className={`text-sm ml-2 ${tier.highlighted ? "text-brand-200" : "text-gray-500"}`}>
                    eenmalig
                  </span>
                </div>
                <p className={`text-lg mb-8 ${tier.highlighted ? "text-brand-100" : "text-gray-600"}`}>
                  {tier.description}
                </p>
                <ul className="space-y-4 mb-10 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2
                        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          tier.highlighted ? "text-brand-200" : "text-green-500"
                        }`}
                      />
                      <span className={tier.highlighted ? "text-brand-100" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`block text-center py-4 px-6 rounded-xl font-semibold transition ${
                    tier.highlighted
                      ? "bg-white text-brand-600 hover:bg-brand-50 shadow-lg"
                      : "bg-brand-600 text-white hover:bg-brand-700"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Value Proposition */}
          <div className="mt-16 bg-gray-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Waarom SnelRIE goedkoper én beter is
            </h3>
            <div className="grid md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Building2 className="h-6 w-6 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Traditionele RI&E</h4>
                <p className="text-sm text-gray-600">€500 - €5.000+</p>
                <p className="text-sm text-gray-600">2-6 weken wachttijd</p>
                <p className="text-sm text-gray-600">Afspraak nodig</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">SnelRIE</h4>
                <p className="text-sm text-gray-600">€99 - €499</p>
                <p className="text-sm text-gray-600">5 minuten</p>
                <p className="text-sm text-gray-600">Direct beschikbaar</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <CheckCircle2 className="h-6 w-6 text-brand-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Uw voordeel</h4>
                <p className="text-sm text-gray-600">Bespaar €400-4.500</p>
                <p className="text-sm text-gray-600">Geen wachttijd</p>
                <p className="text-sm text-gray-600">24/7 beschikbaar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Veelgestelde vragen over prijzen</h2>
          <div className="space-y-4">
            {[
              {
                q: "Waarom is dit zo veel goedkoper dan een traditionele RI&E?",
                a: "Wij gebruiken AI om in minuten te genereren wat een adviseur weken kost. Geen reiskosten, geen uurtarieven, geen lange doorlooptijden. U krijgt hetzelfde resultaat voor een fractie van de prijs."
              },
              {
                q: "Zijn er verborgen kosten?",
                a: "Nee. De prijs die u ziet is wat u betaalt. Geen abonnementen, geen extra kosten, geen verrassingen. Eenmalige betaling en u heeft uw RI&E."
              },
              {
                q: "Kan ik upgraden na mijn gratis scan?",
                a: "Ja. U begint altijd gratis en ziet direct een preview van uw RI&E. Daarna kiest u welk pakket u wilt. U betaalt alleen voor wat u nodig heeft."
              },
              {
                q: "Is deze RI&E rechtsgeldig voor dezelfde prijs?",
                a: "Ja. De RI&E voldoet aan alle wettelijke eisen van de Arbowet. Voor bedrijven met meer dan 25 medewerkers moet de RI&E nog getoetst worden door een arbodeskundige, maar dat geldt voor elke RI&E."
              },
              {
                q: "Hoe kan ik betalen?",
                a: "U kunt veilig betalen via iDEAL, creditcard of bankoverschrijving. Alle betalingen worden verwerkt via Stripe, de meest vertrouwde betalingsprovider ter wereld."
              }
            ].map((faq) => (
              <details key={faq.q} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Klaar om te beginnen?
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            Start met een gratis scan en zie direct uw grootste risico's. 
            Upgrade daarna naar het pakket dat bij u past.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-50 transition shadow-lg"
          >
            Start gratis scan
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
            <Link href="/blog" className="hover:text-white transition">
              Blog
            </Link>
            <Link href="/pricing" className="text-white">
              Prijzen
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
            <p>© {new Date().getFullYear()} SnelRIE — onderdeel van Praesidion Holding B.V.</p>
            <p className="text-gray-500 text-xs mt-1">KvK: 97640794 · BTW: NL868152237B01</p>
            <p className="text-gray-500 text-xs mt-0.5">Tel: 046 240 2401 · info@snelrie.nl</p>
          </div>
        </div>
      </footer>
    </main>
  );
}