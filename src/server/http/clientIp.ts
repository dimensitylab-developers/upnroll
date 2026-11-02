import { headers } from "next/headers";

/** Best-effort client IP for rate-limit keying. Trusts x-forwarded-for, which is
 * only safe behind a proxy/load balancer that sets it itself (document this
 * assumption at deploy time — see docs/deployment/deployment-guide.md). */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headerList.get("x-real-ip") ?? "unknown";
}
