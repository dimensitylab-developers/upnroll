import { SectionBanner } from "@/components/home/section-banner";

const BEGINNER_ALLOWED = [
  "All standard chokes",
  "Armbar",
  "Kimura",
  "Americana",
  "Omoplata",
  "Straight foot lock (straight ankle lock)",
];

const BEGINNER_BANNED = [
  "Heel hooks",
  "Toe holds",
  "Knee bars",
  "Calf slicers",
  "Flying submissions",
  "Jumping guard",
  "Neck cranks",
  "Spine cranks",
  "Twisters",
  "Slams",
];

const ADVANCED_ALLOWED = [
  ...BEGINNER_ALLOWED,
  "Toe hold",
  "Knee bar",
  "Calf slicer",
  "Flying submissions",
  "Jumping guard",
];

const ADVANCED_BANNED = ["Heel hooks", "Neck cranks", "Spine cranks", "Twisters", "Slams"];

const SCORING = [
  { name: "Takedown", points: "2" },
  { name: "Sweep", points: "2" },
  { name: "Knee on belly", points: "2" },
  { name: "Guard pass", points: "3" },
  { name: "Mount", points: "2" },
  { name: "Back control", points: "3", note: "Hooks or a body triangle" },
];

const PENALTIES = [
  "Deliberately leaving the competition area",
  "Unsportsmanlike conduct",
  "Failure to follow referee instructions",
  "Pulling guard without attacking",
  "Stalling or lack of engagement",
];

const OUTCOMES = [
  "Submission",
  "Points",
  "Opponent disqualification",
  "Referee stoppage",
  "Opponent withdrawal",
];

function TechniqueList({ items, allowed }: { items: string[]; allowed: boolean }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className={`font-semibold ${allowed ? "text-brand-red" : ""}`} aria-hidden="true">
            {allowed ? "✓" : "×"}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PastNogiCard() {
  return (
    <div className="mt-16 border-t border-black/10 pt-14">
      <p className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-3">Past card</p>
      <SectionBanner>No-Gi Grappling</SectionBanner>
      <p className="text-muted-foreground mb-8">12 July 2026 · Andheri West, Mumbai</p>

      <h3 className="text-display text-xl font-semibold mb-3">Divisions</h3>
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        <div className="bg-card border-2 border-black rounded-md p-4 shadow-[4px_4px_0_0_#000]">
          <p className="font-semibold">Beginner</p>
          <p className="text-sm mt-1">White belts only.</p>
        </div>
        <div className="bg-brand-red text-white border-2 border-black rounded-md p-4 shadow-[4px_4px_0_0_#000]">
          <p className="font-semibold">Advanced</p>
          <p className="text-sm mt-1">Blue and purple belts.</p>
        </div>
      </div>

      <h3 className="text-display text-xl font-semibold mb-3">Match clock</h3>
      <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          ["6:00", "Total match time is six minutes."],
          ["0:00–3:00", "The first three minutes are a no-points period."],
          ["3:00–6:00", "The final three minutes are the scoring period."],
          ["Anytime", "A submission counts for the whole match."],
        ].map(([time, body]) => (
          <li key={time} className="bg-card border-2 border-black rounded-md p-4 shadow-[4px_4px_0_0_#000]">
            <p className="text-display text-brand-red font-semibold">{time}</p>
            <p className="text-sm mt-2">{body}</p>
          </li>
        ))}
      </ol>

      <h3 className="text-display text-xl font-semibold mb-1">Scoring</h3>
      <p className="text-sm text-muted-foreground mb-3">Points count only in the last three minutes.</p>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {SCORING.map((item) => (
          <li key={item.name} className="bg-card border-2 border-black rounded-md p-3 shadow-[4px_4px_0_0_#000]">
            <p className="text-display text-3xl font-semibold text-brand-red">{item.points}</p>
            <p className="font-semibold text-sm mt-1">{item.name}</p>
            {item.note && <p className="text-xs text-muted-foreground mt-1">{item.note}</p>}
          </li>
        ))}
      </ul>

      <h3 className="text-display text-xl font-semibold mb-3">What was allowed</h3>
      <div className="grid lg:grid-cols-2 gap-3 mb-8">
        {[
          { title: "Beginner division", allowed: BEGINNER_ALLOWED, banned: BEGINNER_BANNED },
          { title: "Advanced division", allowed: ADVANCED_ALLOWED, banned: ADVANCED_BANNED },
        ].map((division) => (
          <div key={division.title} className="bg-card border-2 border-black rounded-md p-4 shadow-[4px_4px_0_0_#000]">
            <p className="font-semibold mb-3">{division.title}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-2">Permitted</p>
                <TechniqueList items={division.allowed} allowed />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold mb-2">Prohibited</p>
                <TechniqueList items={division.banned} allowed={false} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <div className="bg-card border-2 border-black rounded-md p-4 shadow-[4px_4px_0_0_#000]">
          <p className="font-semibold">Minus one point each</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {PENALTIES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-sm mt-3">A penalty point may be awarded for the above. Repeated violations may result in disqualification.</p>
        </div>
        <div className="bg-card border-2 border-black rounded-md p-4 shadow-[4px_4px_0_0_#000]">
          <p className="font-semibold">A competitor may win by</p>
          <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
            {OUTCOMES.map((item) => (
              <li key={item} className="border-2 border-black rounded-md px-3 py-2">{item}</li>
            ))}
          </ul>
          <p className="text-sm mt-3">If the score is tied, the decision is based on activity, then positional control, then submission attempts.</p>
        </div>
      </div>
    </div>
  );
}
