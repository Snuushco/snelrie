import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  AlertTriangle,
  Clock,
  FileText,
  CheckCircle2,
  Zap,
  Scale,
  Phone,
  ShieldAlert,
  BadgeEuro,
  Timer,
  Key,
  Building2,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Brief van de Arbeidsinspectie Ontvangen? Zo Regel je je RI&E Binnen 1 Uur | SnelRIE",
  description:
    "Heb je een brief van de Arbeidsinspectie (NLA) over je RI&E? Geen paniek. Met SnelRIE heb je binnen 1 uur een volledige RI&E met Plan van Aanpak. Voorkom boetes tot €4.500.",
  keywords: [
    "brief arbeidsinspectie",
    "brief NLA ontvangen",
    "RI&E brief arbeidsinspectie",
    "arbeidsinspectie controle RI&E",
    "boete geen RI&E",
    "inspectie SZW RI&E",
    "NLA controle RI&E",
    "RI&E snel regelen",
  ],
  openGraph: {
    title: "Brief van de Arbeidsinspectie? Regel je RI&E Binnen 1 Uur",
    description:
      "Voorkom boetes tot €4.500. Met SnelRIE heb je direct een volledige RI&E.",
    url: "https://snelrie.nl/brief-arbeidsinspectie",
    siteName: "SnelRIE",
    locale: "nl_NL",
    type: "website",
  },
  alternates: {
    canonical: "https://snelrie.nl/brief-arbeidsinspectie",
  },
};

const urgencySteps = [
  {
    time: "Nu",
    title: "Lees de brief zorgvuldig",
    description:
      "Check de datum, de eis en de deadline. De NLA geeft meestal 2 tot 4 weken om een RI&E op te stellen. Soms korter bij ernstige risico's.",
    icon: FileText,
  },
  {
    time: "5 min",
    title: "Start de SnelRIE scan",
    description:
      "Vul je bedrijfsgegevens in. De AI stelt branchespecifieke vragen en genereert automatisch een volledige RI&E met alle wettelijk vereiste elementen.",
    icon: Zap,
    cta: { label: "Start Nu", href: "/scan" },
  },
  {
    time: "30 min",
    title: "Ontvang je volledige RI&E + Plan van Aanpak",
    description:
      "Kies het Professional pakket (€249) voor een complete RI&E met Plan van Aanpak, prioriteitenmatrix, deadlines en verantwoordelijken. Direct als PDF.",
    icon: CheckCircle2,
  },
  {
    time: "1 uur",
    title: "Stuur je RI&E naar de Inspectie",
    description:
      "Beantwoord de brief van de NLA met je verse RI&E als bijlage. Hiermee toon je aan dat je voldoet aan artikel 5 van de Arbowet.",
    icon: Shield,
  },
];

const fines = [
  { violation: "Geen RI&E aanwezig", fine: "€4.500", severity: "high" },
  { violation: "RI&E niet actueel (verouderd)", fine: "€3.000", severity: "high" },
  { violation: "Geen Plan van Aanpak", fine: "€3.000", severity: "high" },
  { violation: "RI&E niet getoetst (>25 werknemers)", fine: "€3.000", severity: "medium" },
  { violation: "Werknemers niet geïnformeerd", fine: "€1.500", severity: "medium" },
  { violation: "Herhaalovertreding (recidive)", fine: "Tot €13.500", severity: "high" },
];

