import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const report = await prisma.rieReport.findUnique({
    where: { id },
    include: {
      payments: { where: { status: "PAID" }, take: 1 },
      user: true,
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  if (report.payments.length === 0) {
    return NextResponse.json({ error: "Betaling vereist" }, { status: 403 });
  }

  if (!report.generatedContent) {
    return NextResponse.json({ error: "Rapport nog niet gereed" }, { status: 400 });
  }

  const content = report.generatedContent as any;

  // Generate HTML-based PDF
  const html = generatePdfHtml(report, content);

  // Return as HTML that the browser can print to PDF
  // For production, use a proper PDF library like puppeteer or @react-pdf/renderer
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="RIE-${report.bedrijfsnaam.replace(/[^a-zA-Z0-9]/g, '-')}.html"`,
    },
  });
}

function generatePdfHtml(report: any, content: any): string {
  const risicos = content.risicos || [];
  const pva = content.planVanAanpak || [];
  const wettelijk = content.wettelijkeVerplichtingen || [];
  const datum = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const prioriteitStyle: Record<string, string> = {
    hoog: "background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;",
    midden: "background:#fefce8;color:#a16207;border:1px solid #fef08a;",
    laag: "background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;",
  };

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<title>RI&E — ${report.bedrijfsnaam}</title>
<style>
  @media print {
    body { margin: 0; }
    .no-print { display: none; }
    .page-break { page-break-before: always; }
  }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 24px; }
  .header { border-bottom: 3px solid #2563eb; padding-bottom: 24px; margin-bottom: 32px; }
  .logo { font-size: 28px; font-weight: 800; color: #2563eb; }
  .logo span { color: #1a1a1a; }
  h1 { font-size: 24px; margin: 8px 0 4px; }
  h2 { font-size: 20px; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 32px; }
  h3 { font-size: 16px; margin: 16px 0 8px; }
  .meta { color: #6b7280; font-size: 14px; }
  .summary { background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #2563eb; }
  .risk-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 12px 0; }
  .risk-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
  th, td { padding: 8px 12px; text-align: left; border: 1px solid #e5e7eb; }
  th { background: #f9fafb; font-weight: 600; color: #374151; }
  .measure { display: flex; gap: 8px; align-items: flex-start; margin: 6px 0; font-size: 14px; }
  .measure::before { content: '✓'; color: #16a34a; font-weight: bold; flex-shrink: 0; }
  .print-btn { position: fixed; top: 20px; right: 20px; background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; z-index: 100; }
  .print-btn:hover { background: #1d4ed8; }
  .toc { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 16px 0; }
  .toc li { margin: 6px 0; }
  .toc a { color: #2563eb; text-decoration: none; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center; }
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">📄 Print / Download als PDF</button>

<div class="header">
  <div class="logo"><span>Snel</span>RIE</div>
  <h1>Risico-Inventarisatie & Evaluatie</h1>
  <div class="meta">
    <strong>${report.bedrijfsnaam}</strong> · ${report.branche} · ${datum}<br>
    ${report.aantalMedewerkers} medewerkers · ${report.aantalLocaties} locatie(s)
  </div>
</div>

<h2>Inhoudsopgave</h2>
<div class="toc">
  <ol>
    <li><a href="#samenvatting">Samenvatting</a></li>
    <li><a href="#risicos">Risico-inventarisatie</a></li>
    ${pva.length > 0 ? '<li><a href="#pva">Plan van Aanpak</a></li>' : ''}
    ${wettelijk.length > 0 ? '<li><a href="#wettelijk">Wettelijke verplichtingen</a></li>' : ''}
  </ol>
</div>

<h2 id="samenvatting">1. Samenvatting</h2>
<div class="summary">
  ${content.samenvatting || 'Geen samenvatting beschikbaar.'}
</div>

${content.bedrijfsprofiel ? `
<h3>Bedrijfsprofiel</h3>
<p>${content.bedrijfsprofiel.beschrijving || ''}</p>
` : ''}

<div class="page-break"></div>
<h2 id="risicos">2. Risico-inventarisatie</h2>
<p>Er zijn <strong>${risicos.length} risico's</strong> geïdentificeerd op basis van uw intake en de branchespecifieke kennisbank.</p>

${risicos.map((r: any, i: number) => `
<div class="risk-card">
  <div class="risk-header">
    <h3>${i + 1}. ${r.categorie}</h3>
    <span class="badge" style="${prioriteitStyle[r.prioriteit] || ''}">${r.prioriteit}</span>
  </div>
  <p style="font-size:14px;color:#4b5563;">${r.beschrijving || ''}</p>
  ${r.wettelijkKader ? `<p style="font-size:12px;color:#6b7280;">📋 ${r.wettelijkKader}</p>` : ''}
  ${r.gevaren && r.gevaren.length > 0 ? `
    <h4 style="font-size:13px;margin:8px 0 4px;">Gevaren:</h4>
    <ul style="font-size:13px;color:#4b5563;margin:0;padding-left:20px;">
      ${r.gevaren.map((g: string) => `<li>${g}</li>`).join('')}
    </ul>
  ` : ''}
  ${r.maatregelen && r.maatregelen.length > 0 ? `
    <h4 style="font-size:13px;margin:12px 0 4px;">Maatregelen:</h4>
    ${r.maatregelen.map((m: any) => `
      <div class="measure">
        <span>${m.maatregel}${m.termijn ? ` <em style="color:#9ca3af;">(${m.termijn})</em>` : ''}</span>
      </div>
    `).join('')}
  ` : ''}
</div>
`).join('')}

${pva.length > 0 ? `
<div class="page-break"></div>
<h2 id="pva">3. Plan van Aanpak</h2>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Maatregel</th>
      <th>Risico</th>
      <th>Prioriteit</th>
      <th>Termijn</th>
      <th>Verantwoordelijke</th>
    </tr>
  </thead>
  <tbody>
    ${pva.map((item: any, i: number) => `
    <tr>
      <td>${item.nummer || i + 1}</td>
      <td>${item.maatregel}</td>
      <td>${item.risico || '-'}</td>
      <td><span class="badge" style="${prioriteitStyle[item.prioriteit] || ''}">${item.prioriteit}</span></td>
      <td>${item.termijn || '-'}</td>
      <td>${item.verantwoordelijke || '-'}</td>
    </tr>
    `).join('')}
  </tbody>
</table>
` : ''}

${wettelijk.length > 0 ? `
<h2 id="wettelijk">${pva.length > 0 ? '4' : '3'}. Wettelijke verplichtingen</h2>
<table>
  <thead>
    <tr>
      <th>Verplichting</th>
      <th>Wet</th>
      <th>Status</th>
      <th>Toelichting</th>
    </tr>
  </thead>
  <tbody>
    ${wettelijk.map((w: any) => `
    <tr>
      <td>${w.verplichting}</td>
      <td>${w.wet}</td>
      <td>${w.status === 'voldoet' ? '✅' : w.status === 'aandachtspunt' ? '⚠️' : '❌'} ${w.status}</td>
      <td>${w.toelichting || '-'}</td>
    </tr>
    `).join('')}
  </tbody>
</table>
` : ''}

<div class="footer">
  <p>Dit rapport is gegenereerd door SnelRIE op ${datum}.</p>
  <p>De RI&E is een hulpmiddel voor de werkgever. Voor bedrijven met >25 medewerkers dient de RI&E getoetst te worden door een gecertificeerde arbodienst/arbodeskundige (Arbowet art. 14).</p>
  <p>© ${new Date().getFullYear()} SnelRIE — snelrie.nl</p>
</div>

</body>
</html>`;
}
