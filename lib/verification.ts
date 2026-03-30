import * as crypto from "crypto";

/**
 * Generate a verification code for a fully signed report.
 * SHA-256 hash of report ID + signature data + timestamp → formatted as XXXX-XXXX-XXXX
 */
export function generateVerificationCode(params: {
  reportId: string;
  signatures: Array<{ role: string; name: string; signedAt: string }>;
  timestamp: string;
}): string {
  const payload = JSON.stringify({
    id: params.reportId,
    sigs: params.signatures.map((s) => ({
      r: s.role,
      n: s.name,
      d: s.signedAt,
    })),
    ts: params.timestamp,
  });

  const hash = crypto.createHash("sha256").update(payload).digest("hex");
  const code = hash.substring(0, 12).toUpperCase();

  // Format as XXXX-XXXX-XXXX
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

/**
 * Check if a report is fully signed (werkgever + preventiemedewerker at minimum)
 */
export function isFullySigned(
  signatures: Array<{ role: string }> | null | undefined
): boolean {
  if (!signatures || signatures.length === 0) return false;
  const roles = new Set(signatures.map((s) => s.role));
  return roles.has("werkgever") && roles.has("preventiemedewerker");
}
