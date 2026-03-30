"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Building2,
  Users,
  Sparkles,
  Crown,
} from "lucide-react";

const subscriptionPlans = [
  {
    tier: "STARTER",
    name: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 179,
    yearlyMonthly: 15,
    yearlySavings: 49,
    description: "Voor kleine bedrijven die willen starten",
    features: [
      "1 RI&E rapport per maand",
      "Basis risico-analyse",
      "PDF download",
      "Email support",
    ],
    highlighted: false,
    icon: Zap,
  },
  {
    tier: "PROFESSIONAL",
    name: "Professional",
    monthlyPrice: 49,
    yearlyPrice: 469,
    yearlyMonthly: 39,
    yearlySavings: 119,
    description: "Voor groeiende bedrijven",
    features: [
      "5 RI&E rapporten per maand",
      "Uitgebreide risico-analyse",
      "Plan van Aanpak",
      "Branding & huisstijl",
      "Tot 3 locaties",
      "AI chat assistent",
      "Prioriteit support",
    ],
    highlighted: true,
    icon: Star,
  },
  {
    tier: "ENTERPRISE",
    name: "Enterprise",
    monthlyPrice: 129,
    yearlyPrice: 1249,
    yearlyMonthly: 104,
    yearlySavings: 299,
    description: "Voor grote organisaties",
    features: [
      "Onbeperkt rapporten",
      "Uitgebreide rapportage",
      "Plan van Aanpak + prioritering",
      "Branding & huisstijl",
      "Onbeperkt locaties",
      "AI Expert Chat (24/7)",
      "Multi-user toegang",
      "API toegang",
      "Dedicated support",
    ],
    highlighted: false,
    icon: Crown,
  },
];

const oneTimePrices = [
  { name: "Basis", price: 249, tier: "BASIS" },
  { name: "Professional", price: 649, tier: "PROFESSIONAL" },
  { name: "Enterprise", price: 1499, tier: "ENTERPRISE" },
];

