import Link from "next/link";
import { notFound } from "next/navigation";
import { HeldRecord } from "@/components/events/held-record";
import { HELD_ARCHIVE } from "@/components/events/held-archive";

export const dynamic = "force-dynamic";

export default async function HeldEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = HELD_ARCHIVE[slug];
  if (!record) notFound();

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <Link href="/events" className="text-sm font-semibold text-brand-red">
          All events
        </Link>
        <div className="mt-6">
          <HeldRecord record={record} />
        </div>
      </div>
    </main>
  );
}
