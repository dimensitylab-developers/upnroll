import Image from "next/image";
import Link from "next/link";
import { BrandMark, FounderCredit } from "@/components/layout/brand";
import { EmojiStrip, MatEmojis } from "@/components/home/mat-emojis";
import { SectionBanner } from "@/components/home/section-banner";
import { GrapplingEmoji } from "@/components/ui/grappling-emoji";

const PATH_STEPS = [
  { n: "01", title: "Create an account", body: "Register as a grappler and sign in." },
  { n: "02", title: "Choose a division", body: "Pick the open card and the division you fight in." },
  { n: "03", title: "Follow the bracket", body: "Once you are in, track every round through to the final." },
];

const NIGHT = [
  { n: "01", title: "On the card", body: "Your name is listed. That is the start of the night." },
  { n: "02", title: "Called to the mat", body: "When your bout is up, you step on. The bracket does not wait." },
  { n: "03", title: "Referee runs it", body: "Their word is the match. Safety before the score." },
  { n: "04", title: "Result published", body: "Win, loss, or stoppage — everyone can see it." },
];

const HOUSE = [
  { title: "Kit", body: "Rashguard and grappling shorts." },
  { title: "Gear", body: "No zippers, pockets, or hard objects." },
  { title: "Referee", body: "Decisions are final." },
  { title: "Safety", body: "Athlete safety first, always." },
  { title: "Divisions", body: "Small groups may merge." },
];

const DOORS = [
  { href: "/events", title: "Events", body: "The card, the date, the venue." },
  { href: "/brackets", title: "Brackets", body: "Live board and published trees." },
  { href: "/rankings", title: "Rankings", body: "Points and public profiles." },
  { href: "/faq", title: "FAQ", body: "Straight answers from the book." },
];

function HeadlineStack({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const built = tone === "light" ? "/headlines/built-for-grapplers-white.png" : "/headlines/built-for-grapplers.png";
  const bjj = tone === "light" ? "/headlines/brazilian-jiu-jitsu-platform-white.png" : "/headlines/brazilian-jiu-jitsu-platform.png";
  const real = tone === "light" ? "/headlines/real-fights-real-pay-real-rankings-white.png" : "/headlines/real-fights-real-pay-real-rankings.png";
  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={built} alt="Built For Grapplers" className="h-auto w-full max-w-md object-contain object-left" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bjj} alt="Brazilian Jiu Jitsu Platform" className="h-auto w-full max-w-md object-contain object-left" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={real} alt="Real Fights. Real Pay. Real Rankings" className="h-auto w-full max-w-lg object-contain object-left" />
    </div>
  );
}

