export type ABVariant = 'a' | 'b' | 'c';

export const variantConfig = {
  a: {
    className: 'ab-control',
    label: 'Control',
    hero: {
      header: 'Je RI&E in minuten,',
      headerHighlight: 'niet weken',
      subtext:
        'AI-gestuurde Risico-Inventarisatie & Evaluatie. Branchespecifiek, professioneel, en direct klaar. Voldoe aan de Arbowet zonder weken te wachten op een adviseur.',
      cta: 'Start Gratis Scan',
    },
    usps: {
      title: 'Waarom bedrijven kiezen voor SnelRIE',
      items: [
        {
          title: 'AI-gestuurd',
          desc: 'Onze AI analyseert uw bedrijfssituatie en genereert een gepersonaliseerde RI&E op basis van de laatste arbocatalogi en wetgeving.',
        },
        {
          title: 'Branchespecifiek',
          desc: 'Geen generiek verhaal. Uw RI&E is afgestemd op de specifieke risico\'s en maatregelen van uw branche.',
        },
        {
          title: 'Klaar in minuten',
          desc: 'Traditioneel duurt een RI&E weken en kost het duizenden euro\'s. Bij SnelRIE heeft u binnen 5 minuten een professioneel rapport.',
        },
      ],
    },
    bottomCta: {
      title: 'Klaar om uw RI&E op te stellen?',
      text: 'Begin met een gratis scan en ontdek de grootste risico\'s in uw bedrijf. In 5 minuten klaar.',
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
      header: 'Geen RI&E? De Inspectie SZW deelt boetes',
      headerHighlight: 'tot €13.500 uit.',
      subtext:
        'Elke werkgever is wettelijk verplicht een RI&E te hebben. Toch mist 50% van het MKB er één. Voorkom boetes en aansprakelijkheid — stel uw RI&E vandaag nog op.',
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
