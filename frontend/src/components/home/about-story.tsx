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
  "Previous match record",
  "Academy",
] as const;

const DOORS = [
  { href: "/events", title: "Events" },
  { href: "/brackets", title: "Brackets" },
  { href: "/rankings", title: "Rankings" },
  { href: "/faq", title: "FAQ" },
];

function AboutHomeTeaser() {
  return (
    <Link
      href="/about"
      aria-label="Know more about Up 'n Roll"
      className="group relative block overflow-hidden border-2 border-black bg-black text-white shadow-[10px_10px_0_0_#c8102e] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[14px_14px_0_0_#c8102e]"
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/Fighting/003A8013.JPG"
          alt=""
          fill
          className="object-cover object-[center_25%] opacity-45 transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 72rem"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,16,46,0.45),transparent_55%),linear-gradient(105deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_48%,rgba(0,0,0,0.35)_100%)]" />
      </div>

      <div className="relative grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-2 border-white bg-white shadow-[3px_3px_0_0_#c8102e]">
                <BrandMark className="h-8 w-8" />
              </span>
              <p className="rounded-sm bg-brand-red px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white shadow-[2px_2px_0_0_#000]">
                About Us
              </p>
            </div>
            <h2 className="text-display max-w-xl text-4xl font-semibold leading-[0.95] sm:text-5xl lg:text-6xl">
              About Up &apos;n Roll
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
              A no-gi grappling platform built for grapplers everywhere, first time on the mat or chasing the next
              belt. Real stage. Fair brackets. Rankings that lead to the superfight.
            </p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65">
              Three events build the board. The fourth is the superfight. Your effort is always rewarded.
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <FounderCredit className="text-white/60" />
            <span className="inline-flex -skew-x-12 border-2 border-black bg-brand-red px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-[5px_5px_0_0_#fff] transition-colors group-hover:bg-white group-hover:text-black group-hover:shadow-[5px_5px_0_0_#c8102e]">
              <span className="inline-block skew-x-12">Know more →</span>
            </span>
          </div>
        </div>

        <div className="hidden items-center justify-center border-t-2 border-black p-6 lg:flex lg:border-l-2 lg:border-t-0">
          <div className="w-full max-w-[19rem] overflow-hidden border-2 border-white/30 bg-black/40 shadow-[3px_3px_0_0_rgba(200,16,46,0.85)]">
            <Image
              src="/Fighting/opt/about-card.jpg"
              alt=""
              width={1066}
              height={1600}
              className="block h-auto w-full transition-transform duration-700 group-hover:scale-110"
              sizes="19rem"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function AboutPageStory() {
  return (
    <div className="bg-[#efeae2]">
      <section className="relative overflow-hidden border-b-2 border-black bg-black text-white">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/Fighting/opt/about-hero.webp"
            alt=""
            fill
            priority
            className="object-cover object-[center_12%] opacity-55"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,16,46,0.4),transparent_55%),linear-gradient(to_bottom,rgba(0,0,0,0.3),#000_90%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[48vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-20 sm:px-6 sm:pb-14 lg:px-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border-2 border-white bg-white shadow-[3px_3px_0_0_#c8102e]">
              <BrandMark className="h-9 w-9" />
            </span>
            <p className="rounded-sm bg-brand-red px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white shadow-[2px_2px_0_0_#000]">
              About Us
            </p>
          </div>
          <h1 className="text-display max-w-3xl text-4xl font-semibold leading-[0.95] sm:text-6xl">
            About Up &apos;n Roll
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Up &apos;n Roll is a no-gi grappling platform built for grapplers everywhere, whether you are stepping on
            the mat for the first time or chasing your next belt. A real stage, fair brackets, and rankings that lead
            to the superfight.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <section className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-6">
          <SectionBanner>The stage</SectionBanner>
          <p className="mt-4 text-sm leading-relaxed sm:text-base">
            Every grappler deserves a real stage. Compete across three events and earn ranking points for every match,
            with wins counting the most. The top performers in each division earn their place in the superfight at the
            fourth event.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Registration fees are returned as show money, and superfight winners take a bonus on top. We run Beginner
            and Intermediate divisions for men and women, with prize money in every division. Higher belts will join
            as we grow.
          </p>
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
              src="/Fighting/opt/about-lifestyle.webp"
              alt=""
              fill
              className="object-cover object-[center_40%] opacity-80"
              sizes="(max-width: 1024px) 100vw, 28rem"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 text-display text-2xl font-semibold text-white sm:text-3xl">
              Jiu jitsu should be a lifestyle, not just an event to enter.
            </p>
          </article>
          <article className="border-2 border-black bg-white p-5 shadow-[8px_8px_0_0_#c8102e] sm:p-8">
            <SectionBanner>Made by an athlete for an athlete</SectionBanner>
            <p className="mt-4 text-sm leading-relaxed sm:text-base">
              We know the nerves before a match, the sting of a loss, and the pride of a hard-earned win. It&apos;s not
              an ego game. It&apos;s a place to test your skills, be heard, build confidence, and tap when you need to.
            </p>
            <div className="mt-6 border-t-2 border-black pt-4">
              <FounderCredit />
            </div>
          </article>
        </section>

        <section className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-8">
          <SectionBanner>Ranking system</SectionBanner>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed">
            Three events build the board. The fourth is the superfight. Who gets that invitation is confirmed by the
            ranking system.
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold text-brand-red">Know more</summary>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>Superfight eligibility is based on wins and top rankings within the same division. Athletes may switch divisions, but their previous rankings will not carry over. They must establish a new ranking in the new division to qualify for a superfight.
              </p>
              <p>
                The further you go in a bracket, the higher you rank, and every win earns you points. If you are knocked
                out early, you rank lower. Skipping an event can also move you down against athletes who competed.
              </p>
             </div>
          </details>
        </section>

        <section>
          <HappyStack photos={HAPPY_PHOTOS} />
        </section>

        <section>
          <SectionBanner>Around the event</SectionBanner>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DOORS.map((door) => (
              <li key={door.href}>
                <Link
                  href={door.href}
                  className="group flex h-full flex-col justify-between border-2 border-black bg-white p-5 shadow-[5px_5px_0_0_#000] transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0_0_#c8102e]"
                >
                  <div>
                    <p className="text-display text-2xl font-semibold">{door.title}</p>
                  </div>
                  <p className="mt-6 text-sm font-semibold text-brand-red group-hover:underline">Open →</p>
                </Link>
              </li>
            ))}
          </ul>
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
    return <AboutPageStory />;
  }
  return <AboutHomeTeaser />;
}
