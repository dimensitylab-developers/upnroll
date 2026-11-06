import nodemailer, { type Transporter } from "nodemailer";
import type { EmailAdapter } from "./types";

export class SmtpEmailAdapter implements EmailAdapter {
  private readonly from: string;
  private readonly transporter: Transporter;

  constructor(input: { host: string; port: number; user: string; pass: string; from: string }) {
    this.from = input.from;
    this.transporter = nodemailer.createTransport({
      host: input.host,
      port: input.port,
      secure: input.port === 465,
      auth: { user: input.user, pass: input.pass },
    });
  }

  async send(input: { to: string; subject: string; body: string }): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      text: input.body,
    });
  }
}
