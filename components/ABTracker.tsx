'use client';

import { useEffect } from 'react';
import type { ABVariant } from '@/lib/ab-variants';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function ABTracker({ variant }: { variant: ABVariant }) {
  useEffect(() => {
    // Push to dataLayer (works with GTM and gtag)
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'ab_landing_variant',
        ab_variant: variant,
        ab_variant_label: { a: 'control', b: 'benefit', c: 'pain' }[variant],
      });

      // Also fire gtag event if available
      if (window.gtag) {
        window.gtag('event', 'ab_landing_variant', {
          variant,
          variant_label: { a: 'control', b: 'benefit', c: 'pain' }[variant],
        });
      }
    }
  }, [variant]);

  return null;
}

export function trackHeroClick(variant: ABVariant) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'ab_landing_hero_click',
      ab_variant: variant,
    });
    if (window.gtag) {
      window.gtag('event', 'ab_landing_hero_click', { variant });
    }
  }
}
