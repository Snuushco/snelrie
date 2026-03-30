import Link from "next/link";
import { ArrowRight, Key, FileText, Download, PenTool, Shield } from "lucide-react";

export const metadata = {
  title: "API Documentatie — SnelRIE Partner API",
  description: "Integreer RI&E scans in uw eigen systeem met de SnelRIE Partner API.",
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-bold">
              Snel<span className="text-blue-600">RIE</span>
              <span className="text-sm font-normal text-gray-400 ml-2">Partner API</span>
            </Link>
          </div>
          <Link
            href="/dashboard/instellingen/api"
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            <Key className="w-4 h-4" />
            API-sleutels beheren
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Intro */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">API Documentatie</h1>
          <p className="text-lg text-gray-600">
            Integreer RI&E scans in uw eigen systeem. Ideaal voor arbodiensten, accountants
            en HR-softwareleveranciers die hun klanten automatisch een RI&E willen aanbieden.
          </p>
        </div>

        {/* Authentication */}
        <Section title="Authenticatie" icon={<Shield className="w-5 h-5 text-blue-600" />}>
          <p className="text-gray-600 mb-4">
            Alle API-verzoeken vereisen een API-sleutel via de <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">Authorization</code> header.
          </p>
          <CodeBlock>{`Authorization: Bearer sk_live_uw_api_sleutel_hier`}</CodeBlock>
          <p className="text-sm text-gray-500 mt-3">
            Genereer een API-sleutel via{" "}
            <Link href="/dashboard/instellingen/api" className="text-blue-600 hover:text-blue-700 font-medium">
              Dashboard → Instellingen → API
            </Link>
            . Rate limit: 100 verzoeken per uur per sleutel.
          </p>
        </Section>

        {/* Base URL */}
        <Section title="Base URL">
          <CodeBlock>{`https://snelrie.nl/api/v1`}</CodeBlock>
        </Section>

        {/* POST /scan */}
        <Section title="RI&E Scan Aanmaken" icon={<FileText className="w-5 h-5 text-green-600" />}>
          <EndpointBadge method="POST" path="/api/v1/scan" />
          <p className="text-gray-600 mb-4 mt-3">
            Maak een nieuwe RI&E scan aan voor een bedrijf. De scan wordt automatisch verwerkt.
          </p>

          <h4 className="font-semibold text-gray-900 mb-2">Request body</h4>
          <CodeBlock>{`{
  "bedrijfsnaam": "Bakkerij Van den Berg",
  "branche": "Horeca en bakkerij",
  "aantalMedewerkers": 12,
  "aantalLocaties": 2,
  "bhvAanwezig": true,
  "aantalBhvers": 2,
  "preventiemedewerker": true,
  "eerderRie": false,
  "beeldschermwerk": true,
  "fysiekWerk": true,
  "buitenwerk": false,
  "nachtwerk": false,
  "alleenWerken": false,
  "gevaarlijkeStoffen": false
}`}</CodeBlock>

          <ParamTable
            params={[
              { name: "bedrijfsnaam", type: "string", required: true, desc: "Naam van het bedrijf" },
              { name: "branche", type: "string", required: true, desc: "Branche/sector" },
              { name: "aantalMedewerkers", type: "number", required: true, desc: "Aantal medewerkers" },
              { name: "aantalLocaties", type: "number", required: false, desc: "Aantal locaties (standaard: 1)" },
              { name: "bhvAanwezig", type: "boolean", required: false, desc: "Is BHV aanwezig?" },
              { name: "preventiemedewerker", type: "boolean", required: false, desc: "Is er een preventiemedewerker?" },
              { name: "beeldschermwerk", type: "boolean", required: false, desc: "Beeldschermwerk?" },
              { name: "fysiekWerk", type: "boolean", required: false, desc: "Fysiek/zwaar werk?" },
            ]}
          />

          <h4 className="font-semibold text-gray-900 mb-2 mt-6">Response</h4>
          <CodeBlock>{`{
  "success": true,
  "reportId": "clxyz123abc",
  "status": "PENDING",
  "message": "RI&E scan is gestart..."
}`}</CodeBlock>
        </Section>

        {/* GET /reports/:id */}
        <Section title="Rapport Ophalen" icon={<FileText className="w-5 h-5 text-blue-600" />}>
          <EndpointBadge method="GET" path="/api/v1/reports/{id}" />
          <p className="text-gray-600 mb-4 mt-3">
            Haal de volledige rapportgegevens op, inclusief risico{"'"}s, plan van aanpak en ondertekeningen.
          </p>

          <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
          <CodeBlock>{`{
  "id": "clxyz123abc",
  "bedrijfsnaam": "Bakkerij Van den Berg",
  "branche": "Horeca en bakkerij",
  "status": "COMPLETED",
  "samenvatting": "De RI&E voor Bakkerij Van den Berg...",
  "risicos": [
    {
      "naam": "Hitteblootstelling bij ovens",
      "score": 12,
      "prioriteit": "hoog",
      "maatregelen": ["Hittebestendige handschoenen", ...]
    }
  ],
  "planVanAanpak": [...],
  "ondertekeningen": [
    { "rol": "werkgever", "naam": "J. van den Berg", "ondertekendOp": "2025-..." }
  ],
  "aangemaakt": "2025-..."
}`}</CodeBlock>
        </Section>

        {/* GET /reports/:id/pdf */}
        <Section title="PDF Downloaden" icon={<Download className="w-5 h-5 text-purple-600" />}>
          <EndpointBadge method="GET" path="/api/v1/reports/{id}/pdf" />
          <p className="text-gray-600 mb-4 mt-3">
            Download het RI&E rapport als PDF-bestand. Alleen beschikbaar voor afgeronde rapporten.
          </p>
          <p className="text-sm text-gray-500">
            Response: <code className="bg-gray-100 px-1.5 py-0.5 rounded">application/pdf</code>
          </p>
        </Section>

        {/* POST /reports/:id/sign */}
        <Section title="Rapport Ondertekenen" icon={<PenTool className="w-5 h-5 text-indigo-600" />}>
          <EndpointBadge method="POST" path="/api/v1/reports/{id}/sign" />
          <p className="text-gray-600 mb-4 mt-3">
            Onderteken een rapport digitaal. Elk rapport kan door drie rollen ondertekend worden.
          </p>

          <h4 className="font-semibold text-gray-900 mb-2">Request body</h4>
          <CodeBlock>{`{
  "rol": "werkgever",
  "naam": "Jan van den Berg",
  "functie": "Directeur"
}`}</CodeBlock>

          <ParamTable
            params={[
              { name: "rol", type: "string", required: true, desc: "werkgever | preventiemedewerker | arbodeskundige" },
              { name: "naam", type: "string", required: true, desc: "Volledige naam van de ondertekenaar" },
              { name: "functie", type: "string", required: false, desc: "Functietitel" },
            ]}
          />
        </Section>

        {/* Example code */}
        <Section title="Voorbeeldcode">
          <h4 className="font-semibold text-gray-900 mb-2">JavaScript / Node.js</h4>
          <CodeBlock>{`const API_KEY = "sk_live_uw_sleutel";
const BASE = "https://snelrie.nl/api/v1";

// Scan aanmaken
const scanRes = await fetch(\`\${BASE}/scan\`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${API_KEY}\`,
  },
  body: JSON.stringify({
    bedrijfsnaam: "Mijn Bedrijf B.V.",
    branche: "Kantoor en administratie",
    aantalMedewerkers: 25,
  }),
});

const { reportId } = await scanRes.json();

// Rapport ophalen (poll tot status COMPLETED)
const reportRes = await fetch(\`\${BASE}/reports/\${reportId}\`, {
  headers: { "Authorization": \`Bearer \${API_KEY}\` },
});

const report = await reportRes.json();
console.log(report.risicos);`}</CodeBlock>

          <h4 className="font-semibold text-gray-900 mb-2 mt-6">cURL</h4>
          <CodeBlock>{`# Scan aanmaken
curl -X POST https://snelrie.nl/api/v1/scan \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk_live_uw_sleutel" \\
  -d '{"bedrijfsnaam":"Test B.V.","branche":"ICT","aantalMedewerkers":10}'

# Rapport ophalen
curl https://snelrie.nl/api/v1/reports/REPORT_ID \\
  -H "Authorization: Bearer sk_live_uw_sleutel"

# PDF downloaden
curl -o rapport.pdf https://snelrie.nl/api/v1/reports/REPORT_ID/pdf \\
  -H "Authorization: Bearer sk_live_uw_sleutel"`}</CodeBlock>
        </Section>

        {/* Error codes */}
        <Section title="Foutcodes">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Code</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Betekenis</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-mono">400</td>
                  <td className="py-2">Ongeldig verzoek — controleer de parameters</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-mono">401</td>
                  <td className="py-2">Niet geautoriseerd — ongeldige of ontbrekende API-sleutel</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-mono">404</td>
                  <td className="py-2">Niet gevonden — rapport bestaat niet of behoort niet tot uw account</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-mono">409</td>
                  <td className="py-2">Conflict — bijv. rapport al ondertekend voor deze rol</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-mono">429</td>
                  <td className="py-2">Rate limit bereikt — max 100 verzoeken/uur</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono">500</td>
                  <td className="py-2">Serverfout — neem contact op bij aanhoudende problemen</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Contact */}
        <div className="mt-12 bg-blue-50 rounded-xl border border-blue-100 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Vragen over de API?</h3>
          <p className="text-gray-600 mb-4">
            Neem contact op via{" "}
            <a href="mailto:info@snelrie.nl" className="text-blue-600 hover:text-blue-700 font-medium">
              info@snelrie.nl
            </a>{" "}
            voor technische ondersteuning of partnership mogelijkheden.
          </p>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function EndpointBadge({ method, path }: { method: string; path: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-100 text-green-700",
    POST: "bg-blue-100 text-blue-700",
    PUT: "bg-yellow-100 text-yellow-700",
    DELETE: "bg-red-100 text-red-700",
  };
  return (
    <div className="inline-flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors[method] || ""}`}>
        {method}
      </span>
      <code className="text-sm font-mono text-gray-800">{path}</code>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono mb-4">
      <code>{children}</code>
    </pre>
  );
}

function ParamTable({
  params,
}: {
  params: Array<{ name: string; type: string; required: boolean; desc: string }>;
}) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 font-medium text-gray-500">Parameter</th>
            <th className="text-left py-2 pr-4 font-medium text-gray-500">Type</th>
            <th className="text-left py-2 pr-4 font-medium text-gray-500">Verplicht</th>
            <th className="text-left py-2 font-medium text-gray-500">Beschrijving</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          {params.map((p) => (
            <tr key={p.name} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-mono text-gray-900">{p.name}</td>
              <td className="py-2 pr-4">{p.type}</td>
              <td className="py-2 pr-4">
                {p.required ? (
                  <span className="text-red-600 font-medium">Ja</span>
                ) : (
                  <span className="text-gray-400">Nee</span>
                )}
              </td>
              <td className="py-2">{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
