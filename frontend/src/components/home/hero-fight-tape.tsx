"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_VIDEO } from "./site-photos";
import { VideoSoundToggle } from "./video-sound-toggle";

export function HeroFightTape() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [attachSource, setAttachSource] = useState(false);
  const [preferMotion, setPreferMotion] = useState(true);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPreferMotion(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Poster paints first; defer attaching the autoplay source so LCP can settle on the poster.
  useEffect(() => {
    if (!preferMotion) return;
    let cancelled = false;
    const start = () => {
      if (!cancelled) setAttachSource(true);
    };
    const outer = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(start);
    });
    const fallback = window.setTimeout(start, 400);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(outer);
      window.clearTimeout(fallback);
    };
  }, [preferMotion]);

  useEffect(() => {
    if (!attachSource) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    const play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        /* Autoplay may be blocked; poster remains visible. */
      });
    }
  }, [attachSource, muted]);

  return (
    <div className="relative z-20 w-full">
      <div className="relative border-2 border-black bg-white p-1 shadow-[8px_8px_0_0_#c8102e] sm:p-1.5 sm:shadow-[12px_12px_0_0_#c8102e]">
        <div className="relative aspect-[9/16] overflow-hidden border-2 border-black bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_VIDEO.poster}
            alt=""
            width={540}
            height={960}
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-contain object-center"
          />

          {attachSource && (
            <video
              ref={videoRef}
              autoPlay
              muted={muted}
              loop
              playsInline
              preload="metadata"
              width={540}
              height={960}
              poster={HERO_VIDEO.poster}
              className="absolute inset-0 h-full w-full object-contain object-center"
              src={HERO_VIDEO.src}
            >
              Up &apos;n Roll fight footage
            </video>
          )}

          {attachSource && (
            <div className="absolute bottom-2 left-2 right-2 z-10 flex justify-start sm:bottom-3 sm:left-3">
              <VideoSoundToggle videoRef={videoRef} muted={muted} onMutedChange={setMuted} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
