import Link from "next/link";
import { getSession } from "@/server/auth/session";
import { listPublicEvents } from "@/server/services/eventService";
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

export async function SiteHeader() {
  const [session, events] = await Promise.all([getSession(), listPublicEvents()]);
  const dashboardHref = session ? (session.user.role === "ADMIN" ? "/admin" : "/fighter/dashboard") : null;
  const openEvent = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;

  return (
    <header className="sticky top-0 z-40 bg-background halftone-bg border-t-2 border-t-black border-b-2 border-b-brand-red relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-h-16 py-3">
          <HeaderLockup />
          <ComicNav links={NAV_LINKS} />

          <div className="hidden md:flex items-center gap-2 ml-auto">
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
              <Link href={dashboardHref} className={`${comicCell} ${comicCellActive}`}>Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className={`${comicCell} ${comicCellIdle}`}>Sign in</Link>
                <Link href="/register" className={`${comicCell} ${comicCellActive}`}>Register</Link>
              </>
            )}
          </div>

          <MobileNavToggle
            links={NAV_LINKS}
            dashboardHref={dashboardHref}
            event={openEvent ? { href: `/events/${openEvent.slug}`, label: openEvent.name } : null}
          />
        </div>
      </div>
    </header>
  );
}
