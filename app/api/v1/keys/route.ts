import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateApiKey, hashApiKey } from "@/lib/api-auth";

// GET - List API keys for current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      requestCount: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ keys });
}

// POST - Create new API key
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const body = await req.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Geef een naam op voor deze API-sleutel (min. 2 tekens)" },
      { status: 400 }
    );
  }

  // Max 10 active keys per user
  const activeKeys = await prisma.apiKey.count({
    where: { userId: session.user.id, revokedAt: null },
  });

  if (activeKeys >= 10) {
    return NextResponse.json(
      { error: "Maximaal 10 actieve API-sleutels per account" },
      { status: 400 }
    );
  }

  const { key, prefix, hash } = generateApiKey();

  await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      key: hash,
      keyPrefix: prefix,
    },
  });

  // Return the full key ONLY on creation (never again)
  return NextResponse.json({
    success: true,
    key, // Full key - shown only once!
    prefix,
    name: name.trim(),
    message: "Bewaar deze sleutel veilig — hij wordt niet meer getoond.",
  });
}

// DELETE - Revoke an API key
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const keyId = searchParams.get("id");

  if (!keyId) {
    return NextResponse.json({ error: "Key ID ontbreekt" }, { status: 400 });
  }

  const apiKey = await prisma.apiKey.findFirst({
    where: { id: keyId, userId: session.user.id },
  });

  if (!apiKey) {
    return NextResponse.json({ error: "API-sleutel niet gevonden" }, { status: 404 });
  }

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ success: true, message: "API-sleutel ingetrokken" });
}
