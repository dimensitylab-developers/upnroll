"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PageLoader } from "./page-loader";

const SHOW_DELAY_MS = 150;
const HIDE_DELAY_MS = 280;

function shouldTrack(headers: Headers) {
  if (headers.get("next-hmr-refresh")) return false;
  if (headers.get("next-router-prefetch") === "1") return false;
  if (headers.get("next-router-segment-prefetch") === "1") return false;
  if (headers.has("next-action")) return true;
  return headers.get("rsc") === "1";
}

export function NavigationLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
  }, [pathname]);

  useEffect(() => {
    let pending = 0;
    let showTimer: number | undefined;
    let hideTimer: number | undefined;
    const original = window.fetch.bind(window);

    const arm = () => {
      window.clearTimeout(hideTimer);
      if (showTimer !== undefined || pending === 0) return;
      showTimer = window.setTimeout(() => {
        showTimer = undefined;
        if (pending > 0) setVisible(true);
      }, SHOW_DELAY_MS);
    };

    const begin = (immediate: boolean) => {
      pending += 1;
      if (immediate) {
        window.clearTimeout(hideTimer);
        window.clearTimeout(showTimer);
        showTimer = undefined;
        setVisible(true);
        return;
      }
      arm();
    };

    const end = () => {
      pending = Math.max(0, pending - 1);
      if (pending > 0) return;
      window.clearTimeout(showTimer);
      showTimer = undefined;
      hideTimer = window.setTimeout(() => {
        if (pending === 0) setVisible(false);
      }, HIDE_DELAY_MS);
    };

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
      const track = shouldTrack(headers);
      if (track) begin(headers.has("next-action"));
      try {
        return await original(input, init);
      } finally {
        if (track) end();
      }
    };

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.fetch = original;
    };
  }, []);

  if (!visible) return null;
  return <PageLoader />;
}
