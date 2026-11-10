"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";

export function FightersSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <Input
      defaultValue={defaultValue}
      placeholder="Search name, email, gym, city…"
      aria-label="Search fighters"
      className="max-w-md border-2 border-black bg-white shadow-[4px_4px_0_0_#000]"
      onChange={(e) => {
        const value = e.target.value;
        startTransition(() => {
          const next = new URLSearchParams(searchParams.toString());
          if (value.trim()) next.set("q", value);
          else next.delete("q");
          router.replace(`${pathname}?${next.toString()}`);
        });
      }}
      disabled={pending}
    />
  );
}
