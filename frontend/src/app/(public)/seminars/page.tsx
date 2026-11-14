import type { Metadata } from "next";
import { ComingSoon } from "@/components/content/coming-soon";

export const metadata: Metadata = { title: "Seminars" };

export default function SeminarsPage() {
  return (
    <ComingSoon
      title="Seminars"
      stamp="Coming soon"
      line="Seminar dates and hosts will be posted here when they are set."
    >
      <p className="text-center text-display text-3xl font-semibold uppercase tracking-wide text-brand-red sm:text-4xl">
        Coming soon
      </p>
    </ComingSoon>
  );
}
