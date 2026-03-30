"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Shield,
  Loader2,
  Building2,
  User,
  Calendar,
  FileCheck,
} from "lucide-react";

type VerificationData = {
  valid: boolean;
  error?: string;
  document?: {
    bedrijfsnaam: string;
    branche: string;
    aantalMedewerkers: number;
    tier: string;
    verificationCode: string;
    aangemaakt: string;
    laatstGewijzigd: string;
  };
  ondertekeningen?: Array<{
    rol: string;
    naam: string;
    functie: string;
    datum: string;
  }>;
};

const ROLE_LABELS: Record<string, string> = {
  werkgever: "Werkgever",
  preventiemedewerker: "Preventiemedewerker",
  arbodeskundige: "Arbodeskundige",
};

export default function VerificatiePage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/verificatie/${code}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ valid: false, error: "Verificatie mislukt" }))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Document verifiëren...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <a
            href="https://snelrie.nl"
            className="inline-flex items-center gap-1 text-xl font-bold"
          >
            <span className="text-blue-600">Snel</span>
            <span className="text-blue-900">RIE</span>
          </a>
        </div>

        {data?.valid ? (
          /* ── VALID ── */
          <div className="bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden">
            {/* Green header */}
            <div className="bg-green-50 border-b border-green-200 p-6 text-center">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
              <h1 className="text-xl font-bold text-green-900 mb-1">
                Document geverifieerd
              </h1>
              <p className="text-green-700 text-sm">
                Dit document is digitaal ondertekend via SnelRIE
              </p>
            </div>

            {/* Verification code */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-mono text-sm font-semibold text-gray-700 tracking-wider">
                  {data.document!.verificationCode}
                </span>
              </div>
            </div>

            {/* Document info */}
            <div className="p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Documentgegevens
              </h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {data.document!.bedrijfsnaam}
                    </p>
                    <p className="text-xs text-gray-500">
                      {data.document!.branche} · {data.document!.aantalMedewerkers} medewerkers
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileCheck className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Risico-Inventarisatie & Evaluatie (RI&E)
                    </p>
                    <p className="text-xs text-gray-500">
                      Tier: {data.document!.tier}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      Aangemaakt:{" "}
                      {new Date(data.document!.aangemaakt).toLocaleDateString(
                        "nl-NL",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            {data.ondertekeningen && data.ondertekeningen.length > 0 && (
              <div className="px-6 pb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Ondertekeningen
                </h2>
                <div className="space-y-3">
                  {data.ondertekeningen.map((sig, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-lg p-3"
                    >
                      <User className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {sig.naam}
                        </p>
                        <p className="text-xs text-gray-600">
                          {ROLE_LABELS[sig.rol] || sig.rol} · {sig.functie}
                        </p>
                        <p className="text-xs text-gray-500">
                          Ondertekend: {sig.datum}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Verificatie uitgevoerd op{" "}
                {new Date().toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ) : (
          /* ── INVALID ── */
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
            <div className="bg-red-50 border-b border-red-200 p-6 text-center">
              <XCircle className="w-14 h-14 text-red-500 mx-auto mb-3" />
              <h1 className="text-xl font-bold text-red-900 mb-1">
                Verificatie mislukt
              </h1>
              <p className="text-red-700 text-sm">
                {data?.error || "Dit document kon niet worden geverifieerd"}
              </p>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                De opgegeven verificatiecode is ongeldig of het document bestaat
                niet in ons systeem.
              </p>
              <p className="text-xs text-gray-400">
                Controleer of u de juiste code heeft ingevoerd. De
                verificatiecode vindt u op de ondertekeningspagina van het
                rapport.
              </p>
            </div>
          </div>
        )}

        {/* Powered by */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Verificatie door{" "}
            <a href="https://snelrie.nl" className="text-blue-500 hover:underline">
              SnelRIE
            </a>{" "}
            — AI-gestuurde RI&E
          </p>
        </div>
      </div>
    </div>
  );
}
