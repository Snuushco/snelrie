'use client';

import Link from 'next/link';
import {
  Shield,
  Zap,
  Building2,
  Clock,
  PiggyBank,
  CalendarCheck,
  Target,
  AlertTriangle,
  ShieldAlert,
  Timer,
  Scale,
} from 'lucide-react';
import { useABVariant } from '@/lib/ab-context';
import { variantConfig } from '@/lib/ab-variants';
import { HeroCTA } from './HeroCTA';

const uspIcons = {
  a: [Zap, Building2, Clock],
  b: [PiggyBank, CalendarCheck, Target],
  c: [AlertTriangle, ShieldAlert, Timer],
};

const heroBadge = {
  a: { icon: Scale, text: 'Wettelijk verplicht voor alle werkgevers' },
  b: { icon: PiggyBank, text: 'Bespaar €1.900+ op uw RI&E' },
  c: { icon: AlertTriangle, text: 'Inspectie SZW controleert steeds vaker' },
};

export function ABContent({
  sectorHero,
  sectorBadge,
  SectorIcon,
  sectorHref,
}: {
  sectorHero?: { badge: string; header: string; highlight: string; subtext: string; cta: string };
  sectorBadge?: string;
  SectorIcon?: any;
  sectorHref: string;
}) {
  const variant = useABVariant();
  const v = variantConfig[variant];
  const badge = heroBadge[variant];
  const icons = uspIcons[variant];

  return (
    <>
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
        {sectorHero && SectorIcon ? (
          <SectorIcon className="h-4 w-4" />
        ) : (
          <badge.icon className="h-4 w-4" />
        )}
        {sectorHero ? sectorBadge : badge.text}
      </div>

      {/* Hero Title */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
        {sectorHero ? sectorHero.header : v.hero.header}{' '}
        <span className="text-brand-600">
          {sectorHero ? sectorHero.highlight : v.hero.headerHighlight}
        </span>
      </h1>

      {/* Hero Subtext */}
      <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
        {sectorHero ? sectorHero.subtext : v.hero.subtext}
      </p>

      {/* Hero CTA Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <HeroCTA cta={sectorHero ? sectorHero.cta : v.hero.cta} href={sectorHref} />
        <a
          href="#hoe-werkt-het"
          className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold border border-gray-200 hover:bg-gray-50 transition"
        >
          Hoe werkt het?
        </a>
      </div>
    </>
  );
}

export function ABUSPs() {
  const variant = useABVariant();
  const v = variantConfig[variant];
  const icons = uspIcons[variant];

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {v.usps.items.map((usp, i) => {
        const Icon = icons[i];
        return (
          <div
            key={usp.title}
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition"
          >
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
              <Icon className="h-6 w-6 text-brand-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{usp.title}</h3>
            <p className="text-gray-600">{usp.desc}</p>
          </div>
        );
      })}
    </div>
  );
}

export function ABBottomCTA({ sectorBottom, sectorHref }: { sectorBottom?: { title: string; text: string; button: string }; sectorHref: string }) {
  const variant = useABVariant();
  const v = variantConfig[variant];

  return (
    <>
      <h2 className="text-3xl font-bold text-white mb-4">
        {sectorBottom ? sectorBottom.title : v.bottomCta.title}
      </h2>
      <p className="text-brand-100 text-lg mb-8">
        {sectorBottom ? sectorBottom.text : v.bottomCta.text}
      </p>
      <HeroCTA cta={sectorBottom ? sectorBottom.button : v.bottomCta.button} isBottom href={sectorHref} />
    </>
  );
}

export function ABMidCTA({
  sectorMidCta,
  sectorHref,
}: {
  sectorMidCta?: { eyebrow: string; title: string; text: string; button: string };
  sectorHref: string;
}) {
  return (
    <div className="bg-brand-50 rounded-2xl p-8 sm:p-12 border border-brand-100">
      <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">
        <AlertTriangle className="h-3.5 w-3.5" />
        {sectorMidCta ? sectorMidCta.eyebrow : 'Wist u dat? 72% van het MKB heeft geen geldige RI&E'}
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
        {sectorMidCta ? sectorMidCta.title : "Ontdek in 30 seconden uw grootste risico's"}
      </h2>
      <p className="text-gray-600 mb-6 max-w-xl mx-auto">
        {sectorMidCta
          ? sectorMidCta.text
          : "Start met een gratis scan - geen account, geen verplichtingen. U ziet direct welke risico's in uw branche spelen."}
      </p>
      <HeroCTA
        cta={sectorMidCta ? sectorMidCta.button : 'Start Gratis Risico-Scan →'}
        href={sectorHref}
      />
    </div>
  );
}

export function ABUSPsTitle() {
  const variant = useABVariant();
  const v = variantConfig[variant];
  return <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{v.usps.title}</h2>;
}
