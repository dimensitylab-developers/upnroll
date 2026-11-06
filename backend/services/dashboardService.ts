import "server-only";
import type { Actor } from "@/server/auth/actor";
import { assertAdmin, assertFighter } from "@/server/auth/actor";
import { listUpcomingEventsForAdmin } from "./eventService";
import { listPaymentQueue } from "./paymentService";
import { listRequestsForAdmin, listRequestsForFighter } from "./requestService";
import { listRecentRegistrationsForAdmin, listMyRegistrations } from "./registrationService";
import { countFighters, getFighterProfile } from "./fighterService";
import { listRecentAuditLogs } from "@/server/audit/log";
import { listMatchesForFighter } from "./matchService";
import { warmUpMinutes } from "./tournamentRules";

/** Composes existing services into the data the admin overview page needs — no new queries beyond what each service already runs. */
export async function getAdminDashboardData(actor: Actor) {
  assertAdmin(actor);
  const [fighterCount, upcomingEvents, pendingPayments, allRequests, recentRegistrations, recentActivity] = await Promise.all([
    countFighters(actor),
    listUpcomingEventsForAdmin(actor, 5),
    listPaymentQueue(actor, "PENDING_REVIEW"),
    listRequestsForAdmin(actor),
    listRecentRegistrationsForAdmin(actor, 5),
    listRecentAuditLogs(actor, 8),
  ]);

  return {
    fighterCount,
    upcomingEvents,
    pendingPayments,
    pendingRequests: allRequests.filter((r) => r.status === "PENDING"),
    recentRegistrations,
    recentActivity,
  };
}

/** Composes existing services into the data the fighter dashboard needs — every call is already scoped to `userId`. */
export async function getFighterDashboardData(actor: Actor) {
  assertFighter(actor);
  const [profile, registrations, matches, requests] = await Promise.all([
    getFighterProfile(actor),
    listMyRegistrations(actor),
    listMatchesForFighter(actor),
    listRequestsForFighter(actor),
  ]);

  const ownRegistrationIds = new Set(registrations.map((r) => String(r._id)));
  const upcomingMatches = matches.filter((m) => m.status === "SCHEDULED" || m.status === "PENDING");
  const recentResults = matches
    .filter((m) => m.status === "COMPLETED" || m.status === "BYE")
    .sort((a, b) => new Date(b.updatedAt as Date).getTime() - new Date(a.updatedAt as Date).getTime())
    .slice(0, 5)
    .map((m) => ({
      ...m,
      outcome: m.winnerRegistrationId
        ? (ownRegistrationIds.has(String(m.winnerRegistrationId)) ? ("WIN" as const) : ("LOSS" as const))
        : null,
    }));
  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const now = new Date();
  const alerts = upcomingMatches.flatMap((match) => {
    if (!match.scheduledAt) return [];
    const minutes = warmUpMinutes(new Date(match.scheduledAt as Date), now);
    if (minutes === null) return [];
    const mat = match.mat ? `mat ${match.mat}` : "your mat";
    return [`Warm up. You are on ${mat} in about ${minutes} minutes.`];
  });

  return { profile, registrations, upcomingMatches, recentResults, pendingRequests, alerts };
}
