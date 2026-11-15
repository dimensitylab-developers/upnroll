import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getSession } from "@/server/auth/session";
import { cachedPublicEvents } from "@/lib/public-reads";
import { HeaderLockup } from "./header-lockup";
import { ComicNav } from "./comic-nav";
import { comicCell, comicCellActive, comicCellIdle } from "./comic-cell";
import { MobileNavToggle } from "./mobile-nav-toggle";

const NAV_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/events", label: "Events" },
  { href: "/brackets", label: "Brackets" },
  { href: "/rankings", label: "Rankings" },
  { href: "/faq", label: "FAQ" },
  { href: "/seminars", label: "Seminars" },
  { href: "/store", label: "Store" },
];

function AuthControlsFallback() {
  return (
    <>
      <div className="hidden md:flex items-center gap-2 ml-auto">
        <span className={`${comicCell} ${comicCellIdle} pointer-events-none opacity-50`}>Login</span>
        <span className={`${comicCell} ${comicCellActive} pointer-events-none opacity-50`}>Sign up</span>
      </div>
      <div className="md:hidden ml-auto flex items-center gap-2">
        <span className={`${comicCell} ${comicCellIdle} pointer-events-none opacity-50`} aria-hidden="true">
          Login
        </span>
        <span className={`${comicCell} ${comicCellIdle} pointer-events-none opacity-50`} aria-hidden="true">
          Menu
        </span>
      </div>
    </>
  );
}

/**
 * Session + open-event chip. Request-scoped for cookies; event list
 * reuses the public `"use cache"` helper (invalidated by event mutations).
 */
async function HeaderSessionChrome() {
  await connection();
  const [session, events] = await Promise.all([getSession(), cachedPublicEvents()]);
  const dashboardHref = session ? (session.user.role === "ADMIN" ? "/admin" : "/fighter/dashboard") : null;
  const openEvent = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;

  return (
    <>
      <div className="ml-auto hidden items-center gap-2 md:flex">
        {openEvent && (
          <Link
            href={`/events/${openEvent.slug}`}
            className={`${comicCell} ${comicCellActive} max-w-[11rem] overflow-hidden`}
            style={{ transform: "rotate(-2deg)" }}
          >
            <span className="truncate">{openEvent.name}</span>
          </Link>
        )}
        {dashboardHref ? (
          <Link href={dashboardHref} className={`${comicCell} ${comicCellActive}`}>
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login?from=%2F" className={`${comicCell} ${comicCellIdle}`}>
              Login
            </Link>
            <Link href="/register?from=%2F" className={`${comicCell} ${comicCellActive}`}>
              Sign up
            </Link>
          </>
        )}
      </div>

      <MobileNavToggle
        links={NAV_LINKS}
        dashboardHref={dashboardHref}
        event={openEvent ? { href: `/events/${openEvent.slug}`, label: openEvent.name } : null}
      />
    </>
  );
}

/** Floating comic bar: sticky inset shell, no full-bleed rule line. */
export function SiteHeader() {
  return (
    <div className="pointer-events-none sticky top-0 z-40 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pt-4">
      <header className="pointer-events-auto relative mx-auto max-w-6xl rounded-2xl border-[3px] border-black bg-background halftone-bg shadow-[6px_6px_0_0_#000] sm:rounded-3xl">
        <div className="px-3 sm:px-4 lg:px-5">
          <div className="flex min-h-14 items-center gap-2 py-2 sm:min-h-16 sm:gap-3 sm:py-2.5">
            <HeaderLockup />
            <ComicNav links={NAV_LINKS} />
            <Suspense fallback={<AuthControlsFallback />}>
              <HeaderSessionChrome />
            </Suspense>
          </div>
        </div>
      </header>
    </div>
  );
}
