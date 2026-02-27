import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacybeleid — SnelRIE",
  description: "Privacybeleid en AVG-informatie van SnelRIE.",
};

export default function PrivacyPage() {
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
          Privacybeleid
        </h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Verwerkingsverantwoordelijke
            </h2>
            <p className="text-gray-600 leading-relaxed">
              SnelRIE is een dienst van Praesidion Holding B.V., gevestigd te
              Sittard, ingeschreven bij de Kamer van Koophandel onder nummer
              97640794. Praesidion Holding B.V. is de verwerkingsverantwoordelijke
              in de zin van de Algemene Verordening Gegevensbescherming (AVG).
            </p>
            <ul className="list-none text-gray-600 space-y-1 mt-3">
              <li><strong>KvK:</strong> 97640794</li>
              <li><strong>BTW:</strong> NL868152237B01</li>
              <li><strong>E-mail:</strong>{" "}
                <a href="mailto:info@snelrie.nl" className="text-brand-600 hover:underline">
                  info@snelrie.nl
                </a>
              </li>
              <li><strong>Telefoon:</strong> 046 240 2401</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Welke persoonsgegevens verwerken wij?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Bij het gebruik van SnelRIE verwerken wij de volgende gegevens:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Naam en e-mailadres</li>
              <li>Bedrijfsnaam en branche</li>
              <li>Aantal medewerkers en aantal locaties</li>
              <li>Informatie over werkzaamheden (type werk, gevaarlijke stoffen, beeldschermwerk, fysiek werk, etc.)</li>
              <li>BHV-informatie (aanwezigheid BHV&apos;ers, aantal, preventiemedewerker)</li>
              <li>Eerdere RI&E-gegevens</li>
              <li>Betalingsgegevens (verwerkt via Stripe)</li>
              <li>IP-adres en technische browsergegevens</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Doel van de verwerking
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Wij verwerken uw persoonsgegevens voor de volgende doeleinden:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>RI&E-generatie:</strong> het opstellen van een Risico-Inventarisatie & Evaluatie op basis van uw bedrijfsgegevens met behulp van AI-technologie</li>
              <li><strong>Facturatie:</strong> het verwerken van betalingen en het versturen van facturen</li>
              <li><strong>Communicatie:</strong> het toesturen van uw rapport en eventuele service-gerelateerde berichten</li>
              <li><strong>Verbetering van de dienst:</strong> het analyseren van gebruikspatronen om onze dienstverlening te verbeteren</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Rechtsgrond
            </h2>
            <p className="text-gray-600 leading-relaxed">
              De verwerking van uw persoonsgegevens is gebaseerd op:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-3">
              <li><strong>Uitvoering van de overeenkomst</strong> (art. 6 lid 1 sub b AVG): uw gegevens zijn noodzakelijk om de RI&E te genereren en de dienst te leveren waarvoor u betaalt.</li>
              <li><strong>Gerechtvaardigd belang</strong> (art. 6 lid 1 sub f AVG): voor het verbeteren van onze dienstverlening en het voorkomen van misbruik.</li>
              <li><strong>Wettelijke verplichting</strong> (art. 6 lid 1 sub c AVG): voor het bewaren van financiële administratie conform fiscale wetgeving.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Verwerkers en doorgifte aan derden
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Voor het leveren van onze dienst maken wij gebruik van de volgende verwerkers:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>
                <strong>OpenRouter.ai / Anthropic (Claude AI):</strong> Uw bedrijfsgegevens (bedrijfsnaam, branche, aantal medewerkers, werkplekinformatie) worden verwerkt door OpenRouter.ai, dat gebruik maakt van Anthropic Claude, voor het AI-gestuurd genereren van uw RI&E. OpenRouter.ai is gevestigd in de Verenigde Staten.
              </li>
              <li>
                <strong>Stripe:</strong> Voor de verwerking van betalingen. Stripe verwerkt uw betalingsgegevens conform hun eigen privacybeleid.
              </li>
              <li>
                <strong>Vercel:</strong> Voor het hosten van de website en applicatie.
              </li>
            </ul>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-amber-800 mb-2">
                Doorgifte buiten de EU
              </h3>
              <p className="text-amber-700 text-sm">
                Door het gebruik van OpenRouter.ai (Anthropic Claude) worden uw bedrijfsgegevens
                doorgegeven naar de Verenigde Staten. Deze doorgifte vindt plaats op basis van
                Standard Contractual Clauses (SCCs) conform art. 46 lid 2 sub c AVG, waarmee een
                passend beschermingsniveau wordt gewaarborgd. Wij versturen uitsluitend de
                bedrijfs- en werkplekinformatie die noodzakelijk is voor het genereren van de RI&E;
                betalingsgegevens worden niet naar de AI-dienst verzonden.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Bewaartermijnen
            </h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>RI&E-rapporten:</strong> 2 jaar na generatie, tenzij u eerder om verwijdering verzoekt</li>
              <li><strong>Betalingsgegevens:</strong> 7 jaar, conform de fiscale bewaarplicht</li>
              <li><strong>Accountgegevens (naam, e-mail):</strong> tot u verzoekt om verwijdering</li>
              <li><strong>Technische loggegevens:</strong> maximaal 90 dagen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Uw rechten
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Op grond van de AVG heeft u de volgende rechten:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Recht op inzage:</strong> u kunt opvragen welke persoonsgegevens wij van u verwerken</li>
              <li><strong>Recht op correctie:</strong> u kunt onjuiste gegevens laten aanpassen</li>
              <li><strong>Recht op verwijdering:</strong> u kunt verzoeken om verwijdering van uw gegevens</li>
              <li><strong>Recht op beperking:</strong> u kunt vragen om beperking van de verwerking</li>
              <li><strong>Recht op dataportabiliteit:</strong> u kunt uw gegevens in een gestructureerd formaat ontvangen</li>
              <li><strong>Recht van bezwaar:</strong> u kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              U kunt uw verzoek indienen via{" "}
              <a href="mailto:info@snelrie.nl" className="text-brand-600 hover:underline">
                info@snelrie.nl
              </a>
              . Wij reageren binnen 30 dagen op uw verzoek.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Beveiliging
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Wij nemen passende technische en organisatorische maatregelen om uw
              persoonsgegevens te beschermen tegen ongeoorloofde toegang, verlies of
              vernietiging. Alle communicatie verloopt via versleutelde verbindingen (HTTPS/TLS).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              9. Klacht bij de toezichthouder
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Bent u het niet eens met de manier waarop wij uw persoonsgegevens verwerken?
              Dan heeft u het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens
              (AP). U kunt contact opnemen via{" "}
              <a
                href="https://autoriteitpersoonsgegevens.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline"
              >
                autoriteitpersoonsgegevens.nl
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              10. Wijzigingen
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Wij kunnen dit privacybeleid van tijd tot tijd aanpassen. De meest recente
              versie is altijd beschikbaar op deze pagina. Bij substantiële wijzigingen
              informeren wij u per e-mail.
            </p>
          </section>

          <p className="text-sm text-gray-400 pt-4 border-t border-gray-200">
            Laatst bijgewerkt: 27 februari 2026
          </p>
        </div>
      </div>
    </div>
  );
}
