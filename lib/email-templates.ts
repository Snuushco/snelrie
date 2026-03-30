/**
 * Email template helpers for SnelRIE drip sequences.
 * All emails in Dutch, professional tone, SnelRIE branding (blue #2563eb).
 */

const LOGO_HEADER = `<p style="font-size:20px;font-weight:700;color:#2563eb;margin:0;">Snel<span style="color:#1a1a1a;">RIE</span></p>`;

const LEGAL_FOOTER = `
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
<div style="color:#9ca3af;font-size:12px;line-height:1.5;">
  <p style="margin:0;">SnelRIE — RI&E zonder gedoe</p>
  <p style="margin:4px 0;">Een dienst van Praesidion Holding B.V. | KvK 97640794 | BTW NL868152237B01</p>
  <p style="margin:4px 0;"><a href="{{UNSUBSCRIBE_URL}}" style="color:#9ca3af;">Uitschrijven</a> | <a href="https://www.snelrie.nl/privacy" style="color:#9ca3af;">Privacybeleid</a></p>
</div>`;

function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;">
<div style="font-family:'Segoe UI',system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;color:#1a1a1a;">
  <div style="padding:32px 24px;">
    ${LOGO_HEADER}
    ${content}
    ${LEGAL_FOOTER}
  </div>
</div>
</body>
</html>`;
}

function ctaButton(text: string, url: string, color = "#2563eb"): string {
  return `<div style="text-align:center;margin:32px 0;">
  <a href="${url}" style="display:inline-block;background:${color};color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">${text}</a>
</div>`;
}

// ─── Sequence A: Free Scan Completed ─────────────────────────────────

export function freeScanDay0(meta: { reportUrl?: string; risksFound?: number; bedrijfsnaam?: string }): { subject: string; html: string; text: string } {
  const reportUrl = meta.reportUrl || "https://www.snelrie.nl/dashboard";
  const risksFound = meta.risksFound || 8;
  return {
    subject: "Uw gratis RI&E scan resultaten",
    html: wrapEmail(`
    <h1 style="font-size:22px;margin:24px 0 12px;">Uw RI&E scanresultaten zijn klaar</h1>
    
    <p>Bedankt voor het invullen van de gratis RI&E scan${meta.bedrijfsnaam ? ` voor <strong>${meta.bedrijfsnaam}</strong>` : ""}.</p>
    
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
      <p style="margin:0;font-size:14px;color:#b91c1c;font-weight:600;">Gevonden risico's</p>
      <p style="margin:8px 0 0;font-size:36px;font-weight:700;color:#b91c1c;">${risksFound}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">waarvan 3 zichtbaar in de gratis versie</p>
    </div>

    <p>De gratis versie toont slechts <strong>3 van de ${risksFound} gevonden risico's</strong>. De overige risico's — vaak de meest kritieke — zijn alleen beschikbaar in het volledige rapport.</p>

    <p><strong>Wat u mist:</strong></p>
    <ul style="padding-left:20px;color:#4b5563;">
      <li>Alle geïdentificeerde risico's met prioriteit</li>
      <li>Concrete maatregelen per risico</li>
      <li>Een compleet Plan van Aanpak</li>
      <li>Downloadbaar PDF-rapport</li>
    </ul>

    ${ctaButton("Bekijk uw volledige rapport →", reportUrl)}

    <p style="color:#6b7280;font-size:13px;">Vanaf €99 — eenmalig, geen abonnement.</p>
    `),
    text: `Uw RI&E scanresultaten zijn klaar

Bedankt voor het invullen van de gratis RI&E scan${meta.bedrijfsnaam ? ` voor ${meta.bedrijfsnaam}` : ""}.

Er zijn ${risksFound} risico's gevonden, waarvan 3 zichtbaar in de gratis versie.

De overige risico's zijn alleen beschikbaar in het volledige rapport.

Bekijk uw volledige rapport: ${reportUrl}

