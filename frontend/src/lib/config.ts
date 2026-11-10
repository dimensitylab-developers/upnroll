import { z } from "zod";
import { ensureMongoDatabaseName, mongoDatabaseNameFromUri } from "@/lib/mongo-uri";

/**
 * Server-only environment config. Import only from src/server/** or server
 * entry points (route handlers, server actions, layouts) — never from a
 * Client Component.
 */

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

let cached: z.infer<typeof envSchema> | null = null;

/**
 * Prefer an explicit path in MONGODB_URI. If the URI has no database name,
 * keep writing to the historical Atlas default (`test`) so existing users,
 * events, and profiles stay visible. New local templates still use `/upnroll`.
 */
function resolveMongoUri(raw: string): string {
  const named = mongoDatabaseNameFromUri(raw);
  if (named) return ensureMongoDatabaseName(raw, named);
  // Empty path previously opened driver DB "test" — preserve that data plane.
  return ensureMongoDatabaseName(raw, "test");
}

export function getConfig() {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration:\n${parsed.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n")}`
    );
  }
  cached = {
    ...parsed.data,
    MONGODB_URI: resolveMongoUri(parsed.data.MONGODB_URI),
  };
  return cached;
}
