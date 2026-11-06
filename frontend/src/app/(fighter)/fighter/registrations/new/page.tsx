import { connection } from "next/server";
import { listOpenDivisionsForRegistration } from "@/server/services/registrationService";
import { NewRegistrationForm } from "@/features/registrations/new-registration-form";

export default async function NewRegistrationPage() {
  // Open divisions depend on the current time. Read the request first so prerender does not freeze that clock.
  await connection();
  const divisions = await listOpenDivisionsForRegistration();

  return (
    <div className="manga-panel p-8 max-w-xl mx-auto">
      <h1 className="text-display text-2xl font-semibold mb-6">Register for an event</h1>
      <NewRegistrationForm
        divisions={divisions.map((d) => ({
          id: String(d._id),
          name: d.name,
          discipline: d.discipline,
          eventName: d.event?.name ?? "Unknown event",
        }))}
      />
    </div>
  );
}
