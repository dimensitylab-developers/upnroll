"use client";

import { useEffect, useRef, useState } from "react";
import { VideoSoundToggle } from "./video-sound-toggle";
import { HERO_VIDEO } from "./site-photos";

export function HeroFightTape() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [attachSource, setAttachSource] = useState(false);
  const [preferMotion, setPreferMotion] = useState(true);

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
    // Double rAF: after first paint of the poster image.
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
      <div className="hero-video-float">
        <div className="hero-video-frame relative border-2 border-black bg-white p-1 shadow-[8px_8px_0_0_#c8102e] sm:p-1.5 sm:shadow-[12px_12px_0_0_#c8102e]">
          <div className="hero-sticker hero-sticker-left absolute -left-4 top-8 z-30 -rotate-12 border-2 border-black bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] shadow-[3px_3px_0_0_#000]">
            On the mat
          </div>
          <div className="hero-sticker hero-sticker-right absolute -right-3 bottom-10 z-30 rotate-6 border-2 border-black bg-brand-red px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[3px_3px_0_0_#000]">
            Fight tape
          </div>

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
                className="hero-video-zoom absolute inset-0 h-full w-full object-contain object-center"
                src={HERO_VIDEO.src}
              >
                Up &apos;n Roll fight footage
              </video>
            )}

            {attachSource && (
              <div className="absolute bottom-2 left-2 z-20">
                <VideoSoundToggle videoRef={videoRef} muted={muted} onMutedChange={setMuted} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 h-3 w-full checker-strip border-2 border-black" aria-hidden="true" />
    </div>
  );
}
