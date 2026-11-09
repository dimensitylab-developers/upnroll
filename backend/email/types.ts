/**
 * Email port. Uses SMTP when SMTP_* is configured; otherwise console in development.
 * Message copy is owned by the services that call send().
 */
export interface EmailAdapter {
  send(input: { to: string; subject: string; body: string }): Promise<void>;
}
