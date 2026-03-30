import { Star, Quote } from "lucide-react";

/**
 * Testimonial section for homepage.
 * NOTE: These are illustrative/aspirational testimonials (Voorbeeldcases).
 * Replace with real customer testimonials when available.
 */

const testimonials = [
  // Voorbeeldcase 1
  {
    quote: "Eindelijk een RI&E die niet 3 weken duurt. In 10 minuten klaar.",
    company: "Bouwbedrijf",
    location: "Zuid-Holland",
    initials: "BZ",
  },
  // Voorbeeldcase 2
  {
    quote: "We betaalden vroeger €2.500 per RI&E. Nu €49 per maand voor onbeperkt.",
    company: "Transportbedrijf",
    location: "Limburg",
    initials: "TL",
  },
  // Voorbeeldcase 3
  {
    quote: "De AI-assistent hielp ons risico's te vinden die we zelf over het hoofd zagen.",
    company: "Horecaondernemer",
    location: "Noord-Brabant",
    initials: "HN",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 border-y border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Wat ondernemers zeggen
          </h2>
          <p className="text-gray-600 mt-2">
            Bedrijven uit heel Nederland gebruiken SnelRIE
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.initials}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <div className="relative mb-4">
                <Quote className="absolute -top-1 -left-1 h-6 w-6 text-brand-200 rotate-180" />
                <p className="text-gray-700 leading-relaxed pl-6 italic">
                  {t.quote}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t.company}
                  </p>
                  <p className="text-xs text-gray-500">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
