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
// Branding — matches website design system exactly
// tailwind.config.ts brand scale + globals.css CSS variables
// ═══════════════════════════════════════════════════════════════

export type BrandingConfig = {
  primaryColor: string;     // brand-600: #2563eb
  primaryDark: string;      // brand-900: #1e3a8a
  primaryLight: string;     // brand-100: #dbeafe
  primaryBg: string;        // brand-50:  #eff6ff
  companyName: string;
  logoUrl?: string;
  footerText: string;
  showSnelRIE: boolean;
};

// Website palette — from tailwind.config.ts
const BRAND = {
  50:  "#eff6ff",
  100: "#dbeafe",
  200: "#bfdbfe",
  300: "#93c5fd",
  400: "#60a5fa",
  500: "#3b82f6",
  600: "#2563eb",   // --primary
  700: "#1d4ed8",
  800: "#1e40af",
  900: "#1e3a8a",
};

// Website neutrals — tailwind gray scale
const GRAY = {
  50:  "#f9fafb",
  100: "#f3f4f6",
  200: "#e5e7eb",
  300: "#d1d5db",
  400: "#9ca3af",
  500: "#6b7280",   // muted-foreground ≈ hsl(215.4 16.3% 46.9%)
  600: "#4b5563",
  700: "#374151",
  800: "#1f2937",
  900: "#111827",   // --foreground (text-gray-900)
};

// Website alert colors — from globals.css & resultaat page
const DESTRUCTIVE = "#dc2626";       // hsl(0 84.2% 60.2%) → red-600
const RED_BG      = "#fef2f2";       // red-50
const RED_BORDER  = "#fecaca";       // red-200
const ORANGE      = "#ea580c";       // orange-600
const ORANGE_BG   = "#fff7ed";       // orange-50
const YELLOW      = "#ca8a04";       // yellow-600
const YELLOW_BG   = "#fefce8";       // yellow-50
const GREEN       = "#16a34a";       // green-600
const GREEN_BG    = "#f0fdf4";       // green-50

const SNELRIE_BRANDING: BrandingConfig = {
  primaryColor: BRAND[600],
  primaryDark:  BRAND[900],
  primaryLight: BRAND[100],
  primaryBg:    BRAND[50],
  companyName:  "SnelRIE",
  footerText:   "Gegenereerd door SnelRIE — snelrie.nl",
  showSnelRIE:  true,
};

export function getBranding(tier?: string, opts?: {
  logoUrl?: string;
  primaryColor?: string;
  companyName?: string;
}): BrandingConfig {
  if (tier?.toUpperCase() === "ENTERPRISE" && opts?.companyName) {
    const p = opts.primaryColor || BRAND[600];
    return {
      primaryColor: p,
      primaryDark:  darken(p, 0.35),
      primaryLight: lighten(p, 0.85),
      primaryBg:    lighten(p, 0.93),
      companyName:  opts.companyName,
      logoUrl:      opts.logoUrl,
      footerText:   `© ${new Date().getFullYear()} ${opts.companyName}`,
      showSnelRIE:  false,
    };
  }
  return { ...SNELRIE_BRANDING };
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.round(r * (1 - amount)),
    Math.round(g * (1 - amount)),
    Math.round(b * (1 - amount)),
  );
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(b + (255 - b) * amount),
  );
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
// Priority badges — matches website: bg-red-100 text-red-700 etc.
// ═══════════════════════════════════════════════════════════════

const prioriteitConfig: Record<string, { bg: string; color: string; border: string; label: string }> = {
  hoog:   { bg: RED_BG,    color: "#b91c1c",  border: RED_BORDER, label: "HOOG" },     // red-100/red-700
  midden: { bg: YELLOW_BG, color: "#a16207",  border: "#fde68a",  label: "MIDDEN" },   // yellow-100/yellow-700
  laag:   { bg: GREEN_BG,  color: "#15803d",  border: "#bbf7d0",  label: "LAAG" },     // green-100/green-700
};

