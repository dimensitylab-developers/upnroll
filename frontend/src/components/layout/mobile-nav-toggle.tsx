"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { comicCell, comicCellActive, comicCellIdle } from "./comic-cell";

export function MobileNavToggle({
  links,
  dashboardHref,
  event = null,
}: {
  links: { href: string; label: string }[];
  dashboardHref: string | null;
  event?: { href: string; label: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden ml-auto">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${comicCell} ${comicCellIdle}`}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full border-b-2 border-b-brand-red bg-background px-4 py-4 halftone-bg">
          <nav aria-label="Primary mobile" className="flex flex-col gap-2">
            {event && (
              <Link href={event.href} className={`${comicCell} ${comicCellActive}`} onClick={() => setOpen(false)}>
                {event.label}
              </Link>
            )}
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`${comicCell} ${active ? comicCellActive : comicCellIdle}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            {dashboardHref ? (
              <Link href={dashboardHref} className={`${comicCell} ${comicCellActive}`} onClick={() => setOpen(false)}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className={`${comicCell} ${comicCellIdle}`} onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className={`${comicCell} ${comicCellActive}`} onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
