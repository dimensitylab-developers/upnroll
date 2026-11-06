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
  it("stays on the console adapter in development", () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      expect(getEmailAdapter()).toBeInstanceOf(ConsoleEmailAdapter);
    } finally {
      process.env.NODE_ENV = previous;
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
