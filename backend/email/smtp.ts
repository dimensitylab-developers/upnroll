import "server-only";
import nodemailer from "nodemailer";
import type { EmailAdapter } from "./types";
import type { SmtpSettings } from "./smtp-config";

type MailSender = {
  sendMail(message: { from: string; to: string; subject: string; text: string }): Promise<unknown>;
};

export type TransportFactory = (options: {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
}) => MailSender;

export function createSmtpAdapter(settings: SmtpSettings, createTransport: TransportFactory = nodemailer.createTransport): EmailAdapter {
  return {
    async send(input) {
      const transport = createTransport({
        host: settings.host,
        port: settings.port,
        secure: settings.port === 465,
        auth: { user: settings.user, pass: settings.pass },
      });
      await transport.sendMail({
        from: settings.from,
        to: input.to,
        subject: input.subject,
        text: input.body,
      });
    },
  };
}
