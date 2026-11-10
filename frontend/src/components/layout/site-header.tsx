import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getSession } from "@/server/auth/session";
import { cachedPublicEvents } from "@/lib/public-reads";
import { HeaderStickers } from "@/components/home/mat-emojis";
import { HeaderLockup } from "./header-lockup";
import { ComicNav } from "./comic-nav";
import { comicCell, comicCellActive, comicCellIdle } from "./comic-cell";
import { MobileNavToggle } from "./mobile-nav-toggle";

const NAV_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/seminars", label: "Seminars" },
  { href: "/brackets", label: "Brackets" },
  { href: "/rankings", label: "Rankings" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About Us" },
  { href: "/store", label: "Store" },
];

function formatCardDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  // Only call after `connection()` so cacheComponents allows request-time formatting.
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

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

function NextCardFallback() {
  return (
    <div className="border-t-2 border-black bg-black text-white" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-4 py-1.5 sm:px-6 lg:px-8">
        <p className="text-xs text-white/40 sm:text-sm">Next card</p>
      </div>
    </div>
  );
}

/**
 * Session + published “next card” strip. Request-scoped for cookies; event list
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

async function HeaderNextCard() {
  await connection();
  const events = await cachedPublicEvents();
  const openEvent = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;
  if (!openEvent) return null;

  return (
    <div className="border-t-2 border-black bg-black text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 text-xs sm:px-6 sm:py-2 sm:text-sm lg:px-8">
        <p className="min-w-0">
          <span className="font-semibold text-brand-red">Next card</span>{" "}
          <span className="break-words">
            {openEvent.name}
            {openEvent.slug === "up-n-roll-superfight-series" ? " · Road to Super Fight" : ""}
            {" · "}
            {formatCardDate(openEvent.startDate)}
          </span>
        </p>
        <Link href="/register?from=%2F" className="shrink-0 font-semibold text-brand-red">
          Sign up
        </Link>
      </div>
    </div>
  );
}

/** Static brand + primary nav paint independently of session / DB. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 relative border-t-2 border-t-black border-b-2 border-b-brand-red bg-background halftone-bg pt-[env(safe-area-inset-top)]">
      <HeaderStickers />
      <div className="relative z-10 mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
        <div className="flex min-h-14 items-center gap-2 py-2 sm:min-h-16 sm:gap-3 sm:py-3">
          <HeaderLockup />
          <ComicNav links={NAV_LINKS} />
          <Suspense fallback={<AuthControlsFallback />}>
            <HeaderSessionChrome />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<NextCardFallback />}>
        <HeaderNextCard />
      </Suspense>
    </header>
  );
}
