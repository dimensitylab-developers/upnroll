import Link from "next/link";
import { FounderCredit } from "@/components/layout/brand";
import { HomeGlimpse } from "@/components/home/home-glimpse";
import { SectionBanner } from "@/components/home/section-banner";

const PATH_STEPS = [
  { n: "01", title: "Create an account", body: "Register as a grappler and sign in." },
  { n: "02", title: "Choose a division", body: "Pick the open card and the division you fight in." },
  { n: "03", title: "Follow the bracket", body: "Once you are in, track every round through to the final." },
];

export function AboutStory({
  eventSlug,
  showHeading = true,
  page = false,
}: {
  eventSlug?: string | null;
  showHeading?: boolean;
  page?: boolean;
}) {
  const Heading = page ? "h1" : "h2";
  return (
    <div>
      {showHeading && (
        <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000] sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">About Us</p>
          <Heading className="text-display mt-2 text-5xl font-semibold leading-[0.95]">Earn your role.</Heading>
          <div className="mt-6 max-w-2xl space-y-1 text-lg leading-relaxed">
            <p className="font-semibold">Built For Grapplers 🇮🇳</p>
            <p>Brazilian Jiu Jitsu Platform</p>
            <p className="font-semibold">Real Fights. Real Pay. Real Rankings</p>
          </div>
          <div className="mt-6">
            <FounderCredit />
          </div>
        </div>
      )}

      <section className="mt-14">
        <SectionBanner>How you enter</SectionBanner>
        <ol className="grid gap-4 sm:grid-cols-3">
          {PATH_STEPS.map((step) => (
            <li key={step.n} className="border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#000]">
              <p className="text-display font-semibold text-brand-red">{step.n}</p>
              <p className="mt-2 font-semibold">{step.title}</p>
              <p className="mt-1 text-sm">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <SectionBanner>The rules</SectionBanner>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">Beginner</p>
            <p className="mt-2 font-semibold">White belts.</p>
            <p className="mt-2 text-sm">Permitted: standard chokes, armbar, kimura, americana, omoplata, straight foot lock.</p>
            <p className="mt-2 text-sm">Prohibited: heel hooks, toe holds, knee bars, calf slicers, flying submissions, jumping guard, neck cranks, spine cranks, twisters, slams.</p>
          </div>
          <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">Intermediate</p>
            <p className="mt-2 font-semibold">Blue and purple belts.</p>
            <p className="mt-2 text-sm">Also permitted: toe hold, knee bar, calf slicer, flying submissions, jumping guard.</p>
            <p className="mt-2 text-sm">Still prohibited: heel hooks, neck cranks, spine cranks, twisters, slams.</p>
          </div>
        </div>
        <p className="mt-4 max-w-3xl rounded-md bg-white px-3 py-2 text-sm">
          A penalty takes a point off. A repeated penalty can end the match. The full 12 July card stays on its{" "}
          <Link href="/events/held/no-gi-12-july-2026" className="underline">record</Link>.
        </p>
      </section>

      <div className="mt-14">
        <HomeGlimpse eventSlug={eventSlug} />
      </div>

      <p className="mt-4 rounded-md bg-white px-3 py-2 text-sm">
        The live board is on <Link href="/rankings" className="underline">rankings</Link>.
        Questions sit on the <Link href="/faq" className="underline">FAQ</Link>.
        Divisions for the open card are on <Link href="/events" className="underline">events</Link>.
      </p>
    </div>
  );
}
