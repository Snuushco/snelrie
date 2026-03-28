'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ABContext } from '@/lib/ab-context';
import type { ABVariant } from '@/lib/ab-variants';
import { trackEvent } from '@/lib/analytics';

const VARIANTS: ABVariant[] = ['a', 'b', 'c'];
const COOKIE_NAME = 'ab-variant';
const COOKIE_MAX_AGE = 30 * 86400; // 30 days

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; samesite=lax`;
}

export function ABProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [variant, setVariant] = useState<ABVariant>('a');
  const [hasAssigned, setHasAssigned] = useState(false);

  useEffect(() => {
    // Check for ?variant= query param override
    const urlVariant = searchParams?.get('variant');
    if (urlVariant && VARIANTS.includes(urlVariant as ABVariant)) {
      const v = urlVariant as ABVariant;
      setVariant(v);
      setCookie(COOKIE_NAME, v, COOKIE_MAX_AGE);
      setHasAssigned(true);
      return;
    }

    // Check for existing cookie
    const existing = getCookie(COOKIE_NAME);
    if (existing && VARIANTS.includes(existing as ABVariant)) {
      setVariant(existing as ABVariant);
      setHasAssigned(true);
      return;
    }

    // Assign new random variant
    const newVariant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
    setVariant(newVariant);
    setCookie(COOKIE_NAME, newVariant, COOKIE_MAX_AGE);
    setHasAssigned(true);

    // Track assignment
    trackEvent('ab_variant_assigned', {
      ab_variant: newVariant,
      ab_variant_label: { a: 'control', b: 'benefit', c: 'pain' }[newVariant],
    });
  }, [searchParams]);

  // Don't render children until variant is assigned (prevents flash of wrong content)
  if (!hasAssigned) {
    return null;
  }

  return <ABContext.Provider value={variant}>{children}</ABContext.Provider>;
}
