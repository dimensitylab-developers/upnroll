"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
const HEADER_HEIGHT = 72;

export function HeaderLockup() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [pastWordmark, setPastWordmark] = useState(false);
  const showName = !isHome || pastWordmark;

  useEffect(() => {
    if (!isHome) return;
    const target = document.getElementById("home-wordmark");
    if (!target) return;

    const update = () => {
      setPastWordmark(target.getBoundingClientRect().bottom <= HEADER_HEIGHT);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  if (!showName) return null;

  return (
    <Link href="/" aria-label="Up 'n Roll" className="shrink-0 bg-white px-2 py-1">
      <img src="/logo-wordmark.png" alt="" className="h-11 w-auto" />
    </Link>
  );
}
