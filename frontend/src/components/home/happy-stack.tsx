"use client";

import { useState, type ReactNode } from "react";
import { Shuffle } from "lucide-react";
import { SectionBanner } from "@/components/home/section-banner";

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

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function HappyStack({
  photos: initialPhotos,
  title,
}: {
  photos: { src: string; alt: string }[];
  title?: ReactNode;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [lifted, setLifted] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {title !== undefined ? title : <SectionBanner className="mb-0">Celebrations</SectionBanner>}
        <button
          type="button"
          onClick={() => {
            setLifted(null);
            setPhotos((current) => shuffled(current));
          }}
          className="inline-flex items-center gap-2 border-2 border-black bg-brand-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000]"
        >
          <Shuffle className="size-4" aria-hidden="true" />
          Shuffle
        </button>
      </div>

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
  </div>
);
}
