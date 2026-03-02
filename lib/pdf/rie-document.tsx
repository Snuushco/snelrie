import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// ═══════════════════════════════════════════════════════════════
// Branding
// ═══════════════════════════════════════════════════════════════

export type BrandingConfig = {
  primaryColor: string;
  primaryDark: string;
  primaryLight: string;
  primaryBg: string;
  companyName: string;
  logoUrl?: string;
  footerText: string;
  showSnelRIE: boolean;
};

const BRAND = {
  50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd",
  400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8",
  800: "#1e40af", 900: "#1e3a8a",
};

const GRAY = {
  50: "#f9fafb", 100: "#f3f4f6", 200: "#e5e7eb", 300: "#d1d5db",
  400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151",
  800: "#1f2937", 900: "#111827",
};

// Risk score colors
const SCORE_COLORS = {
  red:    { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", text: "#991b1b" },
  orange: { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa", text: "#9a3412" },
  yellow: { bg: "#fefce8", color: "#ca8a04", border: "#fde68a", text: "#854d0e" },
  green:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", text: "#166534" },
};

function getScoreColor(score: number) {
  if (score >= 18) return SCORE_COLORS.red;
  if (score >= 12) return SCORE_COLORS.orange;
  if (score >= 6) return SCORE_COLORS.yellow;
  return SCORE_COLORS.green;
}

const SNELRIE_BRANDING: BrandingConfig = {
  primaryColor: BRAND[600], primaryDark: BRAND[900],
  primaryLight: BRAND[100], primaryBg: BRAND[50],
  companyName: "SnelRIE", footerText: "Gegenereerd door SnelRIE — snelrie.nl",
  showSnelRIE: true,
};

export function getBranding(tier?: string, opts?: {
  logoUrl?: string; primaryColor?: string; companyName?: string;
}): BrandingConfig {
  if (tier?.toUpperCase() === "ENTERPRISE" && opts?.companyName) {
    const p = opts.primaryColor || BRAND[600];
    return {
      primaryColor: p, primaryDark: darken(p, 0.35),
      primaryLight: lighten(p, 0.85), primaryBg: lighten(p, 0.93),
      companyName: opts.companyName, logoUrl: opts.logoUrl,
      footerText: `© ${new Date().getFullYear()} ${opts.companyName}`,
      showSnelRIE: false,
    };
  }
  return { ...SNELRIE_BRANDING };
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(Math.round(r * (1 - amount)), Math.round(g * (1 - amount)), Math.round(b * (1 - amount)));
}
function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(Math.round(r + (255 - r) * amount), Math.round(g + (255 - g) * amount), Math.round(b + (255 - b) * amount));
}
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

// ═══════════════════════════════════════════════════════════════
// Priority config
// ═══════════════════════════════════════════════════════════════

const prioriteitConfig: Record<string, { bg: string; color: string; border: string; label: string }> = {
  hoog:   { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca", label: "HOOG" },
  midden: { bg: "#fefce8", color: "#a16207", border: "#fde68a", label: "MIDDEN" },
  laag:   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", label: "LAAG" },
};

const statusConfig: Record<string, { symbol: string; color: string }> = {
  voldoet:        { symbol: "✓", color: "#16a34a" },
  aandachtspunt:  { symbol: "!", color: "#ea580c" },
  niet_in_orde:   { symbol: "✗", color: "#dc2626" },
};

// ═══════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════

function createStyles(b: BrandingConfig) {
  return StyleSheet.create({
    page: {
      paddingTop: 56, paddingBottom: 60, paddingHorizontal: 48,
      fontSize: 9, fontFamily: "Helvetica", color: GRAY[900],
      backgroundColor: "#ffffff", lineHeight: 1.5,
    },
    // Cover page
    coverPage: {
      paddingTop: 0, paddingBottom: 0, paddingHorizontal: 0,
      fontFamily: "Helvetica", color: GRAY[900], backgroundColor: "#ffffff",
    },
    coverTop: {
      backgroundColor: b.primaryDark, height: 280,
      justifyContent: "center", alignItems: "center", paddingHorizontal: 60,
    },
    coverTitle: {
      fontSize: 32, fontFamily: "Helvetica-Bold", color: "#ffffff",
      textAlign: "center", marginBottom: 8,
    },
    coverSubtitle: {
      fontSize: 14, color: b.primaryLight, textAlign: "center", marginBottom: 24,
    },
    coverDivider: {
      width: 60, height: 3, backgroundColor: b.primaryColor, marginBottom: 24,
    },
    coverCompany: {
      fontSize: 20, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "center",
    },
    coverBody: {
      padding: 60, flex: 1, justifyContent: "space-between",
    },
    coverMeta: { marginBottom: 24 },
    coverMetaRow: { flexDirection: "row", marginBottom: 8 },
    coverMetaLabel: { width: 140, fontSize: 10, color: GRAY[500], fontFamily: "Helvetica-Bold" },
    coverMetaValue: { fontSize: 10, color: GRAY[900], flex: 1 },
    coverFooter: {
      borderTopWidth: 1, borderTopColor: GRAY[200], paddingTop: 12,
    },
    coverFooterText: { fontSize: 8, color: GRAY[400], textAlign: "center" },

    // Header
    header: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingBottom: 10, marginBottom: 20, borderBottomWidth: 2, borderBottomColor: b.primaryColor,
    },
    logoText: { fontSize: 18, fontFamily: "Helvetica-Bold", color: b.primaryDark, letterSpacing: -0.5 },
    logoAccent: { color: b.primaryColor },
    logoImage: { height: 28, maxWidth: 120 },
    headerRight: { textAlign: "right" },
    headerCompany: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GRAY[900] },
    headerDate: { fontSize: 7, color: GRAY[500], marginTop: 2 },

    // Titles
    pageTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", color: GRAY[900], marginBottom: 4 },
    pageSubtitle: { fontSize: 9, color: GRAY[500], marginBottom: 20 },
    sectionTitle: {
      fontSize: 12, fontFamily: "Helvetica-Bold", color: GRAY[900],
      marginTop: 20, marginBottom: 10, paddingBottom: 4,
      borderBottomWidth: 1, borderBottomColor: GRAY[200],
    },
    subsectionTitle: {
      fontSize: 10, fontFamily: "Helvetica-Bold", color: GRAY[800], marginTop: 10, marginBottom: 6,
    },

    // Info box
    infoBox: {
      backgroundColor: b.primaryBg, borderLeftWidth: 3, borderLeftColor: b.primaryColor,
      borderRadius: 6, padding: 12, marginBottom: 14,
    },
    infoText: { fontSize: 8.5, color: GRAY[700], lineHeight: 1.6 },

    // Profile
    profileCard: {
      backgroundColor: GRAY[50], borderRadius: 6, borderWidth: 1,
      borderColor: GRAY[200], padding: 12, marginBottom: 14,
    },
    profileRow: { flexDirection: "row", marginBottom: 4 },
    profileLabel: { width: 130, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: GRAY[500] },
    profileValue: { fontSize: 8.5, color: GRAY[900], flex: 1 },

    // Risk card
    riskCard: {
      borderWidth: 1, borderColor: GRAY[200], borderRadius: 6,
      padding: 12, marginBottom: 10, backgroundColor: "#ffffff",
    },
    riskHeader: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6,
    },
    riskTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: GRAY[900], flex: 1, marginRight: 8 },
    riskDesc: { fontSize: 8.5, color: GRAY[600], marginBottom: 6, lineHeight: 1.5 },
    riskMeta: {
      flexDirection: "row", flexWrap: "wrap", marginBottom: 6, gap: 4,
    },
    riskMetaItem: {
      fontSize: 7.5, color: GRAY[500], backgroundColor: GRAY[50],
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    },
    riskLegal: { fontSize: 7.5, color: GRAY[500], marginBottom: 6, fontStyle: "italic" },

    // Badge
    badge: {
      paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
      fontSize: 6.5, fontFamily: "Helvetica-Bold", borderWidth: 1,
    },
    scoreBadge: {
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
      fontSize: 7, fontFamily: "Helvetica-Bold", marginRight: 6,
    },

    // Measures
    measureSection: { marginTop: 4 },
    measureLabel: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: GRAY[800], marginBottom: 3 },
    measureRow: { flexDirection: "row", marginBottom: 3, paddingLeft: 4 },
    measureBullet: { fontSize: 8.5, color: b.primaryColor, marginRight: 5, fontFamily: "Helvetica-Bold", width: 8 },
    dangerBullet: { fontSize: 8.5, color: "#dc2626", marginRight: 5, width: 8 },
    measureText: { fontSize: 8, color: GRAY[700], flex: 1, lineHeight: 1.45 },

    // Tables — fixed column widths prevent overflow
    table: { marginBottom: 14 },
    tableHeader: {
      flexDirection: "row", backgroundColor: GRAY[100],
      paddingVertical: 6, paddingHorizontal: 5,
      borderBottomWidth: 1, borderBottomColor: GRAY[200],
      borderTopLeftRadius: 6, borderTopRightRadius: 6,
    },
    tableRow: {
      flexDirection: "row", paddingVertical: 5, paddingHorizontal: 5,
      borderBottomWidth: 1, borderBottomColor: GRAY[100],
    },
    tableRowAlt: { backgroundColor: GRAY[50] },
    th: { fontSize: 7, fontFamily: "Helvetica-Bold", color: GRAY[500], textTransform: "uppercase" as const, letterSpacing: 0.3 },
    td: { fontSize: 7.5, color: GRAY[900], lineHeight: 1.35 },

    // Footer
    footer: {
      position: "absolute", bottom: 24, left: 48, right: 48,
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      borderTopWidth: 1, borderTopColor: GRAY[200], paddingTop: 6,
    },
    footerText: { fontSize: 6.5, color: GRAY[400] },
    pageNum: { fontSize: 6.5, color: GRAY[400] },

    // Disclaimer
    disclaimerBox: {
      backgroundColor: GRAY[50], borderWidth: 1, borderColor: GRAY[200],
      borderRadius: 6, padding: 12, marginTop: 20,
    },
    disclaimerTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: GRAY[700], marginBottom: 4 },
    disclaimerText: { fontSize: 7.5, color: GRAY[500], lineHeight: 1.55 },

    // TOC
    tocRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: GRAY[100] },
    tocText: { fontSize: 10, color: GRAY[800] },
    tocPage: { fontSize: 10, color: GRAY[500] },

    // Arbo
    arboCard: {
      backgroundColor: GRAY[50], borderRadius: 6, borderWidth: 1,
      borderColor: GRAY[200], padding: 10, marginBottom: 8,
    },
    arboLabel: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: GRAY[800], marginBottom: 2 },
    arboValue: { fontSize: 8, color: GRAY[600], lineHeight: 1.5 },
    arboStatus: { fontSize: 8, fontFamily: "Helvetica-Bold", marginRight: 4 },

    // Tier badge on cover
    tierBadge: {
      paddingHorizontal: 16, paddingVertical: 6, borderRadius: 4,
      marginTop: 16, alignSelf: "center" as const,
    },
    tierBadgeText: {
      fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: 2,
      textTransform: "uppercase" as const,
    },

    // Management dashboard
    dashboardContainer: {
      backgroundColor: GRAY[50], borderRadius: 8, borderWidth: 1,
      borderColor: GRAY[200], padding: 16, marginBottom: 16,
    },
    dashboardTitle: {
      fontSize: 11, fontFamily: "Helvetica-Bold", color: GRAY[900],
      marginBottom: 12, textAlign: "center" as const,
    },
    dashboardRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 8 },
    dashboardMetric: {
      flex: 1, alignItems: "center" as const, paddingVertical: 8,
      backgroundColor: "#ffffff", borderRadius: 6, borderWidth: 1,
      borderColor: GRAY[200], marginHorizontal: 3,
    },
    dashboardMetricValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: b.primaryColor },
    dashboardMetricLabel: { fontSize: 7, color: GRAY[500], marginTop: 2 },

    // PvA cards (Professional+)
    pvaCard: {
      borderWidth: 1, borderColor: GRAY[200], borderRadius: 6,
      padding: 12, marginBottom: 10, backgroundColor: "#ffffff",
    },
    pvaCardHeader: {
      flexDirection: "row" as const, justifyContent: "space-between" as const,
      alignItems: "center" as const, marginBottom: 6,
    },
    pvaCardTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: GRAY[900], flex: 1, marginRight: 8 },
    pvaCardRisk: {
      fontSize: 8, color: GRAY[500], backgroundColor: GRAY[50],
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
      marginBottom: 6, fontStyle: "italic" as const,
    },
    pvaCardMeta: {
      flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 6, marginTop: 4,
    },
    pvaCardMetaItem: { fontSize: 7.5, color: GRAY[600] },
    pvaCardMetaLabel: { fontFamily: "Helvetica-Bold", color: GRAY[500] },

    // Budget summary (Enterprise)
    budgetBox: {
      backgroundColor: b.primaryBg, borderWidth: 1, borderColor: b.primaryColor,
      borderRadius: 6, padding: 12, marginBottom: 16,
    },
    budgetTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: b.primaryDark, marginBottom: 8 },
    budgetRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 3 },
    budgetLabel: { fontSize: 8, color: GRAY[700] },
    budgetValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GRAY[900] },
    budgetTotal: {
      flexDirection: "row" as const, justifyContent: "space-between" as const,
      borderTopWidth: 1, borderTopColor: b.primaryColor, paddingTop: 6, marginTop: 6,
    },
    budgetTotalLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: b.primaryDark },
    budgetTotalValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: b.primaryDark },
  });
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type RieData = {
  bedrijfsnaam: string;
  branche: string;
  aantalMedewerkers: number;
  aantalLocaties: number;
  tier?: string;
  generatedContent: {
    samenvatting?: string;
    bedrijfsprofiel?: {
      beschrijving?: string;
      organisatiestructuur?: string;
      typeWerkzaamheden?: string[];
      werktijden?: string;
      bijzonderheden?: string[];
    };
    arbobeleid?: {
      preventiemedewerker?: { aanwezig?: boolean; toelichting?: string };
      bhvOrganisatie?: { aanwezig?: boolean; aantalBhvers?: number; toelichting?: string };
      arbodienst?: { contractvorm?: string; toelichting?: string };
      eerderRie?: { uitgevoerd?: boolean; toelichting?: string };
      arbocatalogus?: string;
      ondernemingsraad?: { aanwezig?: boolean; toelichting?: string };
    };
    risicos?: Array<{
      categorie: string;
      prioriteit: string;
      beschrijving?: string;
      wieBlootgesteld?: string;
      frequentie?: string;
      ernst?: string;
      kans?: number;
      effect?: number;
      wettelijkKader?: string;
      risicoScore?: number;
      huidigeBeheersing?: string;
      gevaren?: string[];
      maatregelen?: Array<{
        maatregel: string;
        type?: string;
        prioriteit?: string;
        verantwoordelijke?: string;
        deadline?: string;
        kostenindicatie?: string;
        termijn?: string;
        kosten?: string;
      }>;
    }>;
    planVanAanpak?: Array<{
      nummer?: number;
      gekoppeldRisico?: string;
      risicoBeschrijving?: string;
      maatregel: string;
      typeMaatregel?: string;
      risico?: string;
      prioriteit: string;
      verantwoordelijke?: string;
      deadline?: string;
      kostenindicatie?: string;
      termijn?: string;
      kosten?: string;
      status?: string;
    }>;
    wettelijkeVerplichtingen?: Array<{
      verplichting: string;
      wet: string;
      status: string;
      toelichting?: string;
    }>;
    aanbevelingen?: {
      conclusie?: string;
      topPrioriteiten?: Array<{
        nummer?: number;
        titel: string;
        beschrijving: string;
        verwachteImpact?: string;
      }>;
      aanbevelingToetsing?: string;
      aanbevelingActualisatie?: string;
      implementatiepad?: Array<{
        fase: string;
        acties: string[];
        doel?: string;
      }>;
    };
  };
  datum: string;
  whiteLabel?: { logoUrl?: string; primaryColor?: string; companyName?: string };
};

