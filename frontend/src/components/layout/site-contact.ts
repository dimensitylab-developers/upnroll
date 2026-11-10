/** Fallback contact when the database is unreachable or unset. Prefer getPublicSiteContact / cachedPublicSiteContact. */
export const SITE_CONTACT = {
  instagramHandle: "up.n.roll",
  instagramUrl: "https://www.instagram.com/up.n.roll/",
  email: "",
  phoneDisplay: "",
  phoneTel: "",
  city: "Mumbai",
} as const;

export type SiteContact = {
  instagramHandle: string;
  instagramUrl: string;
  email: string;
  phoneDisplay: string;
  phoneTel: string;
  city: string;
};
