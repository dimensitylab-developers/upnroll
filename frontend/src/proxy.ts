import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/auth/cookie-name";
import { JUDGE_SESSION_COOKIE_NAME } from "@/server/auth/judge-cookie-name";

/**
 * Next.js 16 proxy (replaces the deprecated middleware.ts convention —
 * verified against node_modules/next/dist/lib/constants.js).
 *
 * This is a cheap, cookie-presence redirect for UX only. It is NOT the
 * authority on access control — every protected layout and Server Action
 * independently re-verifies the session and role server-side (see
 * src/server/auth/session.ts), per Part M: never rely on a proxy alone.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/judge")) {
    if (pathname === "/judge/login" || pathname.startsWith("/judge/login/")) {
      return NextResponse.next();
    }
    if (!request.cookies.has(JUDGE_SESSION_COOKIE_NAME)) {
      const url = request.nextUrl.clone();
      url.pathname = "/judge/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/fighter/:path*", "/admin/:path*", "/judge/:path*"],
};
