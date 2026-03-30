# Google Ads Setup — SnelRIE

## Status: Tracking Infrastructure Ready ✅

GA4 is already installed and actively tracking. Conversion events are configured for Google Ads import.

---

## 1. Environment Variables (Vercel)

Set these in Vercel → Project Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GA4_ID` | GA4 Measurement ID | `G-XXXXXXXXXX` |

> The GA4 ID is already referenced in `components/GoogleAnalytics.tsx`. If not set, tracking silently disables (safe for dev/preview).

---

## 2. Conversion Events Configured

These events fire automatically and can be imported as Google Ads conversions:

### Primary Conversions (for campaign optimization)

| Event | Trigger | Value | Use For |
|-------|---------|-------|---------|
| `free_scan_completed` | Free RI&E scan result page loads | Lead (no monetary) | Lead generation campaigns |
| `checkout_success` | Subscription checkout completed | € subscription amount | ROAS/revenue campaigns |
| `purchase` | Same as checkout_success (GA4 ecommerce format) | € subscription amount | Smart Bidding |

### Secondary Conversions (for observation)

| Event | Trigger | Notes |
|-------|---------|-------|
| `trial_started` | New account registered (14-day trial) | Track trial → paid conversion rate |
| `scan_form_submit` | Scan form submitted | Top of funnel |
| `upgrade_click` | User clicks upgrade CTA | Mid-funnel intent signal |
| `checkout_start` | Stripe checkout session created | Bottom of funnel |

### Existing Funnel Events (already tracked)

- `scan_form_start` — First form interaction
- `scan_form_step` — Form step progression
- `scan_result_view` — Result page loaded
- `demo_start` / `demo_step` / `demo_email_capture` — Demo flow
- `cta_click` / `hero_cta_click` — CTA interactions

---

## 3. Google Ads Setup Steps

### 3.1 Link GA4 to Google Ads
1. In GA4 → Admin → Product Links → Google Ads
2. Link the Google Ads account
3. Enable auto-tagging

### 3.2 Import Conversions
1. In Google Ads → Tools → Conversions
2. Click "+ New conversion action" → "Import" → "Google Analytics 4"
3. Import these events as conversions:
   - `free_scan_completed` → Category: Lead, Value: Use default (€0, or set €5-10 estimated lead value)
   - `purchase` → Category: Purchase, Value: Use event value (dynamic € amount)
4. Set `purchase` as the **primary** conversion for Smart Bidding
5. Set `free_scan_completed` as **secondary** (observation only, or primary for lead gen campaigns)

### 3.3 Create Audiences (Remarketing)
In GA4 → Configure → Audiences:
- **Scan starters**: `scan_form_start` in last 30 days, NOT `purchase`
- **Scan completers**: `free_scan_completed` in last 30 days, NOT `purchase`
- **Trial users**: `trial_started` in last 14 days, NOT `purchase`
- **Upgraders abandoned**: `checkout_start` in last 7 days, NOT `purchase`

---

## 4. Recommended Campaign Structure

### Campaign 1: Search — RI&E Keywords (Lead Gen)
- **Goal:** Free scan completions → trial → paid
- **Budget:** €25-40/dag
- **Bid strategy:** Maximize conversions (target: `free_scan_completed`)
- **Keywords:**
  - `rie maken` / `rie opstellen` / `risico inventarisatie`
  - `rie verplicht` / `rie wetgeving` / `arbowet rie`
  - `rie software` / `rie tool` / `rie online`
  - `plan van aanpak rie` / `rie voorbeeld`
- **Ad groups:**
  1. RI&E Generiek (rie maken, rie opstellen)
  2. RI&E Verplicht (wetgeving, boetes, arbeidsinspectie)
  3. RI&E Sectoren (horeca, bouw, zorg, etc.)
  4. RI&E Software (tool, online, AI)

### Campaign 2: Search — Competitor/Alternative
- **Goal:** Brand awareness + sign-ups
- **Budget:** €10-15/dag
- **Keywords:**
  - `rie tool vergelijken` / `beste rie software`
  - `alternatief [competitor]` (if applicable)

### Campaign 3: Remarketing (Display + YouTube)
- **Goal:** Convert scan completers and trial users to paid
- **Budget:** €10-15/dag
- **Bid strategy:** Target CPA
- **Audiences:** Scan completers, Trial users, Checkout abandoned
- **Ads:** "U heeft al X risico's gevonden — upgrade voor het volledige Plan van Aanpak"

### Campaign 4: Performance Max (once enough conversion data)
- **Goal:** Maximize revenue
- **Budget:** €30-50/dag
- **Bid strategy:** Maximize conversion value (target ROAS)
- **When:** After 50+ conversions/month from Search campaigns

---

## 5. Recommended Budget & Bid Strategy

### Starting Budget: €50-70/dag (€1.500-2.100/maand)

| Campaign | Daily Budget | Monthly | Bid Strategy |
|----------|-------------|---------|-------------|
| Search — RI&E Keywords | €30 | €900 | Maximize conversions |
| Search — Competitor | €10 | €300 | Maximize clicks → switch to conversions after 30 conv |
| Remarketing | €10 | €300 | Target CPA (€15-25) |
| **Total** | **€50** | **€1.500** | |

### Scaling Plan
- Month 1-2: Search only, collect conversion data
- Month 3: Add remarketing once 100+ scan completions
- Month 4+: Add Performance Max when 50+ conversions/month
- Scale budget on campaigns with CPA < €30 (for free scan) or ROAS > 3x (for purchases)

### Expected Metrics (estimates)
- **CPC (search):** €1.50-3.50
- **Conversion rate (scan completion):** 15-25% of clicks
- **Cost per free scan:** €8-20
- **Trial → Paid rate:** 10-20%
- **Cost per paying customer:** €50-150
- **LTV (12-month commitment):** €588 (Professional yearly) or €468 (Professional monthly × 12)
- **Target ROAS:** 3-5x within 6 months

---

## 6. Technical Notes

- **GTM not needed:** gtag.js is loaded directly via `components/GoogleAnalytics.tsx`
- **Cookie consent:** Consider adding a cookie consent banner for GDPR compliance (currently not implemented)
- **Enhanced conversions:** Can be enabled in GA4 for better attribution with email matching
- **Offline conversion import:** Stripe webhook data can be used for offline conversion tracking if needed
- **Server-side tracking:** For more reliable conversion tracking, consider implementing Measurement Protocol (GA4) server-side events in the Stripe webhook handler

---

## Files Modified

- `components/GoogleAnalytics.tsx` — GA4 script loader (existing, no changes needed)
- `lib/analytics.ts` — Added `checkout_success`, `purchase`, `free_scan_completed`, `trial_started` events
- `components/CheckoutSuccessTracker.tsx` — Client component for checkout success conversion
- `app/dashboard/abonnement/page.tsx` — Fires conversion on checkout success
- `app/scan/resultaat/[id]/page.tsx` — Fires `free_scan_completed` for free tier scans
