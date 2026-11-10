/**
 * WhatsApp notification port.
 *
 * STATUS: MOCK ONLY — nothing is delivered to WhatsApp or any SMS provider.
 * `matchService` calls this after certain schedule/result updates for future wiring.
 * Do not treat console output as production delivery evidence.
 *
 * Introducing a real provider (Meta Cloud API, Twilio, etc.) requires an explicit
 * product/ops decision and is intentionally out of scope for current hardening.
 */

export type WhatsAppNotifier = {
  notify(input: { to: string; body: string }): Promise<void>;
};

/** Dev / staging stand-in. Logs locally and returns. */
export const mockWhatsAppNotifier: WhatsAppNotifier = {
  async notify(input) {
    const to = input.to.trim();
    if (!to) return;
    console.log(`[whatsapp mock — not sent] to=${to}\n${input.body}`);
  },
};

let activeNotifier: WhatsAppNotifier = mockWhatsAppNotifier;

/** Test seam / future provider swap. Production still uses the mock until approved. */
export function setWhatsAppNotifier(notifier: WhatsAppNotifier): void {
  activeNotifier = notifier;
}

export async function notifyWhatsApp(input: { to: string; body: string }): Promise<void> {
  await activeNotifier.notify(input);
}
