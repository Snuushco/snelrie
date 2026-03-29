import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { FileText, ArrowRight, Search, Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function RapportenPage({
  searchParams,
}: {
  searchParams: Promise<{ zoek?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const zoek = params.zoek || "";
  const statusFilter = params.status || "";

  const reports = await prisma.rieReport.findMany({
    where: {
      userId: session.user.id,
      ...(zoek
        ? {
            bedrijfsnaam: {
              contains: zoek,
              mode: "insensitive" as const,
            },
          }
        : {}),
      ...(statusFilter && statusFilter !== "ALL"
        ? { status: statusFilter as "PENDING" | "GENERATING" | "COMPLETED" | "FAILED" }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      bedrijfsnaam: true,
      branche: true,
      status: true,
      tier: true,
      createdAt: true,
      pdfGenerated: true,
    },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapporten</h1>
          <p className="text-gray-500 text-sm mt-1">
            {reports.length} rapport{reports.length !== 1 ? "en" : ""} gevonden
          </p>
        </div>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-blue-700 transition text-sm"
        >
          <Plus className="w-4 h-4" />
          Nieuwe scan
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form className="flex-1 relative" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="zoek"
            defaultValue={zoek}
            placeholder="Zoek op bedrijfsnaam..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          />
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        </form>
        <div className="flex gap-2">
          {["ALL", "COMPLETED", "GENERATING", "PENDING", "FAILED"].map((s) => (
            <Link
              key={s}
              href={`/dashboard/rapporten?status=${s}${zoek ? `&zoek=${zoek}` : ""}`}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                (statusFilter || "ALL") === s
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {s === "ALL"
                ? "Alle"
                : s === "COMPLETED"
                  ? "Afgerond"
                  : s === "GENERATING"
                    ? "Bezig"
                    : s === "PENDING"
                      ? "Wachtend"
                      : "Mislukt"}
            </Link>
          ))}
        </div>
      </div>

      {/* Reports list */}
      {reports.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/scan/resultaat/${report.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {report.bedrijfsnaam}
                  </p>
                  <p className="text-sm text-gray-500">
                    {report.branche} ·{" "}
                    {new Date(report.createdAt).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
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
                <span className="text-xs text-gray-400 uppercase hidden sm:inline">
                  {report.tier}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {zoek || statusFilter ? "Geen resultaten" : "Nog geen rapporten"}
          </h2>
          <p className="text-gray-500 mb-6">
            {zoek || statusFilter
              ? "Probeer andere zoektermen of filters."
              : "Start je eerste RI&E scan om je rapporten hier te zien."}
          </p>
          {!zoek && !statusFilter && (
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Eerste scan starten
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
