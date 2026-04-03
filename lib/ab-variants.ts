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
      header: 'Personeel in dienst? Je RI&E voor €19/mnd —',
      headerHighlight: 'klaar terwijl je koffie zet',
      subtext:
        'Een adviseur kost €1.500+. Bij SnelRIE vul je een kort formulier in en heb je direct een professioneel rapport. Speciaal voor kleine ondernemers en ZZP\'ers met personeel.',
      cta: 'Gratis Risico-Check Starten →',
    },
    usps: {
      title: 'Wat je krijgt',
      items: [
        {
          title: 'Vanaf €19/mnd',
          desc: 'Professionele RI&E zonder dure adviseur. Perfect voor kleine bedrijven.',
        },
        {
          title: 'Vandaag nog geregeld',
          desc: 'Geen wachttijd, geen afspraken, geen gedoe. Gewoon invullen en klaar.',
        },
        {
          title: 'Op maat voor jouw branche',
          desc: 'AI past de RI&E aan op jouw sector en risico\'s.',
        },
      ],
    },
    bottomCta: {
      title: 'De meeste kleine ondernemers missen verplichte risico\'s.',
      text: 'Check die van jou gratis.',
      button: 'Gratis Risico-Check Starten →',
    },
  },
  c: {
    className: 'ab-pain',
    label: 'Pain-Point',
    hero: {
      badge: 'Inspectie SZW verscherpt controles — RI&E-eisen aangescherpt per 2026',
      header: 'Geen RI&E? Ook kleine bedrijven krijgen boetes',
      headerHighlight: 'tot €13.500.',
      subtext:
        'De Inspectie SZW controleert steeds vaker, ook bij bedrijven met maar een paar medewerkers. Heb je personeel? Dan is een RI&E verplicht. Regel het in 10 minuten vanaf €19/mnd.',
      cta: 'Check Nu Of Je Compliant Bent →',
    },
    usps: {
      title: 'Waarom je dit niet kunt uitstellen',
      items: [
        {
          title: 'Boetes tot €13.500',
          desc: 'Inspectie SZW controleert steeds vaker, ook bij kleine bedrijven.',
        },
        {
          title: 'Persoonlijk aansprakelijk',
          desc: 'Bij een bedrijfsongeval zonder RI&E draai jij op voor de schade.',
        },
        {
          title: 'In 5 minuten opgelost',
          desc: 'Geen excuus meer. Je RI&E is sneller klaar dan de papierwinkel van een boete.',
        },
      ],
    },
    bottomCta: {
      title: 'Wacht niet op een controle.',
      text: 'Start nu je gratis risico-scan.',
      button: 'Check Nu Of Je Compliant Bent →',
    },
  },
} as const;
