/** Dev stand-in. Nothing is delivered to WhatsApp. SMS is not part of this phase. */
export async function notifyWhatsApp(input: { to: string; body: string }): Promise<void> {
  const to = input.to.trim();
  if (!to) return;
  console.log(`[dev whatsapp — not sent] to=${to}\n${input.body}`);
}
