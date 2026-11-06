import Link from "next/link";
import { DynamicBoundary } from "@/components/dynamic-boundary";
import { getSession } from "@/server/auth/session";
import { cachedPublicEvents } from "@/lib/public-reads";
import { HeaderLockup } from "./header-lockup";
import { ComicNav } from "./comic-nav";
import { comicCell, comicCellActive, comicCellIdle } from "./comic-cell";
import { MobileNavToggle } from "./mobile-nav-toggle";

const NAV_LINKS = [
  { href: "/events", label: "Events" },
  { href: "/fighters", label: "Fighters" },
  { href: "/rankings", label: "Rankings" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background halftone-bg border-t-2 border-t-black border-b-2 border-b-brand-red relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-h-16 py-3">
          <HeaderLockup />
          <ComicNav links={NAV_LINKS} />
          <DynamicBoundary fallback={<HeaderActions dashboardHref={null} openEvent={null} />}>
            <HeaderLive />
          </DynamicBoundary>
        </div>
      </div>
    </header>
  );
}

async function HeaderLive() {
  const [session, events] = await Promise.all([getSession(), cachedPublicEvents()]);
  const dashboardHref = session ? (session.user.role === "ADMIN" ? "/admin" : "/fighter/dashboard") : null;
  const open = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;
  return (
    <HeaderActions
      dashboardHref={dashboardHref}
      openEvent={open ? { href: `/events/${open.slug}`, label: open.name } : null}
    />
  );
}

function HeaderActions({
  dashboardHref,
  openEvent,
}: {
  dashboardHref: string | null;
  openEvent: { href: string; label: string } | null;
}) {
  return (
    <>
      <div className="hidden md:flex items-center gap-2 ml-auto">
        {openEvent && (
          <Link
            href={openEvent.href}
            className={`${comicCell} ${comicCellActive} max-w-[11rem] overflow-hidden`}
            style={{ transform: "rotate(-2deg)" }}
          >
            <span className="truncate">{openEvent.label}</span>
          </Link>
        )}
        {dashboardHref ? (
          <Link href={dashboardHref} className={`${comicCell} ${comicCellActive}`}>Dashboard</Link>
        ) : (
          <>
            <Link href="/login" className={`${comicCell} ${comicCellIdle}`}>Sign in</Link>
            <Link href="/register" className={`${comicCell} ${comicCellActive}`}>Register</Link>
          </>
        )}
      </div>
      <MobileNavToggle links={NAV_LINKS} dashboardHref={dashboardHref} event={openEvent} />
    </>
  );
}