// ═══════════════════════════════════════════════════════════════
// Styles factory — mirrors website spacing & typography
// Font: Helvetica (closest to system sans-serif in PDF)
// Spacing: 8pt grid (website uses 0.5rem = 8px base)
// Border radius: approximated (PDF supports borderRadius)
// ═══════════════════════════════════════════════════════════════

function createStyles(b: BrandingConfig) {
  return StyleSheet.create({
    // ── Page ──
    page: {
      paddingTop: 56,
      paddingBottom: 56,
      paddingHorizontal: 48,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: GRAY[900],
      backgroundColor: "#ffffff",
      lineHeight: 1.5,
    },

    // ── Header (fixed) ──
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 12,
      marginBottom: 24,
      borderBottomWidth: 2,
      borderBottomColor: b.primaryColor,
    },
    logoText: {
      fontSize: 20,
      fontFamily: "Helvetica-Bold",
      color: b.primaryDark,
      letterSpacing: -0.5,
    },
    logoAccent: { color: b.primaryColor },
    logoImage: { height: 32, maxWidth: 140 },
    headerRight: { textAlign: "right" },
    headerCompany: { fontSize: 9, fontFamily: "Helvetica-Bold", color: GRAY[900] },
    headerDate: { fontSize: 8, color: GRAY[500], marginTop: 2 },

    // ── Title area ──
    pageTitle: {
      fontSize: 20,
      fontFamily: "Helvetica-Bold",
      color: GRAY[900],
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    pageSubtitle: {
      fontSize: 10,
      color: GRAY[500],
      marginBottom: 24,
    },

    // ── Section headings ──
    sectionTitle: {
      fontSize: 13,
      fontFamily: "Helvetica-Bold",
      color: GRAY[900],
      marginTop: 24,
      marginBottom: 12,
      paddingBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: GRAY[200],      // --border
    },

    // ── Info box (blue left-accent card like website) ──
    infoBox: {
      backgroundColor: b.primaryBg,
      borderLeftWidth: 3,
      borderLeftColor: b.primaryColor,
      borderRadius: 8,                   // 0.5rem
      padding: 14,
      marginBottom: 16,
    },
    infoText: {
      fontSize: 9,
      color: GRAY[700],
      lineHeight: 1.65,
    },

    // ── Profile grid ──
    profileCard: {
      backgroundColor: GRAY[50],
      borderRadius: 8,
      borderWidth: 1,
      borderColor: GRAY[200],
      padding: 14,
      marginBottom: 16,
    },
    profileRow: { flexDirection: "row", marginBottom: 5 },
    profileLabel: {
      width: 130,
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: GRAY[500],
    },
    profileValue: {
      fontSize: 9,
      color: GRAY[900],
      flex: 1,
    },

    // ── Risk card ──
    riskCard: {
      borderWidth: 1,
      borderColor: GRAY[200],
      borderRadius: 8,
      padding: 14,
      marginBottom: 12,
      backgroundColor: "#ffffff",
    },
    riskHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    riskTitle: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: GRAY[900],
      flex: 1,
    },
    riskDesc: {
      fontSize: 9,
      color: GRAY[600],
      marginBottom: 8,
      lineHeight: 1.55,
    },
    riskLegal: {
      fontSize: 8,
      color: GRAY[500],
      marginBottom: 8,
      fontStyle: "italic",
    },

    // ── Badge (matches website: rounded-full px-2 py-0.5 text-xs) ──
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      fontSize: 7,
      fontFamily: "Helvetica-Bold",
      borderWidth: 1,
    },

    // ── Score ──
    scoreContainer: { flexDirection: "row", alignItems: "center", marginRight: 8 },
    scoreText: {
      fontSize: 8,
      color: GRAY[500],
      fontFamily: "Helvetica-Bold",
    },

    // ── Measure / checklist items ──
    measureSection: { marginTop: 4 },
    measureLabel: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: GRAY[800],
      marginBottom: 4,
    },
    measureRow: {
      flexDirection: "row",
      marginBottom: 4,
      paddingLeft: 4,
    },
    measureBullet: {
      fontSize: 9,
      color: b.primaryColor,
      marginRight: 6,
      fontFamily: "Helvetica-Bold",
      width: 10,
    },
    dangerBullet: {
      fontSize: 9,
      color: DESTRUCTIVE,
      marginRight: 6,
      width: 10,
    },
    measureText: {
      fontSize: 9,
      color: GRAY[700],
      flex: 1,
      lineHeight: 1.5,
    },

    // ── Table (PvA, wettelijk) ──
    table: { marginBottom: 16 },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: GRAY[100],
      paddingVertical: 7,
      paddingHorizontal: 6,
      borderBottomWidth: 1,
      borderBottomColor: GRAY[200],
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 6,
      paddingHorizontal: 6,
      borderBottomWidth: 1,
      borderBottomColor: GRAY[100],
      minHeight: 24,
    },
    tableRowAlt: {
      backgroundColor: GRAY[50],
    },
    th: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: GRAY[500],
      textTransform: "uppercase" as const,
      letterSpacing: 0.3,
    },
    td: {
      fontSize: 8,
      color: GRAY[900],
      lineHeight: 1.4,
    },

    // ── Footer (fixed) ──
    footer: {
      position: "absolute",
      bottom: 28,
      left: 48,
      right: 48,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: GRAY[200],
      paddingTop: 8,
    },
    footerText: { fontSize: 7, color: GRAY[400] },
    pageNum: { fontSize: 7, color: GRAY[400] },

    // ── Disclaimer box ──
    disclaimerBox: {
      backgroundColor: GRAY[50],
      borderWidth: 1,
      borderColor: GRAY[200],
      borderRadius: 8,
      padding: 14,
      marginTop: 24,
    },
    disclaimerTitle: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: GRAY[700],
      marginBottom: 4,
    },
    disclaimerText: {
      fontSize: 8,
      color: GRAY[500],
      lineHeight: 1.6,
    },
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
  generatedContent: {
    samenvatting?: string;
    bedrijfsprofiel?: { beschrijving?: string };
    risicos?: Array<{
      categorie: string;
      prioriteit: string;
      beschrijving?: string;
      wettelijkKader?: string;
      risicoScore?: number;
      gevaren?: string[];
      maatregelen?: Array<{
        maatregel: string;
        termijn?: string;
        verantwoordelijke?: string;
        kosten?: string;
        kostenindicatie?: string;
      }>;
    }>;
    planVanAanpak?: Array<{
      nummer?: number;
      maatregel: string;
      risico?: string;
      prioriteit: string;
      termijn?: string;
      verantwoordelijke?: string;
      kosten?: string;
      deadline?: string;
    }>;
    wettelijkeVerplichtingen?: Array<{
      verplichting: string;
      wet: string;
      status: string;
      toelichting?: string;
    }>;
  };
  datum: string;
};

