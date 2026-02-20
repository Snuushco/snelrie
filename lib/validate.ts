import { z } from "zod";

// ---- Helpers ----

/** Strip HTML tags from a string */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/** Sanitize all string values in an object (strip HTML, enforce max length) */
export function sanitizeStrings<T extends Record<string, unknown>>(
  obj: T,
  maxLength = 500
): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const val = result[key as keyof T];
    if (typeof val === "string") {
      (result as any)[key] = stripHtml(val).slice(0, maxLength);
    }
  }
  return result;
}

// ---- Valid branches (must match scan-form.tsx) ----
export const VALID_BRANCHES = [
  "beveiliging",
  "horeca",
  "bouw",
  "kinderopvang",
  "schoonmaak",
  "detailhandel",
  "transport",
  "zorg",
  "kantoor",
  "overig",
] as const;

// ---- Zod Schemas ----

export const generateRieSchema = z.object({
  bedrijfsnaam: z
    .string()
    .min(1, "Bedrijfsnaam is verplicht")
    .max(200, "Bedrijfsnaam mag maximaal 200 tekens zijn")
    .transform(stripHtml),
  branche: z.enum(VALID_BRANCHES, {
    errorMap: () => ({ message: "Ongeldige branche" }),
  }),
  aantalMedewerkers: z
    .number({ coerce: true })
    .int()
    .min(1, "Minimaal 1 medewerker")
    .max(100000, "Ongeldig aantal medewerkers"),
  aantalLocaties: z
    .number({ coerce: true })
    .int()
    .min(1)
    .max(10000)
    .default(1),
  email: z
    .string()
    .email("Ongeldig e-mailadres")
    .max(254)
    .transform((v) => v.toLowerCase().trim()),
  naam: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v ? stripHtml(v) : v)),
  tier: z.enum(["GRATIS", "BASIS", "PROFESSIONAL", "ENTERPRISE"]).default("GRATIS"),
  // Werkplek fields - all optional strings
  bhvAanwezig: z.string().max(10).optional(),
  aantalBhvers: z.string().max(10).optional(),
  preventiemedewerker: z.string().max(10).optional(),
  eerderRie: z.string().max(10).optional(),
  laatsteRie: z.string().max(500).optional().transform((v) => (v ? stripHtml(v) : v)),
  typeWerkzaamheden: z.array(z.string().max(200)).max(20).optional(),
  gevaarlijkeStoffen: z.string().max(10).optional(),
  beeldschermwerk: z.string().max(10).optional(),
  fysiekWerk: z.string().max(10).optional(),
  buitenwerk: z.string().max(10).optional(),
  nachtwerk: z.string().max(10).optional(),
  alleenWerken: z.string().max(10).optional(),
});

export const checkoutSchema = z.object({
  reportId: z.string().min(1).max(100),
  tier: z.enum(["BASIS", "PROFESSIONAL", "ENTERPRISE"]),
});

export const chatSchema = z.object({
  reportId: z.string().min(1).max(100),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(500, "Bericht mag maximaal 500 tekens zijn"),
      })
    )
    .max(50, "Maximaal 50 berichten in een gesprek"),
});

// ---- Error Response Helper ----

export function validationErrorResponse(error: z.ZodError): Response {
  const firstError = error.errors[0];
  return new Response(
    JSON.stringify({
      error: firstError?.message || "Ongeldige invoer",
      details: error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  );
}
