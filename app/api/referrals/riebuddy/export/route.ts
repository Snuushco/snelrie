import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ADMIN_EMAILS = [
  "snuushco@gmail.com",
  "emily@snelrie.nl",
  "guus@praesidion.nl",
];

/**
 * GET /api/referrals/riebuddy/export — export referrals as CSV
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 });
  }

  const referrals = await prisma.riebuddyReferral.findMany({
    orderBy: { referredAt: "desc" },
  });

  const header = [
    "ID",
    "Bedrijfsnaam",
    "Branche",
    "Medewerkers",
    "Contact",
    "Email",
    "Datum",
    "Status",
    "Omzet eerste jaar",
    "Commissie",
    "Commissie betaald",
    "Notities",
  ].join(";");

  const rows = referrals.map((r) =>
    [
      r.id,
      `"${r.companyName.replace(/"/g, '""')}"`,
      `"${r.branche.replace(/"/g, '""')}"`,
      r.employeeCount,
      `"${r.contactName.replace(/"/g, '""')}"`,
      r.contactEmail,
      r.referredAt.toISOString().split("T")[0],
      r.status,
      r.firstYearRevenue?.toString() || "",
      r.commissionAmount?.toString() || "",
      r.commissionPaid ? "Ja" : "Nee",
      `"${(r.notes || "").replace(/"/g, '""')}"`,
    ].join(";")
  );

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="riebuddy-referrals-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