// ═══════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════

function Badge({ prioriteit, s }: { prioriteit: string; s: ReturnType<typeof createStyles> }) {
  const config = prioriteitConfig[prioriteit] || prioriteitConfig.laag;
  return (
    <Text style={[s.badge, {
      backgroundColor: config.bg,
      color: config.color,
      borderColor: config.border,
    }]}>
      {config.label}
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
          <Text style={s.logoText}>
            Snel<Text style={s.logoAccent}>RIE</Text>
          </Text>
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
      <Text
        style={s.pageNum}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Document
// ═══════════════════════════════════════════════════════════════

export function RieDocument({ data, branding }: { data: RieData; branding?: BrandingConfig }) {
  const brand = branding || SNELRIE_BRANDING;
  const s = createStyles(brand);
  const content = data.generatedContent;
  const risicos = content.risicos || [];
  const pva = content.planVanAanpak || [];
  const wettelijk = content.wettelijkeVerplichtingen || [];

  const docAuthor = brand.showSnelRIE ? "SnelRIE" : brand.companyName;

  return (
    <Document
      title={`RI&E — ${data.bedrijfsnaam}`}
      author={docAuthor}
      subject="Risico-Inventarisatie & Evaluatie"
      creator={brand.showSnelRIE ? "SnelRIE — snelrie.nl" : brand.companyName}
    >
      {/* ── Page 1: Cover + Profile + Summary + Risk overview ── */}
      <Page size="A4" style={s.page}>
        <Header data={data} brand={brand} s={s} />
        <Footer brand={brand} s={s} />

        <Text style={s.pageTitle}>Risico-Inventarisatie & Evaluatie</Text>
        <Text style={s.pageSubtitle}>
          {data.bedrijfsnaam}  ·  {data.branche}  ·  {data.datum}
        </Text>

        {/* Bedrijfsprofiel */}
        <Text style={s.sectionTitle}>1. Bedrijfsprofiel</Text>
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
          {content.bedrijfsprofiel?.beschrijving && (
            <View style={{ marginTop: 8 }}>
              <Text style={s.infoText}>{content.bedrijfsprofiel.beschrijving}</Text>
            </View>
          )}
        </View>

        {/* Samenvatting */}
        <Text style={s.sectionTitle}>2. Samenvatting</Text>
        <View style={s.infoBox}>
          <Text style={s.infoText}>
            {content.samenvatting || "Geen samenvatting beschikbaar."}
          </Text>
        </View>

        <Text style={[s.infoText, { marginBottom: 12, color: GRAY[500] }]}>
          Er zijn {risicos.length} risico{"'"}s geïdentificeerd op basis van uw intake en de branchespecifieke kennisbank.
        </Text>

        {/* Risk overview table */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.th, { width: 22 }]}>#</Text>
            <Text style={[s.th, { flex: 1 }]}>Categorie</Text>
            <Text style={[s.th, { width: 50, textAlign: "center" }]}>Score</Text>
            <Text style={[s.th, { width: 65, textAlign: "center" }]}>Prioriteit</Text>
          </View>
          {risicos.map((r, i) => (
            <View
              key={i}
              style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
              wrap={false}
            >
              <Text style={[s.td, { width: 22, fontFamily: "Helvetica-Bold" }]}>{i + 1}</Text>
              <Text style={[s.td, { flex: 1 }]}>{r.categorie}</Text>
              <Text style={[s.td, { width: 50, textAlign: "center", color: GRAY[500] }]}>
                {r.risicoScore ? `${r.risicoScore}/25` : "—"}
              </Text>
              <View style={{ width: 65, alignItems: "center", justifyContent: "center" }}>
                <Badge prioriteit={r.prioriteit} s={s} />
              </View>
            </View>
          ))}
        </View>
      </Page>

      {/* ── Page 2+: Detailed Risks ── */}
      <Page size="A4" style={s.page}>
        <Header data={data} brand={brand} s={s} />
        <Footer brand={brand} s={s} />

        <Text style={s.sectionTitle}>3. Risico-inventarisatie — Detail</Text>

        {risicos.map((r, i) => (
          <View key={i} style={s.riskCard} wrap={false}>
            <View style={s.riskHeader}>
              <Text style={s.riskTitle}>
                {i + 1}. {r.categorie}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {r.risicoScore != null && (
                  <View style={s.scoreContainer}>
                    <Text style={s.scoreText}>{r.risicoScore}/25</Text>
                  </View>
                )}
                <Badge prioriteit={r.prioriteit} s={s} />
              </View>
            </View>

            {r.beschrijving && <Text style={s.riskDesc}>{r.beschrijving}</Text>}
            {r.wettelijkKader && (
              <Text style={s.riskLegal}>Wettelijk kader: {r.wettelijkKader}</Text>
            )}

            {/* Gevaren */}
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

            {/* Maatregelen */}
            {r.maatregelen && r.maatregelen.length > 0 && (
              <View style={[s.measureSection, { marginTop: 8 }]}>
                <Text style={s.measureLabel}>Maatregelen</Text>
                {r.maatregelen.map((m, mi) => (
                  <View key={mi} style={s.measureRow}>
                    <Text style={s.measureBullet}>✓</Text>
                    <Text style={s.measureText}>
                      {m.maatregel}
                      {m.termijn ? ` (${m.termijn})` : ""}
                      {m.verantwoordelijke ? ` — ${m.verantwoordelijke}` : ""}
                      {(m.kosten || m.kostenindicatie)
                        ? ` · ${m.kosten || m.kostenindicatie}`
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </Page>

      {/* ── Plan van Aanpak ── */}
      {pva.length > 0 && (
        <Page size="A4" style={s.page}>
          <Header data={data} brand={brand} s={s} />
          <Footer brand={brand} s={s} />

          <Text style={s.sectionTitle}>4. Plan van Aanpak</Text>

          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.th, { width: 18 }]}>#</Text>
              <Text style={[s.th, { flex: 1 }]}>Maatregel</Text>
              <Text style={[s.th, { width: 65 }]}>Risico</Text>
              <Text style={[s.th, { width: 45, textAlign: "center" }]}>Prio</Text>
              <Text style={[s.th, { width: 42 }]}>Termijn</Text>
              <Text style={[s.th, { width: 60 }]}>Verantw.</Text>
              <Text style={[s.th, { width: 55 }]}>Deadline</Text>
            </View>
            {pva.map((item, i) => (
              <View
                key={i}
                style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
                wrap={false}
              >
                <Text style={[s.td, { width: 18, fontFamily: "Helvetica-Bold" }]}>
                  {item.nummer || i + 1}
                </Text>
                <Text style={[s.td, { flex: 1 }]}>{item.maatregel}</Text>
                <Text style={[s.td, { width: 65, color: GRAY[500] }]}>{item.risico || "—"}</Text>
                <View style={{ width: 45, alignItems: "center", justifyContent: "center" }}>
                  <Badge prioriteit={item.prioriteit} s={s} />
                </View>
                <Text style={[s.td, { width: 42 }]}>{item.termijn || "—"}</Text>
                <Text style={[s.td, { width: 60 }]}>{item.verantwoordelijke || "—"}</Text>
                <Text style={[s.td, { width: 55, color: GRAY[500] }]}>{item.deadline || "—"}</Text>
              </View>
            ))}
          </View>
        </Page>
      )}

      {/* ── Wettelijke verplichtingen ── */}
      {wettelijk.length > 0 && (
        <Page size="A4" style={s.page}>
          <Header data={data} brand={brand} s={s} />
          <Footer brand={brand} s={s} />

          <Text style={s.sectionTitle}>
            {pva.length > 0 ? "5" : "4"}. Wettelijke Verplichtingen
          </Text>

          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.th, { flex: 1 }]}>Verplichting</Text>
              <Text style={[s.th, { width: 100 }]}>Wet</Text>
              <Text style={[s.th, { width: 70, textAlign: "center" }]}>Status</Text>
              <Text style={[s.th, { flex: 1 }]}>Toelichting</Text>
            </View>
            {wettelijk.map((w, i) => (
              <View
                key={i}
                style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
                wrap={false}
              >
                <Text style={[s.td, { flex: 1 }]}>{w.verplichting}</Text>
                <Text style={[s.td, { width: 100, color: GRAY[500] }]}>{w.wet}</Text>
                <Text style={[s.td, { width: 70, textAlign: "center" }]}>
                  {w.status === "voldoet" ? "✓" : w.status === "aandachtspunt" ? "!" : "✗"}{" "}
                  {w.status}
                </Text>
                <Text style={[s.td, { flex: 1 }]}>{w.toelichting || "—"}</Text>
              </View>
            ))}
          </View>

          {/* Disclaimer */}
          <View style={s.disclaimerBox}>
            <Text style={s.disclaimerTitle}>Disclaimer</Text>
            <Text style={s.disclaimerText}>
              Deze RI&E is een hulpmiddel voor de werkgever. Voor bedrijven met meer dan 25
              medewerkers dient de RI&E getoetst te worden door een gecertificeerde
              arbodienst of arbodeskundige (Arbowet art. 14). Dit rapport vervangt geen
              professioneel arbo-advies.
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