Vanaf €99 — eenmalig, geen abonnement.`
  };
}

export function freeScanDay2(): { subject: string; html: string; text: string } {
  return {
    subject: "Wist u dat 60% van de bedrijven geen actuele RI&E heeft?",
    html: wrapEmail(`
    <h1 style="font-size:22px;margin:24px 0 12px;">U bent al verder dan 60% van de bedrijven</h1>
    
    <p>Uit recent onderzoek van de Arbeidsinspectie blijkt dat <strong>6 op de 10 bedrijven</strong> geen actuele RI&E heeft. Dat terwijl het wettelijk verplicht is voor élk bedrijf met personeel.</p>

    <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:18px;border-radius:0 10px 10px 0;margin:20px 0;">
      <p style="margin:0;font-weight:600;color:#1d4ed8;">Wist u dat?</p>
      <ul style="margin:8px 0 0;padding-left:20px;color:#374151;line-height:1.7;">
        <li>De Arbeidsinspectie voert jaarlijks <strong>duizenden controles</strong> uit</li>
        <li>Een ontbrekende RI&E leidt direct tot een boete — <strong>geen waarschuwing</strong></li>
        <li>De gemiddelde boete voor een ontbrekende RI&E is <strong>€4.500</strong></li>
        <li>Bij een arbeidsongeval zonder RI&E kan de boete oplopen tot <strong>€13.500+</strong></li>
      </ul>
    </div>

    <p>U heeft al de eerste stap gezet door een gratis scan te doen. Het volledige rapport kost minder dan een uur werk van een externe adviseur — en is binnen minuten klaar.</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-weight:600;color:#15803d;">Wat zeggen andere ondernemers?</p>
      <p style="margin:0;color:#4b5563;font-style:italic;">"Ik dacht dat onze RI&E nog actueel was, tot ik de scan deed. Binnen een uur had ik een compleet rapport — inclusief dingen die ik over het hoofd had gezien."</p>
      <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">— MKB-ondernemer, bouwsector</p>
    </div>

    ${ctaButton("Ontgrendel uw volledige rapport →", "https://www.snelrie.nl/dashboard?utm_source=drip&utm_medium=email&utm_campaign=free_scan_d2")}

    <p style="color:#6b7280;font-size:13px;">Vanaf €99 — eenmalig, geen abonnement.</p>
    `),
    text: `Wist u dat 60% van de bedrijven geen actuele RI&E heeft?

U bent al verder dan de meeste bedrijven door een gratis scan te doen.

Feiten:
- 6 op de 10 bedrijven heeft geen actuele RI&E
- De Arbeidsinspectie geeft geen waarschuwing — direct een boete
- Gemiddelde boete: €4.500
- Bij arbeidsongeval zonder RI&E: tot €13.500+

Ontgrendel uw volledige rapport: https://www.snelrie.nl/dashboard

Vanaf €99 — eenmalig, geen abonnement.`
  };
}

export function freeScanDay5(): { subject: string; html: string; text: string } {
  return {
    subject: "Uw RI&E verloopt — voorkom boetes tot €4.500",
    html: wrapEmail(`
    <h1 style="font-size:22px;margin:24px 0 12px;">Uw RI&E is nog niet compleet</h1>

    <p>Vijf dagen geleden heeft u een gratis RI&E scan gedaan. U weet nu dat er risico's zijn — maar uw rapport is nog niet volledig.</p>

    <div style="margin:20px 0;">
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:20px;text-align:center;margin-bottom:12px;">
        <p style="margin:0;font-size:14px;color:#b91c1c;font-weight:600;">Boete bij ontbrekende RI&E</p>
        <p style="margin:8px 0 0;font-size:28px;font-weight:700;color:#b91c1c;">€4.500+</p>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;text-align:center;">
        <p style="margin:0;font-size:14px;color:#15803d;font-weight:600;">Volledige RI&E via SnelRIE</p>
        <p style="margin:8px 0 0;font-size:28px;font-weight:700;color:#15803d;">vanaf €99</p>
      </div>
    </div>

    <p><strong>De Arbeidsinspectie accepteert geen halve RI&E.</strong> Een gratis scan is een goed begin, maar bij een controle moet u een volledig rapport kunnen tonen — inclusief alle risico's, maatregelen en een Plan van Aanpak.</p>

    <p>Met SnelRIE regelt u dit in minuten:</p>
    <ul style="padding-left:20px;color:#4b5563;">
      <li>✅ Alle risico's met prioriteit en concrete maatregelen</li>
      <li>✅ Professioneel PDF-rapport voor uw dossier</li>
      <li>✅ Plan van Aanpak (bij Professional/Enterprise)</li>
      <li>✅ Direct bruikbaar bij inspectie</li>
    </ul>

    ${ctaButton("Voorkom boetes — upgrade nu →", "https://www.snelrie.nl/dashboard?utm_source=drip&utm_medium=email&utm_campaign=free_scan_d5", "#dc2626")}

    <p style="color:#6b7280;font-size:13px;">Eenmalig bedrag. Geen abonnement. Klaar in minuten.</p>
    `),
    text: `Uw RI&E verloopt — voorkom boetes tot €4.500

