import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// SnelRIE brand colors (blue)
const BRAND_600 = "#2563eb";
const BRAND_900 = "#1e3a8a";
const BRAND_50 = "#eff6ff";

const GRAY_100 = "#f3f4f6";
const GRAY_200 = "#e5e7eb";
const GRAY_500 = "#6b7280";
const GRAY_700 = "#374151";
const GRAY_900 = "#111827";
const RED = "#dc2626";
const RED_BG = "#fef2f2";
const ORANGE = "#ea580c";
const ORANGE_BG = "#fff7ed";
const GREEN = "#16a34a";
const GREEN_BG = "#f0fdf4";

const prioriteitConfig: Record<string, { bg: string; color: string; label: string }> = {
  hoog: { bg: RED_BG, color: RED, label: "HOOG" },
  midden: { bg: ORANGE_BG, color: ORANGE, label: "MIDDEN" },
  laag: { bg: GREEN_BG, color: GREEN, label: "LAAG" },
};

export type WhiteLabelConfig = {
  logoUrl?: string;       // URL to client's logo image
  primaryColor?: string;  // Client's primary brand color (hex)
  companyName?: string;   // Client's company name for branding
};

export type RieData = {
  bedrijfsnaam: string;
  branche: string;
  aantalMedewerkers: number;
  aantalLocaties: number;
  tier?: string;
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
      maatregelen?: Array<{ maatregel: string; termijn?: string; verantwoordelijke?: string; kosten?: string }>;
    }>;
    planVanAanpak?: Array<{
      nummer?: number;
      maatregel: string;
      risico?: string;
      prioriteit: string;
      termijn?: string;
      verantwoordelijke?: string;
      kosten?: string;
    }>;
    wettelijkeVerplichtingen?: Array<{
      verplichting: string;
      wet: string;
      status: string;
      toelichting?: string;
    }>;
  };
  datum: string;
  whiteLabel?: WhiteLabelConfig;
};

function createStyles(primaryColor: string) {
  return StyleSheet.create({
    page: {
      paddingTop: 60,
      paddingBottom: 60,
      paddingHorizontal: 50,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: GRAY_900,
      lineHeight: 1.5,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      borderBottomWidth: 3,
      borderBottomColor: primaryColor,
      paddingBottom: 12,
      marginBottom: 20,
    },
    headerLeft: { flexDirection: "row", alignItems: "center" },
    logoImage: { height: 32, maxWidth: 160, marginRight: 8 },
    logoText: { fontSize: 22, fontFamily: "Helvetica-Bold", color: BRAND_900 },
    logoAccent: { color: primaryColor },
    headerRight: { textAlign: "right", fontSize: 8, color: GRAY_500 },
    title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: BRAND_900, marginBottom: 4 },
    subtitle: { fontSize: 10, color: GRAY_500, marginBottom: 16 },
    sectionTitle: {
      fontSize: 14,
      fontFamily: "Helvetica-Bold",
      color: BRAND_900,
      marginTop: 20,
      marginBottom: 10,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: GRAY_200,
    },
    infoBox: {
      backgroundColor: BRAND_50,
      borderLeftWidth: 3,
      borderLeftColor: primaryColor,
      padding: 12,
      marginBottom: 16,
      borderRadius: 4,
    },
    infoText: { fontSize: 9, color: GRAY_700, lineHeight: 1.6 },
    profileRow: { flexDirection: "row", marginBottom: 4 },
    profileLabel: { width: 140, fontSize: 9, fontFamily: "Helvetica-Bold", color: GRAY_500 },
    profileValue: { fontSize: 9, color: GRAY_900, flex: 1 },
    riskCard: {
      borderWidth: 1,
      borderColor: GRAY_200,
      borderRadius: 6,
      padding: 12,
      marginBottom: 10,
    },
    riskHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    riskTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: GRAY_900, flex: 1 },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      fontSize: 7,
      fontFamily: "Helvetica-Bold",
    },
    riskDesc: { fontSize: 9, color: GRAY_700, marginBottom: 6 },
    riskLegal: { fontSize: 8, color: GRAY_500, marginBottom: 6 },
    measureRow: { flexDirection: "row", marginBottom: 3, paddingLeft: 8 },
    measureCheck: { fontSize: 9, color: GREEN, marginRight: 6, fontFamily: "Helvetica-Bold" },
    measureText: { fontSize: 9, color: GRAY_700, flex: 1 },
    table: { marginBottom: 16 },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: GRAY_100,
      borderBottomWidth: 1,
      borderBottomColor: GRAY_200,
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: GRAY_200,
      paddingVertical: 5,
      paddingHorizontal: 4,
      minHeight: 24,
    },
    th: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GRAY_500 },
    td: { fontSize: 8, color: GRAY_900 },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 50,
      right: 50,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: GRAY_200,
      paddingTop: 8,
    },
    footerText: { fontSize: 7, color: GRAY_500 },
    pageNum: { fontSize: 7, color: GRAY_500 },
    scoreContainer: { flexDirection: "row", alignItems: "center", marginRight: 8 },
    scoreLabel: { fontSize: 7, color: GRAY_500, marginRight: 4 },
  });
}

