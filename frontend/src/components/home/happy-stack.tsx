"use client";

import { useState } from "react";

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

export function HappyStack({ photos }: { photos: { src: string; alt: string }[] }) {
  const [lifted, setLifted] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <div className="relative overflow-hidden border-2 border-black bg-[#f4f1ea] p-3 shadow-[8px_8px_0_0_#000] sm:p-5">
      <ul className="relative grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
        {photos.map((photo, index) => {
          const tilt = TILTS[index % TILTS.length]!;
          const nudge = NUDGES[index % NUDGES.length]!;
          const isLifted = lifted === index;
          return (
            <li key={photo.src} className="min-w-0">
              <button
                type="button"
                onClick={() => setLifted((current) => (current === index ? null : index))}
                aria-pressed={isLifted}
                aria-label={`Celebration ${index + 1}`}
                className={`group relative w-full border-2 border-black bg-white p-2 text-left shadow-[5px_5px_0_0_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[10px_10px_0_0_#c8102e] ${
                  isLifted ? "z-20 -translate-y-2 scale-[1.04] shadow-[10px_10px_0_0_#c8102e] ring-2 ring-brand-red" : "z-0"
                }`}
                style={{
                  transform: isLifted
                    ? undefined
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
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
