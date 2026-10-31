import type { EmailAdapter } from "./types";

/** Dev-only EmailAdapter: logs instead of sending. No email is actually delivered. */
export class ConsoleEmailAdapter implements EmailAdapter {
  async send(input: { to: string; subject: string; body: string }): Promise<void> {
    console.log(`[dev email — not sent] to=${input.to} subject="${input.subject}"\n${input.body}`);
  }
}

export function getEmailAdapter(): EmailAdapter {
  return new ConsoleEmailAdapter();
}
