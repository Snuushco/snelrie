import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(req);
  if (!auth.valid) return auth.response;

  const { id } = await params;

  const report = await prisma.rieReport.findFirst({
    where: { id, userId: auth.userId },
  });

  if (!report) {
    return NextResponse.json({ error: "Rapport niet gevonden" }, { status: 404 });
  }

  if (report.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Rapport is nog niet afgerond. Huidige status: " + report.status },
      { status: 400 }
    );
  }

  // Redirect to the PDF generation endpoint
  const baseUrl = process.env.NEXTAUTH_URL || "https://snelrie.nl";
  const pdfUrl = `${baseUrl}/api/pdf/${id}`;

  try {
    const pdfRes = await fetch(pdfUrl);
    if (!pdfRes.ok) {
      return NextResponse.json(
        { error: "PDF kon niet worden gegenereerd" },
        { status: 500 }
      );
    }

    const pdfBuffer = await pdfRes.arrayBuffer();
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rie-${report.bedrijfsnaam.replace(/[^a-zA-Z0-9]/g, "-")}-${id.slice(0, 8)}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "PDF generatie mislukt" },
      { status: 500 }
    );
  }
}
