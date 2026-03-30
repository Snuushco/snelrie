"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Send,
  RefreshCw,
  ChevronDown,
  Bell,
  ClipboardCheck,
  Users,
  PenTool,
} from "lucide-react";

type PvaItem = {
  index: number;
  titel: string;
  risico: string;
  prioriteit: string;
  deadline: string | null;
  status: string;
};

type ComplianceData = {
  hasReport: boolean;
  reportId?: string;
  bedrijfsnaam?: string;
  aantalMedewerkers?: number;
  rie?: {
    laatsteDatum: string;
    geldigTot: string;
    isActueel: boolean;
  };
  ondertekening?: {
    werkgever: boolean;
    preventiemedewerker: boolean;
    toetser: boolean;
    toetserVereist: boolean;
  };
  planVanAanpak?: {
    totaal: number;
    afgerond: number;
    inBehandeling: number;
    nietGestart: number;
    items: PvaItem[];
  };
  checklist?: Array<{
    id: string;
    label: string;
    checked: boolean;
    autoChecked: boolean;
  }>;
  herinneringen?: string[];
  message?: string;
};

export default function ComplianceDashboardPage() {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPva, setUpdatingPva] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/compliance/status");
      const json = await res.json();
      setData(json);
    } catch {
      setData({ hasReport: false, message: "Fout bij ophalen gegevens." });
    } finally {
      setLoading(false);
    }
  }

  async function updatePvaStatus(reportId: string, index: number, status: string) {
    setUpdatingPva(index);
    try {
      await fetch(`/api/rie/${reportId}/pva/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchData();
    } catch (e) {
      console.error("PvA update failed:", e);
    } finally {
      setUpdatingPva(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!data?.hasReport) {
    return (
      <div className="text-center py-16">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Compliance Dashboard</h1>
        <p className="text-gray-500 mb-6">
          {data?.message || "Start eerst een RI&E scan om uw compliance status te bekijken."}
        </p>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 transition"
        >
          <FileText className="w-5 h-5" />
          RI&E scan starten
        </Link>
      </div>
    );
  }

  const { rie, ondertekening, planVanAanpak, checklist, herinneringen, reportId } = data;
  const pvaProgress = planVanAanpak && planVanAanpak.totaal > 0
    ? Math.round((planVanAanpak.afgerond / planVanAanpak.totaal) * 100)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Compliance Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Overzicht van uw RI&E compliance status — {data.bedrijfsnaam}
        </p>
      </div>

      {/* Herinneringen */}
      {herinneringen && herinneringen.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Herinneringen</h3>
              <ul className="space-y-1">
                {herinneringen.map((h, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* RI&E Status Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">RI&E Status</h2>
          </div>

          {rie && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Laatste RI&E datum</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(rie.laatsteDatum).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Geldig tot</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(rie.geldigTot).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                {rie.isActueel ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                    Actueel
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                    <AlertTriangle className="w-4 h-4" />
                    Verlopen
                  </span>
                )}
              </div>
              {!rie.isActueel && (
                <Link
                  href="/scan"
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiseren
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Ondertekening Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <PenTool className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Ondertekening</h2>
          </div>

          {ondertekening && (
            <div className="space-y-3">
              <SignatureRow label="Werkgever" signed={ondertekening.werkgever} reportId={reportId!} role="werkgever" />
              <SignatureRow label="Preventiemedewerker" signed={ondertekening.preventiemedewerker} reportId={reportId!} role="preventiemedewerker" />
              {ondertekening.toetserVereist && (
                <SignatureRow label="Toetser (arbodeskundige)" signed={ondertekening.toetser} reportId={reportId!} role="arbodeskundige" />
              )}
              {!ondertekening.toetserVereist && (
                <p className="text-xs text-gray-400 mt-2">
                  Toetsing door arbodeskundige niet vereist (≤25 medewerkers)
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Plan van Aanpak */}
      {planVanAanpak && planVanAanpak.totaal > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Plan van Aanpak</h2>
              <p className="text-sm text-gray-500">
                {planVanAanpak.afgerond} van {planVanAanpak.totaal} actiepunten afgerond
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">{pvaProgress}% voltooid</span>
              <div className="flex gap-4 text-xs">
                <span className="text-green-600">✓ {planVanAanpak.afgerond} afgerond</span>
                <span className="text-blue-600">◐ {planVanAanpak.inBehandeling} in behandeling</span>
                <span className="text-gray-400">○ {planVanAanpak.nietGestart} niet gestart</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="flex h-3 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${(planVanAanpak.afgerond / planVanAanpak.totaal) * 100}%` }}
                />
                <div
                  className="bg-blue-400 transition-all"
                  style={{ width: `${(planVanAanpak.inBehandeling / planVanAanpak.totaal) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* PvA items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Actiepunt</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Risico</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Prioriteit</th>
                  <th className="text-left py-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {planVanAanpak.items.map((item) => (
                  <tr key={item.index} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 pr-4 text-gray-900 max-w-xs">
                      <span className="line-clamp-2">{item.titel}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 max-w-xs">
                      <span className="line-clamp-1">{item.risico}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <PrioriteitBadge prioriteit={item.prioriteit} />
                    </td>
                    <td className="py-3">
                      <StatusDropdown
                        status={item.status}
                        loading={updatingPva === item.index}
                        onChange={(status) => updatePvaStatus(reportId!, item.index, status)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compliance Checklist */}
      {checklist && checklist.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Compliance Checklist</h2>
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  item.checked ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                {item.checked ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    item.checked ? "text-green-800 font-medium" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
                {item.autoChecked && (
                  <span className="text-xs text-gray-400 ml-auto">automatisch</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SignatureRow({
  label,
  signed,
  reportId,
  role,
}: {
  label: string;
  signed: boolean;
  reportId: string;
  role: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {signed ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400" />
        )}
        <span className={`text-sm ${signed ? "text-green-800" : "text-gray-600"}`}>
          {label}
        </span>
      </div>
      {!signed && (
        <Link
          href={`/dashboard/rapporten/${reportId}/ondertekenen`}
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <Send className="w-3.5 h-3.5" />
          Ondertekenen
        </Link>
      )}
    </div>
  );
}

function PrioriteitBadge({ prioriteit }: { prioriteit: string }) {
  const colors: Record<string, string> = {
    hoog: "bg-red-100 text-red-700",
    midden: "bg-yellow-100 text-yellow-700",
    laag: "bg-green-100 text-green-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[prioriteit] || colors.midden}`}>
      {prioriteit}
    </span>
  );
}

function StatusDropdown({
  status,
  loading,
  onChange,
}: {
  status: string;
  loading: boolean;
  onChange: (status: string) => void;
}) {
  const statusLabels: Record<string, string> = {
    niet_gestart: "Niet gestart",
    in_behandeling: "In behandeling",
    afgerond: "Afgerond",
  };

  const statusColors: Record<string, string> = {
    niet_gestart: "text-gray-600 bg-gray-100 border-gray-200",
    in_behandeling: "text-blue-600 bg-blue-50 border-blue-200",
    afgerond: "text-green-600 bg-green-50 border-green-200",
  };

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className={`appearance-none text-xs font-medium px-3 py-1.5 pr-7 rounded-lg border cursor-pointer ${
          statusColors[status] || statusColors.niet_gestart
        } ${loading ? "opacity-50" : ""}`}
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
    </div>
  );
}