// ═══════════════════════════════════════════════════════════════
// Helper: truncate text to prevent overflow
// ═══════════════════════════════════════════════════════════════
function truncate(text: string | undefined | null, maxLen: number): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

// ═══════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════

function Badge({ prioriteit, s }: { prioriteit: string; s: ReturnType<typeof createStyles> }) {
  const config = prioriteitConfig[prioriteit?.toLowerCase()] || prioriteitConfig.laag;
  return (
    <Text style={[s.badge, { backgroundColor: config.bg, color: config.color, borderColor: config.border }]}>
      {config.label}
    </Text>
  );
}

function ScoreBadge({ score, s }: { score: number; s: ReturnType<typeof createStyles> }) {
  const colors = getScoreColor(score);
  return (
    <Text style={[s.scoreBadge, { backgroundColor: colors.bg, color: colors.text, borderWidth: 1, borderColor: colors.border }]}>
      {score}/25
    </Text>
  );
}

function Header({ data, brand, s }: { data: RieData; brand: BrandingConfig; s: ReturnType<typeof createStyles> }) {
  return (
    <View style={s.header} fixed>
      <View>
        {brand.logoUrl ? (
          <Image src={brand.logoUrl} style={s.logoImage} />
        ) : brand.showSnelRIE ? (
          <Text style={s.logoText}>Snel<Text style={s.logoAccent}>RIE</Text></Text>
        ) : (
          <Text style={s.logoText}>{brand.companyName}</Text>
        )}
      </View>
      <View style={s.headerRight}>
        <Text style={s.headerCompany}>{data.bedrijfsnaam}</Text>
        <Text style={s.headerDate}>{data.datum}</Text>
      </View>
    </View>
  );
}

