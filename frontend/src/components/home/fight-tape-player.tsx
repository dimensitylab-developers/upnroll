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

  return (
    <article className="overflow-hidden border-2 border-black bg-white shadow-[5px_5px_0_0_#000]">
      <div className="relative aspect-[16/9] overflow-hidden bg-neutral-900">
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
      </div>
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider">{label}</p>
    </article>
  );
}
