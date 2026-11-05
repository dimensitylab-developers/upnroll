export function paymentProofHeaders(contentType: string): Record<string, string> {
  return {
    "Content-Type": contentType,
    "Content-Disposition": "attachment",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
  };
}