function AboutHomeTeaser({ eventSlug }: { eventSlug?: string | null }) {
  return (
    <div>
      <div className="relative overflow-hidden border-2 border-black bg-black text-white shadow-[8px_8px_0_0_#c8102e]">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <Image src="/Fighting/003A8193.JPG" alt="" fill className="object-cover object-center" sizes="72rem" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        </div>
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">About Us</p>
            <h2 className="text-display mt-2 text-5xl font-semibold leading-[0.95]">Earn your role.</h2>
            <div className="mt-6">
              <HeadlineStack tone="light" />
            </div>
            <div className="mt-6">
              <FounderCredit className="text-white/70" />
            </div>
          </div>
          <div className="space-y-4">
            <p className="max-w-sm text-sm leading-relaxed text-white/80">
              Up &apos;n Roll runs the card in India. You bring the fight. Brackets, results, and rankings stay public.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/about"
                className="inline-flex -skew-x-12 border-2 border-black bg-brand-red px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#fff]"
              >
                <span className="inline-block skew-x-12">Full story</span>
              </Link>
              <Link
                href={eventSlug ? `/events/${eventSlug}` : "/events"}
                className="inline-flex border-2 border-white/40 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white"
              >
                Next card
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <SectionBanner>How you enter</SectionBanner>
        <ol className="grid gap-3 sm:grid-cols-3">
          {PATH_STEPS.map((step) => (
            <li key={step.n} className="border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_#000]">
              <p className="text-display text-3xl font-semibold text-brand-red">{step.n}</p>
              <p className="mt-2 font-semibold">{step.title}</p>
              <p className="mt-1 text-sm">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function AboutPageStory({ eventSlug }: { eventSlug?: string | null }) {
  return (
    <div className="bg-[#efeae2]">
      {/* Hero — one composition */}
      <section className="relative overflow-hidden border-b-2 border-black bg-black text-white">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/Fighting/003A8013.JPG"
            alt=""
            fill
            priority
            className="object-cover object-[center_20%] opacity-45"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,16,46,0.45),transparent_55%),linear-gradient(to_bottom,rgba(0,0,0,0.35),#000_92%)]" />
          <MatEmojis className="absolute inset-0 opacity-25" />
        </div>

        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-20 sm:px-6 sm:pb-16 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <BrandMark className="h-12 w-12 drop-shadow-[3px_3px_0_rgba(0,0,0,0.6)]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-red">Up &apos;n Roll · About</p>
          </div>

          <h1 className="sr-only">About Up &apos;n Roll</h1>
          <p className="-rotate-1 mb-5 inline-flex w-fit border-2 border-black bg-brand-red px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[4px_4px_0_0_#fff]">
            Earn your role
          </p>

          <div className="max-w-2xl">
            <HeadlineStack tone="light" />
          </div>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
            Indian Brazilian Jiu-Jitsu. Real cards. Public brackets. Built for grapplers who show up.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="inline-flex -skew-x-12 border-2 border-black bg-brand-red px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-[5px_5px_0_0_#fff]"
            >
              <span className="inline-block skew-x-12">Register to compete</span>
            </Link>
            <Link
              href={eventSlug ? `/events/${eventSlug}` : "/events"}
              className="inline-flex border-2 border-white px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white"
            >
              See the next card
            </Link>
          </div>

          <div className="mt-8 border-t border-white/20 pt-5">
            <FounderCredit className="text-white/65" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6 lg:px-8">
        {/* Who */}
        <section className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[280px] overflow-hidden border-2 border-black bg-black shadow-[8px_8px_0_0_#000]">
            <Image
              src="/gallery/grappling-mat.jpg"
              alt="Grapplers on the mat"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 36rem"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 right-4 text-display text-2xl font-semibold text-white sm:text-3xl">
              The house runs the card.
              <span className="block text-brand-red">You bring the fight.</span>
            </p>
          </div>
          <div className="flex flex-col justify-between border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#c8102e] sm:p-8">
            <div>
              <SectionBanner>The house</SectionBanner>
              <p className="mt-2 text-sm leading-relaxed sm:text-base">
                Up &apos;n Roll is a Brazilian Jiu-Jitsu platform for athletes who want a real night: enter a division, get called to the mat, leave a result that stays public.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                No mystery cards. Brackets, schedules, and rankings live on the site once the night is running.
              </p>
            </div>
            <EmojiStrip className="mt-8 justify-start" size={36} emojis={["double-leg-takedown", "armbar", "triangle-choke", "mount"]} />
          </div>
        </section>

        {/* Path */}
        <section>
          <SectionBanner>How you enter</SectionBanner>
          <p className="mb-8 max-w-xl text-sm leading-relaxed">Three moves from the couch to the mat.</p>
          <ol className="relative grid gap-4 md:grid-cols-3">
            {PATH_STEPS.map((step, index) => (
              <li
                key={step.n}
                className={`relative border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] ${
                  index === 1 ? "md:-translate-y-3" : ""
                }`}
              >
                <span className="text-display absolute -top-4 right-4 text-6xl font-semibold leading-none text-brand-red/20">
                  {step.n}
                </span>
                <p className="text-display text-3xl font-semibold text-brand-red">{step.n}</p>
                <p className="mt-3 text-display text-xl font-semibold">{step.title}</p>
                <p className="mt-2 text-sm leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Rules */}
        <section>
          <SectionBanner>The rules</SectionBanner>
          <p className="mb-8 max-w-2xl text-sm leading-relaxed">
            What you can hunt depends on the belt. Penalties cost a point. Repeat them and the match can end.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="overflow-hidden border-2 border-black bg-white shadow-[7px_7px_0_0_#000]">
              <div className="flex items-center justify-between gap-3 border-b-2 border-black bg-black px-5 py-4 text-white">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">Beginner</p>
                  <p className="text-display text-2xl font-semibold">White belts</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/emojis/belt-white.png" alt="" className="h-10 w-10 object-contain" />
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <p className="-rotate-1 mb-3 inline-block bg-brand-red px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                    Permitted
                  </p>
                  <ul className="space-y-1.5 text-sm leading-snug">
                    <li>Standard chokes</li>
                    <li>Armbar · Kimura · Americana</li>
                    <li>Omoplata</li>
                    <li>Straight foot lock</li>
                  </ul>
                </div>
                <div>
                  <p className="-rotate-1 mb-3 inline-block bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                    Prohibited
                  </p>
                  <ul className="space-y-1.5 text-sm leading-snug text-muted-foreground">
                    <li>Heel hooks · Toe holds</li>
                    <li>Knee bars · Calf slicers</li>
                    <li>Flying submissions · Jumping guard</li>
                    <li>Neck / spine cranks · Twisters · Slams</li>
                  </ul>
                </div>
              </div>
            </article>

            <article className="overflow-hidden border-2 border-black bg-white shadow-[7px_7px_0_0_#c8102e]">
              <div className="flex items-center justify-between gap-3 border-b-2 border-black bg-brand-red px-5 py-4 text-white">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">Intermediate</p>
                  <p className="text-display text-2xl font-semibold">Blue &amp; purple</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/emojis/belt-blue.png" alt="" className="h-10 w-10 object-contain" />
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <p className="-rotate-1 mb-3 inline-block bg-brand-red px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                    Also open
                  </p>
                  <ul className="space-y-1.5 text-sm leading-snug">
                    <li>Toe hold · Knee bar</li>
                    <li>Calf slicer</li>
                    <li>Flying submissions</li>
                    <li>Jumping guard</li>
                  </ul>
                </div>
                <div>
                  <p className="-rotate-1 mb-3 inline-block bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                    Still closed
                  </p>
                  <ul className="space-y-1.5 text-sm leading-snug text-muted-foreground">
                    <li>Heel hooks</li>
                    <li>Neck / spine cranks</li>
                    <li>Twisters</li>
                    <li>Slams</li>
                  </ul>
                </div>
              </div>
            </article>
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-relaxed">
            The full 12 July card stays on its{" "}
            <Link href="/events/held/no-gi-12-july-2026" className="font-semibold text-brand-red underline">
              held record
            </Link>
            . Each open event posts its own format on{" "}
            <Link href="/events" className="font-semibold text-brand-red underline">
              events
            </Link>
            .
          </p>
        </section>

        {/* Match night */}
        <section className="border-2 border-black bg-black text-white shadow-[8px_8px_0_0_#c8102e]">
          <div className="border-b-2 border-white/10 px-6 py-6 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">A match night</p>
            <p className="text-display mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
              Enter. Get called. Leave a result.
            </p>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
            {NIGHT.map((beat, index) => (
              <li
                key={beat.n}
                className={`border-white/10 p-6 ${index < 3 ? "sm:border-r" : ""} ${index < 2 ? "border-b lg:border-b-0" : ""} ${index === 2 ? "border-b sm:border-b-0" : ""}`}
              >
                <p className="text-display text-2xl font-semibold text-brand-red">{beat.n}</p>
                <p className="mt-3 font-semibold">{beat.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{beat.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* House stamps */}
        <section>
          <SectionBanner>On every mat</SectionBanner>
          <ul className="flex flex-wrap gap-3">
            {HOUSE.map((rule) => (
              <li
                key={rule.title}
                className="-rotate-1 border-2 border-black bg-white px-4 py-3 shadow-[4px_4px_0_0_#000] odd:rotate-1"
              >
                <p className="text-display text-lg font-semibold">{rule.title}</p>
                <p className="mt-1 text-sm">{rule.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Registering means you have read the rules, you agree to them, and you accept the risks of combat sports.
          </p>
        </section>

        {/* Doors */}
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

        {/* Close */}
        <section className="relative overflow-hidden border-2 border-black bg-black px-6 py-10 text-white shadow-[8px_8px_0_0_#000] sm:px-10">
          <div className="pointer-events-none absolute -right-6 top-4 opacity-40">
            <GrapplingEmoji name="hip-throw" size={96} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Ready</p>
          <p className="text-display mt-3 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
            The next open card is waiting.
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
              Open card
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
