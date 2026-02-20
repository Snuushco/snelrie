import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Gebruiksvoorwaarden — SnelRIE",
  description: "Gebruiksvoorwaarden en fair use policy van SnelRIE.",
};

export default function VoorwaardenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-600" />
            <span className="text-lg font-bold">
              Snel<span className="text-brand-600">RIE</span>
            </span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Gebruiksvoorwaarden
        </h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Algemeen
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Deze gebruiksvoorwaarden zijn van toepassing op het gebruik van
              SnelRIE (snelrie.nl), een AI-gestuurde dienst voor het genereren
              van Risico-Inventarisaties & Evaluaties (RI&E). Door gebruik te
              maken van onze dienst gaat u akkoord met deze voorwaarden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Dienstverlening
            </h2>
            <p className="text-gray-600 leading-relaxed">
              SnelRIE biedt een AI-ondersteunde tool waarmee werkgevers een RI&E
              kunnen opstellen. Het gegenereerde rapport is een hulpmiddel en
              vervangt niet het advies van een gecertificeerde arbodeskundige.
              Voor bedrijven met meer dan 25 medewerkers dient de RI&E te worden
              getoetst door een gecertificeerde arbodienst (Arbowet art. 14).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Fair Use Policy
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Om de kwaliteit en beschikbaarheid van onze dienst te waarborgen,
              hanteren wij een fair use policy. Dit houdt in:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>
                Maximaal 3 gratis scans per uur per gebruiker/IP-adres.
              </li>
              <li>
                De AI Expert Chat (Enterprise) is bedoeld voor zakelijke vragen
                over uw eigen RI&E, met een maximum van 30 berichten per uur.
              </li>
              <li>
                Geautomatiseerd gebruik (bots, scrapers, API-misbruik) is niet
                toegestaan.
              </li>
              <li>
                Het is niet toegestaan om opzettelijk onjuiste, beledigende of
                schadelijke informatie in te voeren.
              </li>
              <li>
                Het doorverkopen of herdistribueren van gegenereerde rapporten
                zonder toestemming is niet toegestaan.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Sancties bij misbruik
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Bij overtreding van deze voorwaarden of de fair use policy hanteren
              wij het volgende sanctiebeleid:
            </p>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-1">
                  Eerste overtreding: Waarschuwing
                </h3>
                <p className="text-yellow-700 text-sm">
                  U ontvangt een waarschuwing per e-mail met uitleg over de
                  overtreding en het verzoek om het gedrag te stoppen.
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-800 mb-1">
                  Herhaald misbruik: Tijdelijke blokkade (24 uur)
                </h3>
                <p className="text-orange-700 text-sm">
                  Bij herhaalde overtredingen wordt uw toegang tijdelijk
                  geblokkeerd voor een periode van 24 uur.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-1">
                  Ernstig misbruik: Permanente blokkade
                </h3>
                <p className="text-red-700 text-sm">
                  Bij ernstig misbruik (waaronder maar niet beperkt tot DDoS,
                  systematische exploitatie, of opzettelijke schade) wordt uw
                  account permanent geblokkeerd. Er vindt geen restitutie van
                  betaalde bedragen plaats.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Betalingen & Restitutie
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Alle betalingen worden verwerkt via Stripe. Na succesvolle betaling
              ontvangt u direct toegang tot het volledige rapport. Restitutie is
              mogelijk binnen 14 dagen na aankoop, mits het rapport niet is
              gedownload. Bij misbruik vervalt het recht op restitutie.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Privacy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Wij verwerken uw gegevens uitsluitend voor het genereren van uw
              RI&E en de bijbehorende dienstverlening. Uw bedrijfsgegevens worden
              niet gedeeld met derden. Zie ons privacybeleid voor meer
              informatie.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Aansprakelijkheid
            </h2>
            <p className="text-gray-600 leading-relaxed">
              SnelRIE is een hulpmiddel. Wij zijn niet aansprakelijk voor de
              volledigheid of juistheid van het gegenereerde rapport. De
              werkgever blijft te allen tijde verantwoordelijk voor de naleving
              van de Arbowet en het opstellen van een adequate RI&E.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Contact
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Voor vragen over deze voorwaarden kunt u contact opnemen via{" "}
              <a
                href="mailto:info@snelrie.nl"
                className="text-brand-600 hover:underline"
              >
                info@snelrie.nl
              </a>
              .
            </p>
          </section>

          <p className="text-sm text-gray-400 pt-4 border-t border-gray-200">
            Laatst bijgewerkt: 20 februari 2026
          </p>
        </div>
      </div>
    </div>
  );
}
