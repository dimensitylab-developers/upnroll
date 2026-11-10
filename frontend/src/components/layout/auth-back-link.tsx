"use client";

import { useEffect, useState } from "react";
import { isSafeAppPath, resolveAuthReturnPath } from "@/lib/safe-app-path";
import { PageBackLink } from "./page-back-link";

/**
 * Always paints a Back control on first render (safe fallback).
 * May refine to a same-origin referrer after mount when no `from` query was provided.
 */
export function AuthBackLink({
  from,
  current,
  fallback,
}: {
  from?: string;
  current: "/login" | "/register";
  fallback: string;
}) {
  const initial = resolveAuthReturnPath(from, { current, fallback });
  const [href, setHref] = useState(initial);

  useEffect(() => {
    setHref(resolveAuthReturnPath(from, { current, fallback }));
  }, [from, current, fallback]);

  useEffect(() => {
    if (from && isSafeAppPath(from)) return;
    try {
      const ref = document.referrer;
      if (!ref) return;
      const url = new URL(ref);
      if (url.origin !== window.location.origin) return;
      const candidate = `${url.pathname}${url.search}`;
      setHref(resolveAuthReturnPath(candidate, { current, fallback }));
    } catch {
      // ignore malformed referrer
    }
  }, [from, current, fallback]);

  const label =
    href === "/"
      ? "Back to home"
      : href.startsWith("/login")
        ? "Back to sign in"
        : href.startsWith("/events")
          ? "Back to events"
          : "Back";

  return <PageBackLink href={href} label={label} />;
}
