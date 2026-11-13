"use client";

import { useState, type MouseEvent } from "react";
import { AuthTransitionOverlay, holdAuthGate } from "./auth-transition-overlay";

export type GoogleAuthEntry = "login" | "register";

export function GoogleSignInLink({ entry = "login" }: { entry?: GoogleAuthEntry }) {
  const [pending, setPending] = useState(false);
  const href = entry === "register" ? "/api/auth/google?entry=register" : "/api/auth/google";

  async function onClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    await holdAuthGate();
    window.location.assign(href);
  }

  return (
    <>
      {pending ? <AuthTransitionOverlay mode="in" name="Grappler" /> : null}
      <a
        href={href}
        onClick={onClick}
        className="mt-3 flex min-h-12 w-full items-center justify-center border-2 border-black bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] shadow-[4px_4px_0_0_#000] hover:bg-[#f7f4ef]"
      >
        {pending ? "Stepping on the mat…" : "Continue with Google"}
      </a>
    </>
  );
}