function Badge({ prioriteit }: { prioriteit: string }) {
  const config = prioriteitConfig[prioriteit] || prioriteitConfig.laag;
  return (
    <Text style={[{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontSize: 7, fontFamily: "Helvetica-Bold", backgroundColor: config.bg, color: config.color }]}>
      {config.label}
    </Text>
  );
}

function Header({ data, s, isWhiteLabel, primaryColor }: { data: RieData; s: ReturnType<typeof createStyles>; isWhiteLabel: boolean; primaryColor: string }) {
  const wl = data.whiteLabel;
  return (
    <View style={s.header} fixed>
      <View style={s.headerLeft}>
        {isWhiteLabel && wl?.logoUrl ? (
          <Image src={wl.logoUrl} style={s.logoImage} />
        ) : isWhiteLabel && wl?.companyName ? (
          <Text style={[s.logoText, { color: primaryColor }]}>{wl.companyName}</Text>
        ) : (
          <Text style={s.logoText}>
            Snel<Text style={s.logoAccent}>RIE</Text>
          </Text>
        )}
      </View>
      <View style={s.headerRight}>
        <Text>{data.bedrijfsnaam}</Text>
        <Text>{data.datum}</Text>
      </View>
    </View>
  );
}

function Footer({ isWhiteLabel, s }: { isWhiteLabel: boolean; s: ReturnType<typeof createStyles> }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>
        {isWhiteLabel ? "" : "Gegenereerd door SnelRIE — snelrie.nl"}
      </Text>
      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

export function RieDocument({ data }: { data: RieData }) {
  const isWhiteLabel = data.tier === "ENTERPRISE" && !!data.whiteLabel;
  const primaryColor = (isWhiteLabel && data.whiteLabel?.primaryColor) || BRAND_600;
  const s = createStyles(primaryColor);

  const content = data.generatedContent;
  const risicos = content.risicos || [];
  const pva = content.planVanAanpak || [];
  const wettelijk = content.wettelijkeVerplichtingen || [];

  return (
    <Document
      title={`RI&E — ${data.bedrijfsnaam}`}
      author={isWhiteLabel ? (data.whiteLabel?.companyName || data.bedrijfsnaam) : "SnelRIE"}
      subject="Risico-Inventarisatie & Evaluatie"
      creator={isWhiteLabel ? (data.whiteLabel?.companyName || "") : "SnelRIE — snelrie.nl"}
    >
      {/* Page 1: Cover + Summary + Profile */}
      <Page size="A4" style={s.page}>
        <Header data={data} s={s} isWhiteLabel={isWhiteLabel} primaryColor={primaryColor} />
        <Footer isWhiteLabel={isWhiteLabel} s={s} />

        <Text style={[s.title, { color: primaryColor }]}>Risico-Inventarisatie & Evaluatie</Text>
        <Text style={s.subtitle}>
          {data.bedrijfsnaam} · {data.branche} · {data.datum}
        </Text>

        <Text style={[s.sectionTitle, { color: primaryColor }]}>1. Bedrijfsprofiel</Text>
        <View style={{ marginBottom: 12 }}>
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
        </View>

        {content.bedrijfsprofiel?.beschrijving && (
          <Text style={s.infoText}>{content.bedrijfsprofiel.beschrijving}</Text>
        )}

        <Text style={[s.sectionTitle, { color: primaryColor }]}>2. Samenvatting</Text>
        <View style={s.infoBox}>
          <Text style={s.infoText}>
            {content.samenvatting || "Geen samenvatting beschikbaar."}
          </Text>
        </View>

        <Text style={[s.infoText, { marginBottom: 8 }]}>
          Er zijn {risicos.length} risico's geïdentificeerd op basis van uw intake en de branchespecifieke kennisbank.
        </Text>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.th, { width: 20 }]}>#</Text>
            <Text style={[s.th, { flex: 1 }]}>Categorie</Text>
            <Text style={[s.th, { width: 50, textAlign: "center" }]}>Score</Text>
            <Text style={[s.th, { width: 60, textAlign: "center" }]}>Prioriteit</Text>
          </View>
          {risicos.map((r, i) => (
            <View key={i} style={s.tableRow} wrap={false}>
              <Text style={[s.td, { width: 20 }]}>{i + 1}</Text>
              <Text style={[s.td, { flex: 1 }]}>{r.categorie}</Text>
              <Text style={[s.td, { width: 50, textAlign: "center" }]}>
                {r.risicoScore ? `${r.risicoScore}/25` : "-"}
              </Text>
              <View style={{ width: 60, alignItems: "center" }}>
                <Badge prioriteit={r.prioriteit} />
              </View>
            </View>
          ))}
        </View>
      </Page>

      {/* Page 2+: Detailed Risks */}
      <Page size="A4" style={s.page}>
        <Header data={data} s={s} isWhiteLabel={isWhiteLabel} primaryColor={primaryColor} />
        <Footer isWhiteLabel={isWhiteLabel} s={s} />

        <Text style={[s.sectionTitle, { color: primaryColor }]}>3. Risico-inventarisatie — Detail</Text>

        {risicos.map((r, i) => (
          <View key={i} style={s.riskCard} wrap={false}>
            <View style={s.riskHeader}>
              <Text style={s.riskTitle}>
                {i + 1}. {r.categorie}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {r.risicoScore && (
                  <View style={s.scoreContainer}>
                    <Text style={s.scoreLabel}>Score: {r.risicoScore}/25</Text>
                  </View>
                )}
                <Badge prioriteit={r.prioriteit} />
              </View>
            </View>

            {r.beschrijving && <Text style={s.riskDesc}>{r.beschrijving}</Text>}
            {r.wettelijkKader && (
              <Text style={s.riskLegal}>Wettelijk kader: {r.wettelijkKader}</Text>
            )}

            {r.gevaren && r.gevaren.length > 0 && (
              <View style={{ marginBottom: 4 }}>
                <Text style={[s.measureText, { fontFamily: "Helvetica-Bold", marginBottom: 2 }]}>
                  Gevaren:
                </Text>
                {r.gevaren.map((g, gi) => (
                  <View key={gi} style={s.measureRow}>
                    <Text style={[s.measureCheck, { color: RED }]}>•</Text>
                    <Text style={s.measureText}>{g}</Text>
                  </View>
                ))}
              </View>
            )}

            {r.maatregelen && r.maatregelen.length > 0 && (
              <View>
                <Text style={[s.measureText, { fontFamily: "Helvetica-Bold", marginBottom: 2 }]}>
                  Maatregelen:
                </Text>
                {r.maatregelen.map((m, mi) => (
                  <View key={mi} style={s.measureRow}>
                    <Text style={s.measureCheck}>✓</Text>
                    <Text style={s.measureText}>
                      {m.maatregel}
                      {m.termijn ? ` (${m.termijn})` : ""}
                      {m.verantwoordelijke ? ` — ${m.verantwoordelijke}` : ""}
                      {m.kosten ? ` · ${m.kosten}` : ""}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </Page>

      {/* Plan van Aanpak */}
      {pva.length > 0 && (
        <Page size="A4" style={s.page}>
          <Header data={data} s={s} isWhiteLabel={isWhiteLabel} primaryColor={primaryColor} />
          <Footer isWhiteLabel={isWhiteLabel} s={s} />

          <Text style={[s.sectionTitle, { color: primaryColor }]}>4. Plan van Aanpak</Text>

          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.th, { width: 18 }]}>#</Text>
              <Text style={[s.th, { flex: 1 }]}>Maatregel</Text>
              <Text style={[s.th, { width: 80 }]}>Risico</Text>
              <Text style={[s.th, { width: 50, textAlign: "center" }]}>Prioriteit</Text>
              <Text style={[s.th, { width: 60 }]}>Termijn</Text>
              <Text style={[s.th, { width: 70 }]}>Verantw.</Text>
              <Text style={[s.th, { width: 50 }]}>Kosten</Text>
            </View>
            {pva.map((item, i) => (
              <View key={i} style={s.tableRow} wrap={false}>
                <Text style={[s.td, { width: 18 }]}>{item.nummer || i + 1}</Text>
                <Text style={[s.td, { flex: 1 }]}>{item.maatregel}</Text>
                <Text style={[s.td, { width: 80 }]}>{item.risico || "-"}</Text>
                <View style={{ width: 50, alignItems: "center", justifyContent: "center" }}>
                  <Badge prioriteit={item.prioriteit} />
                </View>
                <Text style={[s.td, { width: 60 }]}>{item.termijn || "-"}</Text>
                <Text style={[s.td, { width: 70 }]}>{item.verantwoordelijke || "-"}</Text>
                <Text style={[s.td, { width: 50 }]}>{item.kosten || "-"}</Text>
              </View>
            ))}
          </View>
        </Page>
      )}

      {/* Wettelijke verplichtingen */}
      {wettelijk.length > 0 && (
        <Page size="A4" style={s.page}>
          <Header data={data} s={s} isWhiteLabel={isWhiteLabel} primaryColor={primaryColor} />
          <Footer isWhiteLabel={isWhiteLabel} s={s} />

          <Text style={[s.sectionTitle, { color: primaryColor }]}>
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
              <View key={i} style={s.tableRow} wrap={false}>
                <Text style={[s.td, { flex: 1 }]}>{w.verplichting}</Text>
                <Text style={[s.td, { width: 100 }]}>{w.wet}</Text>
                <Text style={[s.td, { width: 70, textAlign: "center" }]}>
                  {w.status === "voldoet" ? "V" : w.status === "aandachtspunt" ? "!" : "X"}{" "}
                  {w.status}
                </Text>
                <Text style={[s.td, { flex: 1 }]}>{w.toelichting || "-"}</Text>
              </View>
            ))}
          </View>

          <View style={[s.infoBox, { marginTop: 20, borderLeftColor: ORANGE }]}>
            <Text style={[s.infoText, { fontFamily: "Helvetica-Bold", marginBottom: 4 }]}>
              Disclaimer
            </Text>
            <Text style={s.infoText}>
              De RI&E is een hulpmiddel voor de werkgever. Voor bedrijven met meer dan 25
              medewerkers dient de RI&E getoetst te worden door een gecertificeerde
              arbodienst/arbodeskundige (Arbowet art. 14). Dit rapport vervangt geen
              professioneel arbo-advies.
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
