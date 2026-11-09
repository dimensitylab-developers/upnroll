import Link from "next/link";
import { getSession } from "@/server/auth/session";
import { listPublicEvents } from "@/server/services/eventService";
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

export async function SiteHeader() {
  const [session, events] = await Promise.all([getSession(), listPublicEvents()]);
  const dashboardHref = session ? (session.user.role === "ADMIN" ? "/admin" : "/fighter/dashboard") : null;
  const openEvent = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;

  return (
    <header className="sticky top-0 z-40 relative border-t-2 border-t-black border-b-2 border-b-brand-red bg-background halftone-bg">
      <HeaderStickers />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Link href="/login" className={`${comicCell} ${comicCellIdle}`}>Login</Link>
                <Link href="/register" className={`${comicCell} ${comicCellActive}`}>Sign up</Link>
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
      {openEvent && (
        <div className="border-t-2 border-black bg-black text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
            <p>
              <span className="font-semibold text-brand-red">Next card</span>
              {" "}
              {openEvent.name}
              {openEvent.slug === "up-n-roll-superfight-series" ? " · Road to Super Fight" : ""}
              {" · "}
              {new Date(openEvent.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <Link href="/register" className="font-semibold text-brand-red">Sign up</Link>
          </div>
        </div>
      )}
    </header>
  );
}
