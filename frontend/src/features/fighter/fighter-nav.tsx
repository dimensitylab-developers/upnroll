"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/fighter/dashboard", label: "Dashboard" },
  { href: "/fighter/profile", label: "Profile" },
  { href: "/fighter/registrations", label: "Registrations" },
  { href: "/fighter/matches", label: "Matches" },
  { href: "/fighter/requests", label: "Requests" },
];

function useHasHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function FighterNav() {
  const pathname = usePathname();
  const hydrated = useHasHydrated();

  return (
    <nav className="flex flex-wrap gap-x-4 gap-y-2 overflow-x-auto">
      {LINKS.map((link) => {
        const active = hydrated && pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-sm whitespace-nowrap",
              active ? "font-semibold underline" : "text-muted-foreground hover:underline"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
