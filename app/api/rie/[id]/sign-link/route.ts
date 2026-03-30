import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { role, email } = body;

  const validRoles = ["werkgever", "preventiemedewerker", "arbodeskundige"];
  if (!role || !validRoles.includes(role)) {
    return NextResponse.json(
      { error: "Ongeldige rol. Kies uit: werkgever, preventiemedewerker, arbodeskundige" },
      { status: 400 }
    );
  }

  // Verify report ownership
  const report = await prisma.rieReport.findUnique({ where: { id } });
  if (!report || report.userId !== session.user.id) {
    return NextResponse.json({ error: "Rapport niet gevonden of geen toegang" }, { status: 404 });
  }

  // Generate unique token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  // Create or replace existing sign link for this role
  const existing = await prisma.signLink.findFirst({
    where: { reportId: id, role, usedAt: null },
  });

  if (existing) {
    await prisma.signLink.update({
      where: { id: existing.id },
      data: { token, email, expiresAt },
    });
  } else {
    await prisma.signLink.create({
      data: { token, reportId: id, role, email, expiresAt },
    });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://snelrie.nl";
  const signUrl = `${baseUrl}/onderteken/${token}`;

  // If email provided, send signing request
  if (email) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const roleLabel =
        role === "werkgever" ? "Werkgever" :
        role === "preventiemedewerker" ? "Preventiemedewerker" :
        "Arbodeskundige";

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "SnelRIE <noreply@snelrie.nl>",
        to: email,
        subject: `Ondertekeningsverzoek RI&E — ${report.bedrijfsnaam}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">Ondertekeningsverzoek</h2>
            <p>U bent gevraagd om als <strong>${roleLabel}</strong> de Risico-Inventarisatie & Evaluatie (RI&E) van <strong>${report.bedrijfsnaam}</strong> te ondertekenen.</p>
            <p style="margin: 24px 0;">
              <a href="${signUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                RI&E Ondertekenen
              </a>
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              Deze link is 30 dagen geldig en kan eenmalig worden gebruikt.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">
              Verzonden via SnelRIE — snelrie.nl
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send signing email:", err);
      // Don't fail the request — link is still created
    }
  }

  return NextResponse.json({
    success: true,
    signUrl,
    token,
    role,
    expiresAt: expiresAt.toISOString(),
  });
}

// GET: List active sign links for a report
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { id } = await params;

  const report = await prisma.rieReport.findUnique({ where: { id } });
  if (!report || report.userId !== session.user.id) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const links = await prisma.signLink.findMany({
    where: { reportId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      role: true,
      email: true,
      usedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ links });
}
