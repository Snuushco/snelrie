'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { trackHeroClick } from './ABTracker';
import type { ABVariant } from '@/lib/ab-variants';

export function HeroCTA({
  variant,
  cta,
  isBottom,
}: {
  variant: ABVariant;
  cta: string;
  isBottom?: boolean;
}) {
  const handleClick = () => trackHeroClick(variant);

  if (isBottom) {
    return (
      <Link
        href="/scan"
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
      href="/scan"
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-brand-700 transition shadow-lg shadow-brand-600/25"
    >
      {cta}
      <ArrowRight className="h-5 w-5" />
    </Link>
  );
}
