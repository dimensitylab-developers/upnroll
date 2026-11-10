/**
 * Validate same-origin in-app return paths for auth "Back" links.
 * Rejects protocol-relative URLs, external origins, and unsafe destinations.
 */

const BLOCKED_EXACT = new Set(["/verify"]);
const BLOCKED_PREFIXES = ["/api/"];

export function isSafeAppPath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const path = value.trim();
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  if (path.includes("\\")) return false;
  if (/[\r\n\0]/.test(path)) return false;

  let pathname = path;
  try {
    pathname = new URL(path, "http://upnroll.local").pathname;
  } catch {
    return false;
  }

  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (BLOCKED_EXACT.has(normalized)) return false;
  if (BLOCKED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return false;
  return true;
}

/** Prefer an explicit query param, else fall back. Never return to `current`. */
export function resolveAuthReturnPath(
  candidate: unknown,
  options: { current: "/login" | "/register"; fallback: string }
): string {
  if (!isSafeAppPath(candidate)) return options.fallback;
  let pathname = candidate;
  try {
    pathname = new URL(candidate, "http://upnroll.local").pathname.replace(/\/+$/, "") || "/";
  } catch {
    return options.fallback;
  }
  if (pathname === options.current) return options.fallback;
  return candidate;
}
