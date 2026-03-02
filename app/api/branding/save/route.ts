import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, logoUrl, primaryColor, companyName, websiteUrl } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is vereist" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
    }

    const branding = await prisma.brandingConfig.upsert({
      where: { userId: user.id },
      update: {
        ...(logoUrl !== undefined && { logoUrl }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(companyName !== undefined && { companyName }),
        ...(websiteUrl !== undefined && { websiteUrl }),
      },
      create: {
        userId: user.id,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || null,
        companyName: companyName || null,
        websiteUrl: websiteUrl || null,
      },
    });

    return NextResponse.json({ branding, success: true });
  } catch (error) {
    console.error("Branding save error:", error);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }
}
