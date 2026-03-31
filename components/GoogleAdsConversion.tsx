'use client';

import Script from 'next/script';

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

/**
 * Google Ads conversion tracking + remarketing tag.
 * Renders the gtag.js snippet for Google Ads (separate from GA4).
 *
 * Set NEXT_PUBLIC_GOOGLE_ADS_ID in .env / Vercel env vars (format: AW-XXXXXXXXX).
 * If the env var is missing, nothing renders (safe for dev/preview).
 *
 * Conversion events are fired via the helper below:
 *   import { trackConversion } from '@/components/GoogleAdsConversion';
 *   trackConversion('CONVERSION_LABEL', 19.00); // e.g. on sign-up
 */
export function GoogleAdsConversion() {
  if (!GOOGLE_ADS_ID) return null;

  return (
    <>
      {/* Only load gtag.js once — if GA4 already loads it, this is a no-op */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}

/**
 * Fire a Google Ads conversion event.
 * Call this on sign-up, scan completion, or checkout success.
 *
 * @param conversionLabel - The conversion label from Google Ads (format: XXXX-XXXX)
 * @param value - Optional monetary value of the conversion
 * @param currency - Currency code (default: EUR)
 *
 * Usage:
 *   trackConversion('AbCdEfGh', 19.00); // Sign-up conversion
 *   trackConversion('XyZwVuTs', 5.00);  // Free scan conversion
 */
export function trackConversion(
  conversionLabel: string,
  value?: number,
  currency: string = 'EUR'
) {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!adsId || typeof window === 'undefined') return;

  const gtag = (window as any).gtag;
  if (typeof gtag !== 'function') return;

  gtag('event', 'conversion', {
    send_to: `${adsId}/${conversionLabel}`,
    ...(value !== undefined && { value, currency }),
  });
}
