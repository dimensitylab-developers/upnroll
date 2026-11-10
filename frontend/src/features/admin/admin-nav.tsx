"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/fighters", label: "Fighters" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/rankings", label: "Rankings" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/media", label: "Media" },
];

function useHasHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function AdminNav() {
  const pathname = usePathname();
  const hydrated = useHasHydrated();

  return (
    <nav
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      aria-label="Admin"
    >
      {LINKS.map((link) => {
        const active =
          hydrated && (link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 shrink-0 -skew-x-12 items-center border-2 border-black px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] whitespace-nowrap shadow-[3px_3px_0_0_#000] transition-colors",
              active ? "bg-brand-red text-white" : "bg-white text-black hover:bg-black hover:text-white"
            )}
          >
            <span className="inline-block skew-x-12">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
