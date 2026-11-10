import Link from "next/link";
import { connection } from "next/server";
import { listDivisionsForEvent, listPublicEvents } from "@/server/services/eventService";
import { SectionBanner } from "@/components/home/section-banner";
import { EventPoster } from "@/components/events/event-poster";
import { EventStory } from "@/components/events/event-story";
import { HELD_COVERS } from "@/components/events/held-archive";

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
  // cacheComponents: DB/mongoose touches current time; opt into request time first.
  await connection();
  const events = await listPublicEvents();
  // Featured card only: upcoming ordered as returned (startDate asc), first non-completed.
  const coming = events.filter((event) => event.status !== "COMPLETED");
  const finished = events.filter((event) => event.status === "COMPLETED");
  const featuredEvent = coming[0] ?? null;
  const later = coming.slice(1);
  // Code-inferred: 0 division queries when no featured event; otherwise exactly 1.
  const featuredDivisions = featuredEvent
    ? await listDivisionsForEvent(String(featuredEvent._id))
    : [];

  const heldCards = [
    ...HELD_COVERS.map((card) => ({ ...card, href: `/events/held/${card.slug}` })),
    ...finished.map((event) => ({
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
            The date, the divisions, and where to follow the brackets. Further down is how a fight runs, then the cards already held.
          </p>
        </header>

        <section>
          <SectionBanner>Coming up</SectionBanner>
          {featuredEvent ? (
            <div className="space-y-4">
              <EventPoster
                name={featuredEvent.name}
                slug={featuredEvent.slug}
                date={formatDate(featuredEvent.startDate)}
                line={featuredEvent.description === "Road to Super Fight." ? "Road to Super Fight" : ""}
                venue={featuredEvent.venue || ""}
                statusLine={statusLine(featuredEvent.status)}
                registerUntil={featuredEvent.status === "REGISTRATION_OPEN" ? formatDate(featuredEvent.registrationClosesAt) : null}
                matCount={featuredEvent.matCount ?? 1}
                canRegister={featuredEvent.status === "REGISTRATION_OPEN"}
                divisions={featuredDivisions.map((division) => ({
                  id: String(division._id),
                  name: division.name,
                  discipline: division.discipline,
                  capacity: division.capacity,
                }))}
              />
              {later.map((event) => (
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
          <SectionBanner>How a fight runs</SectionBanner>
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
