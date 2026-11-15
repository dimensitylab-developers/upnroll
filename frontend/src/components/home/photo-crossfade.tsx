"use client";

import { useEffect, useState } from "react";
import type { FightingMedia } from "./site-photos";
import { FightTapePlayer } from "./fight-tape-player";

type Tape = Extract<FightingMedia, { type: "video" }>;

/**
 * Landscapes stacked left; portrait on the right matched to that stack height (9:16).
 * Height-matching is pure CSS (flex stretch + aspect-ratio) so it never re-measures
 * on resize - a prior JS ResizeObserver-driven version caused the stack height and
 * portrait width to feed back into each other, which jittered the layout on desktop.
 */
function TapeStrip({ tapes }: { tapes: Tape[] }) {
  const landscapes = tapes.filter((tape) => tape.orientation !== "portrait");
  const portraits = tapes.filter((tape) => tape.orientation === "portrait");
  const portrait = portraits[0];

  if (tapes.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      {landscapes.length > 0 ? (
        <ul className="flex min-w-0 flex-1 flex-col gap-3">
          {landscapes.map((tape) => (
            <li key={tape.src} className="min-w-0">
              <FightTapePlayer
                src={tape.src}
                poster={tape.poster}
                label=""
                alt={tape.alt}
                portrait={false}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {portrait ? (
        <div className="mx-auto w-full max-w-[16rem] shrink-0 sm:mx-0 sm:w-56 sm:max-w-none sm:self-stretch">
          <FightTapePlayer
            src={portrait.src}
            poster={portrait.poster}
            label=""
            alt={portrait.alt}
            portrait
            fill
          />
        </div>
      ) : null}

      {portraits.slice(1).map((tape) => (
        <div key={tape.src} className="mx-auto w-full max-w-[16rem] sm:hidden">
          <FightTapePlayer
            src={tape.src}
            poster={tape.poster}
            label=""
            alt={tape.alt}
            portrait
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Home “On the mat”:
 * 1) Auto-looping still slideshow (object-contain: no crop)
 * 2) Video strip: landscapes stacked left, portrait height-matched on the right
 */
export function FightingGallery({
  photos,
  media,
}: {
  photos?: { src: string; alt: string; orientation?: "portrait" | "landscape" }[];
  media?: FightingMedia[];
}) {
  const items: FightingMedia[] =
    media ??
    (photos ?? []).map((photo) => ({ type: "photo" as const, src: photo.src, alt: photo.alt, orientation: photo.orientation }));

  const stills = items.filter((item): item is Extract<FightingMedia, { type: "photo" }> => item.type === "photo");
  const tapes = items.filter((item): item is Tape => item.type === "video");

  const [index, setIndex] = useState(0);
  const count = stills.length;
  const active = stills[index] ?? null;
  const activePortrait = active?.orientation === "portrait";

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
        <div className="flex justify-center">
          <div
            className={`media-glow relative w-full overflow-hidden border-2 border-black bg-white transition-[max-width] duration-500 ease-out ${
              activePortrait ? "max-w-[min(100%,24rem)] sm:max-w-[min(100%,28rem)]" : "max-w-full"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={active.src}
              src={active.src}
              alt={active.alt}
              width={1280}
              height={activePortrait ? 1920 : 853}
              decoding="async"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
              className="block h-auto w-full"
            />

            <p className="absolute bottom-3 left-3 z-20 border-2 border-black bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red shadow-[3px_3px_0_0_#000]">
              {index + 1}/{count}
            </p>

            <div className="absolute bottom-3 right-3 z-20 flex gap-2">
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
      )}

      <TapeStrip tapes={tapes} />
    </div>
  );
}
