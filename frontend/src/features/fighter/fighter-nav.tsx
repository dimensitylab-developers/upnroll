"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/fighter/dashboard", label: "Dashboard" },
  { href: "/fighter/profile", label: "Profile" },
  { href: "/fighter/registrations", label: "Registrations" },
  { href: "/fighter/matches", label: "Matches" },
  { href: "/fighter/requests", label: "Requests" },
];

export function FighterNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-x-4 gap-y-2 overflow-x-auto">
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
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
