"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/rankings", label: "Rankings" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/media", label: "Media" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-x-4 gap-y-2 overflow-x-auto">
      {LINKS.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
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
