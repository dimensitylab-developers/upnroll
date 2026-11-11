import "server-only";
import { connectDB } from "@/server/db/connect";
import { OutboxJob, type OutboxJobType } from "@/server/models/OutboxJob";
import { assertAdmin, type Actor } from "@/server/auth/actor";
import { bindSession, isDuplicateKey, sessionOpts, type DbSession } from "@/server/db/transaction";
import { NotFoundError, ConflictError } from "@/server/http/errors";

// Job processors are loaded lazily to avoid circular imports with reminderService
// (reminderService → outboxService → reminderService).

export async function enqueueOutboxJob(
  input: {
    type: OutboxJobType;
    idempotencyKey: string;
    runAt: Date;
    payload: Record<string, unknown>;
    maxAttempts?: number;
  },
  session?: DbSession
) {
  await connectDB();
  try {
    const [job] = await OutboxJob.create(
      [
        {
          type: input.type,
          status: "PENDING",
          runAt: input.runAt,
          idempotencyKey: input.idempotencyKey,
          payload: input.payload,
          maxAttempts: input.maxAttempts ?? 5,
        },
      ],
      session ? { session } : undefined
    );
    return job;
  } catch (err) {
    if (isDuplicateKey(err)) {
      const existing = await bindSession(
        OutboxJob.findOne({ idempotencyKey: input.idempotencyKey }),
        session
      );
      return existing;
    }
    throw err;
  }
}

/** Cancel/supersede pending jobs that match a key prefix (e.g. reminders for a match). */
export async function supersedeOutboxJobsByPrefix(
  keyPrefix: string,
  session?: DbSession,
  supersededBy?: string
) {
  await connectDB();
  await OutboxJob.updateMany(
    {
      idempotencyKey: { $regex: `^${keyPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` },
      status: { $in: ["PENDING", "FAILED"] },
    },
    {
      $set: {
        status: "SUPERSEDED",
        completedAt: new Date(),
        ...(supersededBy ? { supersededBy } : {}),
      },
    },
    sessionOpts(session)
  );
}

export async function claimDueOutboxJobs(limit = 20) {
  await connectDB();
  const now = new Date();
  const claimed = [];
  for (let i = 0; i < limit; i++) {
    const job = await OutboxJob.findOneAndUpdate(
      {
        status: "PENDING",
        runAt: { $lte: now },
      },
      {
        $set: { status: "PROCESSING", processingStartedAt: now },
        $inc: { attempts: 1 },
      },
      { sort: { runAt: 1 }, returnDocument: "after" }
    );
    if (!job) break;
    claimed.push(job);
  }
  return claimed;
}

/**
 * Gate frequent schedulers (GitHub Actions) so they only do work around fight day.
 * - due outbox jobs always run
 * - otherwise only when a match is scheduled in a same-day window around now
 */
export async function getOutboxRunGate(now = new Date()): Promise<{ run: boolean; reason: string }> {
  await connectDB();
  const due = await OutboxJob.exists({ status: { $in: ["PENDING", "FAILED"] }, runAt: { $lte: now } });
  if (due) return { run: true, reason: "due_jobs" };

  // Cover an event day in India without running year-round: 6h behind → 18h ahead of now.
  const windowStart = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 18 * 60 * 60 * 1000);
  const { Match } = await import("@/server/models/Match");
  const { Bracket } = await import("@/server/models/Bracket");
  const publishedIds = (
    await Bracket.find({ status: "PUBLISHED" }).select("_id").lean()
  ).map((b) => b._id);
  if (publishedIds.length === 0) return { run: false, reason: "no_event_activity" };

  const matchSoon = await Match.exists({
    bracketId: { $in: publishedIds },
    scheduledAt: { $gte: windowStart, $lte: windowEnd },
    status: { $in: ["PENDING", "SCHEDULED", "LIVE", "DELAYED"] },
  });
  if (matchSoon) return { run: true, reason: "event_day_window" };
  return { run: false, reason: "no_event_activity" };
}

export async function processOutboxJob(jobId: string) {
  await connectDB();
  const job = await OutboxJob.findById(jobId);
  if (!job) throw new NotFoundError("Outbox job not found.");
  if (job.status !== "PROCESSING") throw new ConflictError("Job is not in processing state.");

  try {
    switch (job.type) {
      case "MATCH_REMINDER": {
        const { processMatchReminderJob } = await import("./reminderService");
        await processMatchReminderJob(job);
        break;
      }
      case "MATCH_SCHEDULE_CHANGED": {
        const { processScheduleChangedNotifyJob } = await import("./notificationService");
        await processScheduleChangedNotifyJob(job);
        break;
      }
      case "MATCH_RESULT_NOTIFY": {
        const { processMatchResultNotifyJob } = await import("./notificationService");
        await processMatchResultNotifyJob(job);
        break;
      }
      case "RANKINGS_RECALC": {
        const { recalculateRankingsSystem } = await import("./rankingService");
        await recalculateRankingsSystem();
        break;
      }
      case "EMAIL_DISPATCH":
        // Handled inside notification helpers; standalone email jobs optional.
        break;
      default:
        throw new Error(`Unknown outbox job type: ${job.type}`);
    }
    job.status = "DONE";
    job.completedAt = new Date();
    job.lastError = "";
    await job.save();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    job.lastError = message.slice(0, 500);
    if (job.attempts >= job.maxAttempts) {
      job.status = "FAILED";
      job.completedAt = new Date();
    } else {
      job.status = "PENDING";
      // Bounded exponential backoff
      const delayMs = Math.min(30 * 60_000, 1000 * 2 ** Math.min(job.attempts, 8));
      job.runAt = new Date(Date.now() + delayMs);
    }
    await job.save();
    throw err;
  }
}

export async function processDueOutboxJobs(limit = 20) {
  const claimed = await claimDueOutboxJobs(limit);
  const results: Array<{ id: string; ok: boolean; error?: string }> = [];
  for (const job of claimed) {
    try {
      await processOutboxJob(String(job._id));
      results.push({ id: String(job._id), ok: true });
    } catch (err) {
      results.push({
        id: String(job._id),
        ok: false,
        error: err instanceof Error ? err.message : "error",
      });
    }
  }
  return results;
}

export async function listFailedOutboxJobs(actor: Actor, limit = 50) {
  assertAdmin(actor);
  await connectDB();
  return OutboxJob.find({ status: "FAILED" }).sort({ updatedAt: -1 }).limit(limit).lean();
}

export async function retryFailedOutboxJob(actor: Actor, jobId: string) {
  assertAdmin(actor);
  await connectDB();
  const job = await OutboxJob.findById(jobId);
  if (!job) throw new NotFoundError("Outbox job not found.");
  if (job.status !== "FAILED") throw new ConflictError("Only failed jobs can be retried.");
  job.status = "PENDING";
  job.runAt = new Date();
  job.lastError = "";
  await job.save();
  return job;
}

/** Recover jobs stuck in PROCESSING after worker crash (older than staleMs). */
export async function recoverStaleProcessingJobs(staleMs = 5 * 60_000) {
  await connectDB();
  const cutoff = new Date(Date.now() - staleMs);
  const res = await OutboxJob.updateMany(
    { status: "PROCESSING", processingStartedAt: { $lte: cutoff } },
    { $set: { status: "PENDING", runAt: new Date() } }
  );
  return res.modifiedCount ?? 0;
}
