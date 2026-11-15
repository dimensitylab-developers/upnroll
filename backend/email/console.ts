import "server-only";
import type { EmailAdapter } from "./types";
import { isProductionRuntime, readSmtpSettings, requireSmtpSettings, type SmtpSettings } from "./smtp-config";
import { createSmtpAdapter } from "./smtp";

/** Dev fallback EmailAdapter: logs instead of sending. No email is actually delivered. */
export class ConsoleEmailAdapter implements EmailAdapter {
  async send(input: { to: string; subject: string; body: string; html?: string }): Promise<void> {
    console.log(`[dev email  not sent] to=${input.to} subject="${input.subject}"\n${input.body}`);
    if (input.html) console.log(`[dev email html]\n${input.html}`);
  }
}

// Cached SMTP adapter (and therefore its underlying transport, see smtp.ts) keyed by settings
// signature  settings come from env vars and don't change within a process, so repeated
// getEmailAdapter() calls reuse the same connection instead of each paying a fresh handshake.
let cachedAdapterKey: string | null = null;
let cachedAdapter: EmailAdapter | null = null;

function settingsKey(settings: SmtpSettings): string {
  return `${settings.host}:${settings.port}:${settings.user}:${settings.from}`;
}

function getOrCreateSmtpAdapter(settings: SmtpSettings): EmailAdapter {
  const key = settingsKey(settings);
  if (cachedAdapter && cachedAdapterKey === key) return cachedAdapter;
  cachedAdapter = createSmtpAdapter(settings);
  cachedAdapterKey = key;
  return cachedAdapter;
}

/**
 * Prefer real SMTP whenever the five SMTP_* vars are set (including local dev).
 * Otherwise use the console logger outside production, and fail closed in production.
 */
export function getEmailAdapter(): EmailAdapter {
  const { settings } = readSmtpSettings();
  if (settings) return getOrCreateSmtpAdapter(settings);
  if (!isProductionRuntime()) return new ConsoleEmailAdapter();
  return getOrCreateSmtpAdapter(requireSmtpSettings());
}
