'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID;

/**
 * Google Analytics 4 loader.
 * Renders the gtag.js script tags and initialises dataLayer.
 * Placed in the root layout so every page is tracked automatically.
 *
 * Set NEXT_PUBLIC_GA4_ID in .env / Vercel env vars.
 * If the env var is missing, nothing renders (safe for dev/preview).
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            send_page_view: true,
            cookie_flags: 'SameSite=None;Secure',
          });
        `}
      </Script>
    </>
  );
}
