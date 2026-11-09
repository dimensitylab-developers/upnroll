"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

function numberFor(index: number) {
  return String(index + 1).padStart(2, "0");
}

function Answer({ item, index }: { item: FaqItem; index: number }) {
  return (
    <div className="relative flex h-full flex-col">
      <div className="checker-strip h-2.5 shrink-0" aria-hidden="true" />
      <div className="relative flex-1 px-5 py-6 sm:px-7 sm:py-8">
        <p className="pointer-events-none absolute top-4 right-4 text-display text-6xl font-semibold leading-none text-brand-red/15" aria-hidden="true">
          {numberFor(index)}
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Question {numberFor(index)}</p>
        <h3 className="text-display mt-2 max-w-md text-2xl font-semibold leading-tight sm:text-3xl">{item.question}</h3>
        <p className="mt-4 max-w-prose text-sm leading-relaxed">{item.answer}</p>
      </div>
    </div>
  );
}

export function FaqBoard({ items }: { items: FaqItem[] }) {
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];
  if (!current) return null;

  return (
    <div
      className={cn(
        "border-2 border-black bg-white shadow-[8px_8px_0_0_#000] lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]",
        items.length > 6 && "lg:h-[34rem]"
      )}
    >
      <div className="lg:overflow-y-auto lg:border-r-2 lg:border-black" role="list">
        {items.map((item, index) => {
          const selected = index === active;
          return (
            <div key={item.id} role="listitem" className={cn(index > 0 && "border-t border-black/10")}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(index)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors",
                  selected ? "bg-black text-white" : "bg-white hover:bg-black/[0.04]"
                )}
              >
                <span className="text-display w-7 shrink-0 pt-0.5 text-sm font-semibold text-brand-red">{numberFor(index)}</span>
                <span className="text-sm font-medium leading-snug">{item.question}</span>
              </button>
              {selected && (
                <div className="border-t border-white/10 bg-black text-white lg:hidden">
                  <p className="px-4 py-4 text-sm leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="hidden overflow-y-auto lg:block" aria-live="polite">
        <Answer item={current} index={active} />
      </div>
    </div>
  );
}