Vijf dagen geleden deed u een gratis RI&E scan. Uw rapport is nog niet volledig.

Boete bij ontbrekende RI&E: €4.500+
Volledige RI&E via SnelRIE: vanaf €99

De Arbeidsinspectie accepteert geen halve RI&E. Bij een controle moet u een volledig rapport kunnen tonen.

Upgrade nu: https://www.snelrie.nl/dashboard

Eenmalig bedrag. Geen abonnement.`
  };
}

export function freeScanDay10(): { subject: string; html: string; text: string } {
  return {
    subject: "Laatste kans: 20% korting op uw eerste jaarabonnement",
    html: wrapEmail(`
    <h1 style="font-size:22px;margin:24px 0 12px;">Exclusief aanbod: 20% korting</h1>

    <p>Tien dagen geleden heeft u een gratis RI&E scan gedaan. We willen u graag helpen om uw bedrijf volledig compliant te maken — daarom bieden we u een exclusieve korting aan.</p>

    <div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
      <p style="margin:0;font-size:13px;color:#15803d;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Exclusieve korting</p>
      <p style="margin:8px 0;font-size:32px;font-weight:800;color:#15803d;">20% KORTING</p>
      <p style="margin:0;font-size:16px;color:#1a1a1a;">met code <strong style="background:#dcfce7;padding:4px 12px;border-radius:4px;font-size:18px;">SNELRIE20</strong></p>
      <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Geldig op uw eerste jaarabonnement</p>
    </div>

    <p><strong>Waarom een jaarabonnement?</strong></p>
    <ul style="padding-left:20px;color:#4b5563;line-height:1.8;">
      <li>Uw RI&E moet <strong>jaarlijks geactualiseerd</strong> worden bij wijzigingen</li>
      <li>Met een abonnement kunt u <strong>onbeperkt rapporten</strong> genereren en bijwerken</li>
      <li>Altijd een <strong>actueel rapport</strong> klaar voor de Arbeidsinspectie</li>
      <li>Inclusief <strong>Plan van Aanpak</strong> en automatische herinneringen</li>
    </ul>

    ${ctaButton("Claim uw 20% korting →", "https://www.snelrie.nl/pricing?coupon=SNELRIE20&utm_source=drip&utm_medium=email&utm_campaign=free_scan_d10", "#16a34a")}

    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin:16px 0 0;text-align:center;">
      <p style="margin:0;font-size:14px;color:#92400e;">⏳ Dit aanbod is <strong>7 dagen geldig</strong> — daarna vervalt de kortingscode.</p>
    </div>

    <p style="color:#6b7280;font-size:13px;">Of kies een eenmalig rapport vanaf €99.</p>
    `),
    text: `Laatste kans: 20% korting op uw eerste jaarabonnement

Exclusieve korting: 20% met code SNELRIE20

