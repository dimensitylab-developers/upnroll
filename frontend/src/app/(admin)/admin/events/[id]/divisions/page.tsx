import { notFound } from "next/navigation";
import { getEventForAdmin, listDivisionsForEvent } from "@/server/services/eventService";
import { CreateDivisionForm } from "@/features/events/create-division-form";

export default async function AdminDivisionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event;
  try {
    event = await getEventForAdmin(id);
  } catch {
    notFound();
  }
  const divisions = await listDivisionsForEvent(id);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="manga-panel p-8">
        <h1 className="text-display text-2xl font-semibold mb-1">Divisions — {event.name}</h1>
        <p className="text-sm text-muted-foreground mb-6">Discipline/weight-class taxonomy pending client approval (OD-001/OD-002) — enter freely for now.</p>
        <CreateDivisionForm eventId={id} />
      </div>

      <div className="space-y-2">
        {divisions.map((d) => (
          <div key={String(d._id)} className="manga-panel p-3 text-sm flex flex-col sm:flex-row sm:justify-between gap-1">
            <span>{d.name} — {d.discipline}</span>
            <span className="text-muted-foreground">Capacity {d.capacity}</span>
          </div>
        ))}
        {divisions.length === 0 && <p className="text-sm text-muted-foreground">No divisions yet.</p>}
      </div>
    </div>
  );
}
