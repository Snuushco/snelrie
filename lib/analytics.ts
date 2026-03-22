/**
 * GA4 Conversion Funnel Analytics for SnelRIE
 * 
 * Funnel stages:
 *   1. page_view /scan           — visitor lands on scan page
 *   2. scan_form_start           — first field interaction (branche or medewerkers)
 *   3. scan_form_step            — step progression (step 1 → 2)
 *   4. scan_form_submit          — form submitted (RI&E generation started)
 *   5. scan_result_view          — result page loaded (report DONE)
 *   6. upgrade_click             — CTA click on upgrade/checkout button
 *   7. checkout_start            — Stripe checkout session initiated
 *   8. purchase                  — payment completed (tracked server-side via webhook)
 * 
 * Additional events:
 *   - cta_click                  — any CTA button click (homepage, mid-page, bottom)
 *   - hero_cta_click             — hero section CTA specifically
 *   - ab_variant_assigned        — A/B test variant loaded
 *   - pdf_download               — paid user downloads PDF
 *   - chat_opened                — Enterprise user opens AI chat
 * 
 * GA4 Measurement ID: configured via NEXT_PUBLIC_GA4_ID env var
 */

// ─── Types ──────────────────────────────────────────────────────────────
export type FunnelEvent =
  | 'scan_form_start'
  | 'scan_form_step'
  | 'scan_form_submit'
  | 'scan_result_view'
  | 'upgrade_click'
  | 'checkout_start'
  | 'cta_click'
  | 'hero_cta_click'
  | 'ab_variant_assigned'
  | 'pdf_download'
  | 'chat_opened'
  | 'demo_start'
  | 'demo_step'
  | 'demo_preview_view'
  | 'demo_email_capture'
  | 'demo_cta_click';

export type EventParams = Record<string, string | number | boolean | undefined>;

// ─── Core tracking ──────────────────────────────────────────────────────

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Fire a GA4 event. Safe to call even if GA4 hasn't loaded yet
 * (events queue in dataLayer and flush once gtag initialises).
 */
export function trackEvent(event: FunnelEvent | string, params?: EventParams) {
  if (typeof window === 'undefined') return;

  // Always push to dataLayer (works with GTM too)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });

  // Also fire via gtag if available
  if (window.gtag) {
    window.gtag('event', event, params);
  }
}

// ─── Convenience helpers for each funnel stage ──────────────────────────

/** User interacts with the scan form for the first time */
export function trackFormStart(branche?: string) {
  trackEvent('scan_form_start', {
    form_name: 'rie_scan',
    branche: branche || 'unknown',
  });
}

/** User progresses to the next form step */
export function trackFormStep(step: number, branche: string, medewerkers: string) {
  trackEvent('scan_form_step', {
    form_name: 'rie_scan',
    step_number: step,
    branche,
    aantal_medewerkers: medewerkers,
  });
}

/** User submits the form (generation starts) */
export function trackFormSubmit(branche: string, medewerkers: string, tier: string) {
  trackEvent('scan_form_submit', {
    form_name: 'rie_scan',
    branche,
    aantal_medewerkers: medewerkers,
    tier,
  });
}

/** Result page loads with a completed report */
export function trackResultView(reportId: string, branche: string, tier: string, risicoCount: number) {
  trackEvent('scan_result_view', {
    report_id: reportId,
    branche,
    tier,
    risico_count: risicoCount,
  });
}

/** User clicks an upgrade/checkout button */
export function trackUpgradeClick(tier: string, reportId: string) {
  trackEvent('upgrade_click', {
    tier,
    report_id: reportId,
  });
}

/** Stripe checkout session is created */
export function trackCheckoutStart(tier: string, reportId: string) {
  trackEvent('checkout_start', {
    tier,
    report_id: reportId,
    currency: 'EUR',
    value: { BASIS: 99, PROFESSIONAL: 249, ENTERPRISE: 499 }[tier] || 0,
  });
}

/** Any CTA click (homepage, mid-page, pricing, etc.) */
export function trackCtaClick(location: string, label: string, variant?: string) {
  trackEvent('cta_click', {
    cta_location: location,
    cta_label: label,
    ab_variant: variant,
  });
}

/** PDF download by a paid user */
export function trackPdfDownload(reportId: string, tier: string) {
  trackEvent('pdf_download', {
    report_id: reportId,
    tier,
  });
}

/** Enterprise chat opened */
export function trackChatOpened(reportId: string) {
  trackEvent('chat_opened', {
    report_id: reportId,
  });
}

// ─── Demo flow tracking ─────────────────────────────────────────────────

/** Demo page loaded / flow started */
export function trackDemoStart(sector?: string) {
  trackEvent('demo_start', {
    form_name: 'demo_flow',
    sector: sector || 'none',
  });
}

/** User progresses to the next demo step */
export function trackDemoStep(step: number, branche: string, data?: Record<string, string>) {
  trackEvent('demo_step', {
    form_name: 'demo_flow',
    step_number: step,
    branche,
    ...data,
  });
}

/** AI preview shown after completing all 5 questions */
export function trackDemoPreviewView(branche: string, score: number) {
  trackEvent('demo_preview_view', {
    form_name: 'demo_flow',
    branche,
    risk_score: score,
  });
}

/** Email captured from demo flow */
export function trackDemoEmailCapture(branche: string, medewerkers: string) {
  trackEvent('demo_email_capture', {
    form_name: 'demo_flow',
    branche,
    aantal_medewerkers: medewerkers,
  });
}

/** CTA click from demo results page */
export function trackDemoCtaClick(ctaLabel: string, branche: string) {
  trackEvent('demo_cta_click', {
    form_name: 'demo_flow',
    cta_label: ctaLabel,
    branche,
  });
}
