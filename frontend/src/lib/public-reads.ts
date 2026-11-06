import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getEventBySlug, listDivisionsForEvent, listPublicEvents } from "@/server/services/eventService";
import { getPublishedBracketForDivision } from "@/server/services/bracketService";
import { listPublicResults, listPublicSchedule } from "@/server/services/matchService";
import { listPublicRankings } from "@/server/services/rankingService";
import { getPublicFighterBySlug, listPublicFighters } from "@/server/services/fighterService";
import { listPublished } from "@/server/services/contentService";
import { listPublishedMedia } from "@/server/services/mediaService";
import type { ContentType } from "@/server/models/ContentEntry";

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function cachedPublicEvents() {
  "use cache";
  cacheTag("events");
  cacheLife("minutes");
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
    }))
  );
}

export async function cachedPublicEvent(slug: string) {
  "use cache";
  cacheTag("events", `event:${slug}`);
  cacheLife("minutes");
  const event = await getEventBySlug(slug);
  return plain({
    _id: String(event._id),
    name: event.name,
    slug: event.slug,
    venue: event.venue ?? "",
    startDate: event.startDate,
    status: event.status,
    description: event.description ?? "",
  });
}

export async function cachedPublicDivisions(eventId: string) {
  "use cache";
  cacheTag("events", `divisions:${eventId}`);
  cacheLife("minutes");
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

export async function cachedPublicSchedule(slug: string) {
  "use cache";
  cacheTag("schedule", `schedule:${slug}`);
  cacheLife("minutes");
  return plain(await listPublicSchedule(slug));
}

export async function cachedPublicResults(slug: string) {
  "use cache";
  cacheTag("schedule", `schedule:${slug}`);
  cacheLife("minutes");
  return plain(await listPublicResults(slug));
}

export async function cachedPublicRankings() {
  "use cache";
  cacheTag("rankings");
  cacheLife("minutes");
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
  return plain(await listPublicFighters());
}

export async function cachedPublicFighter(slug: string) {
  "use cache";
  cacheTag("fighters", `fighter:${slug}`);
  cacheLife("minutes");
  return plain(await getPublicFighterBySlug(slug));
}

export async function cachedPublishedContent(type: ContentType) {
  "use cache";
  cacheTag(`content:${type}`);
  cacheLife("minutes");
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
  const items = await listPublishedMedia();
  return plain(
    items.map((item) => ({
      _id: String(item._id),
      caption: item.caption,
      externalUrl: item.externalUrl,
    }))
  );
}