Waarom een jaarabonnement?
- Uw RI&E moet jaarlijks geactualiseerd worden
- Onbeperkt rapporten genereren en bijwerken
- Altijd een actueel rapport klaar voor de Arbeidsinspectie
- Inclusief Plan van Aanpak en herinneringen

Claim uw korting: https://www.snelrie.nl/pricing?coupon=SNELRIE20

Dit aanbod is 7 dagen geldig.`
  };
}

// ─── Sequence B: Account Created ─────────────────────────────────────

export function accountCreatedDay1(meta: { naam?: string }): { subject: string; html: string; text: string } {
  const greeting = meta.naam ? `Welkom ${meta.naam}` : "Welkom";
  return {
    subject: "Welkom bij SnelRIE — zo haalt u het meeste uit uw account",
    html: wrapEmail(`
    <h1 style="font-size:22px;margin:24px 0 12px;">${greeting}!</h1>

    <p>Fijn dat u een account heeft aangemaakt bij SnelRIE. U bent nu klaar om uw bedrijf compliant te maken — snel en zonder gedoe.</p>

    <p><strong>Dit kunt u nu direct doen:</strong></p>

    <div style="margin:20px 0;">
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:12px;">
        <p style="margin:0;font-weight:600;color:#1d4ed8;">1. Start een gratis RI&E scan</p>
        <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Vul de basisvragen in en krijg direct inzicht in de belangrijkste risico's voor uw bedrijf.</p>
      </div>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:12px;">
        <p style="margin:0;font-weight:600;color:#1d4ed8;">2. Bekijk uw dashboard</p>
        <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Al uw rapporten, scans en abonnementsgegevens op één plek.</p>
      </div>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;">
        <p style="margin:0;font-weight:600;color:#1d4ed8;">3. Kies het juiste pakket</p>
        <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Van gratis scan tot compleet jaarabonnement — er is altijd een pakket dat past.</p>
      </div>
    </div>

    ${ctaButton("Naar uw dashboard →", "https://www.snelrie.nl/dashboard?utm_source=drip&utm_medium=email&utm_campaign=account_d1")}

    <p style="color:#6b7280;font-size:13px;">Vragen? Reply op deze email of mail naar emily@snelrie.nl.</p>
    `),
    text: `${greeting}!

Fijn dat u een account heeft aangemaakt bij SnelRIE.

Dit kunt u nu direct doen:

1. Start een gratis RI&E scan
   Vul de basisvragen in en krijg direct inzicht in de belangrijkste risico's.

2. Bekijk uw dashboard
   Al uw rapporten, scans en abonnementsgegevens op één plek.

3. Kies het juiste pakket
   Van gratis scan tot compleet jaarabonnement.

Naar uw dashboard: https://www.snelrie.nl/dashboard

Vragen? Mail naar emily@snelrie.nl`
  };
}

export function accountCreatedDay3(): { subject: string; html: string; text: string } {
  return {
    subject: "3 redenen waarom een RI&E-abonnement slimmer is dan eenmalig",
    html: wrapEmail(`
    <h1 style="font-size:22px;margin:24px 0 12px;">Eenmalig rapport of doorlopend abonnement?</h1>

    <p>De meeste ondernemers beginnen met een eenmalig rapport. Dat is prima — maar er zijn goede redenen om een stap verder te gaan:</p>

    <div style="margin:20px 0;">
      <div style="border-left:4px solid #2563eb;padding:12px 18px;margin-bottom:16px;">
        <p style="margin:0;font-weight:600;color:#1d4ed8;">1. Uw RI&E moet actueel blijven</p>
        <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Bij elke wijziging in werkprocessen, personeel of locaties moet uw RI&E worden geactualiseerd. Met een abonnement doet u dat met één klik.</p>
      </div>
      <div style="border-left:4px solid #2563eb;padding:12px 18px;margin-bottom:16px;">
        <p style="margin:0;font-weight:600;color:#1d4ed8;">2. Goedkoper op jaarbasis</p>
        <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Een los rapport kost €99-€499. Een jaarabonnement geeft u onbeperkt rapporten, updates en support — vaak voordeliger dan twee losse rapporten.</p>
      </div>
      <div style="border-left:4px solid #2563eb;padding:12px 18px;">
        <p style="margin:0;font-weight:600;color:#1d4ed8;">3. Altijd audit-ready</p>
        <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">De Arbeidsinspectie kan elk moment langskomen. Met een abonnement heeft u altijd een actueel rapport klaarliggen.</p>
      </div>
    </div>

    ${ctaButton("Bekijk abonnementen →", "https://www.snelrie.nl/pricing?utm_source=drip&utm_medium=email&utm_campaign=account_d3")}

    <p style="color:#6b7280;font-size:13px;">Liever eerst een eenmalig rapport? Dat kan ook — start een gratis scan.</p>
    `),
    text: `3 redenen waarom een RI&E-abonnement slimmer is dan eenmalig

