"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HeaderLockup() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Home starts hidden so we don't stack two wordmarks; other routes show immediately.
  const [visible, setVisible] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setVisible(true);
      return;
    }

    setVisible(false);

    const target = document.getElementById("home-wordmark");
    if (!target) return;

    const headerOffset = () => {
      const header = document.querySelector("header");
      return header instanceof HTMLElement ? header.getBoundingClientRect().height : 72;
    };

    const update = () => {
      // Reveal once the hero wordmark has scrolled up under (or past) the sticky header.
      setVisible(target.getBoundingClientRect().bottom <= headerOffset() + 4);
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
      aria-label="Up 'n Roll"
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      className={[
        "shrink-0 overflow-hidden bg-white transition-[max-width,opacity,transform,padding] duration-300 ease-out",
        visible
          ? "max-w-[11rem] translate-y-0 px-2 py-1 opacity-100"
          : "pointer-events-none max-w-0 -translate-y-1 px-0 py-1 opacity-0",
      ].join(" ")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-wordmark.png" alt="" className="h-11 w-auto max-w-none" />
    </Link>
  );
}
