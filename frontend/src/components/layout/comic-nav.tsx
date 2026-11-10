"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { comicCell, comicCellActive, comicCellIdle } from "./comic-cell";
import { NavLinkPending } from "./nav-link-pending";

/** Primary destinations — full RSC prefetch in production. */
const PREFETCH_HREFS = new Set(["/events", "/rankings", "/brackets", "/about", "/faq"]);

export function ComicNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden md:flex flex-wrap items-center gap-2">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch={PREFETCH_HREFS.has(link.href) ? true : undefined}
            aria-current={active ? "page" : undefined}
            className={`${comicCell} ${active ? comicCellActive : comicCellIdle} relative`}
          >
            <NavLinkPending />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
