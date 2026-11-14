"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Home: nav starts flush left (no reserved logo gap). When the hero wordmark
 * scrolls away, the lockup expands and eases in so About/Events/… shift aside.
 * Other routes always show the lockup.
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
    <div
      className={`header-lockup ${revealed ? "header-lockup-in" : "header-lockup-out"}`}
      aria-hidden={isHome && !revealed ? true : undefined}
    >
      <div className="header-lockup-clip">
        <Link
          href="/"
          aria-label="Up 'n Roll home"
          tabIndex={isHome && !revealed ? -1 : undefined}
          className="header-lockup-inner flex min-h-12 items-center rounded-sm px-1 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:min-h-14"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-wordmark.png"
            alt=""
            width={220}
            height={60}
            className="h-10 w-auto object-contain sm:h-12"
          />
        </Link>
      </div>
    </div>
  );
}