1. Uw RI&E moet actueel blijven
Bij elke wijziging in werkprocessen, personeel of locaties moet uw RI&E worden geactualiseerd.

2. Goedkoper op jaarbasis
Een los rapport kost €99-€499. Een jaarabonnement geeft onbeperkt rapporten en updates.

3. Altijd audit-ready
De Arbeidsinspectie kan elk moment langskomen. Met een abonnement heeft u altijd een actueel rapport.

Bekijk abonnementen: https://www.snelrie.nl/pricing`
  };
}

export function accountCreatedDay7(meta: { branche?: string }): { subject: string; html: string; text: string } {
  const branche = meta.branche || "uw branche";
  return {
    subject: "Uw branche in de spotlight: de 5 grootste risico's",
    html: wrapEmail(`
    <h1 style="font-size:22px;margin:24px 0 12px;">De 5 grootste risico's in ${branche}</h1>

    <p>Elke branche heeft specifieke risico's. Uit onze data en de richtlijnen van de Arbeidsinspectie komen deze vijf het vaakst voor:</p>

    <div style="margin:20px 0;">
      <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 18px;margin-bottom:10px;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-weight:600;color:#b91c1c;">1. Psychosociale arbeidsbelasting (PSA)</p>
        <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Werkdruk, pesten, discriminatie en agressie op de werkplek.</p>
      </div>
      <div style="background:#fefce8;border-left:4px solid #f59e0b;padding:12px 18px;margin-bottom:10px;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-weight:600;color:#a16207;">2. Fysieke belasting</p>
        <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Tillen, duwen, beeldschermwerk en repeterende bewegingen.</p>
      </div>
      <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 18px;margin-bottom:10px;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-weight:600;color:#b91c1c;">3. Bedrijfshulpverlening (BHV)</p>
        <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Ontruimingsplan, EHBO-voorzieningen en brandveiligheid.</p>
      </div>
      <div style="background:#fefce8;border-left:4px solid #f59e0b;padding:12px 18px;margin-bottom:10px;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-weight:600;color:#a16207;">4. Gevaarlijke stoffen</p>
        <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Blootstelling aan chemische stoffen, stof en dampen.</p>
      </div>
      <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 18px;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-weight:600;color:#b91c1c;">5. Arbeidsmiddelen en machines</p>
        <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Veilig gebruik, keuring en onderhoud van apparatuur.</p>
      </div>
    </div>

    <p>Wilt u weten hoe uw bedrijf scoort op deze risico's? Start een gratis scan en krijg direct inzicht.</p>

    ${ctaButton("Start gratis scan →", "https://www.snelrie.nl/scan?utm_source=drip&utm_medium=email&utm_campaign=account_d7", "#16a34a")}
    `),
    text: `De 5 grootste risico's in ${branche}

1. Psychosociale arbeidsbelasting (PSA)
   Werkdruk, pesten, discriminatie en agressie.

2. Fysieke belasting
   Tillen, duwen, beeldschermwerk en repeterende bewegingen.

3. Bedrijfshulpverlening (BHV)
   Ontruimingsplan, EHBO en brandveiligheid.

4. Gevaarlijke stoffen
   Blootstelling aan chemische stoffen, stof en dampen.

5. Arbeidsmiddelen en machines
   Veilig gebruik, keuring en onderhoud.

Start een gratis scan: https://www.snelrie.nl/scan`
  };
}

