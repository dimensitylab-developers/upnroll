"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./brand";

/**
 * Home: keep the lockup mounted and ease it in after the hero wordmark scrolls away.
 * Other routes always show it.
 */
export function HeaderLockup() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [revealed, setRevealed] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setRevealed(true);
      return;
    }

    setRevealed(false);

    const target = document.getElementById("home-wordmark");
    if (!target) {
      setRevealed(true);
      return;
    }

    const headerOffset = () => {
      const header = document.querySelector("header");
      return header instanceof HTMLElement ? header.getBoundingClientRect().height : 72;
    };

    const update = () => {
      setRevealed(target.getBoundingClientRect().bottom <= headerOffset() + 4);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome, pathname]);

  return (
    <Link
      href="/"
      aria-label="Up 'n Roll home"
      aria-hidden={isHome && !revealed ? true : undefined}
      tabIndex={isHome && !revealed ? -1 : undefined}
      className={`header-lockup flex min-h-11 shrink-0 items-center gap-2 rounded-sm bg-white px-1.5 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
        revealed ? "header-lockup-in" : "header-lockup-out"
      }`}
    >
      <BrandMark className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-wordmark.png" alt="" className="h-7 w-auto sm:h-9" />
    </Link>
  );
}
