import Link from "next/link";
import { listDivisionsForEvent, listPublicEvents } from "@/server/services/eventService";
import { SectionBanner } from "@/components/home/section-banner";
import { EventPoster } from "@/components/events/event-poster";
import { EventStory } from "@/components/events/event-story";
import { HELD_COVERS } from "@/components/events/held-archive";

export const dynamic = "force-dynamic";

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function statusLine(status: string) {
  if (status === "REGISTRATION_OPEN") return "Registration is open. You can put your name on this card.";
  if (status === "REGISTRATION_CLOSED") return "Registration is closed. The card is set, and you can still follow the brackets.";
  if (status === "COMPLETED") return "This card is finished. The date stays here. The results stay up.";
  return status.replaceAll("_", " ");
}

export default async function PublicEventsPage() {
  const events = await listPublicEvents();
  const cards = await Promise.all(
    events.map(async (event) => ({
      event,
      divisions: await listDivisionsForEvent(String(event._id)),
    }))
  );
  const coming = cards.filter((card) => card.event.status !== "COMPLETED");
  const finished = cards.filter((card) => card.event.status === "COMPLETED");
  const featured = coming[0] ?? null;
  const later = coming.slice(1);
  const heldCards = [
    ...HELD_COVERS.map((card) => ({ ...card, href: `/events/held/${card.slug}` })),
    ...finished.map(({ event }) => ({
      href: `/events/${event.slug}`,
      name: event.name,
      date: formatDate(event.startDate),
      line: "The full record for this card.",
    })),
  ];

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="mx-auto max-w-6xl space-y-16">
        <header className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Events</p>
          <h1 className="text-display mt-2 text-5xl font-semibold leading-[0.95]">The next card</h1>
          <p className="mt-4 text-base leading-relaxed">
            The date, the divisions, and where to follow the brackets. Further down is how a night runs, then the cards already held.
          </p>
        </header>

        <section>
          <SectionBanner>Coming up</SectionBanner>
          {featured ? (
            <div className="space-y-4">
              <EventPoster
                name={featured.event.name}
                slug={featured.event.slug}
                date={formatDate(featured.event.startDate)}
                line={featured.event.description === "Road to Super Fight." ? "Road to Super Fight" : ""}
                venue={featured.event.venue || ""}
                statusLine={statusLine(featured.event.status)}
                registerUntil={featured.event.status === "REGISTRATION_OPEN" ? formatDate(featured.event.registrationClosesAt) : null}
                matCount={featured.event.matCount ?? 1}
                canRegister={featured.event.status === "REGISTRATION_OPEN"}
                divisions={featured.divisions.map((division) => ({
                  id: String(division._id),
                  name: division.name,
                  discipline: division.discipline,
                  capacity: division.capacity,
                }))}
              />
              {later.map(({ event }) => (
                <Link key={String(event._id)} href={`/events/${event.slug}`} className="block border-2 border-black bg-white px-5 py-4 shadow-[4px_4px_0_0_#000]">
                  <p className="font-semibold">{event.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(event.startDate)}
                    {event.venue ? ` · ${event.venue}` : ""}
                    {" · "}
                    {statusLine(event.status)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="max-w-xl text-sm leading-relaxed">
              No card is open yet. When one is announced, the date, the divisions, the mats, and how to enter will show here.
            </p>
          )}
        </section>

        <section>
          <SectionBanner>How a night runs</SectionBanner>
          <EventStory />
        </section>

        <section>
          <SectionBanner>Held</SectionBanner>
          <p className="mb-6 max-w-2xl text-sm leading-relaxed">
            Every card that has been held keeps one record: photographs, video, the winner, how the rounds were run, the bracket, the rankings, and how it ended. The next card joins this list the same way.
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {heldCards.map((card) => (
              <li key={card.href} className={heldCards.length === 1 ? "md:col-span-2" : undefined}>
                <Link href={card.href} className="grid h-full border-2 border-black bg-white shadow-[8px_8px_0_0_#000] md:grid-cols-[13rem_minmax(0,1fr)]">
                  <div className="bg-black px-6 py-6 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Held</p>
                    <p className="text-display mt-3 text-2xl font-semibold">{card.date}</p>
                  </div>
                  <div className="px-6 py-6">
                    <h3 className="text-display text-3xl font-semibold">{card.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed">{card.line}</p>
                    <p className="mt-4 text-sm font-semibold text-brand-red">Open the record</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
