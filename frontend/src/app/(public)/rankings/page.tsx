import Link from "next/link";
import { connection } from "next/server";
import { cachedPublicFighters, cachedPublicRankings } from "@/lib/public-reads";
import { listHeldCardAthletes } from "@/data/held-card-athletes";
import { FighterHypeCard } from "@/features/fighters/fighter-hype-card";
import {
  RankingsDivisionBoard,
  type DivisionRankedFighter,
} from "@/features/rankings/rankings-division-board";
import { resolveWeightClassId, WEIGHT_CLASSES, type WeightClassId } from "@/features/rankings/weight-classes";
import { SectionBanner } from "@/components/home/section-banner";
import { PaginationNav } from "@/components/pagination-nav";

/** Request-bound via searchParams. Do not instant-prerender. */
export const instant = false;

const CARDS_PAGE_SIZE = 10;

type BoardFighter = {
  displayName: string;
  slug: string;
  gym: string;
  academy: string;
  discipline: string;
  beltRank: string;
  weightDivision: string;
  hasPhoto: boolean;
  wins: number;
  losses: number;
  points: number;
  rank: number | null;
  featured: boolean;
  houseLabel?: string;
};

function emptyByClass(): Record<WeightClassId, DivisionRankedFighter[]> {
  return Object.fromEntries(WEIGHT_CLASSES.map((band) => [band.id, [] as DivisionRankedFighter[]])) as Record<
    WeightClassId,
    DivisionRankedFighter[]
  >;
}

export default async function PublicRankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ cardsPage?: string }>;
}) {
  await connection();
  const { cardsPage: cardsPageParam } = await searchParams;

  const [rankings, liveFighters, roster] = await Promise.all([
    cachedPublicRankings(),
    cachedPublicFighters(),
    Promise.resolve(listHeldCardAthletes()),
  ]);
  const liveBySlug = new Map(liveFighters.map((fighter) => [fighter.slug, fighter]));
  const rankingBySlug = new Map(
    rankings.filter((row) => row.slug).map((row) => [row.slug as string, row])
  );

  const profileCards: { key: string; href: string; fighter: BoardFighter }[] = [
    ...roster.map((athlete) => {
      const live = liveBySlug.get(athlete.slug);
      const ranked = rankingBySlug.get(athlete.slug);
      return {
        key: athlete.slug,
        href: `/fighters/${athlete.slug}`,
        fighter: {
          displayName: live?.displayName || athlete.displayName,
          slug: athlete.slug,
          gym: live?.gym || athlete.gym || "",
          academy: live?.academy || athlete.gym || "",
          discipline: live?.discipline || athlete.divisions[0] || "",
          beltRank: live?.beltRank || "",
          weightDivision: live?.weightDivision || athlete.weights[0] || "",
          hasPhoto: Boolean(live?.hasPhoto),
          wins: ranked?.wins ?? live?.wins ?? 0,
          losses: ranked?.losses ?? live?.losses ?? 0,
          points: ranked?.points ?? live?.points ?? 0,
          rank: ranked?.rank ?? live?.rank ?? null,
          featured: Boolean(athlete.featured),
          houseLabel: athlete.houseLabel,
        },
      };
    }),
    ...liveFighters
      .filter((fighter) => !roster.some((athlete) => athlete.slug === fighter.slug))
      .map((fighter) => {
        const ranked = rankingBySlug.get(fighter.slug);
        return {
          key: fighter.slug,
          href: `/fighters/${fighter.slug}`,
          fighter: {
            ...fighter,
            wins: ranked?.wins ?? fighter.wins ?? 0,
            losses: ranked?.losses ?? fighter.losses ?? 0,
            points: ranked?.points ?? fighter.points ?? 0,
            rank: ranked?.rank ?? fighter.rank ?? null,
            featured: false,
          },
        };
      }),
  ].sort((a, b) => {
    if (a.fighter.featured && !b.fighter.featured) return -1;
    if (!a.fighter.featured && b.fighter.featured) return 1;
    if ((b.fighter.points ?? 0) !== (a.fighter.points ?? 0)) return (b.fighter.points ?? 0) - (a.fighter.points ?? 0);
    return a.fighter.displayName.localeCompare(b.fighter.displayName);
  });

  const byClass = emptyByClass();
  for (const card of profileCards) {
    const weightClassId = resolveWeightClassId(card.fighter.weightDivision);
    if (!weightClassId) continue;
    byClass[weightClassId].push({
      rank: 0,
      displayName: card.fighter.displayName,
      slug: card.fighter.slug,
      wins: card.fighter.wins,
      losses: card.fighter.losses,
      points: card.fighter.points,
      hasPhoto: card.fighter.hasPhoto,
      academy: card.fighter.academy || card.fighter.gym || "",
      weightClassId,
    });
  }

  for (const band of WEIGHT_CLASSES) {
    byClass[band.id].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.displayName.localeCompare(b.displayName);
    });
    byClass[band.id] = byClass[band.id].map((fighter, index) => ({
      ...fighter,
      rank: index + 1,
    }));
  }

  const cardsTotalPages = Math.max(1, Math.ceil(profileCards.length / CARDS_PAGE_SIZE));
  const cardsPage = Math.min(Math.max(1, Number(cardsPageParam) || 1), cardsTotalPages);
  const pagedProfileCards = profileCards.slice((cardsPage - 1) * CARDS_PAGE_SIZE, cardsPage * CARDS_PAGE_SIZE);

  return (
    <main className="route-enter min-h-screen bg-background halftone-bg">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionBanner>On the board</SectionBanner>
            <h1 className="text-display text-4xl font-semibold uppercase tracking-wide sm:text-5xl">
              Rankings
            </h1>
            <p className="copy-slab mt-3 max-w-xl text-sm">
              Weight-class board with a top seat and contenders under each. Photos drop into the frame
              when fighters upload them. 3 points per win.
            </p>
          </div>
          <p className="text-sm">
            <Link href="/rankings/demo" className="copy-slab underline underline-offset-2 hover:text-brand-red">
              See how seeding works
            </Link>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8">
        <section id="leaderboard" className="scroll-mt-24">
          <RankingsDivisionBoard byClass={byClass} />
        </section>

        <section id="cards" className="mt-16 scroll-mt-24">
          <SectionBanner>Grappler cards</SectionBanner>
          <p className="copy-slab mb-6 max-w-2xl text-sm">
            Dense board. Tap a card for the full profile. No private contact or medical details.
          </p>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {pagedProfileCards.map((card) => (
              <li key={card.key}>
                <FighterHypeCard fighter={card.fighter} href={card.href} compact />
              </li>
            ))}
          </ul>
          {profileCards.length === 0 && (
            <p className="copy-slab text-sm text-muted-foreground">No grappler profiles yet.</p>
          )}
          {profileCards.length > 0 ? (
            <p className="copy-slab mt-3 text-center text-xs text-muted-foreground">
              {(cardsPage - 1) * CARDS_PAGE_SIZE + 1}-{Math.min(cardsPage * CARDS_PAGE_SIZE, profileCards.length)} of{" "}
              {profileCards.length}
            </p>
          ) : null}
          <PaginationNav
            page={cardsPage}
            totalPages={cardsTotalPages}
            basePath="/rankings"
            paramName="cardsPage"
            hash="cards"
          />
        </section>
      </div>
    </main>
  );
}
