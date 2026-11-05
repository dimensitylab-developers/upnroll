"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function MobileNavToggle({
  links,
  dashboardHref,
}: {
  links: { href: string; label: string }[];
  dashboardHref: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>
      {open && (
        <div className="absolute left-0 right-0 top-16 bg-background border-b border-black/10 px-4 pb-4">
          <nav aria-label="Primary mobile" className="flex flex-col gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="px-2 py-2 rounded-md text-sm hover:bg-black/5" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-black/10 my-2" />
            {dashboardHref ? (
              <Link href={dashboardHref} className="px-2 py-2 rounded-md text-sm font-medium hover:bg-black/5" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-2 py-2 rounded-md text-sm hover:bg-black/5" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link href="/register" className="px-2 py-2 rounded-md text-sm font-medium hover:bg-black/5" onClick={() => setOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
