/**
 * Email port. Development uses the console adapter. Production uses SMTP.
 * Message copy is owned by the services that call send().
 */
export interface EmailAdapter {
  send(input: { to: string; subject: string; body: string }): Promise<void>;
}
