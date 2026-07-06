import { Resend } from "resend";

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export const FROM = "letters@thebecomingcreative.com";
export const ADMIN_EMAIL = "aida@aidavisuals.com";
