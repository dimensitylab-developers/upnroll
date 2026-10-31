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
        <p className="text-display text-lg font-semibold mb-1 px-2">Up &apos;n Roll</p>
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
        <span className="text-display font-semibold">Up &apos;n Roll — /ui-preview</span>
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
