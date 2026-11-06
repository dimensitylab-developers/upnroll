import { requireActor } from "@/server/auth/session";
import { listFightersForAdmin } from "@/server/services/fighterService";
import { FighterRecord } from "@/features/admin/fighter-record";


export default async function AdminFightersPage() {
  const fighters = await listFightersForAdmin(await requireActor("ADMIN"));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
      <div>
        <h1 className="text-display text-2xl font-semibold">Fighters</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every field from the registration form lands here, including the passport photograph, Aadhaar, and medical answers.
        </p>
      </div>
      <div className="space-y-4">
        {fighters.map((fighter) => (
          <article key={fighter.userId} className="manga-panel p-4 sm:p-5">
            <FighterRecord fighter={fighter} />
          </article>
        ))}
        {fighters.length === 0 && <p className="text-sm text-muted-foreground">No fighters have registered yet.</p>}
      </div>
    </div>
  );
}
