'use client';

import { useEffect } from 'react';
import type { ABVariant } from '@/lib/ab-variants';
import { trackEvent } from '@/lib/analytics';

export function ABTracker({ variant }: { variant: ABVariant }) {
  useEffect(() => {
    trackEvent('ab_variant_assigned', {
      ab_variant: variant,
      ab_variant_label: { a: 'control', b: 'benefit', c: 'pain' }[variant],
    });
  }, [variant]);

  return null;
}

export function trackHeroClick(variant: ABVariant) {
  trackEvent('hero_cta_click', {
    ab_variant: variant,
    cta_location: 'hero',
  });
}
