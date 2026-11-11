import "server-only";
import { connectDB } from "@/server/db/connect";
import { Event } from "@/server/models/Event";
import { Bracket } from "@/server/models/Bracket";
import { Match } from "@/server/models/Match";
import { Registration } from "@/server/models/Registration";
import { FighterProfile } from "@/server/models/FighterProfile";
import { Division } from "@/server/models/Division";
import { PUBLIC_EVENT_STATUSES } from "./eventService";
import { NotFoundError } from "@/server/http/errors";

export type MatAnnouncement = {
  mat: string;
  status: "LIVE" | "UPCOMING" | "NONE";
  matchId: string | null;
  competitorAName: string | null;
  competitorBName: string | null;
  divisionName: string | null;
  scheduledAt: string | null;
  timezone: string;
  href: string;
};

export type EventAnnouncementBoard = {
  eventId: string;
  eventSlug: string;
  eventName: string;
  timezone: string;
  mats: MatAnnouncement[];
};

/**
 * Deterministic next/live match per mat for published brackets only.
 * Does not invent a single global "next" when multiple mats are active.
 */
export async function getEventAnnouncementBoard(eventSlug: string): Promise<EventAnnouncementBoard> {
  await connectDB();
  const event = await Event.findOne({ slug: eventSlug, status: { $in: PUBLIC_EVENT_STATUSES } }).lean();
  if (!event) throw new NotFoundError("Event not found.");

  const publishedIds = (await Bracket.find({ eventId: event._id, status: "PUBLISHED" }).select("_id").lean()).map(
    (b) => b._id
  );
  const matches = await Match.find({
    bracketId: { $in: publishedIds },
    status: { $in: ["LIVE", "SCHEDULED", "DELAYED", "PENDING"] },
  })
    .sort({ scheduledAt: 1, round: 1, order: 1 })
    .lean();

  const registrationIds = [
    ...new Set(
      matches.flatMap((m) => [m.competitorARegistrationId, m.competitorBRegistrationId].filter(Boolean).map(String))
    ),
  ];
  const divisionIds = [...new Set(matches.map((m) => String(m.divisionId)))];
  const [regs, divisions] = await Promise.all([
    Registration.find({ _id: { $in: registrationIds } }).lean(),
    Division.find({ _id: { $in: divisionIds } }).select("name").lean(),
  ]);
  const profiles = await FighterProfile.find({ userId: { $in: regs.map((r) => r.userId) } })
    .select("displayName userId")
    .lean();
  const nameByUser = new Map(profiles.map((p) => [String(p.userId), p.displayName]));
  const nameByReg = new Map(
    regs.map((r) => [String(r._id), nameByUser.get(String(r.userId)) ?? "TBA"])
  );
  const divisionById = new Map(divisions.map((d) => [String(d._id), d.name]));

  const matCount = event.matCount ?? 1;
  const timezone = event.timezone ?? "Asia/Kolkata";
  const mats: MatAnnouncement[] = [];

  for (let i = 1; i <= matCount; i++) {
    const matKey = String(i);
    const onMat = matches.filter((m) => (m.mat || "") === matKey || (m.mat || "") === `Mat ${matKey}`);
    const live = onMat.find((m) => m.status === "LIVE");
    const upcoming = onMat.find((m) => m.status === "SCHEDULED" || m.status === "DELAYED" || m.status === "PENDING");
    const chosen = live ?? upcoming ?? null;

    mats.push({
      mat: matKey,
      status: live ? "LIVE" : chosen ? "UPCOMING" : "NONE",
      matchId: chosen ? String(chosen._id) : null,
      competitorAName: chosen?.competitorARegistrationId
        ? nameByReg.get(String(chosen.competitorARegistrationId)) ?? "TBA"
        : chosen
          ? "TBA"
          : null,
      competitorBName: chosen?.competitorBRegistrationId
        ? nameByReg.get(String(chosen.competitorBRegistrationId)) ?? "TBA"
        : chosen
          ? "TBA"
          : null,
      divisionName: chosen ? divisionById.get(String(chosen.divisionId)) ?? null : null,
      scheduledAt: chosen?.scheduledAt ? new Date(chosen.scheduledAt).toISOString() : null,
      timezone,
      href: `/events/${event.slug}/schedule`,
    });
  }

  return {
    eventId: String(event._id),
    eventSlug: event.slug,
    eventName: event.name,
    timezone,
    mats,
  };
}
