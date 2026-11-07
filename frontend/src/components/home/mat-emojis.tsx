import { GrapplingEmoji, type GrapplingEmojiName } from "@/components/ui/grappling-emoji";

type StickerSpot = {
  name: GrapplingEmojiName;
  className: string;
  size: number;
};

const SCATTER: StickerSpot[] = [
  { name: "double-leg-takedown", className: "left-[3%] top-[10%] -rotate-12 opacity-80", size: 52 },
  { name: "armbar", className: "right-[5%] top-[14%] rotate-[14deg] opacity-75", size: 46 },
  { name: "hip-throw", className: "bottom-[14%] left-[8%] rotate-6 opacity-70", size: 48 },
  { name: "triangle-choke", className: "bottom-[18%] right-[10%] -rotate-8 opacity-70", size: 44 },
  { name: "mount", className: "left-[42%] top-[6%] rotate-3 opacity-55", size: 36 },
  { name: "rear-naked-choke", className: "right-[30%] bottom-[8%] rotate-12 opacity-60", size: 40 },
  { name: "clinch-collar-tie", className: "left-[22%] bottom-[28%] -rotate-6 opacity-50", size: 34 },
  { name: "knee-slice", className: "right-[18%] top-[36%] rotate-[-10deg] opacity-55", size: 38 },
];

const HEADER_STICKERS: StickerSpot[] = [
  { name: "clinch-collar-tie", className: "left-[18%] top-1/2 -translate-y-1/2 -rotate-8 opacity-70 hidden lg:block", size: 28 },
  { name: "double-leg-takedown", className: "left-[36%] top-1/2 -translate-y-1/2 rotate-6 opacity-65 hidden md:block", size: 26 },
  { name: "hip-throw", className: "left-[52%] top-1/2 -translate-y-1/2 -rotate-4 opacity-60 hidden xl:block", size: 28 },
  { name: "armbar", className: "right-[34%] top-1/2 -translate-y-1/2 rotate-10 opacity-65 hidden lg:block", size: 26 },
  { name: "triangle-choke", className: "right-[22%] top-1/2 -translate-y-1/2 -rotate-12 opacity-60 hidden md:block", size: 24 },
];

export function MatEmojis({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      {SCATTER.map((spot) => (
        <span key={`${spot.name}-${spot.className}`} className={`absolute ${spot.className}`}>
          <GrapplingEmoji name={spot.name} size={spot.size} className="drop-shadow-[2px_2px_0_rgba(0,0,0,0.15)]" />
        </span>
      ))}
    </div>
  );
}

/** Small transparent stickers tucked into empty header space between lockup and actions. */
export function HeaderStickers({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {HEADER_STICKERS.map((spot) => (
        <span key={`${spot.name}-${spot.className}`} className={`absolute ${spot.className}`}>
          <GrapplingEmoji name={spot.name} size={spot.size} />
        </span>
      ))}
    </div>
  );
}

export function EmojiStrip({
  emojis = ["double-leg-takedown", "armbar", "hip-throw", "triangle-choke", "mount", "rear-naked-choke"] as GrapplingEmojiName[],
  size = 34,
  className = "",
}: {
  emojis?: GrapplingEmojiName[];
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-5 ${className}`} aria-hidden="true">
      {emojis.map((name, index) => (
        <span key={`${name}-${index}`} className={index % 2 === 0 ? "-rotate-6" : "rotate-6"}>
          <GrapplingEmoji name={name} size={size} />
        </span>
      ))}
    </div>
  );
}

/** @deprecated Prefer EmojiStrip / MatEmojis / HeaderStickers — kept for any stray imports. */
export function GrapplingEmojiStrip(props: {
  emojis?: GrapplingEmojiName[];
  size?: number;
  className?: string;
}) {
  return <EmojiStrip {...props} />;
}
