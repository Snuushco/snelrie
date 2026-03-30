import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("[resend] RESEND_API_KEY not set");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = "SnelRIE <info@snelrie.nl>";
export const EMAIL_REPLY_TO = "emily@snelrie.nl";
