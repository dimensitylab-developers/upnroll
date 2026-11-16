"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { comicCell, comicCellActive, comicCellIdle } from "./comic-cell";

function withFrom(href: string, from: string) {
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}from=${encodeURIComponent(from)}`;
}

export function MobileNavToggle({
  links,
  dashboardHref,
}: {
  links: { href: string; label: string }[];
  dashboardHref: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    const firstLink = panelRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();

    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function closeAndReturnFocus() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div className="ml-auto flex items-center gap-2 md:hidden">
      {!dashboardHref && (
        <Link
          href={withFrom("/login", pathname || "/")}
          className={`${comicCell} ${comicCellIdle} min-h-11`}
        >
          Sign In
        </Link>
      )}
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={`${comicCell} ${comicCellIdle} min-h-11 min-w-11`}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>
      {open && (
        <div
          id={menuId}
          ref={panelRef}
          className="absolute left-[-3px] right-[-3px] top-[calc(100%+2px)] z-50 rounded-2xl border-[3px] border-black bg-background px-4 py-4 halftone-bg shadow-[6px_6px_0_0_#000] sm:rounded-3xl"
        >
          <nav aria-label="Primary mobile" className="flex flex-col gap-2">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">
              Menu
            </p>
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const prefetch =
                link.href === "/events" || link.href === "/rankings" || link.href === "/brackets" || link.href === "/about"
                  ? true
                  : undefined;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={prefetch}
                  aria-current={active ? "page" : undefined}
                  className={`${comicCell} ${active ? comicCellActive : comicCellIdle} relative min-h-11`}
                  onClick={closeAndReturnFocus}
                >
                  {link.label}
                </Link>
              );
            })}
            {dashboardHref ? (
              <Link
                href={dashboardHref}
                className={`${comicCell} ${comicCellActive} min-h-11`}
                onClick={closeAndReturnFocus}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href={withFrom("/register", pathname || "/")}
                className={`${comicCell} ${comicCellActive} min-h-11`}
                onClick={closeAndReturnFocus}
              >
                Sign up
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
