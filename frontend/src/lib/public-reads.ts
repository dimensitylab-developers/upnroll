import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getEventBySlug, listDivisionsForEvent, listPublicEvents } from "@/server/services/eventService";
import { getPublishedBracketForDivision } from "@/server/services/bracketService";
import { listPublicResults, listPublicSchedule } from "@/server/services/matchService";
import { listPublicRankings } from "@/server/services/rankingService";
import { getPublicFighterBySlug, listPublicFighters } from "@/server/services/fighterService";
import { listPublished } from "@/server/services/contentService";
import { listPublishedMedia, listPublishedMediaForEvent } from "@/server/services/mediaService";
import { getPublicSiteContact } from "@/server/services/siteSettingsService";
import type { ContentType } from "@/server/models/ContentEntry";
import { NotFoundError } from "@/server/http/errors";

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function cachedPublicEvents() {
  "use cache";
  cacheTag("events");
  cacheLife("minutes");
  // CI prerenders with a dummy URI and no database. A live failure still fails the build.
  if (process.env.CI === "true") return [];
  const events = await listPublicEvents();
  return plain(
    events.map((event) => ({
      _id: String(event._id),
      name: event.name,
      slug: event.slug,
      venue: event.venue ?? "",
      startDate: event.startDate,
      status: event.status,
      description: event.description ?? "",
      registrationClosesAt: event.registrationClosesAt,
      matCount: event.matCount ?? 1,
    }))
  );
}

export async function cachedPublicEvent(slug: string) {
  "use cache";
  cacheTag("events", `event:${slug}`);
  cacheLife("minutes");
  if (process.env.CI === "true") throw new NotFoundError("Event not found.");
  const event = await getEventBySlug(slug);
  return plain({
    _id: String(event._id),
    name: event.name,
    slug: event.slug,
    venue: event.venue ?? "",
    startDate: event.startDate,
    status: event.status,
    description: event.description ?? "",
    registrationClosesAt: event.registrationClosesAt,
    matCount: event.matCount ?? 1,
  });
}

export async function cachedPublishedMediaForEvent(eventId: string) {
  "use cache";
  cacheTag("media", `media:${eventId}`);
  cacheLife("minutes");
  if (process.env.CI === "true") return [];
  const items = await listPublishedMediaForEvent(eventId);
  return plain(
    items.map((item) => ({
      _id: String(item._id),
      caption: item.caption,
      externalUrl: item.externalUrl,
    }))
  );
}

export async function cachedPublicDivisions(eventId: string) {
  "use cache";
  cacheTag("events", `divisions:${eventId}`);
  cacheLife("minutes");
  if (process.env.CI === "true") return [];
  const divisions = await listDivisionsForEvent(eventId);
  return divisions.map((division) => ({
    _id: String(division._id),
    name: division.name,
    discipline: division.discipline,
    capacity: division.capacity,
  }));
}

export async function cachedPublishedBracket(divisionId: string) {
  "use cache";
  cacheTag(`brackets:${divisionId}`);
  cacheLife("minutes");
  if (process.env.CI === "true") throw new NotFoundError("Bracket not found.");
  const result = await getPublishedBracketForDivision(divisionId);
  return plain({
    bracket: { _id: String(result.bracket._id), roundsCount: result.bracket.roundsCount },
    matches: result.matches.map((match) => ({
      round: match.round,
      order: match.order,
      competitorAName: match.competitorAName,
      competitorBName: match.competitorBName,
      winnerName: match.winnerName,
      status: match.status,
    })),
  });
}

/** Same payload as cachedPublishedBracket, or null when unpublished (safe for list pages). */
export async function cachedPublishedBracketOrNull(divisionId: string) {
  "use cache";
  cacheTag(`brackets:${divisionId}`);
  cacheLife("minutes");
  if (process.env.CI === "true") return null;
  try {
    const result = await getPublishedBracketForDivision(divisionId);
    return plain({
      bracket: { _id: String(result.bracket._id), roundsCount: result.bracket.roundsCount },
      matches: result.matches.map((match) => ({
        round: match.round,
        order: match.order,
        competitorAName: match.competitorAName,
        competitorBName: match.competitorBName,
        winnerName: match.winnerName,
        status: match.status,
      })),
    });
  } catch {
    return null;
  }
}

export async function cachedPublicSchedule(slug: string) {
  "use cache";
  cacheTag("schedule", `schedule:${slug}`);
  cacheLife("minutes");
  if (process.env.CI === "true") throw new NotFoundError("Schedule not found.");
  return plain(await listPublicSchedule(slug));
}

export async function cachedPublicResults(slug: string) {
  "use cache";
  cacheTag("schedule", `schedule:${slug}`);
  cacheLife("minutes");
  if (process.env.CI === "true") throw new NotFoundError("Results not found.");
  return plain(await listPublicResults(slug));
}

export async function cachedPublicRankings() {
  "use cache";
  cacheTag("rankings");
  cacheLife("minutes");
  if (process.env.CI === "true") return [];
  const rows = await listPublicRankings();
  return rows.map((row) => ({
    rank: row.rank,
    displayName: row.displayName,
    slug: row.slug,
    wins: row.wins,
    losses: row.losses,
    points: row.points,
  }));
}

export async function cachedPublicFighters() {
  "use cache";
  cacheTag("fighters");
  cacheLife("minutes");
  if (process.env.CI === "true") return [];
  return plain(await listPublicFighters());
}

export async function cachedPublicFighter(slug: string) {
  "use cache";
  cacheTag("fighters", `fighter:${slug}`);
  cacheLife("minutes");
  if (process.env.CI === "true") throw new NotFoundError("Fighter not found.");
  return plain(await getPublicFighterBySlug(slug));
}

export async function cachedPublishedContent(type: ContentType) {
  "use cache";
  cacheTag(`content:${type}`);
  cacheLife("minutes");
  if (process.env.CI === "true") return [];
  const entries = await listPublished(type);
  return plain(
    entries.map((entry) => ({
      _id: String(entry._id),
      title: entry.title,
      body: entry.body,
      createdAt: entry.createdAt,
    }))
  );
}

export async function cachedPublishedMedia() {
  "use cache";
  cacheTag("media");
  cacheLife("minutes");
  if (process.env.CI === "true") return [];
  const items = await listPublishedMedia();
  return plain(
    items.map((item) => ({
      _id: String(item._id),
      caption: item.caption,
      externalUrl: item.externalUrl,
    }))
  );
}

export async function cachedPublicSiteContact() {
  "use cache";
  cacheTag("site-settings");
  cacheLife("minutes");
  if (process.env.CI === "true") {
    return {
      instagramHandle: "up.n.roll",
      instagramUrl: "https://www.instagram.com/up.n.roll/",
      email: "",
      phoneDisplay: "",
      phoneTel: "",
      city: "Mumbai",
    };
  }
  return plain(await getPublicSiteContact());
}
