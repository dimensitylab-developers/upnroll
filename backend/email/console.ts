import "server-only";
import type { EmailAdapter } from "./types";
import { isProductionRuntime, readSmtpSettings, requireSmtpSettings } from "./smtp-config";
import { createSmtpAdapter } from "./smtp";

/** Dev fallback EmailAdapter: logs instead of sending. No email is actually delivered. */
export class ConsoleEmailAdapter implements EmailAdapter {
  async send(input: { to: string; subject: string; body: string }): Promise<void> {
    console.log(`[dev email — not sent] to=${input.to} subject="${input.subject}"\n${input.body}`);
  }
}

/**
 * Prefer real SMTP whenever the five SMTP_* vars are set (including local dev).
 * Otherwise use the console logger outside production, and fail closed in production.
 */
export function getEmailAdapter(): EmailAdapter {
  const { settings } = readSmtpSettings();
  if (settings) return createSmtpAdapter(settings);
  if (!isProductionRuntime()) return new ConsoleEmailAdapter();
  return createSmtpAdapter(requireSmtpSettings());
}
