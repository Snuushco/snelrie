/**
 * Email drip sequence definitions for trial-to-paid conversion.
 * 
 * These are triggered after a user completes a GRATIS tier RI&E.
 * Send via your email provider (Resend, SendGrid, etc.) using a cron/queue.
 * 
 * Schedule: 1 email per day for 3 days after gratis RI&E completion.
 */

export interface DripEmail {
  dayOffset: number;
  subject: string;
  previewText: string;
  bodyHtml: string;
}

export const GRATIS_TO_BASIS_DRIP: DripEmail[] = [
  {
    dayOffset: 1,
    subject: "Je gratis RI&E is klaar — maar heb je het compleet?",
    previewText: "Je hebt een goed begin gemaakt. Maar er zijn risico's die je nog niet ziet.",
    bodyHtml: `
<div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
  <div style="padding:32px 24px;">
    <p style="font-size:20px;font-weight:700;color:#2563eb;">Snel<span style="color:#1a1a1a;">RIE</span></p>
    
    <h1 style="font-size:22px;margin:24px 0 12px;">Goed bezig! Maar er is meer.</h1>
    
    <p>Je hebt je gratis RI&E afgerond — complimenten. Veel bedrijven komen niet eens zo ver.</p>
    
    <p>Maar de gratis versie toont slechts <strong>3 van de gevonden risico's</strong>. De rest blijft verborgen. En juist die risico's kunnen het verschil maken tussen een veilige werkplek en een boete van de Arbeidsinspectie.</p>
    
    <p><strong>Wat je mist:</strong></p>
    <ul style="padding-left:20px;color:#4b5563;">
      <li>Alle geïdentificeerde risico's met prioriteit</li>
      <li>Concrete maatregelen per risico</li>
      <li>Een compleet Plan van Aanpak</li>
      <li>Downloadbaar PDF-rapport</li>
    </ul>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="{{REPORT_URL}}" style="display:inline-block;background:#2563eb;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Bekijk je volledige RI&E →</a>
    </div>
    
    <p style="color:#6b7280;font-size:13px;">Vanaf €99 — eenmalig, geen abonnement.</p>
  </div>
</div>`,
  },
  {
    dayOffset: 2,
    subject: "3 risico's die je mist met de gratis versie",
    previewText: "De Arbeidsinspectie kijkt naar je volledige RI&E. Niet naar de eerste 3.",
    bodyHtml: `
<div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
  <div style="padding:32px 24px;">
    <p style="font-size:20px;font-weight:700;color:#2563eb;">Snel<span style="color:#1a1a1a;">RIE</span></p>
    
    <h1 style="font-size:22px;margin:24px 0 12px;">Wist je dit over je RI&E?</h1>
    
    <p>De 3 risico's die je in je gratis rapport zag? Dat is het topje van de ijsberg.</p>
    
    <p>Typisch vinden we bij bedrijven in jouw branche <strong>8 tot 15 risico's</strong>. Hier zijn 3 categorieën die bijna altijd naar voren komen — maar niet in de gratis versie:</p>
    
    <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
      <p style="margin:0;font-weight:600;color:#b91c1c;">1. Psychosociale arbeidsbelasting (PSA)</p>
      <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Werkdruk, pesten, agressie — verplicht onderdeel van elke RI&E.</p>
    </div>
    
    <div style="background:#fefce8;border-left:4px solid #f59e0b;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
      <p style="margin:0;font-weight:600;color:#a16207;">2. Bedrijfshulpverlening (BHV)</p>
      <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Ontruimingsplan, EHBO, brand — de inspectie vraagt hier altijd naar.</p>
    </div>
    
    <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
      <p style="margin:0;font-weight:600;color:#b91c1c;">3. Fysieke belasting</p>
      <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Tillen, beeldschermwerk, repeterende bewegingen — vaak onderschat.</p>
    </div>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="{{REPORT_URL}}" style="display:inline-block;background:#2563eb;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Ontgrendel alle risico's →</a>
    </div>
    
    <p style="color:#6b7280;font-size:13px;">Basis pakket — €99 eenmalig.</p>
  </div>
</div>`,
  },
  {
    dayOffset: 3,
    subject: "€99 voor 3 maanden rust — doe nu een upgrade",
    previewText: "Een boete van de Arbeidsinspectie kost je minimaal €4.500. Een volledige RI&E? €99.",
    bodyHtml: `
<div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
  <div style="padding:32px 24px;">
    <p style="font-size:20px;font-weight:700;color:#2563eb;">Snel<span style="color:#1a1a1a;">RIE</span></p>
    
    <h1 style="font-size:22px;margin:24px 0 12px;">Laatste reminder: je RI&E is nog incompleet</h1>
    
    <p>Even de feiten op een rij:</p>
    
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:12px;border:1px solid #e5e7eb;background:#fef2f2;">
          <strong style="color:#b91c1c;">Boete Arbeidsinspectie</strong><br>
          <span style="font-size:24px;font-weight:700;color:#b91c1c;">€4.500+</span>
        </td>
        <td style="padding:12px;border:1px solid #e5e7eb;background:#f0fdf4;">
          <strong style="color:#15803d;">Volledige RI&E via SnelRIE</strong><br>
          <span style="font-size:24px;font-weight:700;color:#15803d;">€99</span>
        </td>
      </tr>
    </table>
    
    <p>Met het Basis-pakket krijg je:</p>
    <ul style="padding-left:20px;color:#4b5563;">
      <li>✅ Alle risico's + maatregelen</li>
      <li>✅ Plan van Aanpak</li>
      <li>✅ Professioneel PDF-rapport</li>
      <li>✅ Wettelijk compliant</li>
    </ul>
    
    <p><strong>En je hebt het in 5 minuten.</strong> Je RI&E is al gegenereerd — je hoeft alleen te upgraden.</p>
    
    <div style="text-align:center;margin:32px 0;">
      <a href="{{REPORT_URL}}" style="display:inline-block;background:#2563eb;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Upgrade naar Basis — €99 →</a>
    </div>
    
    <p style="color:#6b7280;font-size:13px;">Eenmalig bedrag. Geen abonnement. Geen verborgen kosten.</p>
    
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="color:#9ca3af;font-size:12px;">Je ontvangt deze email omdat je een gratis RI&E hebt gemaakt op SnelRIE. <a href="{{UNSUBSCRIBE_URL}}" style="color:#9ca3af;">Uitschrijven</a></p>
  </div>
</div>`,
  },
];
