export type Finish = "submission" | "points" | "stoppage" | "withdrawal";

export type DemoMatch = {
  opponentId: string;
  won: boolean;
  method: Finish;
};

export type DemoAthlete = {
  id: string;
  name: string;
  belt: "blue" | "purple";
  yearsAtBelt: number;
  yearsTraining: number;
  otherEvents: number;
  coachRating: number;
  matches: DemoMatch[];
};

export type ScoreReason = {
  label: string;
  points: number;
  note: string;
};

export type SeededAthlete = DemoAthlete & {
  rank: number;
  wins: number;
  losses: number;
  score: number;
  reasons: ScoreReason[];
};

export type BracketPair = {
  seeds: [number, number];
  a: SeededAthlete;
  b: SeededAthlete;
};

const FINISH_WEIGHT: Record<Finish, number> = {
  submission: 1.3,
  points: 1,
  stoppage: 0.85,
  withdrawal: 0.85,
};

function beltReason(athlete: DemoAthlete): ScoreReason {
  const years = athlete.yearsAtBelt;
  const beltName = athlete.belt === "purple" ? "Purple" : "Blue";
  let points = 6;
  if (athlete.belt === "purple") points = years >= 2 ? 18 : 15;
  else if (years >= 3) points = 13;
  else if (years >= 1) points = 10;
  return {
    label: "Belt and time",
    points,
    note: `${beltName} belt, ${years} ${years === 1 ? "year" : "years"} at this belt`,
  };
}

function resultsReason(athlete: DemoAthlete, roster: DemoAthlete[]): ScoreReason {
  const max = athlete.matches.length === 0 ? 45 : 47;
  if (athlete.matches.length === 0) {
    return { label: "Up ’n Roll results", points: 22, note: "No matches yet, so this starts in the middle" };
  }

  let raw = 0;
  let submissions = 0;
  for (const match of athlete.matches) {
    const opponent = roster.find((entry) => entry.id === match.opponentId);
    const played = opponent?.matches.length ?? 0;
    const opponentWins = opponent?.matches.filter((entry) => entry.won).length ?? 0;
    const strength = played === 0 ? 0.75 : 0.55 + opponentWins / played;
    const weight = FINISH_WEIGHT[match.method];
    if (match.won) {
      raw += 7 * strength * weight;
      if (match.method === "submission") submissions += 1;
    } else {
      raw -= 2.5 * strength;
    }
  }

  const wins = athlete.matches.filter((match) => match.won).length;
  const winWord = wins === 1 ? "win" : "wins";
  const note = submissions > 0 ? `${wins} ${winWord}, ${submissions} by submission` : `${wins} ${winWord} on Up ’n Roll`;
  return {
    label: "Up ’n Roll results",
    points: Math.max(0, Math.min(max, Math.round(18 + raw))),
    note,
  };
}

function experienceReason(athlete: DemoAthlete): ScoreReason {
  const own = Math.min(6, athlete.matches.length);
  const points = Math.min(15, athlete.otherEvents * 3 + own);
  return {
    label: "Competition experience",
    points,
    note: athlete.otherEvents > 0
      ? `${athlete.otherEvents} verified ${athlete.otherEvents === 1 ? "event" : "events"} outside this card`
      : "No verified results outside Up ’n Roll",
  };
}

function yearsReason(athlete: DemoAthlete): ScoreReason {
  return {
    label: "Years training",
    points: Math.min(10, Math.round(athlete.yearsTraining * 2)),
    note: `${athlete.yearsTraining} ${athlete.yearsTraining === 1 ? "year" : "years"} training`,
  };
}

function formReason(athlete: DemoAthlete): ScoreReason {
  const recent = athlete.matches.slice(-3);
  if (recent.length === 0) {
    return { label: "Recent form", points: 5, note: "No recent matches, so this stays in the middle" };
  }
  const wins = recent.filter((match) => match.won).length;
  return {
    label: "Recent form",
    points: Math.round((wins / recent.length) * 10),
    note: `${wins} of the last ${recent.length} ${recent.length === 1 ? "match" : "matches"}`,
  };
}

function coachReason(athlete: DemoAthlete): ScoreReason {
  if (athlete.matches.length > 0) {
    return { label: "Coach rating", points: 0, note: "Left out once an Up ’n Roll record exists" };
  }
  return {
    label: "Coach rating",
    points: Math.round((athlete.coachRating / 5) * 2),
    note: `Coach rating ${athlete.coachRating} of 5, for a new athlete`,
  };
}

