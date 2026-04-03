"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Download,
  RefreshCw,
  ChevronDown,
  Users,
  Euro,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
} from "lucide-react";

type Referral = {
  id: string;
  companyName: string;
  branche: string;
  employeeCount: number;
  contactName: string;
  contactEmail: string;
  referredAt: string;
  status: "REFERRED" | "CONTACTED" | "CONVERTED" | "LOST";
  riebuddyResponse: string | null;
  firstYearRevenue: string | null;
  commissionAmount: string | null;
  commissionPaid: boolean;
  notes: string | null;
};

type Stats = {
  total: number;
  byStatus: Record<string, number>;
  totalRevenue: string;
  totalCommission: string;
  commissionPaid: string;
  commissionUnpaid: string;
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  REFERRED: { label: "Doorverwezen", color: "bg-blue-100 text-blue-700", icon: Clock },
  CONTACTED: { label: "Contact gehad", color: "bg-yellow-100 text-yellow-700", icon: Phone },
  CONVERTED: { label: "Geconverteerd", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  LOST: { label: "Verloren", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function ReferralDashboard() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Referral>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : "";
    const [refRes, statsRes] = await Promise.all([
      fetch(`/api/referrals/riebuddy${params}`),
      fetch("/api/referrals/riebuddy/stats"),
    ]);
    if (refRes.ok) {
      const data = await refRes.json();
      setReferrals(data.referrals || []);
    }
    if (statsRes.ok) {
      setStats(await statsRes.json());
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/referrals/riebuddy/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      setEditingId(null);
      setEditData({});
      fetchData();
    }
  };

  const formatCurrency = (val: string | null) => {
    if (!val || val === "0") return "—";
    return `€${parseFloat(val).toLocaleString("nl-NL", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-brand-600" />
              <span className="text-lg font-bold">
                Snel<span className="text-brand-600">RIE</span>
              </span>
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium">Riebuddy Referrals</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/referrals/riebuddy/export"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-2 rounded-lg"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </a>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-2 rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
              Ververs
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Totaal referrals"
              value={String(stats.total)}
              color="text-blue-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Geconverteerd"
              value={String(stats.byStatus?.CONVERTED || 0)}
              color="text-green-600"
            />
            <StatCard
              icon={Euro}
              label="Totale commissie"
              value={formatCurrency(stats.totalCommission)}
              color="text-brand-600"
            />
            <StatCard
              icon={Euro}
              label="Nog uitbetalen"
              value={formatCurrency(stats.commissionUnpaid)}
              color="text-amber-600"
            />
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm text-gray-600">Filter op status:</span>
          <div className="flex gap-2">
            <FilterButton active={filter === ""} onClick={() => setFilter("")}>
              Alle
            </FilterButton>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <FilterButton
                key={key}
                active={filter === key}
                onClick={() => setFilter(key)}
              >
                {cfg.label}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Laden...</div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nog geen referrals gevonden.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Datum</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Bedrijf</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Branche</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Mdw</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Contact</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Omzet</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Commissie</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Betaald</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => {
                    const cfg = statusConfig[r.status];
                    const isEditing = editingId === r.id;
                    return (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(r.referredAt).toLocaleDateString("nl-NL")}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{r.companyName}</td>
                        <td className="px-4 py-3 text-gray-600">{r.branche}</td>
                        <td className="px-4 py-3 text-gray-600">{r.employeeCount}</td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900">{r.contactName}</div>
                          <div className="text-gray-500 text-xs">{r.contactEmail}</div>
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              value={(editData.status as string) || r.status}
                              onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                              className="text-xs border border-gray-200 rounded px-2 py-1"
                            >
                              {Object.entries(statusConfig).map(([key, c]) => (
                                <option key={key} value={key}>{c.label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={editData.firstYearRevenue as string || r.firstYearRevenue || ""}
                              onChange={(e) => setEditData({ ...editData, firstYearRevenue: e.target.value })}
                              className="w-24 text-xs border border-gray-200 rounded px-2 py-1"
                            />
                          ) : (
                            <span className="text-gray-600">{formatCurrency(r.firstYearRevenue)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{formatCurrency(r.commissionAmount)}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="checkbox"
                              checked={editData.commissionPaid ?? r.commissionPaid}
                              onChange={(e) => setEditData({ ...editData, commissionPaid: e.target.checked })}
                            />
                          ) : (
                            <span className={r.commissionPaid ? "text-green-600" : "text-gray-400"}>
                              {r.commissionPaid ? "✓" : "—"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleUpdate(r.id)}
                                className="text-xs bg-brand-600 text-white px-2 py-1 rounded"
                              >
                                Opslaan
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setEditData({}); }}
                                className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded"
                              >
                                Annuleer
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingId(r.id); setEditData({}); }}
                              className="text-xs text-brand-600 hover:underline"
                            >
                              Bewerken
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${color}`} />
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
        active
          ? "bg-brand-600 text-white"
          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}
