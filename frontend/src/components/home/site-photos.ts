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
].map((file) => ({ src: `/Fighting/${file}`, alt: "Grappling on the mat" }));

export const FIGHTING_VIDEOS = [
  {
    src: "/Fighting/003A8164.MP4",
    poster: "/Fighting/003A8191.JPG",
    alt: "Fight tape from the mat",
  },
  {
    src: "/Fighting/003A8185.MP4",
    poster: "/Fighting/003A8193.JPG",
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
].map((file) => ({ src: `/happy/${file}`, alt: "A happy moment after the match" }));
