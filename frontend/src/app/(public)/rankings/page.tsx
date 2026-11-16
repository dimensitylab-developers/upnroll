import Link from "next/link";
import { connection } from "next/server";
import { cachedRankingBoardEntries } from "@/lib/public-reads";
import { RankingsBoard, type RankingsLevel } from "@/features/rankings/rankings-board";
import { SectionBanner } from "@/components/home/section-banner";

/** Request-bound via searchParams. Do not instant-prerender. */
export const instant = false;

export default async function PublicRankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  await connection();
  const { level: levelParam } = await searchParams;
  const level: RankingsLevel = levelParam?.toLowerCase() === "intermediate" ? "INTERMEDIATE" : "BEGINNER";

  // The board fills in automatically: a grappler appears in their division once their
  // registration is confirmed, and ranks start once matches are decided.
  const entries = await cachedRankingBoardEntries();

  return (
    <main className="route-enter min-h-screen bg-background halftone-bg">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionBanner>On the board</SectionBanner>
            <h1 className="text-display text-4xl font-semibold uppercase tracking-wide sm:text-5xl">
              Rankings
            </h1>
          </div>
          <p className="text-sm">
            <Link href="/rankings/demo" className="copy-slab underline underline-offset-2 hover:text-brand-red">
              See how seeding works
            </Link>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <RankingsBoard entries={entries} level={level} />
      </div>
    </main>
  );
}
