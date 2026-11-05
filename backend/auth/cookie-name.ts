// Split from cookies.ts so src/proxy.ts (Edge runtime) can read the cookie
// name without pulling in node:crypto, which Edge doesn't support.
export const SESSION_COOKIE_NAME = "upnroll_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
