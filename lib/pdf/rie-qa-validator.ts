/**
 * QA Validation layer for RI&E PDF pipeline.
 * Runs BEFORE PDF generation to catch data quality issues.
 */
import type { RieData } from "./rie-document";

export type QaIssue = {
  severity: "error" | "warning" | "info";
  category:
    | "encoding"
    | "consistency"
    | "compliance"
    | "content"
    | "formatting";
  message: string;
  location?: string;
};

// Known garbled UTF-8 patterns (double-encoded through Latin-1/CP-1252)
const GARBLED_PATTERNS = [
  /Ã[\x80-\xBF]/,     // Double-encoded 2-byte UTF-8 (C3 xx)
  /Â[\x80-\xBF]/,     // Double-encoded continuation byte prefix
  /â€["\u201C\u201D\u2022\u2013\u2014]/,  // Triple-byte mojibake remnants
  /Ã¯/,               // ï double-encoded
  /Ã«/,               // ë double-encoded
  /Ã¶/,               // ö double-encoded
  /Ã¼/,               // ü double-encoded
  /Ã©/,               // é double-encoded
  /Ã¨/,               // è double-encoded
  /Ã¢/,               // â double-encoded
  /â‚¬/,               // € triple-encoded
  /â€"/,               // — triple-encoded
  /Ã‚/,               // Double-encoded Â
  /\u0090/,           // Control character (CP-1252 artifact)
  /\u0153/,           // œ as mojibake artifact
];

/**
 * Recursively scan all string values in an object for garbled encoding.
 */
function scanForEncoding(
  obj: unknown,
  path: string,
  issues: QaIssue[]
): void {
  if (typeof obj === "string") {
    for (const pattern of GARBLED_PATTERNS) {
      if (pattern.test(obj)) {
        const match = obj.match(pattern);
        issues.push({
          severity: "error",
          category: "encoding",
          message: `Garbled UTF-8 detected: "${match?.[0]}" in text "${obj.substring(0, 80)}..."`,
          location: path,
        });
        break; // One encoding error per field is enough
      }
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => scanForEncoding(item, `${path}[${i}]`, issues));
  } else if (obj && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      scanForEncoding(value, `${path}.${key}`, issues);
    }
  }
}

/**
 * Extract a number mentioned in text (e.g., "24 risico's" → 24)
 */
