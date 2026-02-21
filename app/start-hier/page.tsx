import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Clock, ArrowRight, FileText, Building2, CheckCircle2, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Start hier — Je RI&E in 30 minuten | SnelRIE",
  description: "Stap-voor-stap naar een bruikbare Risico-Inventarisatie & Evaluatie. In 30 minuten klaar.",
};

const steps = [
  {
    number: 1,
    title: "Start de gratis scan",
    time: "5 min",
    description: "Vul je bedrijfsgegevens in: naam, branche en aantal medewerkers. Geen account nodig — je kunt direct beginnen.",
    action: { label: "Start Gratis Scan", href: "/scan" },
  },
  {
    number: 2,
    title: "Beantwoord de werkplekvragen",
    time: "5 min",
    description: "Vink aan welke werkzaamheden van toepassing zijn: beeldschermwerk, fysiek werk, gevaarlijke stoffen, etc. De AI stelt de juiste vervolgvragen.",
  },
  {
    number: 3,
    title: "Bekijk je top-3 risico's (gratis)",
    time: "2 min",
    description: "Direct na het invullen zie je je 3 grootste risico's — met uitleg en de wettelijke achtergrond. De rest is geblurd totdat je upgradet.",
  },
  {
    number: 4,
    title: "Kies je pakket",
    time: "3 min",
    description: "Basis (€99) voor de volledige RI&E, Professional (€299) met Plan van Aanpak, of Enterprise (€499) met AI Expert Chat en jaarlijkse updates.",
    action: { label: "Bekijk Pakketten", href: "/#pricing" },
  },
  {
    number: 5,
    title: "Ontvang je volledige rapport",
    time: "Direct",
    description: "Na betaling wordt je volledige RI&E-rapport direct gegenereerd als professionele PDF. Je ontvangt een downloadlink per email.",
  },
  {
    number: 6,
    title: "Implementeer je maatregelen",
    time: "15+ min",
    description: "Elk risico heeft concrete maatregelen met prioriteit, verantwoordelijke en deadline. Begin met de rode items — die zijn het urgentst.",
  },
];

export default function StartHierPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold">Snel<span className="text-blue-600">RIE</span></span>
          </Link>
          <Link href="/scan" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Start Scan →
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Clock className="w-4 h-4" />
            30 minuten naar een bruikbare RI&E
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Start hier
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
            Elke werkgever in Nederland is wettelijk verplicht een RI&E te hebben. Hier maak je er eentje — in 6 stappen.
          </p>
        </div>

        {/* Wettelijke context */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-10 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Wettelijk verplicht (Arbowet art. 5)</p>
            <p className="text-sm text-amber-700 mt-1">Iedere werkgever met personeel moet een RI&E hebben. Inspectie SZW kan boetes opleggen tot €13.500 per overtreding.</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.number} className="relative flex gap-4 sm:gap-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm shrink-0">
                  {step.number}
                </div>
                {step.number < 6 && <div className="w-0.5 flex-1 bg-blue-100 mt-2" />}
              </div>
              <div className="pb-8 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                <span className="inline-block text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded mt-1">
                  {step.time}
                </span>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{step.description}</p>
                {step.action && (
                  <Link
                    href={step.action.href}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {step.action.label}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center p-8 bg-blue-50 rounded-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Klaar om te beginnen?</h2>
          <p className="mt-2 text-gray-600">Geen account nodig. Start direct met je gratis scan.</p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Gratis Scan
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
