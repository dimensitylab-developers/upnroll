import Link from "next/link";
import { connection } from "next/server";
import { listPublicRankings } from "@/server/services/rankingService";
import { listPublicFighters } from "@/server/services/fighterService";
import { listHeldCardAthletes } from "@/data/held-card-athletes";
import { FighterHypeCard } from "@/features/fighters/fighter-hype-card";
import { RankingsPodium, type PodiumFighter } from "@/features/rankings/rankings-podium";
import { EmojiStrip, MatEmojis } from "@/components/home/mat-emojis";
import { SectionBanner } from "@/components/home/section-banner";

export default async function PublicRankingsPage() {
  // cacheComponents: DB/mongoose touches current time; opt into request time first.
  await connection();
  const [rankings, liveFighters, roster] = await Promise.all([
    listPublicRankings(),
    listPublicFighters(),
    Promise.resolve(listHeldCardAthletes()),
  ]);
  const liveBySlug = new Map(liveFighters.map((fighter) => [fighter.slug, fighter]));

  // Live registered profiles win; held-card roster fills the board until photos/accounts catch up.
  const profileCards = [
    ...roster.map((athlete) => {
      const live = liveBySlug.get(athlete.slug);
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
          wins: live?.wins ?? 0,
          losses: live?.losses ?? 0,
          points: live?.points ?? 0,
          rank: live?.rank ?? null,
          featured: Boolean(athlete.featured),
          houseLabel: athlete.houseLabel,
        },
      };
    }),
    ...liveFighters
      .filter((fighter) => !roster.some((athlete) => athlete.slug === fighter.slug))
      .map((fighter) => ({
        key: fighter.slug,
        href: `/fighters/${fighter.slug}`,
        fighter: {
          ...fighter,
          featured: false,
        },
      })),
  ].sort((a, b) => {
    if (a.fighter.featured && !b.fighter.featured) return -1;
    if (!a.fighter.featured && b.fighter.featured) return 1;
    if ((b.fighter.points ?? 0) !== (a.fighter.points ?? 0)) return (b.fighter.points ?? 0) - (a.fighter.points ?? 0);
    return a.fighter.displayName.localeCompare(b.fighter.displayName);
  });

  // Live ranking rows first; fill remaining places from profile cards so the podium can show 1·2·3.
  const fromRankings: PodiumFighter[] = rankings.map((row) => {
    const live = row.slug ? liveBySlug.get(row.slug) : undefined;
    return {
      rank: row.rank,
      displayName: row.displayName,
      slug: row.slug,
      wins: row.wins,
      losses: row.losses,
      points: row.points,
      hasPhoto: Boolean(live?.hasPhoto),
      academy: live?.academy || live?.gym || "",
    };
  });

  const usedSlugs = new Set(fromRankings.map((row) => row.slug).filter(Boolean));
  const fillers: PodiumFighter[] = profileCards
    .filter((card) => !usedSlugs.has(card.fighter.slug))
    .map((card, index) => ({
      rank: fromRankings.length + index + 1,
      displayName: card.fighter.displayName,
      slug: card.fighter.slug,
      wins: card.fighter.wins ?? 0,
      losses: card.fighter.losses ?? 0,
      points: card.fighter.points ?? 0,
      hasPhoto: Boolean(card.fighter.hasPhoto),
      academy: card.fighter.academy || card.fighter.gym || "",
    }));

  // Pin James Lewis to silver (place 2) on the public podium.
  const merged = [...fromRankings, ...fillers];
  const jamesIndex = merged.findIndex(
    (row) => row.slug === "james-lewis" || row.displayName.trim().toLowerCase() === "james lewis"
  );
  if (jamesIndex >= 0) {
    const [james] = merged.splice(jamesIndex, 1);
    merged.splice(Math.min(1, merged.length), 0, james!);
  }
  const board = merged.map((row, index) => ({ ...row, rank: index + 1 }));
  const podium = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 py-10 sm:py-16">
      <MatEmojis className="pointer-events-none absolute inset-0 opacity-40 sm:opacity-100" />
      <div className="relative mx-auto max-w-5xl">
        <EmojiStrip emojis={["mount", "armbar", "hip-throw", "rear-naked-choke", "triangle-choke", "knee-slice"]} />
        <h1 className="mt-4 text-display text-3xl font-semibold sm:text-4xl">Rankings</h1>
        <p className="mt-2 max-w-2xl bg-white px-2 py-1 text-sm">
          Leaderboard — gold, silver, bronze on the podium. Everyone else stacks below. 3 points per win.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/rankings/demo" className="bg-white px-1 underline">
            See how seeding works
          </Link>
        </p>

        <section className="mt-10">
          <SectionBanner>Leaderboard</SectionBanner>

          {podium.length > 0 ? (
            <div className="overflow-hidden border-2 border-black bg-[#faf8f4] pt-7 shadow-[8px_8px_0_0_#000] sm:pt-8">
              <RankingsPodium top={podium} />
            </div>
          ) : (
            <div className="border-2 border-black bg-white px-4 py-10 text-center text-sm text-muted-foreground shadow-[6px_6px_0_0_#000]">
              No podium yet. Points land here after results publish.
            </div>
          )}

          {rest.length > 0 ? (
            <ol className="mt-4 divide-y-2 divide-black border-2 border-black bg-white shadow-[5px_5px_0_0_#000]">
              {rest.map((row) => (
                <li
                  key={row.slug ?? row.rank}
                  className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-[#f7f4ef] sm:gap-4 sm:px-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black bg-[#f7f4ef] text-display text-sm font-semibold sm:h-10 sm:w-10 sm:text-base">
                    {row.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    {row.slug ? (
                      <Link href={`/fighters/${row.slug}`} className="block truncate font-semibold hover:text-brand-red">
                        {row.displayName}
                      </Link>
                    ) : (
                      <p className="truncate font-semibold">{row.displayName}</p>
                    )}
                    {row.academy ? <p className="truncate text-xs text-muted-foreground">{row.academy}</p> : null}
                  </div>
                  <div className="shrink-0 border-2 border-black bg-white px-2 py-1 text-right shadow-[2px_2px_0_0_#000]">
                    <p className="text-display text-sm font-semibold leading-none">
                      {row.wins}-{row.losses}
                    </p>
                    <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-brand-red">
                      {row.points} pts
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </section>

        <section className="mt-14">
          <SectionBanner>Grappler cards</SectionBanner>
          <p className="mb-4 max-w-2xl bg-white px-2 py-1 text-sm">
            Dense board — tap a card for the full profile. No private contact or medical details.
          </p>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {profileCards.map((card) => (
              <li key={card.key}>
                <FighterHypeCard fighter={card.fighter} href={card.href} compact />
              </li>
            ))}
          </ul>
          {profileCards.length === 0 && <p className="text-sm text-muted-foreground">No grappler profiles yet.</p>}
        </section>
      </div>
    </main>
  );
}
