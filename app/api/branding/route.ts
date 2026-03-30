import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireBranding } from "@/lib/gate";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email is vereist" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { branding: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  // Check branding access (PROFESSIONAL+)
  const brandingGate = await requireBranding(user.id);
  if (brandingGate) return brandingGate;

  return NextResponse.json({ branding: user.branding || null });
}
