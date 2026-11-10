import { notFound } from "next/navigation";
import { HeldRecord } from "@/components/events/held-record";
import { HELD_ARCHIVE } from "@/components/events/held-archive";
import { PageBackLink } from "@/components/layout/page-back-link";

export default async function HeldEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = HELD_ARCHIVE[slug];
  if (!record) notFound();

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <PageBackLink href="/events" label="Back to events" />
        <div className="mt-2">
          <HeldRecord record={record} />
        </div>
      </div>
    </main>
  );
}
