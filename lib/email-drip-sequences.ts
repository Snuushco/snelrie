/**
 * Email drip sequence definitions for trial-to-paid conversion and outbound nurture.
 *
 * Send via your email provider (Resend, Mailchimp, HubSpot, etc.) using a cron/queue.
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

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;margin:16px 0 0;text-align:center;">
      <p style="margin:0;font-size:14px;color:#15803d;">💡 Gebruik code <strong>SNELSTART20</strong> voor 20% korting op je eerste upgrade.</p>
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

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;margin:16px 0 0;text-align:center;">
      <p style="margin:0;font-size:14px;color:#15803d;">💡 Gebruik code <strong>SNELSTART20</strong> voor 20% korting — vandaag nog geldig.</p>
    </div>

    <p style="color:#6b7280;font-size:13px;">Basis pakket — €99 eenmalig.</p>
  </div>
</div>`,
  },
  {
    dayOffset: 3,
    subject: "€99 voor rust — doe nu een upgrade",
    previewText: "Een boete van de Arbeidsinspectie kost je al snel meer dan een volledige RI&E.",
    bodyHtml: `
<div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
  <div style="padding:32px 24px;">
    <p style="font-size:20px;font-weight:700;color:#2563eb;">Snel<span style="color:#1a1a1a;">RIE</span></p>

    <h1 style="font-size:22px;margin:24px 0 12px;">Laatste reminder: je RI&E is nog incompleet</h1>

    <p>Even de feiten op een rij:</p>

    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:12px;border:1px solid #e5e7eb;background:#fef2f2;">
          <strong style="color:#b91c1c;">Boeterisico</strong><br>
          <span style="font-size:24px;font-weight:700;color:#b91c1c;">duurder dan €99</span>
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
      <li>✅ Direct verder naar compliance</li>
    </ul>

    <p><strong>En je hebt het in minuten in plaats van weken.</strong></p>

    <div style="text-align:center;margin:32px 0;">
      <a href="{{REPORT_URL}}" style="display:inline-block;background:#2563eb;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Upgrade naar Basis — €99 →</a>
    </div>

    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin:16px 0 0;text-align:center;">
      <p style="margin:0;font-size:15px;font-weight:600;color:#92400e;">⏳ Laatste kans: gebruik code <strong>SNELSTART20</strong> voor 20% korting.</p>
    </div>

    <p style="color:#6b7280;font-size:13px;">Eenmalig bedrag. Geen abonnement. Geen verborgen kosten.</p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="color:#9ca3af;font-size:12px;">Je ontvangt deze email omdat je een gratis RI&E hebt gemaakt op SnelRIE. <a href="{{UNSUBSCRIBE_URL}}" style="color:#9ca3af;">Uitschrijven</a></p>
  </div>
</div>`,
  },
];

export const MKB_BOUW_OUTBOUND_DRIP: DripEmail[] = [
  {
    dayOffset: 1,
    subject: "{{bedrijf}} en de RI&E-plicht: staat dit al scherp?",
    previewText: "Voor bouwbedrijven met personeel is een actuele RI&E geen nice-to-have maar een wettelijke basis.",
    bodyHtml: `
<div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
  <div style="padding:32px 24px;">
    <p style="font-size:20px;font-weight:700;color:#2563eb;margin:0;">Snel<span style="color:#111827;">RIE</span></p>
    <p style="margin:24px 0 0;">Hallo {{contact}},</p>
    <p>Bij {{bedrijf}} in {{sector}} verschuiven risico's vaak per project, ploeg en locatie. Juist daarom is een actuele RI&E wettelijk verplicht én operationeel handig.</p>
    <p>Wat we in bouwbedrijven vaak zien:</p>
    <ul style="padding-left:20px;color:#374151;line-height:1.6;">
      <li>hoogtewerk, buitenwerk en tijdelijke werkplekken lopen door elkaar</li>
      <li>de RI&E is ooit gemaakt, maar sluit niet meer goed aan op de praktijk</li>
      <li>actualisatie blijft liggen tot er een auditvraag, incident of offerte-eis komt</li>
    </ul>
    <p>SnelRIE is gebouwd om dat sneller scherp te krijgen, zonder weken wachten op een adviseur. De bouwvariant start direct met projectrisico's zoals hoogtewerk, stoffen en wisselende locaties.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="https://www.snelrie.nl/?sector=bouw&utm_source=drip&utm_medium=email&utm_campaign=q185_mkb_bouw" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Bekijk de bouwvariant →</a>
    </div>
    <p style="margin-bottom:0;">Groet,<br>Emily<br><span style="color:#6b7280;">emily@snelrie.nl</span></p>
  </div>
</div>`,
  },
  {
    dayOffset: 3,
    subject: "Praktijkvoorbeeld: zo pakt een bouwbedrijf zijn RI&E in 1 week aan",
    previewText: "Geen theoretisch traject, maar een korte route van scan naar concreet overzicht.",
    bodyHtml: `
<div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
  <div style="padding:32px 24px;">
    <p style="font-size:20px;font-weight:700;color:#2563eb;margin:0;">Snel<span style="color:#111827;">RIE</span></p>
    <p style="margin:24px 0 0;">Hallo {{contact}},</p>
    <p>Om het concreet te maken: hieronder staat een <strong>geanonimiseerd praktijkvoorbeeld</strong> van hoe een middelgroot bouwbedrijf dit meestal aanpakt.</p>
    <ol style="padding-left:20px;color:#374151;line-height:1.7;">
      <li>Dag 1: gratis bouwscan invullen voor eerste risicoblokken</li>
      <li>Dag 2-3: ontbrekende punten aanscherpen rond hoogtewerk, materieel en onderaannemers</li>
      <li>Dag 4-5: compleet overzicht + maatregelen intern bespreken met projectleiding of preventiemedewerker</li>
      <li>Dag 5-7: Plan van Aanpak vastleggen en dossier op orde brengen</li>
    </ol>
    <p>De winst zit meestal niet in meer theorie, maar in sneller zien waar de RI&E te generiek of verouderd is voor de huidige projectpraktijk van {{bedrijf}}.</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin:24px 0;">
      <p style="margin:0 0 8px;font-weight:600;">Waarom dit voor bouw werkt</p>
      <p style="margin:0;color:#4b5563;">De bouwvariant legt extra nadruk op hoogtewerk, buitenwerk, tijdelijke werkplekken, gevaarlijke stoffen en coördinatie tussen locaties.</p>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="https://www.snelrie.nl/scan?sector=bouw&utm_source=drip&utm_medium=email&utm_campaign=q185_mkb_bouw" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Start de gratis bouwscan →</a>
    </div>
    <p style="margin-bottom:0;">Groet,<br>Emily</p>
  </div>
</div>`,
  },
  {
    dayOffset: 5,
    subject: "Wat kost het om dit snel netjes te regelen?",
    previewText: "Voor veel MKB-bouwbedrijven is de drempel lager dan gedacht: Basis €99, Professional €249, Enterprise €499.",
    bodyHtml: `
<div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
  <div style="padding:32px 24px;">
    <p style="font-size:20px;font-weight:700;color:#2563eb;margin:0;">Snel<span style="color:#111827;">RIE</span></p>
    <p style="margin:24px 0 0;">Hallo {{contact}},</p>
    <p>Een RI&E wordt vaak uitgesteld omdat ondernemers direct denken aan een lang adviestraject. Daarom even helder wat de SnelRIE-prijzen nu zijn:</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <tr style="background:#f9fafb;">
        <td style="padding:12px;border:1px solid #e5e7eb;"><strong>Basis</strong></td>
        <td style="padding:12px;border:1px solid #e5e7eb;">€99</td>
        <td style="padding:12px;border:1px solid #e5e7eb;">volledige RI&E met risico-inventarisatie</td>
      </tr>
      <tr>
        <td style="padding:12px;border:1px solid #e5e7eb;"><strong>Professional</strong></td>
        <td style="padding:12px;border:1px solid #e5e7eb;">€249</td>
        <td style="padding:12px;border:1px solid #e5e7eb;">RI&E + Plan van Aanpak + prioritering</td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:12px;border:1px solid #e5e7eb;"><strong>Enterprise</strong></td>
        <td style="padding:12px;border:1px solid #e5e7eb;">€499</td>
        <td style="padding:12px;border:1px solid #e5e7eb;">uitgebreide RI&E + PvA + AI Expert Chat</td>
      </tr>
    </table>
    <p>Voor de meeste MKB-bouwbedrijven is <strong>Basis of Professional</strong> al genoeg om veel sneller van losse signalen naar een bruikbaar dossier te gaan.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="https://www.snelrie.nl/?utm_source=drip&utm_medium=email&utm_campaign=q185_mkb_bouw#pricing" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Bekijk prijzen en pakketten →</a>
    </div>
    <p style="margin-bottom:0;">Groet,<br>Emily</p>
  </div>
</div>`,
  },
  {
    dayOffset: 7,
    subject: "Waarom bouwbedrijven niet uitkomen met een generieke kantoor-RI&E",
    previewText: "De bouwvariant van SnelRIE is juist gemaakt voor projectlocaties, buitenwerk en wisselende risico's.",
    bodyHtml: `
<div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
  <div style="padding:32px 24px;">
    <p style="font-size:20px;font-weight:700;color:#2563eb;margin:0;">Snel<span style="color:#111827;">RIE</span></p>
    <p style="margin:24px 0 0;">Hallo {{contact}},</p>
    <p>Een terugkerend probleem in {{sector}}: de RI&E is ooit opgezet vanuit een te generiek model en sluit daardoor slecht aan op de werkvloer.</p>
    <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:18px;border-radius:0 10px 10px 0;margin:20px 0;">
      <p style="margin:0;font-weight:600;color:#1d4ed8;">SnelRIE bouw-propositie</p>
      <p style="margin:8px 0 0;color:#374151;">Voor bouwbedrijven werkt een generieke kantoor-RI&E gewoon niet. Deze variant dwingt direct naar projectrisico's en praktische maatregelen.</p>
    </div>
    <p>Daarom hebben we de bouwvariant ingericht op:</p>
    <ul style="padding-left:20px;color:#374151;line-height:1.6;">
      <li>hoogtewerk en valgevaar</li>
      <li>buitenwerk, verkeer en wisselende projectlocaties</li>
      <li>gevaarlijke stoffen, stofbelasting en materieel</li>
      <li>praktische maatregelen die direct in een Plan van Aanpak passen</li>
    </ul>
    <p>Als {{bedrijf}} sneller wil zien waar de huidige RI&E te dun of verouderd is, dan is dit precies de route.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="https://www.snelrie.nl/?sector=bouw&utm_source=drip&utm_medium=email&utm_campaign=q185_mkb_bouw" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Bekijk waarom de bouwvariant past →</a>
    </div>
    <p style="margin-bottom:0;">Groet,<br>Emily</p>
  </div>
</div>`,
  },
  {
    dayOffset: 9,
    subject: "Zullen we {{bedrijf}} eerst gewoon met de gratis bouwscan laten starten?",
    previewText: "Geen lang traject: binnen enkele minuten eerste inzicht in projectrisico's en blinde vlekken.",
    bodyHtml: `
<div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
  <div style="padding:32px 24px;">
    <p style="font-size:20px;font-weight:700;color:#2563eb;margin:0;">Snel<span style="color:#111827;">RIE</span></p>
    <p style="margin:24px 0 0;">Hallo {{contact}},</p>
    <p>Laat ik het simpel houden: als dit relevant is voor {{bedrijf}}, dan is de beste volgende stap niet meteen een groot traject maar gewoon de <strong>gratis bouwscan</strong>.</p>
    <p>Daarmee zie je snel of jullie huidige RI&E nog past bij de praktijk van {{sector}} en waar de grootste gaten zitten.</p>
    <ul style="padding-left:20px;color:#374151;line-height:1.6;">
      <li>eerste risico-overzicht in minuten</li>
      <li>specifiek voor bouw- en installatiewerk</li>
      <li>bruikbaar als startpunt voor actualisatie of upgrade</li>
    </ul>
    <div style="text-align:center;margin:28px 0;">
      <a href="https://www.snelrie.nl/scan?sector=bouw&utm_source=drip&utm_medium=email&utm_campaign=q185_mkb_bouw" style="display:inline-block;background:#16a34a;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;">Start gratis bouwscan →</a>
    </div>
    <p>Als reactie op deze mail mag ook. Dan stuur ik kort terug welke route meestal het beste past bij bouwbedrijven van jullie formaat.</p>
    <p style="margin-bottom:0;">Groet,<br>Emily<br><span style="color:#6b7280;">SnelRIE — RI&E zonder gedoe</span></p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
    <p style="color:#9ca3af;font-size:12px;">Je ontvangt deze reeks omdat er zakelijke relevantie is rond RI&E voor {{bedrijf}} in {{sector}}. Uitschrijven kan via {{UNSUBSCRIBE_URL}}.</p>
  </div>
</div>`,
  },
];