export default function BriefArbeidsinspectiePage() {
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
            <Link href="/rie-zelf-maken" className="hover:text-gray-900">RI&E Zelf Maken</Link>
            <Link href="/vergelijken" className="hover:text-gray-900">Vergelijken</Link>
            <Link href="/blog" className="hover:text-gray-900">Blog</Link>
            <Link
              href="/scan"
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
            >
              Direct RI&E Regelen
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — urgency-driven */}
      <section className="bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
            <AlertTriangle className="h-4 w-4" />
            Urgente situatie? Direct actie ondernemen
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
            Brief van de Arbeidsinspectie?{" "}
            <span className="text-red-200">Binnen 1 Uur Compliant.</span>
          </h1>
          <p className="text-lg md:text-xl text-red-100 max-w-2xl mx-auto mb-8">
            De NLA controleert steeds strenger op de RI&E-plicht. Geen paniek — met SnelRIE heb
            je binnen een uur een volledige, professionele RI&E met Plan van Aanpak. Voorkom boetes
            tot <strong>€4.500 per overtreding</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/scan"
              className="inline-flex items-center justify-center gap-2 bg-white text-red-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-red-50 transition shadow-lg"
            >
              <Zap className="h-5 w-5" />
              Start Direct — Gratis Scan
            </Link>
            <a
              href="#actieplan"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition"
            >
              Bekijk het actieplan
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Urgency bar */}
      <section className="bg-amber-50 border-b border-amber-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-amber-800">
            <Timer className="h-4 w-4" />
            <strong>Gemiddelde reactietermijn NLA:</strong> 2–4 weken
          </div>
          <div className="hidden sm:block w-px h-4 bg-amber-300" />
          <div className="flex items-center gap-2 text-amber-800">
            <Zap className="h-4 w-4" />
            <strong>SnelRIE doorlooptijd:</strong> 5–30 minuten
          </div>
        </div>
      </section>

      {/* Actieplan */}
      <section id="actieplan" className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-4">
            Je Actieplan in 4 Stappen
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Van brief tot compliance in minder dan 1 uur. Dit is wat je doet:
          </p>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-red-200 hidden md:block" />

            <div className="space-y-8">
              {urgencySteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative flex items-start gap-6">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10">
                      <Icon className="h-5 w-5 text-red-700" />
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          <Clock className="h-3 w-3" />
                          {step.time}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                      {step.cta && (
                        <Link
                          href={step.cta.href}
                          className="mt-3 inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                        >
                          {step.cta.label}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Boetetabel */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-4">
            Wat Kost het als je Niets Doet?
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            De NLA (Nederlandse Arbeidsinspectie) kan direct boetes opleggen. Dit zijn de actuele
            boetebedragen per overtreding:
          </p>

          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {fines.map((fine, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-100/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className={`h-4 w-4 flex-shrink-0 ${
                        fine.severity === "high" ? "text-red-500" : "text-amber-500"
                      }`}
                    />
                    <span className="text-sm text-gray-900">{fine.violation}</span>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      fine.severity === "high" ? "text-red-600" : "text-amber-600"
                    }`}
                  >
                    {fine.fine}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-red-50 border-t border-red-100">
              <p className="text-sm text-red-800">
                <strong>Let op:</strong> Boetes worden per overtreding opgelegd en kunnen cumuleren.
                Bij ernstig gevaar kan de NLA ook een bedrijfsstillegging opleggen.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Een SnelRIE Professional kost <strong>€249</strong> — minder dan 6% van de laagste boete.
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition"
            >
              Voorkom Boetes — Start Nu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Wat staat er in de brief */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-10">
            Wat Staat er in de Brief van de Inspectie?
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Aankondiging inspectie",
                desc: "De NLA kondigt een bezoek aan. Je krijgt tijd om je RI&E op orde te brengen.",
                icon: FileText,
                urgency: "medium",
              },
              {
                title: "Eis tot naleving",
                desc: "Je moet binnen een termijn (2–4 weken) aantonen dat je een actuele RI&E hebt.",
                icon: Scale,
                urgency: "high",
              },
              {
                title: "Waarschuwing / last onder dwangsom",
                desc: "Bij herhaalde niet-naleving volgt een dwangsom: dagelijks oplopende boete tot je compliant bent.",
                icon: BadgeEuro,
                urgency: "high",
              },
              {
                title: "Boetebesluit",
                desc: "Direct een boete bij constatering van ontbrekende RI&E tijdens inspectie.",
                icon: AlertTriangle,
                urgency: "high",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className={`rounded-2xl p-6 border ${
                    item.urgency === "high"
                      ? "bg-red-50 border-red-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <Icon
                    className={`h-8 w-8 mb-3 ${
                      item.urgency === "high" ? "text-red-600" : "text-amber-600"
                    }`}
                  />
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-700">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cross-sell: Praesidion Keyholding */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Key className="h-8 w-8 text-brand-400" />
            <div>
              <p className="text-sm text-brand-400 font-medium">Een dienst van Praesidion Security</p>
              <h2 className="text-2xl md:text-3xl font-extrabold">
                Ook je Fysieke Beveiliging Regelen?
              </h2>
            </div>
          </div>

          <p className="text-gray-300 mb-8 max-w-2xl text-lg">
            Een RI&E brengt risico's in kaart — maar wie reageert als het alarm afgaat? Praesidion
            Security biedt <strong>keyholding en alarmopvolging</strong> voor bedrijven in heel
            Limburg. Gecombineerd met je RI&E ben je aantoonbaar compliant én beschermd.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: Key,
                title: "Keyholding",
                desc: "Wij bewaren je sleutels en zijn 24/7 beschikbaar bij alarm. Vanaf €528/jaar per locatie.",
              },
              {
                icon: ShieldAlert,
                title: "Alarmopvolging",
                desc: "Bij alarm binnen 15 minuten een gecertificeerde beveiliger op locatie. Dag en nacht.",
              },
              {
                icon: Building2,
                title: "Objectbeveiliging",
                desc: "Vaste beveiliging voor uw bedrijfspand, bouwplaats, evenement of zorginstelling.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white/10 rounded-xl p-5 border border-white/10">
                  <Icon className="h-6 w-6 text-brand-400 mb-3" />
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://praesidion.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-500 transition"
            >
              Meer over Praesidion Security
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="tel:0462402401"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition"
            >
              <Phone className="h-4 w-4" />
              Bel direct: 046 240 2401
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            Wacht Niet Tot de Inspecteur op de Stoep Staat
          </h2>
          <p className="text-red-100 mb-8 text-lg">
            Regel je RI&E vandaag nog. Start de gratis scan, upgrade naar Professional (€249)
            en heb binnen een uur een volledige RI&E met Plan van Aanpak.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-white text-red-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-red-50 transition shadow-lg"
          >
            <Zap className="h-5 w-5" />
            Start Gratis RI&E Scan
          </Link>
          <p className="text-red-200 text-sm mt-4">
            Geen account nodig. Resultaat in 5 minuten. Upgrade alleen als je tevreden bent.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">
            Veelgestelde Vragen
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Wat moet ik doen als ik een brief van de Arbeidsinspectie krijg?",
                a: "Lees de brief zorgvuldig en check de deadline. Stel zo snel mogelijk een actuele RI&E op. Met SnelRIE kun je dit binnen een uur regelen. Reageer schriftelijk op de brief met je RI&E als bijlage.",
              },
              {
                q: "Hoeveel tijd heb ik om te reageren?",
                a: "De NLA geeft meestal 2 tot 4 weken. Bij ernstige risico's kan de termijn korter zijn. Hoe sneller je reageert, hoe beter je positie.",
              },
              {
                q: "Kan ik bezwaar maken tegen een boete?",
                a: "Ja, je kunt binnen 6 weken bezwaar maken. Maar het is effectiever om eerst je RI&E op orde te brengen. Een actuele RI&E kan helpen bij het verlagen of intrekken van de boete.",
              },
              {
                q: "Is een SnelRIE-rapport voldoende voor de Inspectie?",
                a: "SnelRIE genereert een professioneel rapport dat voldoet aan de eisen van artikel 5 van de Arbowet. Voor bedrijven met meer dan 25 medewerkers moet het rapport aanvullend getoetst worden door een gecertificeerde arbodeskundige.",
              },
              {
                q: "Wat als ik al een RI&E heb maar die is verouderd?",
                a: "Een verouderde RI&E telt niet als naleving. De RI&E moet actueel zijn — dat betekent jaarlijks herzien of bij veranderingen in je bedrijf. Met SnelRIE maak je in 5 minuten een nieuwe, actuele RI&E.",
              },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-200 group">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-gray-900 font-semibold hover:text-red-700">
                  {faq.q}
                  <ChevronRight className="h-4 w-4 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
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
            <Link href="/vergelijken" className="hover:text-gray-900">Vergelijken</Link>
          </div>
          <p>© {new Date().getFullYear()} SnelRIE — Een product van Praesidion Holding B.V.</p>
        </div>
      </footer>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Wat moet ik doen als ik een brief van de Arbeidsinspectie krijg?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Lees de brief zorgvuldig en check de deadline. Stel zo snel mogelijk een actuele RI&E op. Met SnelRIE kun je dit binnen een uur regelen.",
                },
              },
              {
                "@type": "Question",
                name: "Hoeveel tijd heb ik om te reageren?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "De NLA geeft meestal 2 tot 4 weken. Bij ernstige risico's kan de termijn korter zijn.",
                },
              },
              {
                "@type": "Question",
                name: "Is een SnelRIE-rapport voldoende voor de Inspectie?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "SnelRIE genereert een professioneel rapport dat voldoet aan de eisen van artikel 5 van de Arbowet. Voor bedrijven met meer dan 25 medewerkers moet het rapport aanvullend getoetst worden.",
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
