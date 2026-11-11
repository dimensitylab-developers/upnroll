"use client";

import { useEffect, useState } from "react";
import type { FightingMedia } from "./site-photos";
import { FightTapePlayer } from "./fight-tape-player";

export function FightingGallery({
  photos,
  media,
}: {
  photos?: { src: string; alt: string }[];
  media?: FightingMedia[];
}) {
  const items: FightingMedia[] =
    media ??
    (photos ?? []).map((photo) => ({ type: "photo" as const, src: photo.src, alt: photo.alt }));

  const stills = items.filter((item): item is Extract<FightingMedia, { type: "photo" }> => item.type === "photo");
  const tapes = items.filter((item): item is Extract<FightingMedia, { type: "video" }> => item.type === "video");

  const [index, setIndex] = useState(0);
  const count = stills.length;
  const active = stills[index] ?? null;

  useEffect(() => {
    if (count < 2) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [count, index]);

  if (items.length === 0) return null;

  function step(direction: number) {
    if (count === 0) return;
    setIndex((current) => (current + direction + count) % count);
  }

  return (
    <div className="space-y-4">
      {active && (
        <div className="relative overflow-hidden border-2 border-black bg-black shadow-[10px_10px_0_0_#c8102e]">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-2 bg-brand-red" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-2 bg-brand-red" aria-hidden="true" />

          <div className="relative aspect-[16/10] sm:aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.src}
              alt={active.alt}
              width={960}
              height={540}
              decoding="async"
              loading={index === 0 ? "eager" : "lazy"}
              // First still is often LCP on home; keep it eager. Neighbors stay lazy.
              fetchPriority={index === 0 ? "high" : "low"}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

            <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2">
              <span className="-rotate-2 border-2 border-black bg-brand-red px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[3px_3px_0_0_#000]">
                On the mat
              </span>
              <span className="rotate-2 border-2 border-black bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-[3px_3px_0_0_#000]">
                Highlights
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-3">
              <p className="max-w-sm bg-white/95 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-black sm:text-sm">
                Still from the card
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="border-2 border-black bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000]"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="border-2 border-black bg-brand-red px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[3px_3px_0_0_#000]"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t-2 border-white/20 bg-black px-4 py-2 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">
              Mat screen · {index + 1}/{count}
            </p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">
              {tapes.length} tape{tapes.length === 1 ? "" : "s"} · {stills.length} still{stills.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      )}

      {tapes.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">Fight tapes</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {tapes.map((tape, tapeIndex) => (
              <li key={tape.src}>
                <FightTapePlayer
                  src={tape.src}
                  poster={tape.poster}
                  label={`Tape ${tapeIndex + 1}`}
                  alt={tape.alt}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {stills.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">Stills</p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
            {stills.map((item, itemIndex) => {
              const selected = itemIndex === index;
              const featured = itemIndex === 0 || itemIndex === 5;
              // Only eager-load the active still thumbnail; the rest stay lazy.
              const eager = itemIndex === index;
              return (
                <li
                  key={item.src}
                  className={featured ? "col-span-2 row-span-1 sm:col-span-1 md:col-span-2" : undefined}
                >
                  <button
                    type="button"
                    onClick={() => setIndex(itemIndex)}
                    aria-current={selected ? "true" : undefined}
                    aria-label={`Still ${itemIndex + 1}`}
                    className={`group relative block w-full overflow-hidden border-2 border-black bg-black shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#c8102e] ${
                      selected ? "ring-2 ring-brand-red ring-offset-2" : ""
                    }`}
                  >
                    <div className={`relative overflow-hidden ${featured ? "aspect-[16/10]" : "aspect-square"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.src}
                        alt={item.alt}
                        width={featured ? 640 : 320}
                        height={featured ? 400 : 320}
                        loading={eager ? "eager" : "lazy"}
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
