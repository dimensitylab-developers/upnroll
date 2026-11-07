import { describe, it, expect } from "vitest";
import { paymentProofHeaders } from "./delivery-headers";

describe("paymentProofHeaders", () => {
  it("forces a download and blocks content sniffing", () => {
    const headers = paymentProofHeaders("image/png");
    expect(headers["Content-Type"]).toBe("image/png");
    expect(headers["Content-Disposition"]).toBe("attachment");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Cache-Control"]).toBe("private, no-store");
  });
});
