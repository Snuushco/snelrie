import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("logo") as File | null;
    const email = formData.get("email") as string | null;

    if (!email) {
      return NextResponse.json({ error: "Email is vereist" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "Geen bestand geüpload" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Bestand is te groot (max 2MB)" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Ongeldig bestandstype. Gebruik PNG, JPG of SVG." },
        { status: 400 }
      );
    }

    let logoUrl: string;

    // Try Vercel Blob first, fallback to base64
    try {
      const blob = await put(`branding/${Date.now()}-${file.name}`, file, {
        access: "public",
        contentType: file.type,
      });
      logoUrl = blob.url;
    } catch {
      // Fallback: store as base64 data URL
      const buffer = Buffer.from(await file.arrayBuffer());
      logoUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
    }

    // Check branding access (PROFESSIONAL+)
    const { requireBranding } = await import("@/lib/gate");
    const brandingGate = await requireBranding(user.id);
    if (brandingGate) return brandingGate;

    // Upsert branding config
    const branding = await prisma.brandingConfig.upsert({
      where: { userId: user.id },
      update: { logoUrl },
      create: { userId: user.id, logoUrl },
    });

    return NextResponse.json({ logoUrl: branding.logoUrl, success: true });
  } catch (error) {
    console.error("Logo upload error:", error);
    return NextResponse.json({ error: "Upload mislukt" }, { status: 500 });
  }
}
