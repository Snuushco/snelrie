import type { Metadata } from "next";
import Link from "next/link";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import {
  Shield,
  CheckCircle2,
  FileText,
  Mail,
  Download,
  AlertTriangle,
  Scale,
  Building2,
  Star,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import { ChecklistForm } from "./ChecklistForm";

export const metadata: Metadata = {
  title: "Gratis RI&E Checklist — 20 Controlepunten | SnelRIE",
  description:
    "Download de gratis RI&E Checklist met 20 controlepunten. Ontdek direct of uw bedrijf voldoet aan de Arbowet. Ontvang de PDF per email.",
  openGraph: {
    title: "Gratis RI&E Checklist — 20 Controlepunten | SnelRIE",
    description:
      "Download de gratis RI&E Checklist. 20 essentiële controlepunten voor elke werkgever.",
    url: "https://snelrie.nl/checklist",
    siteName: "SnelRIE",
    locale: "nl_NL",
    type: "website",
    images: [
      {
        url: "https://snelrie.nl/og",
        width: 1200,
        height: 630,
        alt: "Gratis RI&E Checklist — SnelRIE",
      },
    ],
  },
};

const checklistPreview = [
  "RI&E is opgesteld en actueel",
  "Plan van Aanpak is bijgevoegd",
  "Preventiemedewerker is aangesteld",
  "BHV-organisatie is ingericht",
  "Werkplekken zijn geïnventariseerd",
  "Psychosociale belasting is beoordeeld",
  "Fysieke belasting is in kaart gebracht",
  "Gevaarlijke stoffen zijn geregistreerd",
];

const benefits = [
  {
    icon: ClipboardCheck,
    title: "20 essentiële controlepunten",
    desc: "Van basisverplichtingen tot vaak vergeten onderdelen — alles in één overzicht.",
  },
  {
    icon: Scale,
    title: "Gebaseerd op de Arbowet",
    desc: "Elk punt is gekoppeld aan wettelijke verplichtingen uit de Arbowet en het Arbobesluit.",
  },
  {
    icon: FileText,
    title: "Direct bruikbaar als werkdocument",
    desc: "Print de checklist uit en loop hem door met uw preventiemedewerker of HR-afdeling.",
  },
];

export default function ChecklistPage() {
  return (
    <main>
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
            <Link href="/#hoe-werkt-het" className="text-sm text-gray-600 hover:text-gray-900">
              Hoe werkt het
            </Link>
            <Link href="/#prijzen" className="text-sm text-gray-600 hover:text-gray-900">
              Prijzen
            </Link>
            <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
              Blog
            </Link>
          </div>
          <Link
            href="/scan"
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
          >
            Start RI&E Scan
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Download className="h-4 w-4" />
            Gratis download — geen account nodig
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Zijn jullie RI&E-compliant?{" "}
            <span className="text-brand-600">20-Punten Checklist</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Ontdek in 5 minuten of uw bedrijf voldoet aan de belangrijkste
            RI&E-verplichtingen. Download de gratis checklist en loop hem door
            met uw team.
          </p>
        </div>
      </section>

      {/* Main Content: 2 columns */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
          {/* Left: What you get */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Wat zit er in de checklist?
            </h2>

            {/* Benefits */}
            <div className="space-y-6 mb-10">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                    <b.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{b.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview of checklist items */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-600" />
                Preview: eerste 8 van 20 punten
              </h3>
              <ul className="space-y-3">
                {checklistPreview.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
                <li className="flex items-start gap-3 opacity-50">
                  <div className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mt-0.5" />
                  <span className="text-gray-500 text-sm italic">
                    + 12 meer controlepunten in de volledige PDF...
                  </span>
                </li>
              </ul>
            </div>

            {/* Trust signals */}
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                AVG-compliant
              </div>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-brand-600" />
                Arbowet-conform
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                Geen spam, alleen waarde
              </div>
            </div>
          </div>

          {/* Right: Email capture form */}
          <div className="lg:sticky lg:top-24">
            <ChecklistForm />
          </div>
        </div>
      </section>

      {/* Social proof / urgency */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <AlertTriangle className="h-3.5 w-3.5" />
              72% van het MKB heeft geen geldige RI&E
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Wilt u meer dan alleen een checklist?
            </h2>
            <p className="text-gray-600 mb-6">
              Met SnelRIE genereert u in minuten een volledige, AI-gestuurde
              RI&E op maat voor uw bedrijf. Inclusief Plan van Aanpak.
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-700 transition"
            >
              Start Gratis RI&E Scan
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <StickyMobileCTA href="/scan" label="Start Gratis Scan" />

      {/* Footer */}
      <footer className="py-12 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
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
            <p>© {new Date().getFullYear()} SnelRIE — onderdeel van Praesidion Holding B.V.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
