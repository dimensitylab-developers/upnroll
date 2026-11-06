import "server-only";
import type { EmailAdapter } from "./types";
import { isProductionRuntime, requireSmtpSettings } from "./smtp-config";
import { createSmtpAdapter } from "./smtp";

/** Dev-only EmailAdapter: logs instead of sending. No email is actually delivered. */
export class ConsoleEmailAdapter implements EmailAdapter {
  async send(input: { to: string; subject: string; body: string }): Promise<void> {
    console.log(`[dev email — not sent] to=${input.to} subject="${input.subject}"\n${input.body}`);
  }
}

export function getEmailAdapter(): EmailAdapter {
  if (!isProductionRuntime()) return new ConsoleEmailAdapter();
  return createSmtpAdapter(requireSmtpSettings());
}
