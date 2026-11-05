"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./brand";

const HEADER_HEIGHT = 64;

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

  return (
    <Link href="/" aria-label="Up 'n Roll" className="flex items-center gap-2 shrink-0">
      <BrandMark className="h-8 w-8" />
      <span className={`inline-flex overflow-hidden transition-[max-width,opacity] duration-300 ease-out ${showName ? "max-w-56 opacity-100" : "max-w-0 opacity-0"}`}>
        <img src="/logo-wordmark.png" alt="" className="h-8 w-auto max-w-none" />
      </span>
    </Link>
  );
}
