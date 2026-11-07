export const GRAPPLING_EMOJI_NAMES = [
  "clinch-collar-tie",
  "double-leg-takedown",
  "hip-throw",
  "armbar",
  "rear-naked-choke",
  "triangle-choke",
  "mount",
  "knee-slice",
] as const;

export type GrapplingEmojiName = (typeof GRAPPLING_EMOJI_NAMES)[number];

interface GrapplingEmojiProps {
  name: GrapplingEmojiName;
  size?: number;
  className?: string;
  alt?: string;
}

export function GrapplingEmoji({
  name,
  size = 28,
  className = "",
  alt,
}: GrapplingEmojiProps) {
  const formattedAlt = alt ?? name.replace(/-/g, " ");

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/emojis/${name}.png`}
      alt={formattedAlt}
      width={size}
      height={size}
      className={`inline-block shrink-0 align-middle object-contain ${className}`}
      loading="lazy"
      draggable={false}
    />
  );
}
