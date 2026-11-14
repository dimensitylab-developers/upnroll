"use client";

import { useState, type MouseEvent } from "react";
import { AuthTransitionOverlay, holdAuthGate } from "./auth-transition-overlay";

export type GoogleAuthEntry = "login" | "register";

export function GoogleSignInLink({
  entry = "login",
  from,
}: {
  entry?: GoogleAuthEntry;
  from?: string;
}) {
  const [pending, setPending] = useState(false);
  const params = new URLSearchParams();
  if (entry === "register") params.set("entry", "register");
  if (from) params.set("from", from);
  const query = params.toString();
  const href = query ? `/api/auth/google?${query}` : "/api/auth/google";

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
