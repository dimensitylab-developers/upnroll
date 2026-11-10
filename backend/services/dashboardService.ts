import "server-only";
import type { Actor } from "@/server/auth/actor";
import { assertAdmin, assertFighter } from "@/server/auth/actor";
import { listUpcomingEventsForAdmin } from "./eventService";
import { listPaymentQueue } from "./paymentService";
import { listRequestsForAdmin, listRequestsForFighter } from "./requestService";
import { listRecentRegistrationsForAdmin, listMyRegistrations } from "./registrationService";
import { countFighters, getFighterProfile } from "./fighterService";
import {
  getAdminPresenceStats,
  listRecentAccountsForAdmin,
  listRecentAuditLogs,
  listRecentAuditLogsByActions,
} from "@/server/audit/log";
import { listMatchesForFighter } from "./matchService";
import { warmUpMinutes } from "./tournamentRules";

const ENTRY_ACTIONS = ["USER_LOGIN"] as const;
const PROFILE_ACTIONS = ["FIGHTER_PROFILE_CREATED", "FIGHTER_PROFILE_UPDATED"] as const;

/** Composes existing services into the data the admin overview page needs. */
export async function getAdminDashboardData(actor: Actor) {
  assertAdmin(actor);
  const [
    fighterCount,
    upcomingEvents,
    pendingPayments,
    allRequests,
    recentRegistrations,
    recentActivity,
    recentEntries,
    recentProfiles,
    recentAccounts,
    presence,
  ] = await Promise.all([
    countFighters(actor),
    listUpcomingEventsForAdmin(actor, 5),
    listPaymentQueue(actor, "PENDING_REVIEW"),
    listRequestsForAdmin(actor),
    listRecentRegistrationsForAdmin(actor, 8),
    listRecentAuditLogs(actor, 10),
    listRecentAuditLogsByActions(actor, [...ENTRY_ACTIONS], 8),
    listRecentAuditLogsByActions(actor, [...PROFILE_ACTIONS], 8),
    listRecentAccountsForAdmin(actor, 8),
    getAdminPresenceStats(actor),
  ]);

  return {
    fighterCount,
    upcomingEvents,
    pendingPayments,
    pendingRequests: allRequests.filter((r) => r.status === "PENDING"),
    recentRegistrations,
    recentActivity,
    recentEntries,
    recentProfiles,
    recentAccounts,
    presence,
  };
}

function profileChecklist(profile: Awaited<ReturnType<typeof getFighterProfile>>) {
  const checks = [
    { id: "name", label: "Full name", done: Boolean(profile?.displayName?.trim()) },
    { id: "photo", label: "Passport photo", done: Boolean(profile?.photoKey) },
    { id: "personal", label: "Personal details", done: Boolean(profile?.dateOfBirth && profile?.mobile && profile?.cityState) },
    { id: "competition", label: "Competition details", done: Boolean(profile?.academy && profile?.beltRank && profile?.weightDivision) },
    { id: "medical", label: "Medical answers", done: Boolean(profile?.dateOfBirth && profile?.medicallyFit !== undefined) },
    { id: "waiver", label: "Terms agreed", done: Boolean(profile?.waiverAcceptedAt) },
  ] as const;
  const done = checks.filter((c) => c.done).length;
  return { checks, done, total: checks.length, percent: Math.round((done / checks.length) * 100) };
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
  const wins = recentResults.filter((m) => m.outcome === "WIN").length;
  const losses = recentResults.filter((m) => m.outcome === "LOSS").length;
  const now = new Date();
  const alerts = upcomingMatches.flatMap((match) => {
    if (!match.scheduledAt) return [];
    const minutes = warmUpMinutes(new Date(match.scheduledAt as Date), now);
    if (minutes === null) return [];
    const mat = match.mat ? `mat ${match.mat}` : "your mat";
    return [`Warm up. You are on ${mat} in about ${minutes} minutes.`];
  });

  return {
    profile,
    profileHealth: profileChecklist(profile),
    registrations,
    upcomingMatches,
    recentResults,
    pendingRequests,
    alerts,
    record: { wins, losses },
  };
}