// ─── Sequence C: Subscription Active (Onboarding) ───────────────────

export function subscriptionDay0(meta: { naam?: string; tier?: string }): { subject: string; html: string; text: string } {
  const greeting = meta.naam ? `Welkom ${meta.naam}` : "Welkom";
  const tier = meta.tier || "Professional";
  return {
    subject: "Welkom! Zo maakt u uw eerste RI&E rapport",
    html: wrapEmail(`
    <h1 style="font-size:22px;margin:24px 0 12px;">${greeting}! Uw ${tier}-abonnement is actief 🎉</h1>

    <p>Gefeliciteerd — u heeft de belangrijkste stap al gezet. Nu is het tijd om uw eerste volledige RI&E rapport te maken.</p>

    <p><strong>In 3 stappen naar uw eerste rapport:</strong></p>

    <div style="margin:20px 0;">
      <div style="display:flex;margin-bottom:16px;">
        <div style="background:#2563eb;color:white;width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;line-height:32px;text-align:center;">1</div>
        <div style="margin-left:12px;">
          <p style="margin:0;font-weight:600;">Vul de bedrijfsgegevens in</p>
          <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Branche, aantal medewerkers, locaties — de basis voor een goed rapport.</p>
        </div>
      </div>
      <div style="display:flex;margin-bottom:16px;">
        <div style="background:#2563eb;color:white;width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;line-height:32px;text-align:center;">2</div>
        <div style="margin-left:12px;">
          <p style="margin:0;font-weight:600;">Beantwoord de risicovragen</p>
          <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Onze AI stelt gerichte vragen op basis van uw branche. Duurt gemiddeld 15 minuten.</p>
        </div>
      </div>
      <div style="display:flex;">
        <div style="background:#2563eb;color:white;width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;line-height:32px;text-align:center;">3</div>
        <div style="margin-left:12px;">
          <p style="margin:0;font-weight:600;">Download uw rapport</p>
          <p style="margin:4px 0 0;font-size:14px;color:#4b5563;">Compleet PDF-rapport met alle risico's, maatregelen en Plan van Aanpak.</p>
        </div>
      </div>
    </div>

    ${ctaButton("Maak uw eerste rapport →", "https://www.snelrie.nl/dashboard/new?utm_source=drip&utm_medium=email&utm_campaign=sub_d0")}

    <p style="color:#6b7280;font-size:13px;">Hulp nodig? Reply op deze email — we helpen u graag.</p>
    `),
    text: `${greeting}! Uw ${tier}-abonnement is actief.

In 3 stappen naar uw eerste rapport:

1. Vul de bedrijfsgegevens in
2. Beantwoord de risicovragen (±15 minuten)
3. Download uw compleet PDF-rapport

Maak uw eerste rapport: https://www.snelrie.nl/dashboard/new

Hulp nodig? Mail naar emily@snelrie.nl`
  };
}

