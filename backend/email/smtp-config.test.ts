import { describe, expect, it } from "vitest";
import { assertProductionEmailConfig, isProductionRuntime, readSmtpSettings } from "./smtp-config";

const complete = {
  NODE_ENV: "production",
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: "587",
  SMTP_USER: "mailer",
  SMTP_PASS: "secret",
  SMTP_FROM: "events@example.com",
} as NodeJS.ProcessEnv;

describe("smtp configuration", () => {
  it("ignores SMTP settings outside a production server", () => {
    expect(isProductionRuntime({ NODE_ENV: "development" } as NodeJS.ProcessEnv)).toBe(false);
    expect(isProductionRuntime({ NODE_ENV: "test" } as NodeJS.ProcessEnv)).toBe(false);
    expect(isProductionRuntime({ NODE_ENV: "production", NEXT_PHASE: "phase-production-build" } as NodeJS.ProcessEnv)).toBe(false);
    expect(() => assertProductionEmailConfig({ NODE_ENV: "production", NEXT_PHASE: "phase-production-build" } as NodeJS.ProcessEnv)).not.toThrow();
  });

  it("fails closed when a production server has no SMTP settings", () => {
    expect(() => assertProductionEmailConfig({ NODE_ENV: "production" } as NodeJS.ProcessEnv)).toThrow(/console adapter is not used in production/);
    expect(readSmtpSettings({ NODE_ENV: "production", SMTP_PORT: "0" } as NodeJS.ProcessEnv).missing).toEqual([
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASS",
      "SMTP_FROM",
    ]);
  });

  it("accepts a complete production configuration", () => {
    expect(() => assertProductionEmailConfig(complete)).not.toThrow();
    expect(readSmtpSettings(complete).settings).toEqual({
      host: "smtp.example.com",
      port: 587,
      user: "mailer",
      pass: "secret",
      from: "events@example.com",
    });
  });
});
