import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { FileText, Plus, CreditCard, User, ArrowRight, Lock, Sparkles, MessageSquare, Palette, ClipboardList, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { getEffectiveTier, getFeatureAccess, getRemainingReports, getTrialInfo } from "@/lib/stripe-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [reportCount, subscription, recentReports, tier, remainingReports, trialInfo] = await Promise.all([
    prisma.rieReport.count({ where: { userId: session.user.id } }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.rieReport.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        bedrijfsnaam: true,
        status: true,
        tier: true,
        createdAt: true,
      },
    }),
    getEffectiveTier(session.user.id),
    getRemainingReports(session.user.id),
    getTrialInfo(session.user.id),
  ]);

  const features = getFeatureAccess(tier);
  const tierLabel = tier;
  const tierColors: Record<string, string> = {
    STARTER: "bg-gray-100 text-gray-700",
    PROFESSIONAL: "bg-blue-100 text-blue-700",
    ENTERPRISE: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welkom{session.user.naam ? `, ${session.user.naam}` : ""}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Hier vind je een overzicht van je RI&E rapporten en account.
        </p>
      </div>

      {/* Trial banner */}
      {trialInfo.isOnTrial && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                U heeft nog {trialInfo.daysRemaining} {trialInfo.daysRemaining === 1 ? 'dag' : 'dagen'} toegang tot Professional functies
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Upgrade nu voor onbeperkte rapporten, AI chat, branding en Plan van Aanpak.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-amber-500 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-amber-600 transition flex-shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade nu
            </Link>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Rapporten deze maand</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {remainingReports.unlimited
              ? "Onbeperkt"
              : `${remainingReports.remaining}/${remainingReports.limit}`}
          </p>
          {!remainingReports.unlimited && remainingReports.remaining === 0 && (
            <Link
              href="/pricing"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block"
            >
              Upgrade voor meer →
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Abonnement</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${tierColors[tierLabel] || tierColors.STARTER}`}>
              {tierLabel}
            </span>
          </div>
          {tierLabel === "STARTER" && (
            <Link
              href="/pricing"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
            >
              Upgrade →
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Account</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 truncate">
            {session.user.email}
          </p>
        </div>
      </div>

      {/* Feature access overview (show locked features for STARTER) */}
      {tierLabel === "STARTER" && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Ontgrendel meer functies</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: MessageSquare, label: "AI Chat Assistent", available: features.aiChat },
              { icon: Palette, label: "Branding & Huisstijl", available: features.branding },
              { icon: ClipboardList, label: "Plan van Aanpak", available: features.planVanAanpak },
            ].map(({ icon: Icon, label, available }) => (
              <div
                key={label}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  available ? "bg-green-50 border border-green-200" : "bg-white border border-gray-200"
                }`}
              >
                {available ? (
                  <Icon className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <span className={`text-sm font-medium ${available ? "text-green-700" : "text-gray-500"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition"
          >
            <Sparkles className="w-4 h-4" />
            Bekijk abonnementen
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/scan"
          className="flex items-center gap-4 bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-700 transition group"
        >
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">Nieuwe RI&E scan</p>
            <p className="text-blue-100 text-sm">Start een nieuwe risico-inventarisatie</p>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/dashboard/rapporten"
          className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition group"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg text-gray-900">Alle rapporten</p>
            <p className="text-gray-500 text-sm">Bekijk en download je rapporten</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent reports */}
      {recentReports.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recente rapporten</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentReports.map((report) => (
              <Link
                key={report.id}
                href={`/scan/resultaat/${report.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium text-gray-900">{report.bedrijfsnaam}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      report.status === "COMPLETED"
                        ? "bg-green-50 text-green-700"
                        : report.status === "GENERATING"
                          ? "bg-yellow-50 text-yellow-700"
                          : report.status === "FAILED"
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {report.status === "COMPLETED"
                      ? "Afgerond"
                      : report.status === "GENERATING"
                        ? "Bezig..."
                        : report.status === "FAILED"
                          ? "Mislukt"
                          : "Wachtend"}
                  </span>
                  <span className="text-xs text-gray-400 uppercase">{report.tier}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {reportCount === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Nog geen rapporten
          </h2>
          <p className="text-gray-500 mb-6">
            Start je eerste RI&E scan om je rapport hier te zien.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Eerste scan starten
          </Link>
        </div>
      )}
    </div>
  );
}
