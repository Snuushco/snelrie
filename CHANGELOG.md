# Changelog

## [Unreleased]

### Added — Lead Nurture Email System (hb-041)
- **LeadNurtureEvent** Prisma model with A/B testing variant tracking, GDPR suppression, and conversion tracking
- **5-step nurture sequence**: Welcome (T+0), Case study (T+3), Urgency/Arbeidsinspectie (T+5), Free offer (T+7), Win-back (T+14)
- **`lib/email/send.ts`**: Centralized email sender with signed unsubscribe tokens, HTML template loading from `emails/` directory
- **`lib/nurture/scheduler.ts`**: Idempotent nurture scheduler running Mon-Fri 09:00-11:00 CET
- **`lib/nurture/hooks.ts`**: Simple event hooks for signup, demo request, pricing abandonment, trial expiry, and conversion
- **API routes**:
  - `POST /api/nurture/trigger` — Create nurture events or mark conversions
  - `GET /api/nurture/cron` — Process due nurture emails (Vercel cron)
  - `GET/POST /api/nurture/unsubscribe?token=<signed>` — GDPR unsubscribe with signed tokens + RFC 8058 One-Click
  - `GET /api/nurture/report` — A/B testing performance report
- **Email templates**: 5 nurture HTML templates + base template copied to `emails/` directory
- **Integrations**: Nurture hooks in user registration, free scan completion, and Stripe subscription checkout
- **Vercel cron**: Nurture processing scheduled Mon-Fri at 07:00/08:00/09:00 UTC

### Changed
- `vercel.json`: Added nurture cron entry
- `prisma/schema.prisma`: Added `NurtureEventType` enum and `LeadNurtureEvent` model with User relation
