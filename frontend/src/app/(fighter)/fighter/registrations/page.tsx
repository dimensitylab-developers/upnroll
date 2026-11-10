import type { Metadata } from "next";
import Link from "next/link";
import { actorFromSession, getSession } from "@/server/auth/session";
import { listMyRegistrations } from "@/server/services/registrationService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Registrations" };

export default async function MyRegistrationsPage() {
  const session = await getSession();
  const registrations = session ? await listMyRegistrations(actorFromSession(session)) : [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display text-2xl font-semibold">Your registrations</h1>
        <Button asChild size="sm"><Link href="/fighter/registrations/new">New registration</Link></Button>
      </div>

      {registrations.length === 0 && (
        <p className="text-sm text-muted-foreground">You have no registrations yet.</p>
      )}

      <div className="space-y-3">
        {registrations.map((r) => (
          <Link key={String(r._id)} href={`/fighter/registrations/${r._id}/payment`} className="block manga-panel p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{r.event?.name ?? "Unknown event"} — {r.division?.name ?? "Unknown division"}</p>
                <p className="text-xs text-muted-foreground">Registered {new Date(r.createdAt as Date).toLocaleDateString()}</p>
              </div>
              <Badge variant="outline">{r.status.replaceAll("_", " ")}</Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