const comparisonFeatures = [
  { name: "RI&E rapporten per maand", starter: "1", professional: "5", enterprise: "Onbeperkt" },
  { name: "Risico-analyse", starter: "Basis", professional: "Uitgebreid", enterprise: "Uitgebreid+" },
  { name: "Plan van Aanpak", starter: "—", professional: "✓", enterprise: "✓" },
  { name: "Branding & huisstijl", starter: "—", professional: "✓", enterprise: "✓" },
  { name: "Locaties", starter: "1", professional: "3", enterprise: "Onbeperkt" },
  { name: "AI chat assistent", starter: "—", professional: "✓", enterprise: "24/7 Expert" },
  { name: "Team leden", starter: "1", professional: "5", enterprise: "Onbeperkt" },
  { name: "PDF download", starter: "✓", professional: "✓", enterprise: "✓" },
  { name: "API toegang", starter: "—", professional: "—", enterprise: "✓" },
  { name: "Support", starter: "Email", professional: "Prioriteit", enterprise: "Dedicated" },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);

  const handleCheckout = async (tier: string) => {
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          billingCycle: isYearly ? "YEARLY" : "MONTHLY",
        }),
      });

      if (res.status === 401) {
        // Not logged in, redirect to register
        window.location.href = `/register?redirect=/pricing&tier=${tier}&cycle=${isYearly ? "YEARLY" : "MONTHLY"}`;
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Er ging iets mis. Probeer het opnieuw.");
    }
  };

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
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Kies het plan dat bij je past
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            Transparante{" "}
            <span className="text-brand-600">prijzen</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Start met een gratis scan en kies daarna het abonnement dat past bij jouw organisatie.
            Bespaar tot €299 met een jaarabonnement. Minimaal 12 maanden — precies één RI&E-cyclus.
          </p>

          {/* Billing toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? "text-gray-900" : "text-gray-500"}`}>
              Maandelijks
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                isYearly ? "bg-brand-600" : "bg-gray-300"
              }`}
              aria-label="Toggle jaarlijks/maandelijks"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                  isYearly ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? "text-gray-900" : "text-gray-500"}`}>
              Jaarlijks
            </span>
            {isYearly && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                Bespaar tot €299
              </span>
            )}
          </div>

          {/* Social proof */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4 text-brand-600" />
              <span className="font-semibold text-gray-900">127+</span>
              <span>RI&E scans deze maand</span>
              <span className="mx-2 text-gray-300">·</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-medium text-gray-700">4.8/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan) => {
              const Icon = plan.icon;
              const price = isYearly ? plan.yearlyMonthly : plan.monthlyPrice;
              const totalYearly = plan.yearlyPrice;

              return (
                <div
                  key={plan.tier}
                  className={`rounded-2xl p-8 flex flex-col relative ${
                    plan.highlighted
                      ? "bg-brand-600 text-white ring-4 ring-brand-600/20 lg:scale-105 shadow-2xl"
                      : "bg-white border border-gray-200 shadow-sm hover:shadow-md transition"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-800 text-white text-xs font-semibold px-4 py-1 rounded-full">
                      Meest gekozen
                    </div>
                  )}

                  {isYearly && (
                    <div
                      className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        plan.highlighted
                          ? "bg-green-400/20 text-green-100"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      Bespaar €{plan.yearlySavings}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        plan.highlighted ? "bg-white/20" : "bg-brand-100"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${plan.highlighted ? "text-white" : "text-brand-600"}`} />
                    </div>
                    <h3
                      className={`text-2xl font-semibold ${
                        plan.highlighted ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.name}
                    </h3>
                  </div>

                  <div className="mb-2">
                    <span
                      className={`text-5xl font-extrabold ${
                        plan.highlighted ? "text-white" : "text-gray-900"
                      }`}
                    >
                      €{price}
                    </span>
                    <span
                      className={`text-sm ml-2 ${
                        plan.highlighted ? "text-brand-200" : "text-gray-500"
                      }`}
                    >
                      /maand
                    </span>
                  </div>

                  {isYearly && (
                    <p
                      className={`text-sm mb-2 ${
                        plan.highlighted ? "text-brand-200" : "text-gray-500"
                      }`}
                    >
                      €{totalYearly} per jaar gefactureerd
                    </p>
                  )}

                  <p
                    className={`text-xs mb-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                      plan.highlighted
                        ? "bg-white/10 text-brand-200"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    12 maanden · auto-verlenging
                  </p>

                  <p
                    className={`text-base mb-6 ${
                      plan.highlighted ? "text-brand-100" : "text-gray-600"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <CheckCircle2
                          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            plan.highlighted ? "text-brand-200" : "text-green-500"
                          }`}
                        />
                        <span className={plan.highlighted ? "text-brand-100" : "text-gray-600"}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleCheckout(plan.tier)}
                    className={`block w-full text-center py-4 px-6 rounded-xl font-semibold transition cursor-pointer ${
                      plan.highlighted
                        ? "bg-white text-brand-600 hover:bg-brand-50 shadow-lg"
                        : "bg-brand-600 text-white hover:bg-brand-700"
                    }`}
                  >
                    Aan de slag
                    <ArrowRight className="inline-block ml-2 h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Vergelijk alle functies
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">
                      Functie
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-900">
                      Starter
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-brand-600 bg-brand-50">
                      Professional
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-900">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, i) => (
                    <tr
                      key={feature.name}
                      className={i < comparisonFeatures.length - 1 ? "border-b border-gray-100" : ""}
                    >
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {feature.name}
                      </td>
                      <td className="text-center py-4 px-6 text-sm text-gray-600">
                        {feature.starter}
                      </td>
                      <td className="text-center py-4 px-6 text-sm text-gray-900 font-medium bg-brand-50/50">
                        {feature.professional}
                      </td>
                      <td className="text-center py-4 px-6 text-sm text-gray-600">
                        {feature.enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* One-time purchase section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Liever een eenmalig rapport?
            </h2>
            <p className="text-gray-600 text-lg">
              Geen abonnement nodig? Koop een enkel RI&E rapport tegen een vaste prijs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {oneTimePrices.map((item) => (
              <div
                key={item.tier}
                className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.name}
                </h3>
                <p className="text-4xl font-extrabold text-gray-900 mb-1">
                  €{item.price}
                </p>
                <p className="text-sm text-gray-500 mb-6">eenmalig</p>
                <Link
                  href="/scan"
                  className="block w-full py-3 px-6 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Start met scan
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-4">
            Na je gratis scan kies je welk rapport je wilt kopen.
          </p>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Waarom SnelRIE goedkoper én beter is
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Building2 className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Traditionele RI&E</h4>
              <p className="text-sm text-gray-600">€500 – €5.000+</p>
              <p className="text-sm text-gray-600">2–6 weken wachttijd</p>
              <p className="text-sm text-gray-600">Afspraak nodig</p>
            </div>
            <div className="text-center bg-white rounded-xl p-6 border-2 border-brand-200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">SnelRIE</h4>
              <p className="text-sm text-gray-600">Vanaf €19/maand</p>
              <p className="text-sm text-gray-600">5 minuten</p>
              <p className="text-sm text-gray-600">Direct beschikbaar</p>
            </div>
            <div className="text-center bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <CheckCircle2 className="h-6 w-6 text-brand-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Uw voordeel</h4>
              <p className="text-sm text-gray-600">Bespaar €400–4.500</p>
              <p className="text-sm text-gray-600">Geen wachttijd</p>
              <p className="text-sm text-gray-600">24/7 beschikbaar</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Veelgestelde vragen over prijzen
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Kan ik ook zonder abonnement een rapport kopen?",
                a: "Ja! Je kunt altijd een eenmalig rapport kopen zonder abonnement. Start een gratis scan en kies daarna het eenmalige pakket dat bij je past.",
              },
              {
                q: "Hoe werkt het abonnement?",
                a: "Alle abonnementen hebben een minimale looptijd van 12 maanden — dit past precies bij de wettelijke RI&E-cyclus. Na 12 maanden wordt je abonnement automatisch verlengd, zodat je RI&E altijd actueel blijft. Opzeggen kan tot 30 dagen voor de verlengdatum. Zo heb je altijd zekerheid dat je compliant bent.",
              },
              {
                q: "Wat gebeurt er als ik upgrade of downgrade?",
                a: "Bij een upgrade krijg je direct toegang tot alle functies van je nieuwe plan. Het verschil wordt pro rata verrekend. Bij een downgrade wijzigt je plan aan het einde van de lopende periode.",
              },
              {
                q: "Hoe kan ik betalen?",
                a: "Je kunt betalen via iDEAL of creditcard (Visa, Mastercard, American Express). Alle betalingen worden veilig verwerkt via Stripe.",
              },
              {
                q: "Is er een proefperiode?",
                a: "Nieuwe accounts starten met een gratis scan. Hiermee krijg je direct inzicht in de mogelijkheden van SnelRIE voordat je een abonnement kiest.",
              },
              {
                q: "Wat als ik meer dan 25 medewerkers heb?",
                a: "De RI&E voldoet aan de Arbowet. Bij meer dan 25 medewerkers moet de RI&E worden getoetst door een arbodeskundige. Dit geldt voor elke RI&E, ongeacht de aanbieder.",
              },
              {
                q: "Is de RI&E wettelijk verplicht?",
                a: "Ja, elke werkgever in Nederland is wettelijk verplicht een RI&E op te stellen (Arbowet art. 5). Dit geldt voor alle bedrijven met personeel, ook met maar 1 werknemer.",
              },
              {
                q: "Kan ik tussentijds opzeggen?",
                a: "Alle abonnementen hebben een minimale looptijd van 12 maanden. Na deze periode kunt u opzeggen met een opzegtermijn van 30 dagen.",
              },
              {
                q: "Wat als ik meer rapporten nodig heb dan mijn plan toestaat?",
                a: "U kunt eenvoudig upgraden naar Professional (5 rapporten/maand) of Enterprise (onbeperkt). De upgrade gaat direct in en het verschil wordt pro rata verrekend.",
              },
              {
                q: "Is mijn data veilig?",
                a: "Ja. Alle data wordt versleuteld opgeslagen en wij zijn volledig GDPR-compliant. Uw bedrijfsgegevens worden nooit gedeeld met derden.",
              },
              {
                q: "Kan ik het eerst proberen?",
                a: "Ja! Start met een gratis scan om direct inzicht te krijgen. Daarnaast bieden wij een 14 dagen gratis Professional proefperiode aan zodat u alle functies kunt uitproberen.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Urgency element */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-amber-50 border-y border-amber-200">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm sm:text-base font-medium text-amber-800">
            ⚠️ Inspectie SZW controleert steeds vaker — zorg dat uw RI&E op orde is
          </p>
          <p className="text-xs sm:text-sm text-amber-700 mt-1">
            Boetes voor ontbrekende RI&E kunnen oplopen tot €4.500 of meer.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Klaar om te beginnen?
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            Start met een gratis scan en zie direct uw grootste risico&apos;s.
            Kies daarna het plan dat bij u past.
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
