"use client";

import { useMemo, useState } from "react";

const TILTS = [-6, 4, -3, 7, -5, 3, -8, 5, -2, 6, -4, 8, -7];
const NUDGES = [
  { x: -6, y: 8 },
  { x: 10, y: -4 },
  { x: -2, y: 12 },
  { x: 8, y: 2 },
  { x: -10, y: -6 },
  { x: 4, y: 10 },
  { x: -8, y: 0 },
  { x: 12, y: 6 },
  { x: 0, y: -8 },
  { x: 6, y: 4 },
  { x: -4, y: 14 },
  { x: 2, y: -2 },
  { x: -12, y: 8 },
];

function shuffleOrder(length: number, avoid?: number[]): number[] {
  const next = Array.from({ length }, (_, index) => index);
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  // avoid identical shuffle when possible
  if (avoid && next.every((value, index) => value === avoid[index]) && length > 1) {
    [next[0], next[1]] = [next[1]!, next[0]!];
  }
  return next;
}

export function HappyStack({ photos }: { photos: { src: string; alt: string }[] }) {
  const count = photos.length;
  const [order, setOrder] = useState(() => Array.from({ length: count }, (_, index) => index));
  const [lifted, setLifted] = useState<number | null>(null);
  const [seed, setSeed] = useState(0);

  const layout = useMemo(
    () =>
      order.map((photoIndex, slot) => ({
        photoIndex,
        tilt: TILTS[(photoIndex + seed) % TILTS.length]!,
        nudge: NUDGES[(photoIndex + seed) % NUDGES.length]!,
        slot,
      })),
    [order, seed]
  );

  if (count === 0) return null;

  function shuffleBoard() {
    setOrder((current) => shuffleOrder(count, current));
    setSeed((value) => value + 1);
    setLifted(null);
  }

  function liftCard(photoIndex: number) {
    setLifted((current) => (current === photoIndex ? null : photoIndex));
  }

  function swapWithNeighbor(photoIndex: number) {
    setOrder((current) => {
      const at = current.indexOf(photoIndex);
      if (at < 0) return current;
      const withIndex = at % 2 === 0 ? Math.min(at + 1, current.length - 1) : at - 1;
      if (withIndex === at) return current;
      const next = [...current];
      [next[at], next[withIndex]] = [next[withIndex]!, next[at]!];
      return next;
    });
    setLifted(photoIndex);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl bg-white px-2 py-1 text-sm">
          Polaroids on the board — tap to lift, double-tap to swap, or shuffle the whole frame.
        </p>
        <button
          type="button"
          onClick={shuffleBoard}
          className="inline-flex -skew-x-12 border-2 border-black bg-brand-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000]"
        >
          <span className="inline-block skew-x-12">Shuffle</span>
        </button>
      </div>

      <div className="relative overflow-hidden border-2 border-black bg-[#f4f1ea] p-3 shadow-[8px_8px_0_0_#000] sm:p-5">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "10px 10px" }} />

        <ul className="relative grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {layout.map(({ photoIndex, tilt, nudge, slot }) => {
            const photo = photos[photoIndex]!;
            const isLifted = lifted === photoIndex;
            return (
              <li key={`${photo.src}-${slot}`} className="min-w-0">
                <button
                  type="button"
                  onClick={() => liftCard(photoIndex)}
                  onDoubleClick={(event) => {
                    event.preventDefault();
                    swapWithNeighbor(photoIndex);
                  }}
                  aria-pressed={isLifted}
                  aria-label={`Happy moment ${photoIndex + 1}. ${isLifted ? "Lifted." : "Tap to lift."}`}
                  className={`group relative w-full border-2 border-black bg-white p-2 text-left shadow-[5px_5px_0_0_#000] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#c8102e] ${
                    isLifted ? "z-20 shadow-[10px_10px_0_0_#c8102e] ring-2 ring-brand-red" : "z-0"
                  }`}
                  style={{
                    transform: isLifted
                      ? `translate(${nudge.x * 0.2}px, ${nudge.y * 0.2 - 8}px) rotate(0deg) scale(1.04)`
                      : `translate(${nudge.x}px, ${nudge.y}px) rotate(${tilt}deg)`,
                  }}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 sm:aspect-[5/6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      width={360}
                      height={450}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      draggable={false}
                    />
                  </div>
                  <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Moment {String(photoIndex + 1).padStart(2, "0")}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
