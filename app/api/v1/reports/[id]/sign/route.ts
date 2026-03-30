import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return auth.response;

  const { id } = await params;

  const body = await req.json();
  const { rol, naam, functie } = body;

  const validRoles = ["werkgever", "preventiemedewerker", "arbodeskundige"];
  if (!rol || !validRoles.includes(rol)) {
    return NextResponse.json(
      { error: `Verplicht veld: rol (${validRoles.join(", ")})` },
      { status: 400 }
    );
  }

  if (!naam) {
    return NextResponse.json(
      { error: "Verplicht veld: naam" },
      { status: 400 }
    );
  }

  const report = await prisma.rieReport.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!report) {
    return NextResponse.json({ error: "Rapport niet gevonden" }, { status: 404 });
  }

  if (report.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Rapport is nog niet afgerond" },
      { status: 400 }
    );
  }

  const currentSignatures = (report.signatures as any[]) || [];

  // Check if already signed for this role
  const existing = currentSignatures.findIndex((s: any) => s.role === rol);
  if (existing >= 0) {
    return NextResponse.json(
      { error: `Rapport is al ondertekend door ${rol}` },
      { status: 409 }
    );
  }

  const newSignature = {
    role: rol,
    name: naam,
    functie: functie || null,
    signatureImage: null, // API signing doesn't include visual signature
    signedAt: new Date().toISOString(),
    signedVia: "api",
  };

  currentSignatures.push(newSignature);

  await prisma.rieReport.update({
    where: { id },
    data: { signatures: currentSignatures },
  });

  return NextResponse.json({
    success: true,
    ondertekening: {
      rol,
      naam,
      ondertekendOp: newSignature.signedAt,
    },
  });
}
