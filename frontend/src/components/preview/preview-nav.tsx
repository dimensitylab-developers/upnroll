"use client";

import { useState } from "react";
import { CHAPTERS } from "./chapter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function PreviewNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label="Showroom chapters"
        className="hidden lg:block fixed left-0 top-0 h-screen w-64 overflow-y-auto border-r border-black/10 bg-sidebar px-4 py-6"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-wordmark.png"
          alt="Up 'n Roll"
          width={912}
          height={244}
          className="mb-1 h-8 w-auto max-w-[10rem] object-contain px-2"
        />
        <p className="text-xs text-muted-foreground px-2 mb-6">/ui-preview showroom</p>
        <ul className="space-y-0.5">
          {CHAPTERS.map((c) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
              >
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile top bar + drawer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-black/10 bg-sidebar px-4 py-3">
        <span className="flex min-w-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-wordmark.png"
            alt="Up 'n Roll"
            width={912}
            height={244}
            className="h-6 w-auto max-w-[7.5rem] object-contain"
          />
          <span className="text-xs text-muted-foreground">/ui-preview</span>
        </span>
        <Button variant="ghost" size="icon" aria-label="Open chapter navigation" onClick={() => setOpen(true)}>
          <Menu className="size-5" />
        </Button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
            <span className="text-display font-semibold">Chapters</span>
            <Button variant="ghost" size="icon" aria-label="Close chapter navigation" onClick={() => setOpen(false)}>
              <X className="size-5" />
            </Button>
          </div>
          <ul className="px-4 py-4 space-y-1 overflow-y-auto h-[calc(100vh-56px)]">
            {CHAPTERS.map((c) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-black/5"
                >
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
