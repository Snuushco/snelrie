import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  // Allow cron or authenticated user
  const cronSecret = req.headers.get("x-cron-secret");
  const isCron = cronSecret === process.env.CRON_SECRET;
  
  let userId: string | null = null;
  
  if (!isCron) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }
    userId = session.user.id;
  }

  // Find reports that need reminders
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const elevenMonthsAgo = new Date();
  elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

  const reportsNeedingReminder = await prisma.rieReport.findMany({
    where: {
      status: "COMPLETED",
      ...(userId ? { userId } : {}),
      OR: [
        // RI&E bijna verlopen (11+ maanden oud)
        { createdAt: { lte: elevenMonthsAgo } },
      ],
    },
    include: {
      user: { select: { email: true, naam: true } },
    },
  });

  const reminders: Array<{ email: string; bedrijfsnaam: string; type: string }> = [];

  for (const report of reportsNeedingReminder) {
    const createdAt = new Date(report.createdAt);
    const oneYearLater = new Date(createdAt);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    const isExpired = new Date() > oneYearLater;

    const pvaStatuses = (report.pvaStatuses as any[]) || [];
    const content = report.generatedContent as any;
    const pvaItems = content?.planVanAanpak || content?.pva || [];
    const nietGestart = pvaItems.filter((_: any, i: number) => {
      const s = pvaStatuses.find((ps: any) => ps.index === i);
      return !s || s.status === "niet_gestart";
    }).length;

    if (isExpired) {
      reminders.push({
        email: report.user.email,
        bedrijfsnaam: report.bedrijfsnaam,
        type: "rie_verlopen",
      });
    } else {
      const daysUntil = Math.ceil((oneYearLater.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 30) {
        reminders.push({
          email: report.user.email,
          bedrijfsnaam: report.bedrijfsnaam,
          type: `rie_verloopt_${daysUntil}_dagen`,
        });
      }
    }

    if (nietGestart > 0) {
      reminders.push({
        email: report.user.email,
        bedrijfsnaam: report.bedrijfsnaam,
        type: `pva_${nietGestart}_niet_gestart`,
      });
    }
  }

  // In production, send actual emails here via Resend
  // For now, return the list of reminders that would be sent
  return NextResponse.json({
    success: true,
    remindersCount: reminders.length,
    reminders,
  });
}
