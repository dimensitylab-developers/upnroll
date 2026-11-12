"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const STORAGE_KEY = "upnroll-pitch-no-gi-2";
const AUTO_HIDE_MS = 4000;
const BANNER_SRC = "/banners/up-n-roll-no-gi-2.jpg";
const EVENT_HREF = "/events/up-n-roll-superfight-series";

export function EventPitchPopup() {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      // private mode — still show once this session
    }

    const show = window.setTimeout(() => setOpen(true), 500);
    return () => window.clearTimeout(show);
  }, []);

  useEffect(() => {
    if (!open) return;

    const hide = window.setTimeout(() => dismiss(), AUTO_HIDE_MS);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(hide);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function markSeen() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }

  function dismiss() {
    if (leaving) return;
    setLeaving(true);
    markSeen();
    window.setTimeout(() => {
      setOpen(false);
      setLeaving(false);
    }, 280);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Upcoming card">
      <button
        type="button"
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${leaving ? "opacity-0" : "opacity-100"}`}
        aria-label="Dismiss pitch"
        onClick={dismiss}
      />

      <div
        className={`pitch-popup relative z-10 w-full max-w-md overflow-hidden border-2 border-black bg-[#f2eee6] shadow-[12px_12px_0_0_#c8102e] ${
          leaving ? "pitch-popup-out" : "pitch-popup-in"
        }`}
      >
        {/* Ticket tear / cut stamp — not a plain X */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 z-20 -rotate-6 border-2 border-black bg-brand-red px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-[3px_3px_0_0_#000] transition-transform hover:rotate-3 hover:scale-105"
        >
          Cut · Out
        </button>

        <div className="border-b-2 border-black bg-black px-4 py-3 pr-24 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">Next card · #2</p>
          <p className="mt-1 text-display text-lg font-semibold leading-tight sm:text-xl">Grapplers only. No-Gi.</p>
        </div>

        <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
          <Image
            src={BANNER_SRC}
            alt="Up 'n Roll No-Gi. 23 January 2027, Mumbai"
            fill
            sizes="(max-width: 448px) 100vw, 28rem"
            className="object-cover object-top"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="space-y-3 border-t-2 border-black bg-white px-4 py-4">
          <p className="text-sm font-semibold">23 January 2027 · Saturday · Mumbai</p>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Road to Super Fight</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={EVENT_HREF}
              onClick={markSeen}
              className="inline-flex -skew-x-12 border-2 border-black bg-brand-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000]"
            >
              <span className="inline-block skew-x-12">Open the card</span>
            </Link>
            <Link
              href="/register"
              onClick={markSeen}
              className="inline-flex border-2 border-black bg-black px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#c8102e]"
            >
              Sign up
            </Link>
          </div>

          {/* Auto-hide fuse */}
          <div className="pt-1" aria-hidden="true">
            <div className="h-1.5 overflow-hidden border border-black bg-neutral-200">
              <div className="pitch-fuse h-full bg-brand-red" />
            </div>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Auto clears</p>
          </div>
        </div>
      </div>
    </div>
  );
}
