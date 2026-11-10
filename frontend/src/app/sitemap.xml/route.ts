import { cachedPublicEvents, cachedPublicFighters } from "@/lib/public-reads";
import { absoluteUrl } from "@/lib/site-url";

const STATIC_PATHS = [
  "/",
  "/events",
  "/fighters",
  "/rankings",
  "/brackets",
  "/faq",
  "/about",
  "/announcements",
  "/policies",
  "/seminars",
  "/store",
];

export async function GET() {
  const paths = new Set(STATIC_PATHS);
  try {
    const [events, fighters] = await Promise.all([cachedPublicEvents(), cachedPublicFighters()]);
    for (const event of events) {
      paths.add(`/events/${event.slug}`);
      paths.add(`/events/${event.slug}/brackets`);
      paths.add(`/events/${event.slug}/schedule`);
      paths.add(`/events/${event.slug}/results`);
    }
    for (const fighter of fighters) paths.add(`/fighters/${fighter.slug}`);
  } catch {
    // The static paths above still describe the public site when the database is unreachable.
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...paths].map((path) => {
      const loc = absoluteUrl(path).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
      return `  <url><loc>${loc}</loc></url>`;
    }),
    "</urlset>",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
