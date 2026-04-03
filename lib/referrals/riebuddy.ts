/**
 * lib/referrals/riebuddy.ts — Riebuddy referral detection & processing
 *
 * Partnership: SnelRIE × Riebuddy (henry@riebuddy.nl)
 * Commission model: 10% of first year revenue from referred client
 *
 * Rules for toetsing verplichting:
 * - 25+ employees → toetsing verplicht (Arbowet art. 14)
 * - Hazardous substances (gevaarlijkeStoffen) → toetsing verplicht
 */

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";

const RIEBUDDY_EMAIL = "henry@riebuddy.nl";
const SNELRIE_BASE_URL = "https://www.snelrie.nl";

// ─── Detection ──────────────────────────────────────────────────────

export interface ToetsingCheck {
  required: boolean;
  reasons: string[];
}

export function checkToetsingRequired(intakeData: any): ToetsingCheck {
  const reasons: string[] = [];

  const employeeCount = intakeData?.aantalMedewerkers ?? 0;
  if (employeeCount >= 25) {
    reasons.push(
      `${employeeCount} medewerkers — toetsing verplicht bij 25+ medewerkers (Arbowet art. 14)`
    );
  }

  const gevaarlijkeStoffen =
    intakeData?.werkplek?.gevaarlijkeStoffen === true ||
    intakeData?.werkplek?.gevaarlijkeStoffen === "ja" ||
    intakeData?.gevaarlijkeStoffen === true ||
    intakeData?.gevaarlijkeStoffen === "ja";

  if (gevaarlijkeStoffen) {
    reasons.push(
      "Werkt met gevaarlijke stoffen — toetsing verplicht (Arbowet art. 14)"
    );
  }

  return {
    required: reasons.length > 0,
    reasons,
  };
}

// ─── Referral Creation ──────────────────────────────────────────────

export async function createRiebuddyReferral(reportId: string): Promise<{
  success: boolean;
  referralId?: string;
  skipped?: boolean;
  reason?: string;
  error?: string;
}> {
  try {
    const report = await prisma.rieReport.findUnique({
      where: { id: reportId },
      include: { user: true },
    });

    if (!report) {
      return { success: false, error: "Rapport niet gevonden" };
    }

    const intakeData = (report.intakeData as any) || {};
    const toetsing = checkToetsingRequired(intakeData);

    if (!toetsing.required) {
      return { success: true, skipped: true, reason: "Toetsing niet verplicht" };
    }

    // Check if referral already exists for this report
    const existing = await prisma.riebuddyReferral.findFirst({
      where: { reportId },
    });

    if (existing) {
      return { success: true, skipped: true, reason: "Referral bestaat al", referralId: existing.id };
    }

    const contactName = report.user?.naam || intakeData.naam || "Onbekend";
    const contactEmail = report.user?.email || "onbekend@snelrie.nl";
    const reportUrl = `${SNELRIE_BASE_URL}/scan/resultaat/${report.id}`;

    // Create referral record
    const referral = await prisma.riebuddyReferral.create({
      data: {
        reportId: report.id,
        userId: report.userId,
        companyName: report.bedrijfsnaam,
        branche: report.branche,
        employeeCount: report.aantalMedewerkers,
        contactName,
        contactEmail,
        status: "REFERRED",
      },
    });

    // Send referral email to Riebuddy (henry@riebuddy.nl)
    const riebuddyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Nieuwe RI&E toetsing referral via SnelRIE</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Bedrijfsnaam</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${report.bedrijfsnaam}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Branche</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${report.branche}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Aantal medewerkers</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${report.aantalMedewerkers}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Contactpersoon</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${contactName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${contactEmail}">${contactEmail}</a></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Datum referral</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</td></tr>
        </table>
        <h3>Reden toetsing verplichting:</h3>
        <ul>
          ${toetsing.reasons.map((r) => `<li>${r}</li>`).join("")}
        </ul>
        <p><a href="${reportUrl}" style="display: inline-block; background: #1a56db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Bekijk SnelRIE rapport</a></p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Dit bericht is automatisch verzonden door SnelRIE. Referral ID: ${referral.id}</p>
      </div>
    `;

    const riebuddyResult = await sendEmail({
      to: RIEBUDDY_EMAIL,
      subject: `Nieuwe toetsing referral: ${report.bedrijfsnaam} (${report.aantalMedewerkers} mdw)`,
      html: riebuddyHtml,
      tags: [
        { name: "type", value: "riebuddy_referral" },
        { name: "referral_id", value: referral.id },
        { name: "report_id", value: report.id },
      ],
    });

    if (!riebuddyResult.success) {
      console.error(`[riebuddy] Failed to email henry@riebuddy.nl:`, riebuddyResult.error);
    }

    // Send notification email to the customer
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Uw RI&E vereist officiële toetsing</h2>
        <p>Beste ${contactName},</p>
        <p>Uit de RI&E-scan van <strong>${report.bedrijfsnaam}</strong> blijkt dat uw bedrijf wettelijk verplicht is de RI&E te laten toetsen door een gecertificeerde kerndeskundige.</p>
        <h3>Waarom is toetsing verplicht?</h3>
        <ul>
          ${toetsing.reasons.map((r) => `<li>${r}</li>`).join("")}
        </ul>
        <p>We hebben uw gegevens doorgestuurd naar onze toetsingspartner <strong>Riebuddy</strong>. Zij nemen binnen 2 werkdagen contact met u op om de toetsing te bespreken.</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Over Riebuddy</p>
          <p style="margin: 8px 0 0;">Henry Beekema<br>Kanaalpark 140, 2321 JV Leiden<br>Tel: 06-52 59 59 49<br>Email: henry@riebuddy.nl</p>
        </div>
        <p>Heeft u vragen? Neem gerust contact op via <a href="mailto:emily@snelrie.nl">emily@snelrie.nl</a>.</p>
        <p>Met vriendelijke groet,<br><strong>SnelRIE</strong></p>
      </div>
    `;

    const customerResult = await sendEmail({
      to: contactEmail,
      subject: `Uw RI&E vereist toetsing — we hebben u doorverwezen naar Riebuddy`,
      html: customerHtml,
      tags: [
        { name: "type", value: "riebuddy_customer_notification" },
        { name: "referral_id", value: referral.id },
        { name: "report_id", value: report.id },
      ],
    });

    if (!customerResult.success) {
      console.error(`[riebuddy] Failed to email customer ${contactEmail}:`, customerResult.error);
    }

    console.log(`[riebuddy] Referral created: ${referral.id} for ${report.bedrijfsnaam}`);

    return { success: true, referralId: referral.id };
  } catch (error) {
    console.error("[riebuddy] Error creating referral:", error);
    return { success: false, error: String(error) };
  }
}
