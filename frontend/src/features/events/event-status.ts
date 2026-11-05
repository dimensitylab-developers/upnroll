// Client-safe copy of the status enum — src/server/models/Event.ts pulls in
// Mongoose, which must never be imported from a "use client" component.
export const EVENT_STATUS_OPTIONS = ["DRAFT", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "COMPLETED"] as const;
