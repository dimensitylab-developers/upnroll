"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { HomeFaqItem } from "@/components/home/home-faq-data";

const TILTS = ["-rotate-1", "rotate-1", "-rotate-[0.75deg]", "rotate-[1.25deg]", "-rotate-[1.1deg]"];

function PlusMinus({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-7 w-7 shrink-0 items-center justify-center border-2 border-black bg-white text-brand-red shadow-[2px_2px_0_0_#000] transition-colors duration-200",
        "group-hover:bg-brand-red group-hover:text-white",
        open && "bg-brand-red text-white"
      )}
      aria-hidden="true"
    >
      <span className="absolute h-[2.5px] w-3.5 bg-current" />
      <span
        className={cn(
          "absolute h-3.5 w-[2.5px] bg-current transition-transform duration-200",
          open && "scale-y-0"
        )}
      />
    </span>
  );
}

export function HomeFaqTimeline({ items }: { items: HomeFaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  if (items.length === 0) return null;

  return (
    <div className="relative overflow-hidden border-[3px] border-black bg-white shadow-[10px_10px_0_0_#000]">
      <div className="checker-strip h-3 border-b-[3px] border-black" aria-hidden="true" />

      <div className="relative px-4 py-8 sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute -right-2 top-6 hidden rotate-6 border-2 border-black bg-[#F5C518] px-2 py-1 text-display text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000] sm:block"
          aria-hidden="true"
        >
          Tap to open
        </div>

        <ol className="relative mx-auto max-w-3xl list-none space-y-6 sm:space-y-7">
          <span
            className="pointer-events-none absolute top-4 bottom-4 left-5 w-[3px] bg-black sm:left-1/2 sm:-translate-x-1/2"
            aria-hidden="true"
          />

          {items.map((item, index) => {
            const open = openId === item.id;
            const flip = index % 2 === 1;
            const tilt = TILTS[index % TILTS.length];

            return (
              <li
                key={item.id}
                className={cn(
                  "home-faq-rise group/item relative z-10",
                  flip ? "sm:ml-auto sm:mr-0 sm:w-[min(100%,28rem)]" : "sm:mr-auto sm:w-[min(100%,28rem)]"
                )}
                style={{ animationDelay: `${0.06 + index * 0.07}s` }}
              >
                <span
                  className={cn(
                    "absolute top-8 z-20 h-4 w-4 rounded-full border-[2.5px] border-black transition-colors duration-200",
                    "left-[12px] sm:left-1/2 sm:-translate-x-1/2",
                    open ? "bg-brand-red" : "bg-white group-hover/item:bg-brand-red"
                  )}
                  aria-hidden="true"
                />

                <div className={cn("relative ml-10 sm:ml-0", tilt, "transition-transform duration-200 hover:-translate-y-1")}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : item.id)}
                    className={cn(
                      "group relative w-full border-[3px] border-black bg-white px-4 py-4 text-left shadow-[5px_5px_0_0_#000] outline-none transition-[box-shadow,background-color] duration-200 sm:px-5 sm:py-5",
                      "hover:shadow-[7px_7px_0_0_var(--color-brand-red)] focus-visible:shadow-[7px_7px_0_0_var(--color-brand-red)]",
                      open && "bg-[#fff8f6] shadow-[7px_7px_0_0_var(--color-brand-red)]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-funky text-base text-brand-red sm:text-lg">{item.label}</p>
                        <p className="text-display mt-1 text-lg font-semibold uppercase leading-[1.05] tracking-wide sm:text-xl">
                          {item.question}
                        </p>
                      </div>
                      <PlusMinus open={open} />
                    </div>

                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-200 ease-out",
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="pt-3">
                          <div className="mb-3 border-t border-dashed border-black/40" />
                          <p className="text-sm leading-relaxed text-foreground/85">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            href="/faq"
            className="inline-flex -skew-x-12 items-center border-2 border-black bg-black px-5 py-2.5 text-display text-sm font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_var(--color-brand-red)] transition-colors hover:bg-brand-red"
          >
            <span className="inline-block skew-x-12">All fighter FAQs →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
