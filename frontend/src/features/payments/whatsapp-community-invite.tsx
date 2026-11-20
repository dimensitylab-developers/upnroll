"use client";

import { useEffect, useId, useState } from "react";
import { EVENT_WHATSAPP_COMMUNITY_CTA, EVENT_WHATSAPP_COMMUNITY_URL } from "@/lib/event-community";

type WhatsAppCommunityInviteProps = {
  /** Stable id so we only auto-open once per registration / thank-you view. */
  storageKey: string;
  /** Open the dialog on mount (after payment submit / thank-you). */
  autoOpen?: boolean;
};

export function WhatsAppCommunityInvite({ storageKey, autoOpen = true }: WhatsAppCommunityInviteProps) {
  const titleId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!autoOpen) return;
    try {
      if (window.sessionStorage.getItem(storageKey) === "1") return;
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // private mode — still show once this mount
    }
    setOpen(true);
  }, [autoOpen, storageKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="mt-5 border-2 border-black bg-white p-4 text-left shadow-[4px_4px_0_0_#000]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-red">Event community</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          All further event updates go out in the WhatsApp community. Join so you do not miss brackets, mats, and
          day-of notes.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={EVENT_WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 -skew-x-12 items-center border-2 border-black bg-[#25D366] px-4 text-xs font-semibold uppercase tracking-wider text-black shadow-[3px_3px_0_0_#000]"
          >
            <span className="inline-block skew-x-12">{EVENT_WHATSAPP_COMMUNITY_CTA}</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-10 items-center border-2 border-black bg-white px-3 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000]"
          >
            Open invite
          </button>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md border-2 border-black bg-white p-5 shadow-[10px_10px_0_0_#000] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">WhatsApp</p>
            <h2 id={titleId} className="text-display mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              Join the event community
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Further updates for this event are posted in the WhatsApp community. Tap join so you stay on the list.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a
                href={EVENT_WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 flex-1 items-center justify-center border-2 border-black bg-[#25D366] px-4 text-sm font-semibold uppercase tracking-wider text-black shadow-[4px_4px_0_0_#000]"
              >
                {EVENT_WHATSAPP_COMMUNITY_CTA}
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center justify-center border-2 border-black bg-white px-4 text-sm font-semibold uppercase tracking-wider shadow-[4px_4px_0_0_#000]"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
