export type FlowFighter = { id: string; name: string };

export type FlowMatch = {
  id: string;
  top: FlowFighter | null;
  bottom: FlowFighter | null;
  winnerId: string | null;
};

export type BracketFlow = {
  forward: FlowMatch[];
  out: FlowMatch[];
};

type Side = "top" | "bottom";
type Feed = { id: string; side: Side };

const FORWARD_WIN: Record<string, Feed> = {
  q0: { id: "s0", side: "top" },
  q1: { id: "s0", side: "bottom" },
  q2: { id: "s1", side: "top" },
  q3: { id: "s1", side: "bottom" },
  s0: { id: "f0", side: "top" },
  s1: { id: "f0", side: "bottom" },
};

const OUT_WIN: Record<string, Feed> = {
  o0: { id: "o2", side: "top" },
  o1: { id: "o2", side: "bottom" },
  o2: { id: "o4", side: "top" },
  o3: { id: "o4", side: "bottom" },
};

const DROP: Record<string, Feed> = {
  q0: { id: "o0", side: "top" },
  q1: { id: "o0", side: "bottom" },
  q2: { id: "o1", side: "top" },
  q3: { id: "o1", side: "bottom" },
  s0: { id: "o3", side: "top" },
  s1: { id: "o3", side: "bottom" },
};

function emptyMatch(id: string): FlowMatch {
  return { id, top: null, bottom: null, winnerId: null };
}

export function openingFlow(seeded: { id: string; name: string; rank: number }[]): BracketFlow {
  const byRank = new Map(seeded.map((athlete) => [athlete.rank, { id: athlete.id, name: athlete.name }]));
  const at = (rank: number) => byRank.get(rank) ?? null;
  return {
    forward: [
      { id: "q0", top: at(1), bottom: at(8), winnerId: null },
      { id: "q1", top: at(4), bottom: at(5), winnerId: null },
      { id: "q2", top: at(2), bottom: at(7), winnerId: null },
      { id: "q3", top: at(3), bottom: at(6), winnerId: null },
      emptyMatch("s0"),
      emptyMatch("s1"),
      emptyMatch("f0"),
    ],
    out: [emptyMatch("o0"), emptyMatch("o1"), emptyMatch("o2"), emptyMatch("o3"), emptyMatch("o4")],
  };
}

function place(matches: FlowMatch[], feed: Feed | undefined, fighter: FlowFighter) {
  if (!feed) return;
  const match = matches.find((entry) => entry.id === feed.id);
  if (!match) return;
  match[feed.side] = fighter;
}

export function decideMatch(flow: BracketFlow, matchId: string, winnerId: string): BracketFlow {
  const next: BracketFlow = structuredClone(flow);
  const match = [...next.forward, ...next.out].find((entry) => entry.id === matchId);
  if (!match || match.winnerId || !match.top || !match.bottom) return flow;
  if (match.top.id !== winnerId && match.bottom.id !== winnerId) return flow;

  match.winnerId = winnerId;
  const winner = match.top.id === winnerId ? match.top : match.bottom;
  const loser = match.top.id === winnerId ? match.bottom : match.top;
  place(next.forward, FORWARD_WIN[matchId], winner);
  place(next.out, OUT_WIN[matchId], winner);
  place(next.out, DROP[matchId], loser);
  return next;
}

export const FORWARD_ROUNDS: { title: string; ids: string[] }[] = [
  { title: "Opening", ids: ["q0", "q1", "q2", "q3"] },
  { title: "Semis", ids: ["s0", "s1"] },
  { title: "Final", ids: ["f0"] },
];

export const OUT_ROUNDS: { title: string; ids: string[] }[] = [
  { title: "Dropped in", ids: ["o0", "o1"] },
  { title: "Still forward", ids: ["o2", "o3"] },
  { title: "Last step", ids: ["o4"] },
];
