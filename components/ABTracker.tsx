'use client';

import { useEffect } from 'react';
import { useABVariant } from '@/lib/ab-context';

export function ABTracker() {
  const variant = useABVariant();

  useEffect(() => {
    // Tracking is now handled in ABProvider on initial assignment
    // This component is kept for backward compatibility but does nothing
  }, [variant]);

  return null;
}
