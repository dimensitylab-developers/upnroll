import "server-only";

export type SmtpSettings = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

/** Serving production traffic. The production build itself is not a server. */
export function isProductionRuntime(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === "production" && env.NEXT_PHASE !== "phase-production-build";
}

export function readSmtpSettings(env: NodeJS.ProcessEnv = process.env): { settings: SmtpSettings | null; missing: string[] } {
  const host = env.SMTP_HOST?.trim() ?? "";
  const portText = env.SMTP_PORT?.trim() ?? "";
  const user = env.SMTP_USER?.trim() ?? "";
  const pass = env.SMTP_PASS ?? "";
  const from = env.SMTP_FROM?.trim() ?? "";
  const port = Number(portText);
  const missing: string[] = [];
  if (!host) missing.push("SMTP_HOST");
  if (!portText || !Number.isInteger(port) || port < 1 || port > 65535) missing.push("SMTP_PORT");
  if (!user) missing.push("SMTP_USER");
  if (!pass) missing.push("SMTP_PASS");
  if (!from) missing.push("SMTP_FROM");
  if (missing.length > 0) return { settings: null, missing };
  return { settings: { host, port, user, pass, from }, missing };
}

export function assertProductionEmailConfig(env: NodeJS.ProcessEnv = process.env): void {
  if (!isProductionRuntime(env)) return;
  const { missing } = readSmtpSettings(env);
  if (missing.length === 0) return;
  throw new Error(
    `Production email is not configured. Missing ${missing.join(", ")}. The console adapter is not used in production.`
  );
}

export function requireSmtpSettings(env: NodeJS.ProcessEnv = process.env): SmtpSettings {
  const { settings, missing } = readSmtpSettings(env);
  if (!settings) {
    throw new Error(
      `Production email is not configured. Missing ${missing.join(", ")}. The console adapter is not used in production.`
    );
  }
  return settings;
}
