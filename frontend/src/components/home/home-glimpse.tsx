import type { ReactNode } from "react";
import Link from "next/link";
import { SectionBanner } from "./section-banner";

const LINES = [
  { kicker: "01", title: "Register", body: "Put your name on the card." },
  { kicker: "02", title: "Step on the mat", body: "Show up ready. The bracket does not wait." },
  { kicker: "03", title: "Follow it through", body: "From the first round to the final." },
];

const HOUSE_RULES = [
  { title: "Kit", body: "Rashguard and grappling shorts are required." },
  { title: "Gear", body: "No zippers, pockets, or hard objects." },
  { title: "Referee", body: "Referee decisions are final." },
  { title: "Safety", body: "Athlete safety comes first at all times." },
  { title: "Divisions", body: "Organizers may merge divisions." },
];

const NIGHT = [
  { n: "01", title: "Your name is on the card", body: "Once you are in, the event lists you. That is the start of the night." },
  { n: "02", title: "You are called to the mat", body: "When your bout is up, you step on. The bracket does not wait." },
  { n: "03", title: "The referee runs the match", body: "The referee's word is the match. Safety comes before the score." },
  { n: "04", title: "The result is published", body: "Win, loss, or stoppage, the result goes up for everyone to see." },
];

export function HomeGlimpse({
  fighting,
  happy,
  eventSlug,
}: {
  fighting: ReactNode;
  happy: ReactNode;
  eventSlug?: string | null;
}) {
  const spots = [
    { href: "/events", title: "Events", body: "The card, the date, and the venue for what is coming up." },
    { href: eventSlug ? `/events/${eventSlug}/brackets` : "/events", title: "Brackets", body: "Every round, from the first fight to the final." },
    { href: "/fighters", title: "Grapplers", body: "A public profile for everyone who steps on the mat." },
    { href: "/seminars", title: "Seminars", body: "Classes and camps, listed when a date is set." },
    { href: "/rankings", title: "Rankings", body: "The board, built from published results." },
    { href: "/about", title: "About", body: "Built for grapplers in India and Brazil." },
    { href: "/store", title: "Store", body: "Manga grappling shirts. Opening soon." },
    { href: eventSlug ? `/events/${eventSlug}/results` : "/events", title: "Results", body: "Who won, once the match is over." },
    { href: "/faq", title: "FAQ assistant", body: "Questions answered from the published FAQ." },
  ];
  return (
    <>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <SectionBanner>Every card</SectionBanner>
        <p className="text-display text-2xl sm:text-3xl font-semibold max-w-2xl mb-4">
          Up &apos;n Roll runs the card. You bring the fight.
        </p>
        <ol className="grid sm:grid-cols-3 gap-3">
          {LINES.map((line) => (
            <li key={line.kicker} className="bg-card border-2 border-black rounded-md p-4 shadow-[4px_4px_0_0_#000]">
              <p className="text-display text-brand-red font-semibold">{line.kicker}</p>
              <p className="font-semibold mt-2">{line.title}</p>
              <p className="text-sm mt-1">{line.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <SectionBanner>On every mat</SectionBanner>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {HOUSE_RULES.map((rule) => (
            <li key={rule.title} className="bg-card border-2 border-black rounded-md p-4 shadow-[4px_4px_0_0_#000]">
              <p className="font-semibold">{rule.title}</p>
              <p className="text-sm mt-1">{rule.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm max-w-3xl">
          Registering means you have read the rules, you agree to them, and you accept the risks of combat sports.
        </p>
        <p className="mt-3 text-sm">
          Each event publishes its own format, divisions, and scoring on the{" "}
          <Link href="/events" className="underline">events page</Link>.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <SectionBanner>Around the card</SectionBanner>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {spots.map((spot) => (
            <li key={spot.title}>
              <Link href={spot.href} className="block h-full bg-card border-2 border-black rounded-md p-4 shadow-[4px_4px_0_0_#000]">
                <p className="font-semibold">{spot.title}</p>
                <p className="text-sm mt-1">{spot.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <SectionBanner>Fighting</SectionBanner>
        {fighting}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <SectionBanner>A match night</SectionBanner>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {NIGHT.map((beat) => (
            <li key={beat.n} className="bg-card border-2 border-black rounded-md p-4 shadow-[4px_4px_0_0_#000]">
              <p className="text-display text-brand-red font-semibold">{beat.n}</p>
              <p className="font-semibold mt-2">{beat.title}</p>
              <p className="text-sm mt-1">{beat.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <SectionBanner>Happy moments</SectionBanner>
        {happy}
      </section>
    </>
  );
}
