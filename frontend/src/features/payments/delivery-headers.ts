export function paymentProofHeaders(contentType: string): Record<string, string> {
  return {
    "Content-Type": contentType,
    // Inline so admins can preview in the review dialog (same pattern as private ID photos).
    "Content-Disposition": "inline",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
  };
}