export function scoreBoard(roster: DemoAthlete[]): SeededAthlete[] {
  const scored = roster.map((athlete) => {
    const wins = athlete.matches.filter((match) => match.won).length;
    const losses = athlete.matches.length - wins;
    const reasons = [
      resultsReason(athlete, roster),
      beltReason(athlete),
      experienceReason(athlete),
      yearsReason(athlete),
      formReason(athlete),
      coachReason(athlete),
    ];
    const score = Math.max(0, Math.min(100, reasons.reduce((sum, reason) => sum + reason.points, 0)));
    return { ...athlete, wins, losses, score, reasons, rank: 0 };
  });

  scored.sort((a, b) => b.score - a.score || b.wins - a.wins || a.name.localeCompare(b.name));
  return scored.map((athlete, index) => ({ ...athlete, rank: index + 1 }));
}

export function bracketOf(seeded: SeededAthlete[]): { halfA: BracketPair[]; halfB: BracketPair[] } | null {
  if (seeded.length !== 8) return null;
  const byRank = new Map(seeded.map((athlete) => [athlete.rank, athlete]));
  const pair = (left: number, right: number): BracketPair => ({
    seeds: [left, right],
    a: byRank.get(left)!,
    b: byRank.get(right)!,
  });
  return {
    halfA: [pair(1, 8), pair(4, 5)],
    halfB: [pair(2, 7), pair(3, 6)],
  };
}

export function applyResult(
  roster: DemoAthlete[],
  fighterA: string,
  fighterB: string,
  winnerId: string,
  method: Finish
): DemoAthlete[] {
  const loserId = winnerId === fighterA ? fighterB : fighterA;
  return roster.map((athlete) => {
    if (athlete.id === winnerId) {
      return { ...athlete, matches: [...athlete.matches, { opponentId: loserId, won: true, method }] };
    }
    if (athlete.id === loserId) {
      return { ...athlete, matches: [...athlete.matches, { opponentId: winnerId, won: false, method }] };
    }
    return athlete;
  });
}

function bout(roster: DemoAthlete[], winnerId: string, loserId: string, method: Finish) {
  roster.find((athlete) => athlete.id === winnerId)?.matches.push({ opponentId: loserId, won: true, method });
  roster.find((athlete) => athlete.id === loserId)?.matches.push({ opponentId: winnerId, won: false, method });
}

export function seedRoster(): DemoAthlete[] {
  const roster: DemoAthlete[] = [
    { id: "suketu", name: "Suketu Bhuva", belt: "purple", yearsAtBelt: 6, yearsTraining: 12, otherEvents: 5, coachRating: 5, matches: [] },
    { id: "james", name: "James Lewis", belt: "purple", yearsAtBelt: 4, yearsTraining: 8, otherEvents: 3, coachRating: 4, matches: [] },
    { id: "suraj", name: "Suraj Phirke", belt: "blue", yearsAtBelt: 3, yearsTraining: 5, otherEvents: 2, coachRating: 4, matches: [] },
    { id: "deep", name: "Deep Godani", belt: "blue", yearsAtBelt: 1, yearsTraining: 2, otherEvents: 1, coachRating: 3, matches: [] },
    { id: "ravi", name: "Ravi Iyer", belt: "purple", yearsAtBelt: 4, yearsTraining: 5, otherEvents: 4, coachRating: 5, matches: [] },
    { id: "aman", name: "Aman Desai", belt: "blue", yearsAtBelt: 3, yearsTraining: 5, otherEvents: 4, coachRating: 4, matches: [] },
    { id: "neel", name: "Neel Joshi", belt: "blue", yearsAtBelt: 0.5, yearsTraining: 2, otherEvents: 0, coachRating: 3, matches: [] },
    { id: "kabir", name: "Kabir Nair", belt: "blue", yearsAtBelt: 0.5, yearsTraining: 1, otherEvents: 0, coachRating: 4, matches: [] },
  ];

  bout(roster, "suketu", "ravi", "submission");
  bout(roster, "suketu", "james", "points");
  bout(roster, "suketu", "suraj", "submission");
  bout(roster, "ravi", "aman", "submission");
  bout(roster, "ravi", "suraj", "points");
  bout(roster, "ravi", "neel", "points");
  bout(roster, "james", "suraj", "points");
  bout(roster, "james", "deep", "points");
  bout(roster, "aman", "james", "points");
  bout(roster, "aman", "deep", "submission");
  bout(roster, "aman", "neel", "points");
  bout(roster, "suraj", "deep", "points");
  bout(roster, "suraj", "neel", "points");
  bout(roster, "deep", "neel", "submission");

  return roster.map((athlete) => ({ ...athlete, matches: athlete.matches.map((match) => ({ ...match })) }));
}