function Footer({ brand, s }: { brand: BrandingConfig; s: ReturnType<typeof createStyles> }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>{brand.footerText}</Text>
      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Document
// ═══════════════════════════════════════════════════════════════

export function RieDocument({ data, branding }: { data: RieData; branding?: BrandingConfig }) {
  const brand = branding || (
    data.tier?.toUpperCase() === "ENTERPRISE" && data.whiteLabel?.companyName
      ? getBranding("ENTERPRISE", data.whiteLabel)
      : SNELRIE_BRANDING
  );
  const s = createStyles(brand);
  const content = data.generatedContent;
  const risicos = content.risicos || [];
  const pva = content.planVanAanpak || [];
  const wettelijk = content.wettelijkeVerplichtingen || [];
  const arbo = content.arbobeleid;
  const aanbevelingen = content.aanbevelingen;

  const docAuthor = brand.showSnelRIE ? "SnelRIE" : brand.companyName;

  // Section numbering
  let sectionNum = 0;
  const nextSection = () => ++sectionNum;

  // Count priorities
  const hoogCount = risicos.filter(r => r.prioriteit === "hoog").length;
  const middenCount = risicos.filter(r => r.prioriteit === "midden").length;
  const laagCount = risicos.filter(r => r.prioriteit === "laag").length;

  // Tier logic
  const tierUpper = (data.tier || "BASIS").toUpperCase();
  const isProfessional = tierUpper === "PROFESSIONAL" || tierUpper === "ENTERPRISE";
  const isEnterprise = tierUpper === "ENTERPRISE";
  const tierLabel = tierUpper === "PROFESSIONAL" ? "PROFESSIONAL" : tierUpper === "ENTERPRISE" ? "ENTERPRISE" : tierUpper === "BASIS" ? "BASIS" : null;
  const tierBadgeColors = isEnterprise
    ? { bg: brand.primaryDark, border: brand.primaryColor, text: "#ffffff" }
    : tierUpper === "PROFESSIONAL"
    ? { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" }
    : { bg: GRAY[100], border: GRAY[300], text: GRAY[600] };

  // Avg risk score
  const avgScore = risicos.length > 0 ? Math.round(risicos.reduce((a, r) => a + (r.risicoScore || 0), 0) / risicos.length) : 0;

  // Budget helper for Enterprise
  function parseCostRange(kosten: string | undefined): [number, number] {
    if (!kosten) return [0, 0];
    const matches = kosten.match(/€?\s*([\d.,]+)/g);
    if (!matches) return [0, 0];
    const nums = matches.map(m => parseInt(m.replace(/[€.\s]/g, "").replace(",", ""), 10) || 0);
    return nums.length >= 2 ? [nums[0], nums[1]] : [nums[0], nums[0]];
  }
  const budgetItems = pva.map(item => {
    const [lo, hi] = parseCostRange(item.kostenindicatie || item.kosten);
    return { prio: item.prioriteit, lo, hi };
  });
  const totalBudgetLo = budgetItems.reduce((a, b) => a + b.lo, 0);
  const totalBudgetHi = budgetItems.reduce((a, b) => a + b.hi, 0);
  const hoogBudgetHi = budgetItems.filter(b => b.prio === "hoog").reduce((a, b) => a + b.hi, 0);
  const middenBudgetHi = budgetItems.filter(b => b.prio === "midden").reduce((a, b) => a + b.hi, 0);
  const laagBudgetHi = budgetItems.filter(b => b.prio === "laag").reduce((a, b) => a + b.hi, 0);

  return (
    <Document
      title={`RI&E — ${data.bedrijfsnaam}`}
      author={docAuthor}
      subject="Risico-Inventarisatie & Evaluatie"
      creator={brand.showSnelRIE ? "SnelRIE — snelrie.nl" : brand.companyName}
    >
      {/* ═══ VOORBLAD ═══ */}
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverTop}>
          {brand.logoUrl ? (
            <Image src={brand.logoUrl} style={{ height: 40, maxWidth: 200, marginBottom: 20 }} />
          ) : brand.showSnelRIE ? (
            <Text style={[s.coverTitle, { fontSize: 24, marginBottom: 20 }]}>
              Snel<Text style={{ color: brand.primaryLight }}>RIE</Text>
            </Text>
          ) : null}
          <Text style={s.coverTitle}>Risico-Inventarisatie{"\n"}& Evaluatie</Text>
          <View style={s.coverDivider} />
          <Text style={s.coverCompany}>{data.bedrijfsnaam}</Text>
          <Text style={[s.coverSubtitle, { marginTop: 8 }]}>{data.branche}</Text>
          {/* Tier badge */}
          {tierLabel && (
            <View style={[s.tierBadge, { backgroundColor: tierBadgeColors.bg, borderWidth: 1, borderColor: tierBadgeColors.border }]}>
              <Text style={[s.tierBadgeText, { color: tierBadgeColors.text }]}>{tierLabel}</Text>
            </View>
          )}
        </View>
        <View style={s.coverBody}>
          <View style={s.coverMeta}>
            <View style={s.coverMetaRow}>
              <Text style={s.coverMetaLabel}>Datum</Text>
              <Text style={s.coverMetaValue}>{data.datum}</Text>
            </View>
            <View style={s.coverMetaRow}>
              <Text style={s.coverMetaLabel}>Aantal medewerkers</Text>
              <Text style={s.coverMetaValue}>{data.aantalMedewerkers}</Text>
            </View>
            <View style={s.coverMetaRow}>
              <Text style={s.coverMetaLabel}>Aantal locaties</Text>
              <Text style={s.coverMetaValue}>{data.aantalLocaties}</Text>
            </View>
            <View style={s.coverMetaRow}>
              <Text style={s.coverMetaLabel}>Opgesteld door</Text>
              <Text style={s.coverMetaValue}>{brand.showSnelRIE ? "SnelRIE (AI-gestuurde RI&E)" : brand.companyName}</Text>
            </View>
            <View style={s.coverMetaRow}>
              <Text style={s.coverMetaLabel}>Aantal risico{"'"}s</Text>
              <Text style={s.coverMetaValue}>{risicos.length} geïdentificeerd</Text>
            </View>
          </View>
          <View style={s.coverFooter}>
            <Text style={s.coverFooterText}>{brand.footerText}</Text>
            <Text style={[s.coverFooterText, { marginTop: 4 }]}>
              Versie 1.0 — Aanbevolen jaarlijks te actualiseren
            </Text>
          </View>
        </View>
      </Page>

      {/* ═══ INHOUDSOPGAVE ═══ */}
      <Page size="A4" style={s.page}>
        <Header data={data} brand={brand} s={s} />
        <Footer brand={brand} s={s} />
        <Text style={s.pageTitle}>Inhoudsopgave</Text>
        <View style={{ marginTop: 16 }}>
          {[
            "Samenvatting",
            "Bedrijfsbeschrijving",
            ...(arbo ? ["Arbobeleid & Organisatie"] : []),
            "Risico-inventarisatie — Overzicht",
            "Risico-inventarisatie — Detail",
            ...(pva.length > 0 ? ["Plan van Aanpak"] : []),
            ...(wettelijk.length > 0 ? ["Wettelijke Verplichtingen"] : []),
            ...(aanbevelingen ? ["Aanbevelingen & Conclusie"] : []),
            "Disclaimer",
          ].map((title, i) => (
            <View key={i} style={s.tocRow}>
              <Text style={s.tocText}>{i + 1}. {title}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* ═══ SAMENVATTING + BEDRIJFSPROFIEL ═══ */}
      <Page size="A4" style={s.page}>
        <Header data={data} brand={brand} s={s} />
        <Footer brand={brand} s={s} />

        <Text style={s.sectionTitle}>{nextSection()}. Samenvatting</Text>
        <View style={s.infoBox}>
          <Text style={s.infoText}>{content.samenvatting || "Geen samenvatting beschikbaar."}</Text>
        </View>

        <Text style={[s.infoText, { marginBottom: 12, color: GRAY[500] }]}>
          Er zijn {risicos.length} risico{"'"}s geïdentificeerd: {hoogCount} hoog, {middenCount} midden, {laagCount} laag prioriteit.
        </Text>

        {/* Management Dashboard (Professional+) */}
        {isProfessional && (
          <View style={s.dashboardContainer}>
            <Text style={s.dashboardTitle}>Management Samenvatting</Text>
            <View style={s.dashboardRow}>
              <View style={s.dashboardMetric}>
                <Text style={s.dashboardMetricValue}>{risicos.length}</Text>
                <Text style={s.dashboardMetricLabel}>Risico{"'"}s totaal</Text>
              </View>
              <View style={s.dashboardMetric}>
                <Text style={[s.dashboardMetricValue, { color: "#dc2626" }]}>{hoogCount}</Text>
                <Text style={s.dashboardMetricLabel}>Hoog prioriteit</Text>
              </View>
              <View style={s.dashboardMetric}>
                <Text style={[s.dashboardMetricValue, { color: "#ea580c" }]}>{middenCount}</Text>
                <Text style={s.dashboardMetricLabel}>Midden prioriteit</Text>
              </View>
              <View style={s.dashboardMetric}>
                <Text style={[s.dashboardMetricValue, { color: "#16a34a" }]}>{laagCount}</Text>
                <Text style={s.dashboardMetricLabel}>Laag prioriteit</Text>
              </View>
            </View>
            <View style={s.dashboardRow}>
              <View style={s.dashboardMetric}>
                <Text style={s.dashboardMetricValue}>{avgScore}</Text>
                <Text style={s.dashboardMetricLabel}>Gem. risicoscore</Text>
              </View>
              <View style={s.dashboardMetric}>
                <Text style={s.dashboardMetricValue}>{pva.length}</Text>
                <Text style={s.dashboardMetricLabel}>Actiepunten PvA</Text>
              </View>
              {isEnterprise && (
                <View style={s.dashboardMetric}>
                  <Text style={[s.dashboardMetricValue, { fontSize: 14 }]}>€{totalBudgetLo.toLocaleString("nl-NL")}–{totalBudgetHi.toLocaleString("nl-NL")}</Text>
                  <Text style={s.dashboardMetricLabel}>Geschat budget</Text>
                </View>
              )}
              {!isEnterprise && (
                <View style={s.dashboardMetric}>
                  <Text style={s.dashboardMetricValue}>{wettelijk.length || "—"}</Text>
                  <Text style={s.dashboardMetricLabel}>Wettelijke checks</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <Text style={s.sectionTitle}>{nextSection()}. Bedrijfsbeschrijving</Text>
        <View style={s.profileCard}>
          <View style={s.profileRow}>
            <Text style={s.profileLabel}>Bedrijfsnaam</Text>
            <Text style={s.profileValue}>{data.bedrijfsnaam}</Text>
          </View>
          <View style={s.profileRow}>
            <Text style={s.profileLabel}>Branche</Text>
            <Text style={s.profileValue}>{data.branche}</Text>
          </View>
          <View style={s.profileRow}>
            <Text style={s.profileLabel}>Aantal medewerkers</Text>
            <Text style={s.profileValue}>{data.aantalMedewerkers}</Text>
          </View>
          <View style={s.profileRow}>
            <Text style={s.profileLabel}>Aantal locaties</Text>
            <Text style={s.profileValue}>{data.aantalLocaties}</Text>
          </View>
          {content.bedrijfsprofiel?.werktijden && (
            <View style={s.profileRow}>
              <Text style={s.profileLabel}>Werktijden</Text>
              <Text style={s.profileValue}>{content.bedrijfsprofiel.werktijden}</Text>
            </View>
          )}
        </View>

        {content.bedrijfsprofiel?.beschrijving && (
          <View style={s.infoBox}>
            <Text style={s.infoText}>{content.bedrijfsprofiel.beschrijving}</Text>
          </View>
        )}

        {content.bedrijfsprofiel?.typeWerkzaamheden && content.bedrijfsprofiel.typeWerkzaamheden.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <Text style={s.subsectionTitle}>Type werkzaamheden</Text>
            {content.bedrijfsprofiel.typeWerkzaamheden.map((w, i) => (
              <View key={i} style={{ flexDirection: "row", marginBottom: 2, paddingLeft: 4 }}>
                <Text style={{ fontSize: 8, color: BRAND[600], marginRight: 5 }}>•</Text>
                <Text style={{ fontSize: 8, color: GRAY[700] }}>{w}</Text>
              </View>
            ))}
          </View>
        )}

        {content.bedrijfsprofiel?.bijzonderheden && content.bedrijfsprofiel.bijzonderheden.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <Text style={s.subsectionTitle}>Bijzonderheden</Text>
            {content.bedrijfsprofiel.bijzonderheden.map((b, i) => (
              <View key={i} style={{ flexDirection: "row", marginBottom: 2, paddingLeft: 4 }}>
                <Text style={{ fontSize: 8, color: "#ea580c", marginRight: 5 }}>!</Text>
                <Text style={{ fontSize: 8, color: GRAY[700] }}>{b}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>

      {/* ═══ ARBOBELEID & ORGANISATIE ═══ */}
      {arbo && (
        <Page size="A4" style={s.page}>
          <Header data={data} brand={brand} s={s} />
          <Footer brand={brand} s={s} />

          <Text style={s.sectionTitle}>{nextSection()}. Arbobeleid & Organisatie</Text>

          {arbo.preventiemedewerker && (
            <View style={s.arboCard} wrap={false}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={[s.arboStatus, { color: arbo.preventiemedewerker.aanwezig ? "#16a34a" : "#dc2626" }]}>
                  {arbo.preventiemedewerker.aanwezig ? "✓" : "✗"}
                </Text>
                <Text style={s.arboLabel}>Preventiemedewerker</Text>
              </View>
              <Text style={s.arboValue}>{arbo.preventiemedewerker.toelichting}</Text>
            </View>
          )}

          {arbo.bhvOrganisatie && (
            <View style={s.arboCard} wrap={false}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={[s.arboStatus, { color: arbo.bhvOrganisatie.aanwezig ? "#16a34a" : "#dc2626" }]}>
                  {arbo.bhvOrganisatie.aanwezig ? "✓" : "✗"}
                </Text>
                <Text style={s.arboLabel}>BHV-organisatie ({arbo.bhvOrganisatie.aantalBhvers || 0} BHV{"'"}ers)</Text>
              </View>
              <Text style={s.arboValue}>{arbo.bhvOrganisatie.toelichting}</Text>
            </View>
          )}

          {arbo.arbodienst && (
            <View style={s.arboCard} wrap={false}>
              <Text style={s.arboLabel}>Arbodienst / Bedrijfsarts</Text>
              <Text style={s.arboValue}>{arbo.arbodienst.contractvorm}</Text>
              {arbo.arbodienst.toelichting && <Text style={[s.arboValue, { marginTop: 2 }]}>{arbo.arbodienst.toelichting}</Text>}
            </View>
          )}

          {arbo.eerderRie && (
            <View style={s.arboCard} wrap={false}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={[s.arboStatus, { color: arbo.eerderRie.uitgevoerd ? "#16a34a" : "#ea580c" }]}>
                  {arbo.eerderRie.uitgevoerd ? "✓" : "!"}
                </Text>
                <Text style={s.arboLabel}>Eerdere RI&E</Text>
              </View>
              <Text style={s.arboValue}>{arbo.eerderRie.toelichting}</Text>
            </View>
          )}

          {arbo.ondernemingsraad && (
            <View style={s.arboCard} wrap={false}>
              <Text style={s.arboLabel}>Ondernemingsraad / PVT</Text>
              <Text style={s.arboValue}>{arbo.ondernemingsraad.toelichting}</Text>
            </View>
          )}

          {arbo.arbocatalogus && (
            <View style={s.arboCard} wrap={false}>
              <Text style={s.arboLabel}>Arbocatalogus</Text>
              <Text style={s.arboValue}>{arbo.arbocatalogus}</Text>
            </View>
          )}
        </Page>
      )}

      {/* ═══ RISICO-INVENTARISATIE OVERZICHT ═══ */}
      <Page size="A4" style={s.page}>
        <Header data={data} brand={brand} s={s} />
        <Footer brand={brand} s={s} />

        <Text style={s.sectionTitle}>{nextSection()}. Risico-inventarisatie — Overzicht</Text>

        <Text style={[s.infoText, { marginBottom: 12 }]}>
          Totaal {risicos.length} risico{"'"}s: {hoogCount} hoog prioriteit, {middenCount} midden, {laagCount} laag.
          Risicoscore = kans × effect (schaal 1-25).
        </Text>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.th, { width: 18 }]}>#</Text>
            <Text style={[s.th, { flex: 1 }]}>Categorie</Text>
            <Text style={[s.th, { width: 42, textAlign: "center" }]}>Score</Text>
            <Text style={[s.th, { width: 55, textAlign: "center" }]}>Prioriteit</Text>
            <Text style={[s.th, { flex: 1 }]}>Huidige beheersing</Text>
          </View>
          {risicos.map((r, i) => (
            <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
              <Text style={[s.td, { width: 18, fontFamily: "Helvetica-Bold" }]}>{i + 1}</Text>
              <Text style={[s.td, { flex: 1 }]}>{truncate(r.categorie, 40)}</Text>
              <View style={{ width: 42, alignItems: "center", justifyContent: "center" }}>
                {r.risicoScore ? (
                  <ScoreBadge score={r.risicoScore} s={s} />
                ) : (
                  <Text style={[s.td, { textAlign: "center" }]}>—</Text>
                )}
              </View>
              <View style={{ width: 55, alignItems: "center", justifyContent: "center" }}>
                <Badge prioriteit={r.prioriteit} s={s} />
              </View>
              <Text style={[s.td, { flex: 1, color: GRAY[500] }]}>{truncate(r.huidigeBeheersing, 60) || "—"}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* ═══ RISICO-INVENTARISATIE DETAIL ═══ */}
      <Page size="A4" style={s.page}>
        <Header data={data} brand={brand} s={s} />
        <Footer brand={brand} s={s} />

        <Text style={s.sectionTitle}>{nextSection()}. Risico-inventarisatie — Detail</Text>

        {risicos.map((r, i) => (
          <View key={i} style={s.riskCard} wrap={false}>
            <View style={s.riskHeader}>
              <Text style={s.riskTitle}>{i + 1}. {r.categorie}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {r.risicoScore != null && <ScoreBadge score={r.risicoScore} s={s} />}
                <Badge prioriteit={r.prioriteit} s={s} />
              </View>
            </View>

            {r.beschrijving && <Text style={s.riskDesc}>{r.beschrijving}</Text>}

            {/* Meta info row */}
            <View style={s.riskMeta}>
              {r.wieBlootgesteld && <Text style={s.riskMetaItem}>Blootgesteld: {truncate(r.wieBlootgesteld, 50)}</Text>}
              {r.frequentie && <Text style={s.riskMetaItem}>Frequentie: {truncate(r.frequentie, 40)}</Text>}
              {r.ernst && <Text style={s.riskMetaItem}>Ernst: {truncate(r.ernst, 50)}</Text>}
            </View>

            {r.wettelijkKader && <Text style={s.riskLegal}>Wettelijk kader: {r.wettelijkKader}</Text>}

            {r.huidigeBeheersing && (
              <View style={{ marginBottom: 4 }}>
                <Text style={[s.measureLabel, { fontSize: 7.5 }]}>Huidige beheersing:</Text>
                <Text style={[s.riskDesc, { marginBottom: 0, fontSize: 8 }]}>{r.huidigeBeheersing}</Text>
              </View>
            )}

            {r.gevaren && r.gevaren.length > 0 && (
              <View style={s.measureSection}>
                <Text style={s.measureLabel}>Gevaren</Text>
                {r.gevaren.map((g, gi) => (
                  <View key={gi} style={s.measureRow}>
                    <Text style={s.dangerBullet}>•</Text>
                    <Text style={s.measureText}>{g}</Text>
                  </View>
                ))}
              </View>
            )}

            {r.maatregelen && r.maatregelen.length > 0 && (
              <View style={[s.measureSection, { marginTop: 6 }]}>
                <Text style={s.measureLabel}>Maatregelen</Text>
                {r.maatregelen.map((m, mi) => (
                  <View key={mi} style={[s.measureRow, { marginBottom: 4 }]}>
                    <Text style={s.measureBullet}>✓</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.measureText}>{m.maatregel}</Text>
                      <Text style={{ fontSize: 7, color: GRAY[400], marginTop: 1 }}>
                        {[
                          m.type && `Type: ${m.type}`,
                          (m.verantwoordelijke) && `Verantw: ${m.verantwoordelijke}`,
                          (m.deadline || m.termijn) && `Deadline: ${m.deadline || m.termijn}`,
                          (m.kostenindicatie || m.kosten) && `Kosten: ${m.kostenindicatie || m.kosten}`,
                        ].filter(Boolean).join(" · ")}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </Page>

      {/* ═══ PLAN VAN AANPAK ═══ */}
      {pva.length > 0 && (
        <Page size="A4" style={s.page}>
          <Header data={data} brand={brand} s={s} />
          <Footer brand={brand} s={s} />

          <Text style={s.sectionTitle}>{nextSection()}. Plan van Aanpak</Text>
          <Text style={[s.infoText, { marginBottom: 10 }]}>
            Het Plan van Aanpak bevat {pva.length} concrete actiepunten, gesorteerd op prioriteit.
            Conform Arbowet art. 5 lid 3 is het PvA een verplicht onderdeel van de RI&E.
          </Text>

          {/* Enterprise: Budget overview */}
          {isEnterprise && (
            <View style={s.budgetBox} wrap={false}>
              <Text style={s.budgetTitle}>Budgetoverzicht</Text>
              <View style={s.budgetRow}>
                <Text style={s.budgetLabel}>Hoge prioriteit ({pva.filter(p => p.prioriteit === "hoog").length} items)</Text>
                <Text style={s.budgetValue}>€{hoogBudgetHi.toLocaleString("nl-NL")}</Text>
              </View>
              <View style={s.budgetRow}>
                <Text style={s.budgetLabel}>Midden prioriteit ({pva.filter(p => p.prioriteit === "midden").length} items)</Text>
                <Text style={s.budgetValue}>€{middenBudgetHi.toLocaleString("nl-NL")}</Text>
              </View>
              <View style={s.budgetRow}>
                <Text style={s.budgetLabel}>Lage prioriteit ({pva.filter(p => p.prioriteit === "laag").length} items)</Text>
                <Text style={s.budgetValue}>€{laagBudgetHi.toLocaleString("nl-NL")}</Text>
              </View>
              <View style={s.budgetTotal}>
                <Text style={s.budgetTotalLabel}>Totaal geschat budget</Text>
                <Text style={s.budgetTotalValue}>€{totalBudgetLo.toLocaleString("nl-NL")} – €{totalBudgetHi.toLocaleString("nl-NL")}</Text>
              </View>
            </View>
          )}

          {/* Enterprise: Summary table + detailed cards below */}
          {isEnterprise && (
            <View style={s.table}>
              <View style={s.tableHeader}>
                <Text style={[s.th, { width: 16 }]}>#</Text>
                <Text style={[s.th, { flex: 2 }]}>Maatregel</Text>
                <Text style={[s.th, { width: 38, textAlign: "center" }]}>Prio</Text>
                <Text style={[s.th, { width: 55 }]}>Verantw.</Text>
                <Text style={[s.th, { width: 55 }]}>Deadline</Text>
                <Text style={[s.th, { width: 50 }]}>Kosten</Text>
              </View>
              {pva.map((item, i) => (
                <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
                  <Text style={[s.td, { width: 16, fontFamily: "Helvetica-Bold" }]}>{item.nummer || i + 1}</Text>
                  <Text style={[s.td, { flex: 2 }]}>{truncate(item.maatregel, 50)}</Text>
                  <View style={{ width: 38, alignItems: "center", justifyContent: "center" }}>
                    <Badge prioriteit={item.prioriteit} s={s} />
                  </View>
                  <Text style={[s.td, { width: 55 }]}>{truncate(item.verantwoordelijke, 14) || "—"}</Text>
                  <Text style={[s.td, { width: 55, color: GRAY[500] }]}>{truncate(item.deadline || item.termijn, 14) || "—"}</Text>
                  <Text style={[s.td, { width: 50, color: GRAY[500] }]}>{truncate(item.kostenindicatie || item.kosten, 12) || "—"}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Basis: compact table */}
          {!isProfessional && (
            <View style={s.table}>
              <View style={s.tableHeader}>
                <Text style={[s.th, { width: 16 }]}>#</Text>
                <Text style={[s.th, { flex: 2 }]}>Maatregel</Text>
                <Text style={[s.th, { width: 38, textAlign: "center" }]}>Prio</Text>
                <Text style={[s.th, { width: 55 }]}>Type</Text>
                <Text style={[s.th, { width: 55 }]}>Verantw.</Text>
                <Text style={[s.th, { width: 55 }]}>Deadline</Text>
                <Text style={[s.th, { width: 48 }]}>Status</Text>
              </View>
              {pva.map((item, i) => (
                <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
                  <Text style={[s.td, { width: 16, fontFamily: "Helvetica-Bold" }]}>{item.nummer || i + 1}</Text>
                  <Text style={[s.td, { flex: 2 }]}>{truncate(item.maatregel, 65)}</Text>
                  <View style={{ width: 38, alignItems: "center", justifyContent: "center" }}>
                    <Badge prioriteit={item.prioriteit} s={s} />
                  </View>
                  <Text style={[s.td, { width: 55, color: GRAY[500] }]}>{truncate(item.typeMaatregel, 14) || "—"}</Text>
                  <Text style={[s.td, { width: 55 }]}>{truncate(item.verantwoordelijke, 14) || "—"}</Text>
                  <Text style={[s.td, { width: 55, color: GRAY[500] }]}>{truncate(item.deadline || item.termijn, 14) || "—"}</Text>
                  <Text style={[s.td, { width: 48, fontSize: 6.5, color: GRAY[400] }]}>{truncate(item.status, 14) || "—"}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Professional + Enterprise: detailed cards */}
          {isProfessional && (
            <View>
              {isEnterprise && (
                <Text style={[s.subsectionTitle, { marginTop: 16, marginBottom: 10 }]}>Gedetailleerde actiepunten</Text>
              )}
              {pva.map((item, i) => (
                <View key={i} style={[s.pvaCard, { borderLeftWidth: 3, borderLeftColor: (prioriteitConfig[item.prioriteit?.toLowerCase()] || prioriteitConfig.laag).color }]} wrap={false}>
                  <View style={s.pvaCardHeader}>
                    <Text style={s.pvaCardTitle}>{item.nummer || i + 1}. {item.maatregel}</Text>
                    <Badge prioriteit={item.prioriteit} s={s} />
                  </View>
                  {(item.risicoBeschrijving || item.gekoppeldRisico) && (
                    <Text style={s.pvaCardRisk}>
                      Gekoppeld risico: {item.risicoBeschrijving || item.gekoppeldRisico}
                    </Text>
                  )}
                  <View style={s.pvaCardMeta}>
                    {item.typeMaatregel && (
                      <Text style={s.pvaCardMetaItem}><Text style={s.pvaCardMetaLabel}>Type: </Text>{item.typeMaatregel}</Text>
                    )}
                    {item.verantwoordelijke && (
                      <Text style={s.pvaCardMetaItem}><Text style={s.pvaCardMetaLabel}>Verantwoordelijke: </Text>{item.verantwoordelijke}</Text>
                    )}
                    {(item.deadline || item.termijn) && (
                      <Text style={s.pvaCardMetaItem}><Text style={s.pvaCardMetaLabel}>Deadline: </Text>{item.deadline || item.termijn}</Text>
                    )}
                    {(item.kostenindicatie || item.kosten) && (
                      <Text style={s.pvaCardMetaItem}><Text style={s.pvaCardMetaLabel}>Kosten: </Text>{item.kostenindicatie || item.kosten}</Text>
                    )}
                    {item.status && (
                      <Text style={s.pvaCardMetaItem}><Text style={s.pvaCardMetaLabel}>Status: </Text>{item.status}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </Page>
      )}

      {/* ═══ WETTELIJKE VERPLICHTINGEN ═══ */}
      {wettelijk.length > 0 && (
        <Page size="A4" style={s.page}>
          <Header data={data} brand={brand} s={s} />
          <Footer brand={brand} s={s} />

          <Text style={s.sectionTitle}>{nextSection()}. Wettelijke Verplichtingen</Text>

          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.th, { flex: 1 }]}>Verplichting</Text>
              <Text style={[s.th, { width: 85 }]}>Wet / Artikel</Text>
              <Text style={[s.th, { width: 55, textAlign: "center" }]}>Status</Text>
              <Text style={[s.th, { flex: 1 }]}>Toelichting</Text>
            </View>
            {wettelijk.map((w, i) => {
              const st = statusConfig[w.status] || statusConfig.aandachtspunt;
              return (
                <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]} wrap={false}>
                  <Text style={[s.td, { flex: 1, fontFamily: "Helvetica-Bold" }]}>{truncate(w.verplichting, 30)}</Text>
                  <Text style={[s.td, { width: 85, color: GRAY[500] }]}>{truncate(w.wet, 25)}</Text>
                  <View style={{ width: 55, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 9, color: st.color, marginRight: 3 }}>{st.symbol}</Text>
                    <Text style={[s.td, { fontSize: 6.5 }]}>{w.status}</Text>
                  </View>
                  <Text style={[s.td, { flex: 1 }]}>{truncate(w.toelichting, 80) || "—"}</Text>
                </View>
              );
            })}
          </View>
        </Page>
      )}

      {/* ═══ AANBEVELINGEN & CONCLUSIE ═══ */}
      {aanbevelingen && (
        <Page size="A4" style={s.page}>
          <Header data={data} brand={brand} s={s} />
          <Footer brand={brand} s={s} />

          <Text style={s.sectionTitle}>{nextSection()}. Aanbevelingen & Conclusie</Text>

          {aanbevelingen.conclusie && (
            <View style={s.infoBox}>
              <Text style={s.infoText}>{aanbevelingen.conclusie}</Text>
            </View>
          )}

          {aanbevelingen.topPrioriteiten && aanbevelingen.topPrioriteiten.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={s.subsectionTitle}>Top Prioriteiten</Text>
              {aanbevelingen.topPrioriteiten.map((tp, i) => (
                <View key={i} style={[s.arboCard, { borderLeftWidth: 3, borderLeftColor: "#dc2626" }]} wrap={false}>
                  <Text style={s.arboLabel}>{tp.nummer || i + 1}. {tp.titel}</Text>
                  <Text style={s.arboValue}>{tp.beschrijving}</Text>
                  {tp.verwachteImpact && (
                    <Text style={[s.arboValue, { marginTop: 2, fontStyle: "italic", color: GRAY[500] }]}>
                      Verwachte impact: {tp.verwachteImpact}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {aanbevelingen.aanbevelingToetsing && (
            <View style={[s.arboCard, { marginTop: 10 }]} wrap={false}>
              <Text style={s.arboLabel}>Toetsing</Text>
              <Text style={s.arboValue}>{aanbevelingen.aanbevelingToetsing}</Text>
            </View>
          )}

          {aanbevelingen.aanbevelingActualisatie && (
            <View style={s.arboCard} wrap={false}>
              <Text style={s.arboLabel}>Actualisatie</Text>
              <Text style={s.arboValue}>{aanbevelingen.aanbevelingActualisatie}</Text>
            </View>
          )}

          {/* Enterprise implementatiepad */}
          {aanbevelingen.implementatiepad && aanbevelingen.implementatiepad.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={s.subsectionTitle}>Implementatiepad</Text>
              {aanbevelingen.implementatiepad.map((fase, i) => (
                <View key={i} style={s.arboCard} wrap={false}>
                  <Text style={s.arboLabel}>{fase.fase}</Text>
                  {fase.doel && <Text style={[s.arboValue, { marginBottom: 4, fontStyle: "italic" }]}>Doel: {fase.doel}</Text>}
                  {fase.acties.map((a, ai) => (
                    <View key={ai} style={{ flexDirection: "row", marginBottom: 2, paddingLeft: 4 }}>
                      <Text style={{ fontSize: 7.5, color: BRAND[600], marginRight: 5 }}>•</Text>
                      <Text style={{ fontSize: 7.5, color: GRAY[700] }}>{a}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </Page>
      )}

      {/* ═══ DISCLAIMER ═══ */}
      <Page size="A4" style={s.page}>
        <Header data={data} brand={brand} s={s} />
        <Footer brand={brand} s={s} />

        <Text style={s.sectionTitle}>{nextSection()}. Disclaimer</Text>

        <View style={s.disclaimerBox}>
          <Text style={s.disclaimerTitle}>Juridische disclaimer</Text>
          <Text style={s.disclaimerText}>
            Deze Risico-Inventarisatie & Evaluatie (RI&E) is een hulpmiddel voor de werkgever
            bij het in kaart brengen van arbeidsrisico{"'"}s conform de Arbeidsomstandighedenwet (Arbowet).
          </Text>
          <Text style={[s.disclaimerText, { marginTop: 6 }]}>
            Voor bedrijven met meer dan 25 medewerkers dient de RI&E getoetst te worden door een
            gecertificeerde arbodienst of arbodeskundige (Arbowet art. 14). Bedrijven met minder
            dan 25 medewerkers kunnen gebruik maken van een erkend RI&E-instrument.
          </Text>
          <Text style={[s.disclaimerText, { marginTop: 6 }]}>
            Dit rapport vervangt geen professioneel arbo-advies. De werkgever blijft te allen tijde
            verantwoordelijk voor het naleven van de Arbowet en het uitvoeren van het Plan van Aanpak.
          </Text>
          <Text style={[s.disclaimerText, { marginTop: 6 }]}>
            Aanbevolen wordt de RI&E jaarlijks te actualiseren of bij significante wijzigingen in
            werkprocessen, organisatie of arbeidsomstandigheden.
          </Text>
        </View>

        <View style={[s.profileCard, { marginTop: 20 }]}>
          <Text style={s.arboLabel}>Rapportgegevens</Text>
          <View style={[s.profileRow, { marginTop: 6 }]}>
            <Text style={s.profileLabel}>Gegenereerd op</Text>
            <Text style={s.profileValue}>{data.datum}</Text>
          </View>
          <View style={s.profileRow}>
            <Text style={s.profileLabel}>Tool</Text>
            <Text style={s.profileValue}>{brand.showSnelRIE ? "SnelRIE — snelrie.nl" : brand.companyName}</Text>
          </View>
          <View style={s.profileRow}>
            <Text style={s.profileLabel}>Versie</Text>
            <Text style={s.profileValue}>1.0</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
