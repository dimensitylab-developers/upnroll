import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionBanner } from "@/components/home/section-banner";
import { HomeEventsSection, HomeFaqSection, HomeGlimpseSection, HomeRankingsSection } from "@/components/home/home-live";

export const dynamic = "force-dynamic";

const PATH_STEPS = [
  { n: "01", title: "Create an account", body: "Register as a fighter and sign in." },
  { n: "02", title: "Choose a division", body: "Pick an open event and the division you fight in." },
  { n: "03", title: "Submit payment", body: "Send the payment details for an admin to review." },
  { n: "04", title: "Follow the bracket", body: "Once you are in, track every round through to the final." },
];

function SectionFallback({ label }: { label: string }) {
  return <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-muted-foreground">{label}</p>;
}

export default function HomePage() {
  return (
    <main>
      <section className="speed-lines border-b border-black/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-4">The Underground Arena</p>
            <h1 id="home-wordmark" className="max-w-xl">
              <img src="/logo-wordmark.png" alt="Up 'n Roll" className="w-full h-auto" />
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg">
              Combat sports tournaments, run properly. Register for a division, track your record,
              and follow every bracket from first round to final.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Button asChild size="lg"><Link href="/register">Register to compete</Link></Button>
              <Button asChild variant="outline" size="lg"><Link href="/events">Browse events</Link></Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[320px] bg-black border-2 border-black rounded-md overflow-hidden shadow-[6px_6px_0_0_#000]">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              width={1080}
              height={1920}
              className="aspect-[9/16] w-full h-auto object-contain bg-black"
              src="/Videos/IMG_7263.MP4_2.mp4"
            >
              Up &apos;n Roll fight footage
            </video>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <SectionBanner>How you enter</SectionBanner>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PATH_STEPS.map((step) => (
            <li key={step.n} className="bg-card border-2 border-black rounded-md p-4 shadow-[6px_6px_0_0_#000]">
              <p className="text-display text-brand-red font-semibold">{step.n}</p>
              <p className="font-semibold mt-2">{step.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Payment uses the organizer&apos;s QR instructions. This site does not take card payments.
        </p>
      </section>

      <Suspense fallback={<SectionFallback label="Loading the card…" />}>
        <HomeGlimpseSection />
      </Suspense>
      <Suspense fallback={<SectionFallback label="Loading events…" />}>
        <HomeEventsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback label="Loading rankings…" />}>
        <HomeRankingsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback label="Loading questions…" />}>
        <HomeFaqSection />
      </Suspense>
      <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-sm text-muted-foreground">
        The on-site assistant answers from the published FAQ.
      </p>
    </main>
  );
}
