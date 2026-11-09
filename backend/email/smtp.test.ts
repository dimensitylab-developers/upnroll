import { describe, expect, it, vi } from "vitest";
import { ConsoleEmailAdapter, getEmailAdapter } from "./console";
import { createSmtpAdapter } from "./smtp";

const settings = {
  host: "smtp.example.com",
  port: 587,
  user: "mailer",
  pass: "secret",
  from: "events@example.com",
};

describe("smtp adapter", () => {
  it("passes the service subject and body through unchanged", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    const createTransport = vi.fn().mockReturnValue({ sendMail });
    const adapter = createSmtpAdapter(settings, createTransport);

    await adapter.send({ to: "fighter@example.com", subject: "Payment rejected", body: "Reason: UTR does not match" });

    expect(createTransport).toHaveBeenCalledWith({
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: { user: "mailer", pass: "secret" },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
    });
    expect(sendMail).toHaveBeenCalledWith({
      from: "events@example.com",
      to: "fighter@example.com",
      subject: "Payment rejected",
      text: "Reason: UTR does not match",
    });
  });

  it("uses implicit TLS on port 465", async () => {
    const createTransport = vi.fn().mockReturnValue({ sendMail: vi.fn().mockResolvedValue({}) });
    const adapter = createSmtpAdapter({ ...settings, port: 465 }, createTransport);
    await adapter.send({ to: "fighter@example.com", subject: "Payment approved — registration confirmed", body: "Approved." });
    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ port: 465, secure: true }));
  });
});

describe("getEmailAdapter", () => {
  it("stays on the console adapter in development when SMTP is unset", () => {
    const previous = { ...process.env };
    process.env.NODE_ENV = "development";
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;
    try {
      expect(getEmailAdapter()).toBeInstanceOf(ConsoleEmailAdapter);
    } finally {
      process.env = previous;
    }
  });

  it("uses SMTP in development when all SMTP_* vars are set", () => {
    const previous = { ...process.env };
    process.env.NODE_ENV = "development";
    process.env.SMTP_HOST = settings.host;
    process.env.SMTP_PORT = String(settings.port);
    process.env.SMTP_USER = settings.user;
    process.env.SMTP_PASS = settings.pass;
    process.env.SMTP_FROM = settings.from;
    try {
      expect(getEmailAdapter()).not.toBeInstanceOf(ConsoleEmailAdapter);
    } finally {
      process.env = previous;
    }
  });

  it("refuses the console adapter when production SMTP settings are missing", () => {
    const previous = { ...process.env };
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PHASE;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;
    try {
      expect(() => getEmailAdapter()).toThrow(/console adapter is not used in production/);
    } finally {
      process.env = previous;
    }
  });
});
