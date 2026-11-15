"use client";

import { useRef, useState } from "react";
import { VideoSoundToggle } from "./video-sound-toggle";

export function FightTapePlayer({
  src,
  poster,
  label,
  alt,
  portrait = false,
  /** Fill a sized parent (e.g. height-matched portrait column). */
  fill = false,
}: {
  src: string;
  poster: string;
  label: string;
  alt: string;
  portrait?: boolean;
  fill?: boolean;
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

  // `fill` stretches to match the sibling column's height, but only once that
  // height actually exists (the sm:+ side-by-side layout). On mobile (stacked,
  // no definite parent height) it must fall back to natural block sizing, or
  // the video collapses to 0px tall.
  const mediaClass = fill
    ? "block h-auto w-full sm:absolute sm:inset-0 sm:h-full sm:w-full sm:object-contain sm:object-center"
    : "block h-auto w-full";

  return (
    <article
      className={`media-glow overflow-hidden border-2 border-black bg-white shadow-[5px_5px_0_0_#000] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#c8102e] ${
        fill ? "sm:flex sm:h-full sm:min-h-0 sm:flex-col" : ""
      }`}
    >
      <div className={`relative overflow-hidden bg-neutral-950 ${fill ? "sm:min-h-0 sm:flex-1" : ""}`}>
        {!started ? (
          <button
            type="button"
            onClick={startPlayback}
            className={`group relative block w-full ${fill ? "sm:h-full" : ""}`}
            aria-label={label ? `Play ${label}` : `Play video: ${alt}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt={alt}
              width={portrait ? 576 : 1280}
              height={portrait ? 992 : 720}
              loading="lazy"
              decoding="async"
              className={mediaClass}
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
              className={mediaClass}
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
      {label ? <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider">{label}</p> : null}
    </article>
  );
}
