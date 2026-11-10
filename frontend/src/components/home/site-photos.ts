/**
 * Optimized WebP/display paths live under /Fighting/opt and /happy/opt.
 * Source masters remain in /Fighting and /happy (offline conversion only).
 */
function fightingStill(file: string) {
  const base = file.replace(/\.JPG$/i, "");
  return {
    src: `/Fighting/opt/${base}.webp`,
    alt: "Grappling on the mat" as const,
  };
}

function happyStill(file: string) {
  const base = file.replace(/\.JPG$/i, "");
  return {
    src: `/happy/opt/${base}.webp`,
    alt: "A happy moment after the match" as const,
  };
}

export const FIGHTING_PHOTOS = [
  "003A7748.JPG",
  "003A7835.JPG",
  "003A7962.JPG",
  "003A8013.JPG",
  "003A8057.JPG",
  "003A8191.JPG",
  "003A8193.JPG",
  "003A8259.JPG",
  "003A8278.JPG",
].map(fightingStill);

export const FIGHTING_VIDEOS = [
  {
    src: "/Fighting/003A8164.MP4",
    poster: "/Fighting/opt/003A8191.webp",
    alt: "Fight tape from the mat",
  },
  {
    src: "/Fighting/003A8185.MP4",
    poster: "/Fighting/opt/003A8193.webp",
    alt: "Fight tape from the mat",
  },
];

export type FightingMedia =
  | { type: "photo"; src: string; alt: string }
  | { type: "video"; src: string; poster: string; alt: string };

export const FIGHTING_MEDIA: FightingMedia[] = [
  ...FIGHTING_VIDEOS.map((video) => ({ type: "video" as const, ...video })),
  ...FIGHTING_PHOTOS.map((photo) => ({ type: "photo" as const, ...photo })),
];

export const HAPPY_PHOTOS = [
  "003A7763.JPG",
  "003A7764.JPG",
  "003A7879.JPG",
  "003A8114.JPG",
  "003A8181.JPG",
  "003A8291.JPG",
  "003A8295.JPG",
  "003A8300.JPG",
  "003A8317.JPG",
  "003A8328.JPG",
  "003A8339.JPG",
  "003A8344.JPG",
  "003A8347.JPG",
].map(happyStill);

/** Compressed hero loop + poster generated offline (see scripts/optimize-home-media.mjs). */
export const HERO_VIDEO = {
  src: "/Videos/hero-loop.mp4",
  poster: "/Videos/hero-poster.webp",
  /** Masters retained for re-encoding */
  master: "/Videos/IMG_7263.MP4_2.mp4",
} as const;
