/**
 * Email abstraction (Part D §7 / Part F). Real provider is pending
 * OD-012; templates/copy are pending OD-009. Nothing in this interface
 * implies delivery actually happened in production — adapters must be
 * explicit about whether a send is real or simulated.
 */
export interface EmailAdapter {
  send(input: { to: string; subject: string; body: string }): Promise<void>;
}
