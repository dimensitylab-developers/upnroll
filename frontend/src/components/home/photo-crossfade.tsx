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
        <div className="media-glow relative overflow-hidden border-2 border-black bg-black shadow-[10px_10px_0_0_#c8102e]">
          <div className="relative aspect-[16/10] sm:aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.src}
              alt={active.alt}
              width={960}
              height={540}
              decoding="async"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 hover:scale-[1.03]"
            />

            <div className="absolute bottom-4 right-4 z-20 flex gap-2">
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

          <div className="flex items-center justify-between gap-3 border-t-2 border-white/20 bg-black px-4 py-2 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">
              {index + 1}/{count}
            </p>
          </div>
        </div>
      )}

      {tapes.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tapes.map((tape) => (
            <li key={tape.src}>
              <FightTapePlayer src={tape.src} poster={tape.poster} label="" alt={tape.alt} portrait />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
