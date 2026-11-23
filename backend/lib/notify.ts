import { resend } from "@/lib/resend";

/**
 * Plain-text team notification for inbound messages (questions, contact forms).
 * Optional: needs RESEND_API_KEY and a recipient list. Never throws — the message is
 * already stored when this runs.
 */
export async function notifyTeam(recipients: string | undefined, subject: string, text: string, replyTo?: string) {
  if (!process.env.RESEND_API_KEY || !recipients) return;
  const to = recipients
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!to.length) return;
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Voxlate <no-reply@voxlatesn.in>",
      to,
      replyTo,
      subject: subject.slice(0, 140),
      text,
    });
  } catch {
    // Swallowed on purpose: notification is best-effort.
  }
}
