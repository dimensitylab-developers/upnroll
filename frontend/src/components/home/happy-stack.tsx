"use client";

import { useState } from "react";

const TILTS = [-8, 5, -3, 7, -6, 4, -5, 6, -4, 8, -7, 3, -2];

export function HappyStack({ photos }: { photos: { src: string; alt: string }[] }) {
  const [front, setFront] = useState(0);
  const count = photos.length;
  if (count === 0) return null;

  function bringForward(index: number) {
    setFront(index);
  }

  function next() {
    setFront((current) => (current + 1) % count);
  }

  return (
    <div>
      <div className="relative mx-auto h-[22rem] max-w-xl sm:h-[26rem]">
        {photos.map((photo, index) => {
          const order = (index - front + count) % count;
          const visible = order < 5;
          if (!visible) return null;
          const tilt = TILTS[index % TILTS.length];
          const offsetX = order * 18;
          const offsetY = order * 14;
          const scale = 1 - order * 0.04;
          const isFront = order === 0;

          return (
            <button
              key={photo.src}
              type="button"
              onClick={() => (isFront ? next() : bringForward(index))}
              aria-label={isFront ? `Next happy moment, currently ${index + 1} of ${count}` : `Bring photo ${index + 1} forward`}
              className="absolute left-1/2 top-6 w-[78%] max-w-md origin-center border-2 border-black bg-white shadow-[6px_6px_0_0_#000] transition-all duration-500 ease-out"
              style={{
                zIndex: 40 - order,
                transform: `translate(calc(-50% + ${offsetX}px), ${offsetY}px) rotate(${isFront ? tilt * 0.35 : tilt}deg) scale(${scale})`,
              }}
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt={photo.alt} className="max-h-full max-w-full object-contain" />
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm font-semibold tabular-nums">
        {front + 1} / {count}
      </p>
      <p className="mt-1 text-center text-xs text-muted-foreground">Tap the front photo to peel the next layer. Tap a back layer to bring it up.</p>
    </div>
  );
}
