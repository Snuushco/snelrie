/**
 * Unit tests for Stripe 12-Month Commitment Enforcement
 *
 * Tests the pure commitment logic (no DB/Stripe calls needed).
 * Uses checkCommitmentPure() which accepts all params directly.
 */

import {
  checkCommitmentPure,
  COMMITMENT_MONTHS,
  CANCEL_NOTICE_DAYS,
  COMMITMENT_MESSAGES,
} from "@/lib/stripe-commitment";

// Helper: create a date N days from now
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// Helper: create a date N months ago
function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

describe("12-Month Commitment Enforcement", () => {
  // ═══════════════════════════════════════════
  // SCENARIO 1: Brand new subscription (day 30)
  // Expected: CANNOT cancel
  // ═══════════════════════════════════════════
  describe("within commitment period", () => {
    test("should block cancellation at day 30", () => {
      const result = checkCommitmentPure({
        subscriptionStartDate: monthsAgo(1), // started 1 month ago
        currentPeriodEnd: daysFromNow(30),
        cancelAtPeriodEnd: false,
      });

      expect(result.withinCommitment).toBe(true);
      expect(result.canCancel).toBe(false);
      expect(result.reasonCode).toBe("within_commitment");
      expect(result.daysRemaining).toBeGreaterThan(300);
    });

    test("should block cancellation at month 6", () => {
      const result = checkCommitmentPure({
        subscriptionStartDate: monthsAgo(6),
        currentPeriodEnd: daysFromNow(30),
        cancelAtPeriodEnd: false,
      });

      expect(result.withinCommitment).toBe(true);
      expect(result.canCancel).toBe(false);
      expect(result.reasonCode).toBe("within_commitment");
      expect(result.daysRemaining).toBeGreaterThan(150);
      expect(result.daysRemaining).toBeLessThan(200);
    });

    test("should block cancellation at month 11", () => {
      const result = checkCommitmentPure({
        subscriptionStartDate: monthsAgo(11),
        currentPeriodEnd: daysFromNow(30),
        cancelAtPeriodEnd: false,
      });

      expect(result.withinCommitment).toBe(true);
      expect(result.canCancel).toBe(false);
      expect(result.reasonCode).toBe("within_commitment");
      expect(result.daysRemaining).toBeGreaterThan(20);
      expect(result.daysRemaining).toBeLessThan(40);
    });
  });

  // ═══════════════════════════════════════════
  // SCENARIO 2: After 12 months (day 365+)
  // Expected: CAN cancel (if before 30-day deadline)
  // ═══════════════════════════════════════════
  describe("after commitment period", () => {
    test("should allow cancellation after 12 months with >30 days before renewal", () => {
      const result = checkCommitmentPure({
        subscriptionStartDate: monthsAgo(13), // 13 months ago
        currentPeriodEnd: daysFromNow(60), // renewal in 60 days
        cancelAtPeriodEnd: false,
      });

      expect(result.withinCommitment).toBe(false);
      expect(result.canCancel).toBe(true);
      expect(result.reasonCode).toBe("can_cancel");
      expect(result.daysRemaining).toBe(0);
    });

    test("should allow cancellation exactly at 12 months + 1 day", () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
      startDate.setDate(startDate.getDate() - 1);

      const result = checkCommitmentPure({
        subscriptionStartDate: startDate,
        currentPeriodEnd: daysFromNow(60),
        cancelAtPeriodEnd: false,
      });

      expect(result.withinCommitment).toBe(false);
      expect(result.canCancel).toBe(true);
      expect(result.reasonCode).toBe("can_cancel");
    });
  });

  // ═══════════════════════════════════════════
  // SCENARIO 3: Past 30-day cancel deadline
  // Expected: CANNOT cancel (too late for this period)
  // ═══════════════════════════════════════════
  describe("past cancel deadline", () => {
    test("should block cancellation when <30 days before renewal", () => {
      const result = checkCommitmentPure({
        subscriptionStartDate: monthsAgo(13),
        currentPeriodEnd: daysFromNow(15), // renewal in 15 days (< 30)
        cancelAtPeriodEnd: false,
      });

      expect(result.withinCommitment).toBe(false);
      expect(result.canCancel).toBe(false);
      expect(result.reasonCode).toBe("past_cancel_deadline");
    });

    test("should block on exact deadline day", () => {
      const result = checkCommitmentPure({
        subscriptionStartDate: monthsAgo(13),
        currentPeriodEnd: daysFromNow(29), // renewal in 29 days (< 30)
        cancelAtPeriodEnd: false,
      });

      expect(result.canCancel).toBe(false);
      expect(result.reasonCode).toBe("past_cancel_deadline");
    });

    test("should allow on exactly 31 days before renewal", () => {
      const result = checkCommitmentPure({
        subscriptionStartDate: monthsAgo(13),
        currentPeriodEnd: daysFromNow(31),
        cancelAtPeriodEnd: false,
      });

      expect(result.canCancel).toBe(true);
      expect(result.reasonCode).toBe("can_cancel");
    });
  });

  // ═══════════════════════════════════════════
  // SCENARIO 4: Already cancelling
  // ═══════════════════════════════════════════
  describe("already cancelling", () => {
    test("should report already_cancelling when cancel_at_period_end is true", () => {
      const result = checkCommitmentPure({
        subscriptionStartDate: monthsAgo(13),
        currentPeriodEnd: daysFromNow(60),
        cancelAtPeriodEnd: true,
      });

      expect(result.canCancel).toBe(false);
      expect(result.reasonCode).toBe("already_cancelling");
    });
  });

  // ═══════════════════════════════════════════
  // SCENARIO 5: Edge cases
  // ═══════════════════════════════════════════
  describe("edge cases", () => {
    test("subscription started exactly 12 months ago should be past commitment", () => {
      // Note: because of month math, starting exactly 12 months ago means
      // commitmentEndDate is today or slightly in the past
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
      startDate.setHours(0, 0, 0, 0); // start of day

      const now = new Date();
      now.setHours(23, 59, 59, 999); // end of day

      const result = checkCommitmentPure({
        subscriptionStartDate: startDate,
        currentPeriodEnd: daysFromNow(60),
        cancelAtPeriodEnd: false,
        now,
      });

      // Should be at the boundary — commitment end is same day
      expect(result.withinCommitment).toBe(false);
      expect(result.canCancel).toBe(true);
    });

    test("commitment end date is calculated correctly", () => {
      const startDate = new Date("2025-03-15T10:00:00Z");
      const result = checkCommitmentPure({
        subscriptionStartDate: startDate,
        currentPeriodEnd: new Date("2026-06-15T10:00:00Z"),
        cancelAtPeriodEnd: false,
        now: new Date("2026-04-01T10:00:00Z"), // 12.5 months later
      });

      expect(result.withinCommitment).toBe(false);
      expect(result.commitmentEndDate.toISOString()).toBe("2026-03-15T10:00:00.000Z");
    });
  });

  // ═══════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════
  describe("constants", () => {
    test("commitment period is 12 months", () => {
      expect(COMMITMENT_MONTHS).toBe(12);
    });

    test("cancel notice is 30 days", () => {
      expect(CANCEL_NOTICE_DAYS).toBe(30);
    });
  });

  // ═══════════════════════════════════════════
  // MESSAGE TEMPLATES
  // ═══════════════════════════════════════════
  describe("Dutch UI messages", () => {
    test("withinCommitment message includes date and days remaining", () => {
      const endDate = new Date("2026-06-15");
      const msg = COMMITMENT_MESSAGES.withinCommitment(endDate, 90);
      expect(msg).toContain("12 maanden");
      expect(msg).toContain("90 dagen");
    });

    test("pastCancelDeadline message includes renewal date", () => {
      const renewalDate = new Date("2026-07-01");
      const msg = COMMITMENT_MESSAGES.pastCancelDeadline(renewalDate);
      expect(msg).toContain("30 dagen");
      expect(msg).toContain("verlengd");
    });

    test("cancellationConfirmed message includes end date", () => {
      const endDate = new Date("2026-08-01");
      const msg = COMMITMENT_MESSAGES.cancellationConfirmed(endDate);
      expect(msg).toContain("opgezegd");
    });

    test("commitmentInfo is a non-empty string", () => {
      expect(COMMITMENT_MESSAGES.commitmentInfo.length).toBeGreaterThan(50);
      expect(COMMITMENT_MESSAGES.commitmentInfo).toContain("12 maanden");
    });
  });
});
