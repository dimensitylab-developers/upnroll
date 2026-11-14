import Image from "next/image";
import Link from "next/link";
import { BrandMark, FounderCredit } from "@/components/layout/brand";
import { HappyStack } from "@/components/home/happy-stack";
import { SectionBanner } from "@/components/home/section-banner";
import { HAPPY_PHOTOS } from "@/components/home/site-photos";

const BRACKET_FACTORS = [
  "Age",
  "Weight",
  "Belt",
  "Training years",
  "Match record",
  "Gym",
] as const;

const DOORS = [
  { href: "/events", title: "Events", body: "The card, the date, the venue." },
  { href: "/brackets", title: "Brackets", body: "Live board and published trees." },
  { href: "/rankings", title: "Rankings", body: "Points and public profiles." },
  { href: "/faq", title: "FAQ", body: "Straight answers from the book." },
];

function AboutHomeTeaser({ eventSlug }: { eventSlug?: string | null }) {
  return (
    <div className="relative overflow-hidden border-2 border-black bg-black text-white shadow-[8px_8px_0_0_#c8102e]">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <Image src="/Fighting/003A8193.JPG" alt="" fill className="object-cover object-center" sizes="72rem" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
      </div>
      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">About Us</p>
          <h2 className="text-display mt-2 text-4xl font-semibold leading-[0.95] sm:text-5xl">Up &apos;n Roll</h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80">
            No-gi for grapplers everywhere — a real stage, fair brackets, and rankings that lead to the superfight.
          </p>
          <div className="mt-6">
            <FounderCredit className="text-white/70" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/about"
            className="inline-flex -skew-x-12 border-2 border-black bg-brand-red px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#fff]"
          >
            <span className="inline-block skew-x-12">Know more</span>
          </Link>
          <Link
            href={eventSlug ? `/events/${eventSlug}` : "/events"}
            className="inline-flex border-2 border-white/40 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white"
          >
            Next event
          </Link>
        </div>
      </div>
    </div>
  );
}

