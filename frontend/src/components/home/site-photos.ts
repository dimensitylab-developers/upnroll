/**
 * Optimized WebP/display paths live under /Fighting/opt and /happy/opt.
 * Source masters remain in /Fighting and /happy (offline conversion only).
 */
function fightingStill(file: string, orientation: "landscape" | "portrait" = "landscape") {
  const base = file.replace(/\.JPG$/i, "");
  return {
    src: `/Fighting/opt/${base}.webp`,
    alt: "Grappling on the mat" as const,
    orientation,
  };
}

function happyStill(file: string) {
  const base = file.replace(/\.JPG$/i, "");
  return {
    src: `/happy/opt/${base}.webp`,
    alt: "A happy moment after the match" as const,
  };
}

/** Selected mat stills for the home slideshow. */
export const FIGHTING_PHOTOS = [
  fightingStill("003A7748.JPG"),
  fightingStill("003A7835.JPG"),
  fightingStill("003A7962.JPG"),
  fightingStill("003A8013.JPG"),
  fightingStill("003A8057.JPG"),
  fightingStill("003A8191.JPG"),
  fightingStill("003A8193.JPG"),
  fightingStill("003A8259.JPG", "portrait"),
  fightingStill("003A8278.JPG", "portrait"),
];

/**
 * Home fight tapes — native ratios only (no forced crop).
 * 8164 + 8185 are landscape masters; mat-portrait is vertical.
 */
export const FIGHTING_VIDEOS = [
  {
    src: "/Fighting/003A8164.MP4",
    poster: "/Fighting/opt/tape-8164-poster.jpg",
    alt: "Fight tape from the mat",
    orientation: "landscape" as const,
  },
  {
    src: "/Fighting/003A8185.MP4",
    poster: "/Fighting/opt/tape-8185-poster.jpg",
    alt: "Fight tape from the mat",
    orientation: "landscape" as const,
  },
  {
    src: "/Videos/mat-portrait.mp4",
    poster: "/Videos/mat-portrait-poster.jpg",
    alt: "Fight tape from the mat",
    orientation: "portrait" as const,
  },
];

export type FightingVideo = (typeof FIGHTING_VIDEOS)[number];

export type FightingMedia =
  | {
      type: "photo";
      src: string;
      alt: string;
      orientation?: "portrait" | "landscape";
    }
  | {
      type: "video";
      src: string;
      poster: string;
      alt: string;
      orientation?: "portrait" | "landscape";
    };

/** Slideshow stills first, then the three fight tapes. */
export const FIGHTING_MEDIA: FightingMedia[] = [
  ...FIGHTING_PHOTOS.map((photo) => ({ type: "photo" as const, ...photo })),
  ...FIGHTING_VIDEOS.map((video) => ({ type: "video" as const, ...video })),
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
