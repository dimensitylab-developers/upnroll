"use client";

import { useRef, useState } from "react";
import { VideoSoundToggle } from "./video-sound-toggle";

/** Main home fight tape — keep this source; only the frame chrome changes. */
const MAIN_VIDEO = "/Videos/IMG_7263.MP4_2.mp4";

export function HeroFightTape() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  return (
    <div className="relative z-20 mx-auto w-full max-w-[280px] sm:max-w-[300px] lg:mr-2 lg:justify-self-end">
      <div className="hero-video-float">
        <div className="hero-video-frame relative border-2 border-black bg-white p-1.5 shadow-[12px_12px_0_0_#c8102e]">
          <div className="hero-sticker hero-sticker-left absolute -left-4 top-8 z-30 -rotate-12 border-2 border-black bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] shadow-[3px_3px_0_0_#000]">
            On the mat
          </div>
          <div className="hero-sticker hero-sticker-right absolute -right-3 bottom-10 z-30 rotate-6 border-2 border-black bg-brand-red px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[3px_3px_0_0_#000]">
            Fight tape
          </div>

          <div className="relative aspect-[9/16] overflow-hidden border-2 border-black bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted={muted}
              loop
              playsInline
              preload="auto"
              width={1080}
              height={1920}
              className="hero-video-zoom absolute inset-0 h-full w-full object-contain object-center"
              src={MAIN_VIDEO}
            >
              Up &apos;n Roll fight footage
            </video>

            <div className="absolute bottom-2 left-2 z-20">
              <VideoSoundToggle videoRef={videoRef} muted={muted} onMutedChange={setMuted} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 h-3 w-full checker-strip border-2 border-black" aria-hidden="true" />
    </div>
  );
}
