"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/grappler/dashboard", label: "Desk" },
  { href: "/grappler/profile", label: "Profile" },
  { href: "/grappler/registrations", label: "Events" },
  { href: "/grappler/matches", label: "Matches" },
  { href: "/grappler/requests", label: "Requests" },
  { href: "/grappler/notifications", label: "Alerts" },
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
      className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Grappler sections"
    >
      {LINKS.map((link) => {
        const active = hydrated && pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-9 shrink-0 -skew-x-12 items-center border-2 border-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap shadow-[2px_2px_0_0_#000] transition-colors sm:min-h-10 sm:px-3 sm:text-xs",
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
