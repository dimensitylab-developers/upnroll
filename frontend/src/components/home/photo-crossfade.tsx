"use client";

import { useEffect, useState } from "react";

export function FightingGallery({ photos }: { photos: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);
  const count = photos.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [count]);

  if (count === 0) return null;

  function step(direction: number) {
    setIndex((current) => (current + direction + count) % count);
  }

  return (
    <div>
      <div className="border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-white">
          {photos.map((shot, shotIndex) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={shot.src}
              src={shot.src}
              alt={shot.alt}
              className={`absolute max-h-full max-w-full object-contain transition-opacity duration-700 ${
                shotIndex === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <button type="button" onClick={() => step(-1)} className="border-2 border-black bg-white px-3 py-1.5 text-sm font-semibold shadow-[3px_3px_0_0_#000]">
          Previous
        </button>
        <p className="text-sm font-semibold tabular-nums">
          {index + 1} / {count}
        </p>
        <button type="button" onClick={() => step(1)} className="border-2 border-black bg-white px-3 py-1.5 text-sm font-semibold shadow-[3px_3px_0_0_#000]">
          Next
        </button>
      </div>
      <ul className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {photos.map((shot, shotIndex) => (
          <li key={shot.src} className="shrink-0">
            <button
              type="button"
              onClick={() => setIndex(shotIndex)}
              aria-current={shotIndex === index ? "true" : undefined}
              aria-label={`Photo ${shotIndex + 1} of ${count}`}
              className={`block h-16 w-20 border-2 bg-white ${shotIndex === index ? "border-brand-red" : "border-black"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shot.src} alt="" className="h-full w-full object-contain" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
