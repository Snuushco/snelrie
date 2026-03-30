import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateVerificationCode, isFullySigned } from "@/lib/verification";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const { signatureImage, name, functie, role, token } = body;

  // Validate required fields
  if (!signatureImage || !name || !functie || !role) {
    return NextResponse.json(
      { error: "Alle velden zijn verplicht (signatureImage, name, functie, role)" },
      { status: 400 }
    );
  }

  const validRoles = ["werkgever", "preventiemedewerker", "arbodeskundige"];
  if (!validRoles.includes(role)) {
    return NextResponse.json(
      { error: "Ongeldige rol. Kies uit: werkgever, preventiemedewerker, arbodeskundige" },
      { status: 400 }
    );
  }

  // Validate signature image (must be base64 data URI)
  if (!signatureImage.startsWith("data:image/")) {
    return NextResponse.json(
      { error: "Handtekening moet een base64 data URI zijn (data:image/png;base64,...)" },
      { status: 400 }
    );
  }

  // Auth: either via session (report owner) or via signing token
  let report;

  if (token) {
    // Public signing via token
    const signLink = await prisma.signLink.findUnique({
      where: { token },
      include: { report: true },
    });

    if (!signLink || signLink.reportId !== id) {
      return NextResponse.json({ error: "Ongeldige ondertekeningslink" }, { status: 403 });
    }

    if (signLink.expiresAt < new Date()) {
      return NextResponse.json({ error: "Ondertekeningslink is verlopen" }, { status: 403 });
    }

    if (signLink.usedAt) {
      return NextResponse.json({ error: "Deze link is al gebruikt" }, { status: 403 });
    }

    if (signLink.role !== role) {
      return NextResponse.json(
        { error: `Deze link is bedoeld voor de rol '${signLink.role}', niet '${role}'` },
        { status: 403 }
      );
    }

    report = signLink.report;

    // Mark link as used
    await prisma.signLink.update({
      where: { id: signLink.id },
      data: { usedAt: new Date() },
    });
  } else {
    // Authenticated signing
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    report = await prisma.rieReport.findUnique({ where: { id } });
    if (!report || report.userId !== session.user.id) {
      return NextResponse.json({ error: "Rapport niet gevonden of geen toegang" }, { status: 404 });
    }
  }

  // Build new signature
  const signedAt = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const newSignature = {
    role,
    name,
    functie,
    signatureImage,
    signedAt,
  };

  // Get existing signatures, replace if same role already signed
  const existingSignatures: any[] = (report.signatures as any[]) || [];
  const updatedSignatures = [
    ...existingSignatures.filter((s: any) => s.role !== role),
    newSignature,
  ];

  // Check if report is now fully signed → generate verification code
  let verificationCode = report.verificationCode;
  if (!verificationCode && isFullySigned(updatedSignatures)) {
    verificationCode = generateVerificationCode({
      reportId: id,
      signatures: updatedSignatures.map((s: any) => ({
        role: s.role,
        name: s.name,
        signedAt: s.signedAt,
      })),
      timestamp: new Date().toISOString(),
    });
  }

  await prisma.rieReport.update({
    where: { id },
    data: {
      signatures: updatedSignatures,
      ...(verificationCode ? { verificationCode } : {}),
    },
  });

  return NextResponse.json({
    success: true,
    message: `Rapport succesvol ondertekend als ${role}`,
    verificationCode: verificationCode || null,
    signatures: updatedSignatures.map((s: any) => ({
      role: s.role,
      name: s.name,
      signedAt: s.signedAt,
    })),
  });
}
