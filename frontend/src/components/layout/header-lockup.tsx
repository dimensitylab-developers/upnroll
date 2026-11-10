"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./brand";

export function HeaderLockup() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Home starts with mark-only on mobile; wordmark reveals after hero scrolls away.
  const [wordmarkVisible, setWordmarkVisible] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setWordmarkVisible(true);
      return;
    }

    setWordmarkVisible(false);

    const target = document.getElementById("home-wordmark");
    if (!target) return;

    const headerOffset = () => {
      const header = document.querySelector("header");
      return header instanceof HTMLElement ? header.getBoundingClientRect().height : 72;
    };

    const update = () => {
      setWordmarkVisible(target.getBoundingClientRect().bottom <= headerOffset() + 4);
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
      className="flex min-h-11 shrink-0 items-center gap-2 rounded-sm bg-white px-1.5 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      <BrandMark className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-wordmark.png"
        alt=""
        aria-hidden={!wordmarkVisible}
        className={[
          "h-7 w-auto max-w-none transition-[max-width,opacity] duration-300 ease-out sm:h-9",
          wordmarkVisible ? "max-w-[9rem] opacity-100 sm:max-w-[11rem]" : "max-w-0 opacity-0",
        ].join(" ")}
      />
    </Link>
  );
}
