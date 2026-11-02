// Client-safe copy — src/server/models/ContentEntry.ts pulls in Mongoose,
// which must never be imported from a "use client" component.
export const CONTENT_TYPE_OPTIONS = ["FAQ", "ANNOUNCEMENT", "POLICY"] as const;
