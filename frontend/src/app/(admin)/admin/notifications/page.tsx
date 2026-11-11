import { requireActor } from "@/server/auth/session";
import { listFailedOutboxJobs } from "@/server/services/outboxService";
import { AdminOutboxPanel } from "@/features/notifications/admin-outbox-panel";
import { PageHeader } from "@/components/page-header";

export const instant = false;

export default async function AdminNotificationsPage() {
  const actor = await requireActor("ADMIN");
  const jobs = await listFailedOutboxJobs(actor, 50);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Failed deliveries" />
      <p className="text-sm text-muted-foreground">
        Outbox jobs that exhausted retries. Retry after fixing the underlying issue (SMTP, data, etc.).
      </p>
      <AdminOutboxPanel
        jobs={jobs.map((j) => ({
          _id: String(j._id),
          type: j.type,
          status: j.status,
          lastError: j.lastError,
          attempts: j.attempts,
          runAt: j.runAt as Date,
          updatedAt: j.updatedAt as Date | undefined,
        }))}
      />
    </div>
  );
}