function extractCountFromText(
  text: string,
  keyword: string
): number | null {
  // Match patterns like "24 risico's", "heeft 24 risico's"
  const patterns = [
    new RegExp(`(\\d+)\\s+${keyword}`, "i"),
    new RegExp(`${keyword}[^\\d]*(\\d+)`, "i"),
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Validate RI&E data before PDF generation.
 */
export function validateRieData(data: RieData): QaIssue[] {
  const issues: QaIssue[] = [];
  const content = data.generatedContent;
  const risicos = content.risicos || [];
  const pva = content.planVanAanpak || [];
  const wettelijk = content.wettelijkeVerplichtingen || [];

  // ─── 1. ENCODING CHECKS ───
  scanForEncoding(data, "data", issues);

  // ─── 2. CONSISTENCY CHECKS ───

  // Check if samenvatting mentions a risk count that doesn't match
  if (content.samenvatting) {
    const mentionedCount = extractCountFromText(
      content.samenvatting,
      "risico"
    );
    if (mentionedCount !== null && mentionedCount !== risicos.length) {
      issues.push({
        severity: "warning",
        category: "consistency",
        message: `Samenvatting vermeldt ${mentionedCount} risico's maar rapport bevat ${risicos.length} risico's`,
        location: "generatedContent.samenvatting",
      });
    }

    // Check hoog/midden/laag counts in summary
    const hoogActual = risicos.filter(
      (r) => r.prioriteit === "hoog"
    ).length;
    const middenActual = risicos.filter(
      (r) => r.prioriteit === "midden"
    ).length;
    const laagActual = risicos.filter(
      (r) => r.prioriteit === "laag"
    ).length;

    const hoogMentioned = extractCountFromText(
      content.samenvatting,
      "hoog"
    );
    if (
      hoogMentioned !== null &&
      hoogMentioned !== hoogActual
    ) {
      issues.push({
        severity: "warning",
        category: "consistency",
        message: `Samenvatting vermeldt ${hoogMentioned} hoog-prioriteit maar werkelijk zijn er ${hoogActual}`,
        location: "generatedContent.samenvatting",
      });
    }
  }

  // Validate risk scores are in range 1-25
  risicos.forEach((r, i) => {
    if (r.risicoScore !== undefined) {
      if (
        isNaN(r.risicoScore) ||
        r.risicoScore < 1 ||
        r.risicoScore > 25
      ) {
        issues.push({
          severity: "error",
          category: "consistency",
          message: `Risicoscore ${r.risicoScore} is buiten bereik 1-25`,
          location: `generatedContent.risicos[${i}].risicoScore`,
        });
      }
    }
    // Validate kans × effect = risicoScore
    if (
      r.kans !== undefined &&
      r.effect !== undefined &&
      r.risicoScore !== undefined
    ) {
      const expected = r.kans * r.effect;
      if (expected !== r.risicoScore) {
        issues.push({
          severity: "warning",
          category: "consistency",
          message: `Risicoscore ${r.risicoScore} komt niet overeen met kans(${r.kans}) × effect(${r.effect}) = ${expected}`,
          location: `generatedContent.risicos[${i}]`,
        });
      }
    }
  });

  // ─── 3. COMPLIANCE CHECKS ───

  // Every risk must have categorie, prioriteit, beschrijving
  risicos.forEach((r, i) => {
    if (!r.categorie) {
      issues.push({
        severity: "error",
        category: "compliance",
        message: `Risico ${i + 1} mist categorie`,
        location: `generatedContent.risicos[${i}].categorie`,
      });
    }
    if (!r.prioriteit) {
      issues.push({
        severity: "error",
        category: "compliance",
        message: `Risico ${i + 1} mist prioriteit`,
        location: `generatedContent.risicos[${i}].prioriteit`,
      });
    }
    if (!r.beschrijving) {
      issues.push({
        severity: "warning",
        category: "compliance",
        message: `Risico ${i + 1} mist beschrijving`,
        location: `generatedContent.risicos[${i}].beschrijving`,
      });
    }

    // Must have at least 1 maatregel
    if (!r.maatregelen || r.maatregelen.length === 0) {
      issues.push({
        severity: "warning",
        category: "compliance",
        message: `Risico ${i + 1} (${r.categorie}) heeft geen maatregelen`,
        location: `generatedContent.risicos[${i}].maatregelen`,
      });
    }
  });

  // PvA should have at least 1 item per hoog-prioriteit risico
  const hoogRisicos = risicos.filter((r) => r.prioriteit === "hoog");
  if (hoogRisicos.length > 0 && pva.length === 0) {
    issues.push({
      severity: "error",
      category: "compliance",
      message: `Er zijn ${hoogRisicos.length} hoog-prioriteit risico's maar geen Plan van Aanpak items`,
      location: "generatedContent.planVanAanpak",
    });
  }

  // Wettelijke verplichtingen should not be empty (for non-gratis tiers)
  if (
    data.tier !== "GRATIS" &&
    wettelijk.length === 0
  ) {
    issues.push({
      severity: "warning",
      category: "compliance",
      message: "Wettelijke verplichtingen sectie is leeg",
      location: "generatedContent.wettelijkeVerplichtingen",
    });
  }

  // For >25 employees, mention toetsing
  if (data.aantalMedewerkers > 25 && data.tier !== "GRATIS") {
    const mentionsToetsing =
      content.samenvatting?.toLowerCase().includes("toets") ||
      content.aanbevelingen?.aanbevelingToetsing;
    if (!mentionsToetsing) {
      issues.push({
        severity: "warning",
        category: "compliance",
        message:
          "Bedrijf heeft >25 medewerkers maar toetsingsverklaring wordt niet vermeld",
        location: "generatedContent",
      });
    }
  }

  // ─── 4. CONTENT CHECKS ───

  if (!data.bedrijfsnaam || data.bedrijfsnaam.trim() === "") {
    issues.push({
      severity: "error",
      category: "content",
      message: "Bedrijfsnaam is leeg",
      location: "bedrijfsnaam",
    });
  }

  if (!data.branche || data.branche.trim() === "") {
    issues.push({
      severity: "error",
      category: "content",
      message: "Branche is leeg",
      location: "branche",
    });
  }

  // Check for placeholder text
  const placeholderPatterns = [
    /\bTODO\b/i,
    /\bLorem ipsum\b/i,
    /\btest\s*test\b/i,
    /\bXXX\b/,
    /\bplaceholder\b/i,
    /\bvul hier in\b/i,
  ];

  function checkPlaceholders(obj: unknown, path: string): void {
    if (typeof obj === "string") {
      for (const pattern of placeholderPatterns) {
        if (pattern.test(obj)) {
          issues.push({
            severity: "warning",
            category: "content",
            message: `Placeholder tekst gevonden: "${obj.substring(0, 60)}..."`,
            location: path,
          });
          break;
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, i) =>
        checkPlaceholders(item, `${path}[${i}]`)
      );
    } else if (obj && typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        checkPlaceholders(value, `${path}.${key}`);
      }
    }
  }
  checkPlaceholders(content, "generatedContent");

  // Maatregelen should not be too short
  risicos.forEach((r, i) => {
    r.maatregelen?.forEach((m, mi) => {
      if (m.maatregel && m.maatregel.length < 10) {
        issues.push({
          severity: "warning",
          category: "content",
          message: `Maatregel is te kort (${m.maatregel.length} chars): "${m.maatregel}"`,
          location: `generatedContent.risicos[${i}].maatregelen[${mi}]`,
        });
      }
    });
  });

  // Check deadlines are not in the past
  const now = new Date();
  pva.forEach((item, i) => {
    const deadline = item.deadline || item.termijn;
    if (deadline) {
      // Try to parse common date formats
      const dateMatch = deadline.match(
        /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/
      );
      if (dateMatch) {
        const parsed = new Date(
          `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`
        );
        if (!isNaN(parsed.getTime()) && parsed < now) {
          issues.push({
            severity: "info",
            category: "content",
            message: `PvA deadline "${deadline}" ligt in het verleden`,
            location: `generatedContent.planVanAanpak[${i}].deadline`,
          });
        }
      }
    }
  });

  // ─── 5. FORMATTING CHECKS ───

  // Check for extremely long text fields
  risicos.forEach((r, i) => {
    if (r.beschrijving && r.beschrijving.length > 1000) {
      issues.push({
        severity: "info",
        category: "formatting",
        message: `Risicobeschrijving is erg lang (${r.beschrijving.length} chars), kan PDF layout verstoren`,
        location: `generatedContent.risicos[${i}].beschrijving`,
      });
    }
  });

  // Risk scores should be numbers
  risicos.forEach((r, i) => {
    if (
      r.risicoScore !== undefined &&
      (typeof r.risicoScore !== "number" || isNaN(r.risicoScore))
    ) {
      issues.push({
        severity: "error",
        category: "formatting",
        message: `Risicoscore is geen geldig getal: ${r.risicoScore}`,
        location: `generatedContent.risicos[${i}].risicoScore`,
      });
    }
  });

  return issues;
}

/**
 * Separate issues by severity for use in API responses.
 */
export function categorizeIssues(issues: QaIssue[]) {
  return {
    errors: issues.filter((i) => i.severity === "error"),
    warnings: issues.filter((i) => i.severity === "warning"),
    info: issues.filter((i) => i.severity === "info"),
    hasErrors: issues.some((i) => i.severity === "error"),
    hasWarnings: issues.some((i) => i.severity === "warning"),
    total: issues.length,
  };
}
