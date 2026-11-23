import { resend } from "@/lib/resend";

/**
 * Plain-text email for inbound messages and answers. Optional: needs RESEND_API_KEY and at least
 * one recipient. Never throws; resolves to whether an email was actually handed to Resend.
 */
export async function notifyTeam(recipients: string | undefined, subject: string, text: string, replyTo?: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY || !recipients) return false;
  const to = recipients
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!to.length) return false;
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Voxlate <no-reply@voxlatesn.in>",
      to,
      replyTo,
      subject: subject.slice(0, 140),
      text,
    });
    return !result.error;
  } catch {
    // Best-effort: the data is already stored when this runs.
    return false;
  }
}
