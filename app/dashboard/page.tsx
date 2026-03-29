import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { FileText, Plus, CreditCard, User, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [reportCount, subscription, recentReports] = await Promise.all([
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
  ]);

  const tierLabel = subscription?.tier || "STARTER";

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

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Rapporten</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{reportCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Abonnement</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{tierLabel}</p>
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
