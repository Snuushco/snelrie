import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

/**
 * Hash an API key for storage/lookup
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Generate a new API key
 */
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const random = crypto.randomBytes(32).toString("base64url");
  const key = `sk_live_${random}`;
  const prefix = key.slice(0, 16) + "...";
  const hash = hashApiKey(key);
  return { key, prefix, hash };
}

// In-memory rate limit store for API keys
const apiRateLimits = new Map<string, { count: number; resetAt: number }>();

// Clean up every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of apiRateLimits) {
    if (now > entry.resetAt) apiRateLimits.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Validate API key from Authorization header.
 * Returns the user or an error response.
 */
export async function validateApiKey(req: NextRequest): Promise<
  | { valid: true; userId: string; apiKeyId: string }
  | { valid: false; response: NextResponse }
> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer sk_")) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "API-sleutel ontbreekt. Gebruik Authorization: Bearer sk_..." },
        { status: 401 }
      ),
    };
  }

  const key = authHeader.slice(7); // Remove "Bearer "
  const hash = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { key: hash },
  });

  if (!apiKey || apiKey.revokedAt) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Ongeldige of ingetrokken API-sleutel" },
        { status: 401 }
      ),
    };
  }

  // Rate limiting: 100 requests per hour per key
  const now = Date.now();
  const rl = apiRateLimits.get(apiKey.id);
  if (rl && now < rl.resetAt) {
    if (rl.count >= 100) {
      const retryAfter = Math.ceil((rl.resetAt - now) / 1000);
      return {
        valid: false,
        response: NextResponse.json(
          { error: "Rate limit bereikt. Maximaal 100 verzoeken per uur.", retryAfter },
          { status: 429, headers: { "Retry-After": String(retryAfter) } }
        ),
      };
    }
    rl.count++;
  } else {
    apiRateLimits.set(apiKey.id, { count: 1, resetAt: now + 3600 * 1000 });
  }

  // Update last used timestamp (fire and forget)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date(), requestCount: { increment: 1 } },
  }).catch(() => {});

  return { valid: true, userId: apiKey.userId, apiKeyId: apiKey.id };
}