function AboutPageStory({ eventSlug }: { eventSlug?: string | null }) {
  return (
    <div className="bg-[#efeae2]">
      <section className="relative overflow-hidden border-b-2 border-black bg-black text-white">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/Fighting/003A8013.JPG"
            alt=""
            fill
            priority
            className="object-cover object-[center_20%] opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,16,46,0.4),transparent_55%),linear-gradient(to_bottom,rgba(0,0,0,0.3),#000_90%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[48vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-20 sm:px-6 sm:pb-14 lg:px-8">
          <div className="mb-5 flex items-center gap-3">
            <BrandMark className="h-11 w-11 drop-shadow-[3px_3px_0_rgba(0,0,0,0.6)]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-red">About Us</p>
          </div>
          <h1 className="text-display max-w-3xl text-4xl font-semibold leading-[0.95] sm:text-6xl">
            About Up &apos;n Roll
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            A no-gi grappling platform built for grapplers everywhere — first time on the mat or chasing the next belt.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-3">
          <article className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-6 lg:col-span-2">
            <SectionBanner>The stage</SectionBanner>
            <p className="mt-4 text-sm leading-relaxed sm:text-base">
              Every grappler deserves a real stage. Athletes compete across three events and earn ranking points for
              every match, with wins counting the most. Top performers earn their place in the superfight at the fourth
              event.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Registration fees come back as show money. Superfight winners take a bonus on top. Beginner and
              Intermediate divisions for men and women — prize money in every division. Higher belts join as we grow.
            </p>
          </article>
          <article className="flex flex-col justify-between border-2 border-black bg-brand-red p-5 text-white shadow-[6px_6px_0_0_#000] sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">Show money</p>
            <p className="text-display mt-4 text-3xl font-semibold leading-tight">
              Your effort is always rewarded.
            </p>
          </article>
        </section>

        <section className="border-2 border-black bg-white p-5 shadow-[8px_8px_0_0_#000] sm:p-8">
          <SectionBanner>Fair brackets</SectionBanner>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed sm:text-base">
            Brackets are set by a system, not by favourites. You match with athletes at a similar level, and teammates
            stay apart in the early rounds.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {BRACKET_FACTORS.map((factor) => (
              <li
                key={factor}
                className="border-2 border-black bg-[#f7f6f4] px-3 py-1.5 text-sm font-semibold shadow-[3px_3px_0_0_#000]"
              >
                {factor}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="relative min-h-[240px] overflow-hidden border-2 border-black bg-black shadow-[8px_8px_0_0_#000]">
            <Image
              src="/gallery/grappling-mat.jpg"
              alt=""
              fill
              className="object-cover opacity-70"
              sizes="(max-width: 1024px) 100vw, 28rem"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 text-display text-2xl font-semibold text-white sm:text-3xl">
              Jiu jitsu as a lifestyle — not just a card to enter.
            </p>
          </article>
          <article className="border-2 border-black bg-white p-5 shadow-[8px_8px_0_0_#c8102e] sm:p-8">
            <SectionBanner>Made by an athlete</SectionBanner>
            <p className="mt-4 text-sm leading-relaxed sm:text-base">
              We know the nerves before a match, the sting of a loss, and the pride of a hard-earned win. It&apos;s not
              an ego game — it&apos;s a place to test your skills, be heard, build confidence, and tap when you need to.
            </p>
            <p className="mt-4 text-sm font-semibold text-brand-red">Come roll with us.</p>
            <div className="mt-6 border-t-2 border-black pt-4">
              <FounderCredit />
            </div>
          </article>
        </section>

        <section className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-8">
          <SectionBanner>Ranking system</SectionBanner>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed">
            Three events build the board. The fourth is the superfight. Who gets that invitation is confirmed by the
            house — not points alone.
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold text-brand-red">Know more</summary>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>
                Deeper bracket runs place higher. Early exits place lower. When two athletes lose with no points, the
                faster loss places lower. Missing a recent event can drop you versus athletes who showed up.
              </p>
              <p>Featured #1 gets the photo. The list under the podium starts at #2.</p>
            </div>
          </details>
        </section>

        <section>
          <SectionBanner>Celebrations</SectionBanner>
          <HappyStack photos={HAPPY_PHOTOS} />
        </section>

        <section>
          <SectionBanner>Around the card</SectionBanner>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DOORS.map((door) => (
              <li key={door.href}>
                <Link
                  href={door.href}
                  className="group flex h-full flex-col justify-between border-2 border-black bg-white p-5 shadow-[5px_5px_0_0_#000] transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0_0_#c8102e]"
                >
                  <div>
                    <p className="text-display text-2xl font-semibold">{door.title}</p>
                    <p className="mt-2 text-sm leading-relaxed">{door.body}</p>
                  </div>
                  <p className="mt-6 text-sm font-semibold text-brand-red group-hover:underline">Open →</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-2 border-black bg-black px-6 py-10 text-white shadow-[8px_8px_0_0_#000] sm:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Ready</p>
          <p className="text-display mt-3 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
            Come roll with us.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex -skew-x-12 border-2 border-black bg-brand-red px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-[5px_5px_0_0_#fff]"
            >
              <span className="inline-block skew-x-12">Register</span>
            </Link>
            <Link
              href={eventSlug ? `/events/${eventSlug}` : "/events"}
              className="inline-flex border-2 border-white px-5 py-3 text-sm font-semibold uppercase tracking-wider"
            >
              Next event
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AboutStory({
  eventSlug,
  page = false,
}: {
  eventSlug?: string | null;
  showHeading?: boolean;
  page?: boolean;
}) {
  if (page) {
    return <AboutPageStory eventSlug={eventSlug} />;
  }
  return <AboutHomeTeaser eventSlug={eventSlug} />;
}
