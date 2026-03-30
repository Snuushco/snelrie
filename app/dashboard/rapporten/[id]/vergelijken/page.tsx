"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Minus,
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type Report = {
  id: string;
  bedrijfsnaam: string;
  createdAt: string;
};

type ComparisonData = {
  reportA: {
    id: string;
    bedrijfsnaam: string;
    datum: string;
    aantalRisicos: number;
    gemiddeldeScore: number;
    pvaItems: number;
    pvaAfgerond: number;
  };
  reportB: {
    id: string;
    bedrijfsnaam: string;
    datum: string;
    aantalRisicos: number;
    gemiddeldeScore: number;
    pvaItems: number;
    pvaAfgerond: number;
  };
  vergelijking: {
    nieuweRisicos: Array<{ naam: string; score: number | null; prioriteit: string | null }>;
    verwijderdeRisicos: Array<{ naam: string; score: number | null; prioriteit: string | null }>;
    scoreWijzigingen: Array<{ naam: string; scoreA: number; scoreB: number; verschil: number }>;
    samenvatting: {
      nieuweRisicosAantal: number;
      verwijderdeRisicosAantal: number;
      gemiddeldeScoreA: number;
      gemiddeldeScoreB: number;
      scoreTrend: string;
    };
  };
};

export default function VergelijkenPage() {
  const { id } = useParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const res = await fetch("/api/rie/compare?list=true");
      // Fallback: fetch from dashboard
      const dashRes = await fetch("/api/compliance/status");
      const dashData = await dashRes.json();
      
      // Get all user reports
      const reportsRes = await fetch(`/api/rie/${id}`);
      const currentReport = await reportsRes.json();
      
      // We need a separate endpoint or use what we have
      // For now, we'll let the user enter the other report ID
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  async function doCompare(reportBId: string) {
    setComparing(true);
    try {
      const res = await fetch(`/api/rie/compare?reportA=${id}&reportB=${reportBId}`);
      const data = await res.json();
      if (res.ok) {
        setComparison(data);
      }
    } catch (e) {
      console.error("Vergelijking mislukt:", e);
    } finally {
      setComparing(false);
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/scan/resultaat/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar rapport
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <GitCompare className="w-8 h-8 text-blue-600" />
          RI&E Vergelijken
        </h1>
        <p className="text-gray-500 mt-1">
          Vergelijk dit rapport met een eerdere versie om voortgang te zien.
        </p>
      </div>

      {/* Report selector */}
      {!comparison && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Selecteer rapport om mee te vergelijken
          </h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rapport ID van het andere rapport
              </label>
              <input
                type="text"
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                placeholder="Plak hier het ID van het andere rapport"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Ga naar Dashboard → Rapporten om de ID te vinden
              </p>
            </div>
            <button
              onClick={() => doCompare(selectedReport)}
              disabled={!selectedReport || comparing}
              className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {comparing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <GitCompare className="w-4 h-4" />
              )}
              Vergelijken
            </button>
          </div>
        </div>
      )}

      {/* Comparison results */}
      {comparison && (
        <>
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Samenvatting</h2>
            <p className="text-gray-700">
              Ten opzichte van uw vorige RI&E ({formatDate(comparison.reportA.datum)}):{" "}
              <strong className="text-green-700">
                {comparison.vergelijking.samenvatting.verwijderdeRisicosAantal} opgeloste risico{"'"}s
              </strong>
              ,{" "}
              <strong className="text-red-700">
                {comparison.vergelijking.samenvatting.nieuweRisicosAantal} nieuwe risico{"'"}s
              </strong>
              , gemiddelde score{" "}
              <strong
                className={
                  comparison.vergelijking.samenvatting.scoreTrend === "gedaald"
                    ? "text-green-700"
                    : comparison.vergelijking.samenvatting.scoreTrend === "gestegen"
                      ? "text-red-700"
                      : "text-gray-700"
                }
              >
                {comparison.vergelijking.samenvatting.scoreTrend} van{" "}
                {comparison.vergelijking.samenvatting.gemiddeldeScoreA} naar{" "}
                {comparison.vergelijking.samenvatting.gemiddeldeScoreB}
              </strong>
              .
            </p>
          </div>

          {/* Side by side stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ReportCard
              label="Vorig rapport"
              report={comparison.reportA}
              color="gray"
            />
            <ReportCard
              label="Huidig rapport"
              report={comparison.reportB}
              color="blue"
            />
          </div>

          {/* New risks */}
          {comparison.vergelijking.nieuweRisicos.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Nieuwe risico{"'"}s ({comparison.vergelijking.nieuweRisicos.length})
              </h3>
              <div className="space-y-2">
                {comparison.vergelijking.nieuweRisicos.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <span className="text-sm font-medium text-red-900">{r.naam}</span>
                    <div className="flex items-center gap-2">
                      {r.prioriteit && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          {r.prioriteit}
                        </span>
                      )}
                      {r.score && (
                        <span className="text-xs font-mono text-red-600">
                          Score: {r.score}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Removed risks */}
          {comparison.vergelijking.verwijderdeRisicos.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Opgeloste risico{"'"}s ({comparison.vergelijking.verwijderdeRisicos.length})
              </h3>
              <div className="space-y-2">
                {comparison.vergelijking.verwijderdeRisicos.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                  >
                    <span className="text-sm font-medium text-green-900 line-through">
                      {r.naam}
                    </span>
                    {r.score && (
                      <span className="text-xs font-mono text-green-600">
                        Score: {r.score}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score changes */}
          {comparison.vergelijking.scoreWijzigingen.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-blue-500" />
                Scorewijzigingen
              </h3>
              <div className="space-y-2">
                {comparison.vergelijking.scoreWijzigingen.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900">{s.naam}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-500">{s.scoreA}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-xs font-mono text-gray-900">{s.scoreB}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          s.verschil < 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {s.verschil < 0 ? (
                          <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUp className="w-3 h-3" />
                        )}
                        {Math.abs(s.verschil)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compare again */}
          <div className="text-center">
            <button
              onClick={() => {
                setComparison(null);
                setSelectedReport("");
              }}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <GitCompare className="w-4 h-4" />
              Ander rapport vergelijken
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ReportCard({
  label,
  report,
  color,
}: {
  label: string;
  report: ComparisonData["reportA"];
  color: "gray" | "blue";
}) {
  const borderColor = color === "blue" ? "border-blue-200" : "border-gray-200";
  const bgColor = color === "blue" ? "bg-blue-50" : "bg-white";

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-6`}>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
      <p className="text-lg font-semibold text-gray-900 mb-4">{report.bedrijfsnaam}</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Datum</span>
          <span className="font-medium">
            {new Date(report.datum).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Aantal risico{"'"}s</span>
          <span className="font-medium">{report.aantalRisicos}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Gemiddelde score</span>
          <span className="font-medium">{report.gemiddeldeScore}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">PvA actiepunten</span>
          <span className="font-medium">
            {report.pvaAfgerond}/{report.pvaItems} afgerond
          </span>
        </div>
      </div>
    </div>
  );
}
