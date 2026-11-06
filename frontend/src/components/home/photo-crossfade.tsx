"use client";

import { useEffect, useState } from "react";

export function PhotoCrossfade({ photos }: { photos: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % photos.length), 4000);
    return () => clearInterval(timer);
  }, [photos.length]);

  return (
    <div className="relative border-2 border-black bg-black shadow-[6px_6px_0_0_#000]">
      {photos.map((photo, photoIndex) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          className={`h-auto w-full object-contain transition-opacity duration-700 ${
            photoIndex === index ? "relative opacity-100" : "absolute inset-0 opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
