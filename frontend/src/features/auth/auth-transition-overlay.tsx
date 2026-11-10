"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** How long the mat gate stays up so the name can be read before auth continues. */
export const AUTH_GATE_MS = 2200;

export async function holdAuthGate(ms = AUTH_GATE_MS) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

type AuthTransitionOverlayProps = {
  mode: "in" | "out";
  /** Full or first name — we shorten to the first word for the shout. */
  name: string;
};

function shortName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "Grappler";
  return trimmed.split(/\s+/)[0] ?? "Grappler";
}

/** Full-screen mat gate — portaled to body so parent transforms cannot trap it. */
export function AuthTransitionOverlay({ mode, name }: AuthTransitionOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const who = shortName(name);
  const headline = mode === "in" ? "Hi," : "Later,";
  const sub = mode === "in" ? "Stepping on the mat…" : "Stepping off the mat…";
  const stamp = mode === "in" ? "ON THE MAT" : "OFF THE MAT";

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="auth-gate fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] text-white"
      role="status"
      aria-live="assertive"
      aria-label={`${headline} ${who}. ${sub}`}
    >
      <div className="auth-gate-speed pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="auth-gate-halftone pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-6 px-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.png"
          alt=""
          className="auth-gate-mark h-16 w-16 object-contain drop-shadow-[4px_4px_0_0_#c8102e]"
        />

        <div className="auth-gate-stamp border-4 border-white bg-brand-red px-5 py-2 shadow-[6px_6px_0_0_#fff]">
          <p className="text-display text-sm font-semibold uppercase tracking-[0.28em] sm:text-base">{stamp}</p>
        </div>

        <div className="auth-gate-nameplate w-full border-4 border-white bg-white px-5 py-6 text-black shadow-[8px_8px_0_0_#c8102e]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-red">{headline}</p>
          <p className="text-display mt-2 text-4xl font-semibold sm:text-5xl">{who}</p>
        </div>

        <p className="text-sm uppercase tracking-[0.2em] text-white/70">{sub}</p>

        <div
          className="auth-gate-mat mt-1 h-3 w-52 overflow-hidden border-2 border-white bg-white/10"
          style={{ ["--auth-gate-ms" as string]: `${AUTH_GATE_MS}ms` }}
        >
          <span className="auth-gate-progress block h-full bg-brand-red" />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-red">Up &apos;n Roll</p>
      </div>
    </div>,
    document.body
  );
}

/** Best-effort first name from an email local-part while signing in. */
export function guessNameFromEmail(email: string) {
  const local = email.split("@")[0]?.trim() ?? "";
  if (!local) return "Grappler";
  const cleaned = local.replace(/[._+-]+/g, " ").trim();
  const first = cleaned.split(/\s+/)[0] ?? "Grappler";
  return first.charAt(0).toUpperCase() + first.slice(1);
}
