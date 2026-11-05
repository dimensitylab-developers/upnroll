"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { comicCell, comicCellActive, comicCellIdle } from "./comic-cell";

export function ComicNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden md:flex items-center gap-2">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`${comicCell} ${active ? comicCellActive : comicCellIdle}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
