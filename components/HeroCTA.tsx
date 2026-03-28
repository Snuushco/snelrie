'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useABVariant } from '@/lib/ab-context';
import { trackEvent } from '@/lib/analytics';

export function HeroCTA({
  cta,
  isBottom,
  href = '/scan',
}: {
  cta: string;
  isBottom?: boolean;
  href?: string;
}) {
  const variant = useABVariant();
  const handleClick = () => {
    trackEvent('hero_cta_click', {
      ab_variant: variant,
      cta_location: 'hero',
    });
  };

  if (isBottom) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-50 transition"
      >
        {cta}
        <ArrowRight className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-700 transition shadow-lg shadow-brand-600/25"
    >
      {cta}
      <ArrowRight className="h-5 w-5" />
    </Link>
  );
}
