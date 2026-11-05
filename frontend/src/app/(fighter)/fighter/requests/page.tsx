import { getSession } from "@/server/auth/session";
import { listMyRegistrations } from "@/server/services/registrationService";
import { listDivisionsForEvent } from "@/server/services/eventService";
import { listRequestsForFighter } from "@/server/services/requestService";
import { isActiveRegistration } from "@/server/services/registrationStateMachine";
import { CreateRequestDialog } from "@/features/requests/create-request-dialog";
import { Badge } from "@/components/ui/badge";

export default async function FighterRequestsPage() {
  const session = await getSession();
  if (!session) return null;

  const [registrations, requests] = await Promise.all([
    listMyRegistrations(String(session.user._id)),
    listRequestsForFighter(String(session.user._id)),
  ]);
  const active = registrations.filter((r) => isActiveRegistration(r.status));

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-display text-2xl font-semibold mb-4">Request a cancellation or transfer</h1>
        <div className="space-y-2">
          {await Promise.all(
            active.map(async (r) => {
              const divisions = r.event ? await listDivisionsForEvent(String(r.event._id)) : [];
              const otherDivisions = divisions.filter((d) => String(d._id) !== String(r.divisionId)).map((d) => ({ id: String(d._id), name: d.name }));
              return (
                <div key={String(r._id)} className="manga-panel p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.event?.name} — {r.division?.name}</p>
                    <Badge variant="outline">{r.status.replaceAll("_", " ")}</Badge>
                  </div>
                  <CreateRequestDialog registrationId={String(r._id)} otherDivisions={otherDivisions} />
                </div>
              );
            })
          )}
          {active.length === 0 && <p className="text-sm text-muted-foreground">No active registrations to request changes for.</p>}
        </div>
      </div>

      <div>
        <h2 className="text-display text-xl font-semibold mb-4">Your requests</h2>
        <div className="space-y-2">
          {requests.map((r) => (
            <div key={String(r._id)} className="manga-panel p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.type}</p>
                <Badge variant={r.status === "APPROVED" ? "default" : r.status === "REJECTED" ? "destructive" : "secondary"}>{r.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{r.reason}</p>
              {r.reviewNote && <p className="text-sm text-muted-foreground mt-1">Admin note: {r.reviewNote}</p>}
            </div>
          ))}
          {requests.length === 0 && <p className="text-sm text-muted-foreground">No requests submitted yet.</p>}
        </div>
      </div>
    </div>
  );
}
