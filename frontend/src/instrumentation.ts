export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { assertProductionEmailConfig } = await import("@/server/email/smtp-config");
  assertProductionEmailConfig();
}
