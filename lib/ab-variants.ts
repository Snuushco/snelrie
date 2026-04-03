export type ABVariant = 'a' | 'b' | 'c';

export const variantConfig = {
  a: {
    className: 'ab-control',
    label: 'Control',
    hero: {
      header: 'Eerste werknemer? Regel je RI&E',
      headerHighlight: 'in 10 minuten',
      subtext:
        'Als je personeel aanneemt, is een RI&E verplicht. Geen duur adviesbureau nodig — SnelRIE maakt het simpel, snel en betaalbaar. Vanaf €19/mnd.',
      cta: 'Start Gratis Scan',
    },
    usps: {
      title: 'Waarom kleine ondernemers kiezen voor SnelRIE',
      items: [
        {
          title: 'Simpel en snel',
          desc: 'Geen ingewikkelde vragenlijsten of weken wachten. Vul een korte intake in en je RI&E is klaar.',
        },
        {
          title: 'Op maat voor jouw branche',
          desc: 'Of je nu in de bouw, horeca, zorg of retail werkt — je krijgt een RI&E die past bij jouw risico\'s.',
        },
        {
          title: 'Vanaf €19/mnd',
          desc: 'Een adviseur kost al snel €1.500+. Bij SnelRIE heb je een professioneel rapport voor een fractie van die prijs.',
        },
      ],
    },
    bottomCta: {
      title: 'RI&E verplicht? Regel het nu.',
      text: 'Begin met een gratis scan en ontdek in 5 minuten de grootste risico\'s in jouw bedrijf.',
      button: 'Start Nu — Gratis',
    },
  },
  b: {
    className: 'ab-benefit',
    label: 'Benefit-Focus',
    hero: {
      header: 'Uw professionele RI&E voor €99 —',
      headerHighlight: 'klaar terwijl u koffie zet',
      subtext:
        'Andere bedrijven betalen €2.000+ en wachten weken. U vult 5 minuten een formulier in en downloadt direct een branchespecifiek, wettelijk onderbouwd rapport.',
      cta: 'Gratis Risico-Check Starten →',
    },
    usps: {
      title: 'Wat u krijgt',
      items: [
        {
          title: '€1.900+ bespaard',
          desc: 'Professionele RI&E voor een fractie van de adviseurskosten.',
        },
        {
          title: 'Vandaag nog compliant',
          desc: 'Geen wachttijd, geen afspraken, geen gedoe.',
        },
        {
          title: 'Op maat voor uw branche',
          desc: 'AI combineert uw situatie met de actuele arbocatalogus.',
        },
      ],
    },
    bottomCta: {
      title: 'Meer dan 95% van MKB\'ers mist verplichte risico\'s.',
      text: 'Check de uwe gratis.',
      button: 'Gratis Risico-Check Starten →',
    },
  },
  c: {
    className: 'ab-pain',
    label: 'Pain-Point',
    hero: {
      badge: 'Inspectie SZW verscherpt controles — RI&E-eisen aangescherpt per 2026',
      header: 'Geen RI&E? De Inspectie SZW deelt boetes',
      headerHighlight: 'tot €13.500 uit.',
      subtext:
        'De Inspectie SZW verscherpt controles in 2026: gevaarlijke stoffen en psychosociale belasting moeten nu expliciet in je RI&E. Voorkom boetes en aansprakelijkheid — stel uw RI&E vandaag nog op.',
      cta: 'Check Nu Of U Compliant Bent →',
    },
    usps: {
      title: 'Waarom u dit niet kunt uitstellen',
      items: [
        {
          title: 'Boetes tot €13.500',
          desc: 'Inspectie SZW controleert steeds vaker, ook bij kleine bedrijven.',
        },
        {
          title: 'Persoonlijk aansprakelijk',
          desc: 'Bij een bedrijfsongeval zonder RI&E draait ú op voor de schade.',
        },
        {
          title: 'In 5 minuten opgelost',
          desc: 'Geen excuus meer. Uw RI&E is sneller klaar dan de papierwinkel van een boete.',
        },
      ],
    },
    bottomCta: {
      title: 'Wacht niet op een controle.',
      text: 'Start nu uw gratis risico-scan.',
      button: 'Check Nu Of U Compliant Bent →',
    },
  },
} as const;
