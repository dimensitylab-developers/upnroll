"use client";

import { useEffect, type RefObject } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function VideoSoundToggle({
  videoRef,
  muted,
  onMutedChange,
  className = "",
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  className?: string;
}) {
  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    node.muted = muted;
    if (!muted) {
      void node.play().catch(() => {});
    }
  }, [muted, videoRef]);

  return (
    <button
      type="button"
      onClick={() => onMutedChange(!muted)}
      aria-pressed={!muted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      className={`inline-flex items-center gap-1.5 border-2 border-black bg-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#000] transition-transform hover:-translate-y-0.5 ${className}`}
    >
      {muted ? (
        <VolumeX className="h-3.5 w-3.5 shrink-0" aria-hidden="true" strokeWidth={2.5} />
      ) : (
        <Volume2 className="h-3.5 w-3.5 shrink-0 text-brand-red" aria-hidden="true" strokeWidth={2.5} />
      )}
      <span>{muted ? "Sound off" : "Sound on"}</span>
    </button>
  );
}
