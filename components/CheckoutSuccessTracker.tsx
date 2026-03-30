'use client';

import { useEffect, useRef } from 'react';
import { trackCheckoutSuccess } from '@/lib/analytics';

interface CheckoutSuccessTrackerProps {
  tier: string;
  billingCycle: string;
  value: number;
}

/**
 * Client component that fires a GA4 conversion event when mounted.
 * Used on the checkout success page (/dashboard/abonnement?checkout=success).
 */
export function CheckoutSuccessTracker({ tier, billingCycle, value }: CheckoutSuccessTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      trackCheckoutSuccess(tier, billingCycle, value);
    }
  }, [tier, billingCycle, value]);

  return null;
}
