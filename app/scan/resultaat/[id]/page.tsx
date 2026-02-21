"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Download,
  Lock,
  ArrowRight,
  FileText,
  MessageCircle,
} from "lucide-react";
import UpgradePopup from "@/components/UpgradePopup";

type Report = {
  id: string;
  bedrijfsnaam: string;
  branche: string;
  tier: string;
  status: string;
  generatedContent: any;
  samenvatting: string | null;
  hasPaid: boolean;
};

const prioriteitKleur: Record<string, string> = {
  hoog: "bg-red-100 text-red-700 border-red-200",
  midden: "bg-yellow-100 text-yellow-700 border-yellow-200",
  laag: "bg-green-100 text-green-700 border-green-200",
};

export default function ResultaatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/rie/${id}`);
        if (!res.ok) throw new Error("Rapport niet gevonden");
        const data = await res.json();
        setReport(data);
        if (data.status === "GENERATING" || data.status === "PENDING") {
          setTimeout(poll, 2000);
        } else {
          setLoading(false);
        }
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
      }
    };
    poll();
  }, [id]);

  const handleCheckout = async (tier: string) => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: id, tier }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      setCheckoutLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    window.open(`/api/pdf/${id}`, "_blank");
  };

  if (loading || (report && (report.status === "GENERATING" || report.status === "PENDING"))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Uw RI&E wordt gegenereerd...
          </h2>
          <p className="text-gray-600">
            Onze AI analyseert uw bedrijfssituatie. Dit duurt circa 30 seconden.
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Er ging iets mis
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/scan"
            className="text-brand-600 font-medium hover:underline"
          >
            Probeer opnieuw
          </Link>
        </div>
      </div>
    );
  }

  if (report.status === "FAILED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Generatie mislukt
          </h2>
          <p className="text-gray-600 mb-4">
            Er ging iets mis bij het genereren van uw RI&E. Probeer het opnieuw.
          </p>
          <Link
            href="/scan"
            className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition"
          >
            Opnieuw proberen
          </Link>
        </div>
      </div>
    );
  }

  const content = report.generatedContent;
  const risicos = content?.risicos || [];
  const isGratis = report.tier === "GRATIS";
  const hasPaid = report.hasPaid;
  const showBlur = isGratis || (!hasPaid && report.tier !== "GRATIS");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Upgrade popup for gratis tier after completion */}
      {isGratis && report.status === "DONE" && <UpgradePopup delayMs={2000} />}

      {/* Header */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-600" />
            <span className="text-lg font-bold">
              Snel<span className="text-brand-600">RIE</span>
            </span>
          </Link>
          {hasPaid && (
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Report header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                RI&E — {report.bedrijfsnaam}
              </h1>
              <p className="text-gray-600 mt-1">
                Branche: {report.branche} · Gegenereerd op{" "}
                {new Date().toLocaleDateString("nl-NL")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Voltooid
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        {content?.samenvatting && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-600" />
              Samenvatting
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {content.samenvatting}
            </p>
          </div>
        )}

        {/* Risks */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Risico-inventarisatie ({risicos.length} risico's gevonden)
          </h2>

          {risicos.map((risico: any, index: number) => {
            const shouldBlur = showBlur && index >= 3;

            return (
              <div
                key={risico.id || index}
                className={`bg-white rounded-xl border border-gray-200 p-6 relative ${
                  shouldBlur ? "overflow-hidden" : ""
                }`}
              >
                {shouldBlur && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Upgrade om dit risico te bekijken
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {risico.categorie}
                  </h3>
                  <div className="flex items-center gap-2">
                    {risico.risicoScore && (
                      <span className="text-xs text-gray-500">
                        Score: {risico.risicoScore}/25
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        prioriteitKleur[risico.prioriteit] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {risico.prioriteit}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {risico.beschrijving}
                </p>

                {risico.wettelijkKader && (
                  <p className="text-xs text-gray-500 mb-3">
                    📋 {risico.wettelijkKader}
                  </p>
                )}

                {risico.maatregelen && risico.maatregelen.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Maatregelen:
                    </h4>
                    <div className="space-y-2">
                      {risico.maatregelen.map((m: any, mi: number) => (
                        <div
                          key={mi}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span>{m.maatregel}</span>
                            {m.termijn && (
                              <span className="ml-2 text-xs text-gray-400">
                                ({m.termijn})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Plan van Aanpak (if available and paid) */}
        {content?.planVanAanpak &&
          content.planVanAanpak.length > 0 &&
          hasPaid && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Plan van Aanpak
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 font-medium text-gray-500">#</th>
                      <th className="pb-3 font-medium text-gray-500">
                        Maatregel
                      </th>
                      <th className="pb-3 font-medium text-gray-500">
                        Prioriteit
                      </th>
                      <th className="pb-3 font-medium text-gray-500">
                        Termijn
                      </th>
                      <th className="pb-3 font-medium text-gray-500">
                        Verantwoordelijke
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.planVanAanpak.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 text-gray-400">{item.nummer || i + 1}</td>
                        <td className="py-3 text-gray-900">{item.maatregel}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              prioriteitKleur[item.prioriteit] || ""
                            }`}
                          >
                            {item.prioriteit}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600">{item.termijn}</td>
                        <td className="py-3 text-gray-600">
                          {item.verantwoordelijke}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Upgrade CTA */}
        {showBlur && (
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-3">
              Ontgrendel uw volledige RI&E
            </h2>
            <p className="text-brand-100 mb-6 max-w-xl mx-auto">
              U heeft {risicos.length} risico's in uw bedrijf. Krijg toegang tot
              alle risico's, maatregelen en een professioneel PDF-rapport.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleCheckout("BASIS")}
                disabled={checkoutLoading}
                className="bg-white text-brand-600 px-6 py-3 rounded-lg font-semibold hover:bg-brand-50 transition disabled:opacity-50"
              >
                Basis — €99
              </button>
              <button
                onClick={() => handleCheckout("PROFESSIONAL")}
                disabled={checkoutLoading}
                className="bg-white text-brand-600 px-6 py-3 rounded-lg font-semibold hover:bg-brand-50 transition disabled:opacity-50 ring-2 ring-white/50"
              >
                Professional — €299 ⭐
              </button>
              <button
                onClick={() => handleCheckout("ENTERPRISE")}
                disabled={checkoutLoading}
                className="bg-white/10 text-white border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition disabled:opacity-50"
              >
                Enterprise — €499
              </button>
            </div>
            {checkoutLoading && (
              <p className="mt-4 text-brand-200 text-sm flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Doorsturen naar betaalpagina...
              </p>
            )}
          </div>
        )}

        {/* Paid + download */}
        {hasPaid && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Betaling ontvangen!
            </h2>
            <p className="text-gray-600 mb-6">
              Uw volledige RI&E is beschikbaar. Download het professionele
              PDF-rapport hieronder.
            </p>
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-700 transition"
            >
              <Download className="h-5 w-5" />
              Download PDF Rapport
            </button>
            {report.tier === "ENTERPRISE" && (
              <Link
                href={`/chat/${id}`}
                className="inline-flex items-center gap-2 bg-white text-brand-600 border-2 border-brand-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-50 transition mt-4"
              >
                <MessageCircle className="h-5 w-5" />
                💬 AI Expert Chat
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
