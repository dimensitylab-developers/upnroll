"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/fighter/dashboard", label: "Desk" },
  { href: "/fighter/profile", label: "Profile" },
  { href: "/fighter/registrations", label: "Cards" },
  { href: "/fighter/matches", label: "Matches" },
  { href: "/fighter/requests", label: "Requests" },
];

function useHasHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function FighterNav() {
  const pathname = usePathname();
  const hydrated = useHasHydrated();

  return (
    <nav
      className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Fighter sections"
    >
      {LINKS.map((link) => {
        const active = hydrated && pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 px-2.5 py-1.5 text-xs uppercase tracking-[0.14em] whitespace-nowrap",
              active
                ? "bg-black font-semibold text-white"
                : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
