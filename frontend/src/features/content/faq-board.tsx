"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

function PlusMinus({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        "relative mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center text-brand-red",
        "transition-transform duration-200"
      )}
      aria-hidden="true"
    >
      <span className="absolute h-[2.5px] w-3.5 bg-current" />
      <span
        className={cn(
          "absolute h-3.5 w-[2.5px] bg-current transition-transform duration-200",
          open && "rotate-90 scale-y-0"
        )}
      />
    </span>
  );
}

export function FaqBoard({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  if (items.length === 0) return null;

  return (
    <div className="relative border-[3px] border-black bg-white shadow-[8px_8px_0_0_#000]">
      <div
        className="pointer-events-none absolute -top-3 -right-3 z-10 flex h-10 w-10 items-center justify-center border-2 border-black bg-[#F5C518] shadow-[3px_3px_0_0_#000]"
        aria-hidden="true"
      >
        <span className="text-display text-xl font-semibold leading-none">✦</span>
      </div>

      <div className="divide-y divide-black/15">
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <div key={item.id} className="border-x-0">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : item.id)}
                className={cn(
                  "flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors sm:px-6 sm:py-5",
                  open ? "bg-black/[0.03]" : "hover:bg-black/[0.03]"
                )}
              >
                <span className="text-display text-[15px] font-semibold uppercase leading-snug tracking-[0.04em] sm:text-base">
                  {item.question}
                </span>
                <PlusMinus open={open} />
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-250 ease-out",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                    <div className="mb-4 border-t border-dashed border-black/35" />
                    <p className="max-w-prose text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
