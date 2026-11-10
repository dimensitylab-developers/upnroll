"use client";

import { useLinkStatus } from "next/link";

/** Visible pressed/pending cue for Next.js Link navigations. */
export function NavLinkPending({ className = "" }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      className={`pointer-events-none absolute inset-0 bg-brand-red/15 ${className}`}
      aria-hidden="true"
      data-pending="true"
    />
  );
}
