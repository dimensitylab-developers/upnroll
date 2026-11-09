import "server-only";

type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

const REDACT_KEYS = /pass(word)?|secret|token|authorization|cookie|session|smtp_pass|utr|aadhaar|screenshot/i;

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[truncated]";
  if (value == null) return value;
  if (typeof value === "string") {
    if (value.length > 500) return `${value.slice(0, 500)}…`;
    return value;
  }
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitize(item, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    out[key] = REDACT_KEYS.test(key) ? "[redacted]" : sanitize(nested, depth + 1);
  }
  return out;
}

function write(level: LogLevel, message: string, fields?: LogFields) {
  const entry = {
    level,
    message,
    ts: new Date().toISOString(),
    ...(fields ? { fields: sanitize(fields) as LogFields } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/** Structured server logger. Never pass raw passwords, session tokens, or full payment proofs. */
export const logger = {
  info(message: string, fields?: LogFields) {
    write("info", message, fields);
  },
  warn(message: string, fields?: LogFields) {
    write("warn", message, fields);
  },
  error(message: string, fields?: LogFields) {
    write("error", message, fields);
  },
};
