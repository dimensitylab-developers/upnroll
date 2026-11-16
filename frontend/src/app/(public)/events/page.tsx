import Link from "next/link";
import { MapPin } from "lucide-react";
import { cachedPublicEvents } from "@/lib/public-reads";
import { SectionBanner } from "@/components/home/section-banner";
import { EventPoster } from "@/components/events/event-poster";
import { EventStory } from "@/components/events/event-story";

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function statusLine(status: string) {
  if (status === "REGISTRATION_OPEN") return "Registration is open. You can put your name on this event.";
  if (status === "REGISTRATION_CLOSED") return "Registration is closed. The event is set.";
  if (status === "COMPLETED") return "This event is finished. The date stays here.";
  return status.replaceAll("_", " ");
}

export default async function PublicEventsPage() {
  // Cross-request cached public reads; event mutations invalidate the "events" tag.
  const events = await cachedPublicEvents();
  const coming = events.filter((event) => event.status !== "COMPLETED");
  const featuredEvent = coming[0] ?? null;
  const later = coming.slice(1);

  return (
    <main className="route-enter min-h-screen bg-background halftone-bg px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-12 sm:space-y-16">
        <section>
          <SectionBanner>Coming up</SectionBanner>
          {featuredEvent ? (
            <div className="space-y-4">
              <EventPoster
                eventId={String(featuredEvent._id)}
                name={featuredEvent.name}
                slug={featuredEvent.slug}
                date={formatDate(featuredEvent.startDate)}
                line={featuredEvent.description === "Road to Super Fight." ? "Road to Super Fight" : ""}
                venue={featuredEvent.venue || ""}
                statusLine={statusLine(featuredEvent.status)}
                registerUntil={featuredEvent.status === "REGISTRATION_OPEN" ? formatDate(featuredEvent.registrationClosesAt) : null}
                canRegister={featuredEvent.status === "REGISTRATION_OPEN"}
              />
              {later.map((event) => (
                <Link
                  key={String(event._id)}
                  href={`/events/${event.slug}`}
                  className="block border-2 border-black bg-white px-5 py-4 shadow-[4px_4px_0_0_#000] transition-colors active:bg-brand-red/10"
                >
                  <p className="font-semibold">{event.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
                    <span>{formatDate(event.startDate)}</span>
                    {event.venue ? (
                      <span className="inline-flex items-center gap-1">
                        <span aria-hidden="true">·</span>
                        <MapPin className="size-3.5 shrink-0 text-brand-red" aria-hidden="true" />
                        {event.venue}
                      </span>
                    ) : null}
                    <span aria-hidden="true">·</span>
                    <span>{statusLine(event.status)}</span>
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="border-2 border-black bg-white px-5 py-4 text-sm leading-relaxed shadow-[4px_4px_0_0_#000]">
              No event is open yet. When one is announced, the date, the venue, and how to enter will show here.
            </p>
          )}
        </section>

        <section>
          <SectionBanner>How a match runs</SectionBanner>
          <EventStory />
        </section>
      </div>
    </main>
  );
}
