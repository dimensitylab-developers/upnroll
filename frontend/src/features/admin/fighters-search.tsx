"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 300;

export function FightersSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);
  const latestParams = useRef(searchParams);
  latestParams.current = searchParams;

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const trimmed = value.trim();
    const current = latestParams.current.get("q") ?? "";
    if (trimmed === current) return;

    const timer = window.setTimeout(() => {
      startTransition(() => {
        const next = new URLSearchParams(latestParams.current.toString());
        if (trimmed) next.set("q", trimmed);
        else next.delete("q");
        const qs = next.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [value, pathname, router]);

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search name, email, gym, city…"
      aria-label="Search grapplers"
      className="max-w-md border-2 border-black bg-white shadow-[4px_4px_0_0_#000]"
      autoComplete="off"
    />
  );
}
