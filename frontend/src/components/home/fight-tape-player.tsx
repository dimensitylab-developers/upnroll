"use client";

import { useRef, useState } from "react";
import { VideoSoundToggle } from "./video-sound-toggle";

export function FightTapePlayer({
  src,
  poster,
  label,
  alt,
}: {
  src: string;
  poster: string;
  label: string;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);

  function startPlayback() {
    setStarted(true);
    window.requestAnimationFrame(() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = muted;
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(() => undefined);
    });
  }

  return (
    <article className="overflow-hidden border-2 border-black bg-white shadow-[5px_5px_0_0_#000]">
      <div className="relative aspect-[16/9] overflow-hidden bg-neutral-900">
        {!started ? (
          <button
            type="button"
            onClick={startPlayback}
            className="group absolute inset-0 z-10 block w-full"
            aria-label={`Play ${label}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt={alt}
              width={640}
              height={360}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/35">
              <span className="border-2 border-black bg-brand-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] transition-transform group-hover:scale-105">
                Play
              </span>
            </span>
          </button>
        ) : (
          <>
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src={src}
              poster={poster}
              muted={muted}
              loop
              playsInline
              preload="metadata"
              controls
            >
              {alt}
            </video>
            <div className="absolute left-2 top-2 z-10">
              <VideoSoundToggle videoRef={videoRef} muted={muted} onMutedChange={setMuted} />
            </div>
          </>
        )}
      </div>
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider">{label}</p>
    </article>
  );
}