export function subscriptionDay7(): { subject: string; html: string; text: string } {
  return {
    subject: "Tip: gebruik de Plan van Aanpak generator",
    html: wrapEmail(`
    <h1 style="font-size:22px;margin:24px 0 12px;">Heeft u het Plan van Aanpak al gebruikt?</h1>

    <p>Een RI&E zonder Plan van Aanpak is als een diagnose zonder recept. De Arbeidsinspectie verwacht dat u niet alleen risico's identificeert, maar ook laat zien <strong>wat u eraan gaat doen</strong>.</p>

    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px;margin:20px 0;">
      <p style="margin:0;font-weight:600;color:#1d4ed8;">💡 Tip: Plan van Aanpak generator</p>
      <p style="margin:8px 0 0;font-size:14px;color:#4b5563;">In uw dashboard vindt u de Plan van Aanpak generator. Deze maakt automatisch een concreet actieplan op basis van uw RI&E-resultaten — compleet met:</p>
      <ul style="margin:8px 0 0;padding-left:20px;color:#4b5563;font-size:14px;">
        <li>Prioritering van maatregelen (hoog/midden/laag)</li>
        <li>Verantwoordelijke per maatregel</li>
        <li>Voorgestelde deadlines</li>
        <li>Downloadbaar als PDF of Excel</li>
      </ul>
    </div>

    ${ctaButton("Open de Plan van Aanpak generator →", "https://www.snelrie.nl/dashboard?tab=pva&utm_source=drip&utm_medium=email&utm_campaign=sub_d7")}

    <p style="color:#6b7280;font-size:13px;">Tip: deel het Plan van Aanpak met uw preventiemedewerker of HR-afdeling.</p>
    `),
    text: `Heeft u het Plan van Aanpak al gebruikt?

Een RI&E zonder Plan van Aanpak is als een diagnose zonder recept.

De Plan van Aanpak generator maakt automatisch een actieplan op basis van uw RI&E:
- Prioritering van maatregelen
- Verantwoordelijke per maatregel
- Voorgestelde deadlines
- Downloadbaar als PDF of Excel

Open de generator: https://www.snelrie.nl/dashboard?tab=pva

Tip: deel het Plan van Aanpak met uw preventiemedewerker.`
  };
}

export function subscriptionDay30(meta: { reportsCount?: number }): { subject: string; html: string; text: string } {
  const reports = meta.reportsCount || 0;
  return {
    subject: "Uw eerste maand — heeft u al uw rapport geüpdatet?",
    html: wrapEmail(`
    <h1 style="font-size:22px;margin:24px 0 12px;">Uw eerste maand bij SnelRIE 📊</h1>

    <p>U bent nu een maand abonnee — een goed moment om even te checken of alles op orde is.</p>

    ${reports > 0 ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
      <p style="margin:0;font-size:14px;color:#15803d;font-weight:600;">Uw rapporten</p>
      <p style="margin:8px 0 0;font-size:36px;font-weight:700;color:#15803d;">${reports}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">rapporten aangemaakt</p>
    </div>
    ` : `
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
      <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">U heeft nog geen rapport aangemaakt</p>
      <p style="margin:8px 0 0;font-size:14px;color:#78716c;">Maak vandaag uw eerste rapport — het kost maar 15 minuten.</p>
    </div>
    `}

    <p><strong>Checklist voor een complete RI&E:</strong></p>
    <ul style="padding-left:20px;color:#4b5563;line-height:1.8;">
      <li>☐ RI&E rapport aangemaakt en gedownload</li>
      <li>☐ Plan van Aanpak opgesteld</li>
      <li>☐ Rapport gedeeld met preventiemedewerker</li>
      <li>☐ Maatregelen ingepland in de agenda</li>
      <li>☐ Herinnering gezet voor jaarlijkse update</li>
    </ul>

    <p>Is er iets veranderd in uw bedrijf de afgelopen maand? Nieuwe medewerkers, andere werkprocessen, of een nieuwe locatie? Dan is het slim om uw rapport te updaten.</p>

    ${ctaButton("Ga naar uw dashboard →", "https://www.snelrie.nl/dashboard?utm_source=drip&utm_medium=email&utm_campaign=sub_d30")}
    `),
    text: `Uw eerste maand bij SnelRIE

U bent nu een maand abonnee. Even checken of alles op orde is.

${reports > 0 ? `U heeft ${reports} rapporten aangemaakt.` : "U heeft nog geen rapport aangemaakt."}

Checklist:
- RI&E rapport aangemaakt en gedownload
- Plan van Aanpak opgesteld
- Rapport gedeeld met preventiemedewerker
- Maatregelen ingepland
- Herinnering gezet voor jaarlijkse update

Is er iets veranderd? Update uw rapport: https://www.snelrie.nl/dashboard`
  };
}
