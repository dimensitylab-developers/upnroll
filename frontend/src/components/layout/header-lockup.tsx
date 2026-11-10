"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./brand";

/**
 * Home: hide the whole brand lockup while the hero wordmark is on screen.
 * After scroll, reveal Up 'n Roll in the sticky header. Other routes always show it.
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

  if (isHome && !revealed) {
    return <div className="hidden w-0 shrink-0" aria-hidden="true" />;
  }

  return (
    <Link
      href="/"
      aria-label="Up 'n Roll home"
      className="flex min-h-11 shrink-0 items-center gap-2 rounded-sm bg-white px-1.5 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      <BrandMark className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-wordmark.png"
        alt=""
        className="h-7 w-auto sm:h-9"
      />
    </Link>
  );
}
