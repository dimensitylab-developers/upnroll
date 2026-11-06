import type { EmailAdapter } from "./types";
import { SmtpEmailAdapter } from "./smtp";

/** Dev-only EmailAdapter: logs instead of sending. No email is actually delivered. */
export class ConsoleEmailAdapter implements EmailAdapter {
  async send(input: { to: string; subject: string; body: string }): Promise<void> {
    console.log(`[dev email — not sent] to=${input.to} subject="${input.subject}"\n${input.body}`);
  }
}

export function getEmailAdapter(): EmailAdapter {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (host && user && pass) {
    const port = Number(process.env.SMTP_PORT || 587);
    return new SmtpEmailAdapter({
      host,
      port: Number.isFinite(port) ? port : 587,
      user,
      pass,
      from: process.env.SMTP_FROM || user,
    });
  }
  return new ConsoleEmailAdapter();
}
