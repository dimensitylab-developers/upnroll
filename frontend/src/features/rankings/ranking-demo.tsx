"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SectionBanner } from "@/components/home/section-banner";
import { applyResult, scoreBoard, seedRoster, type Finish } from "./seeding";
import { decideMatch, openingFlow } from "./bracket-flow";
import { BracketChart } from "./bracket-chart";

const FINISHES: { value: Finish; label: string }[] = [
  { value: "submission", label: "Submission" },
  { value: "points", label: "Points" },
  { value: "stoppage", label: "Referee stoppage" },
  { value: "withdrawal", label: "Withdrawal" },
];

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function RankingDemo() {
  const [roster, setRoster] = useState(seedRoster);
  const [fighterA, setFighterA] = useState("");
  const [fighterB, setFighterB] = useState("");
  const [winnerId, setWinnerId] = useState("");
  const [method, setMethod] = useState<Finish>("submission");
  const [note, setNote] = useState("");
  const [flow, setFlow] = useState(() => openingFlow(scoreBoard(seedRoster())));

  const board = useMemo(() => scoreBoard(roster), [roster]);
  const pairReady = fighterA !== "" && fighterB !== "" && fighterA !== fighterB;
  const winnerReady = winnerId === fighterA || winnerId === fighterB;

  function recordResult() {
    if (!pairReady || !winnerReady) return;
    const winner = board.find((athlete) => athlete.id === winnerId);
    const loserId = winnerId === fighterA ? fighterB : fighterA;
    const loser = board.find((athlete) => athlete.id === loserId);
    const finish = FINISHES.find((entry) => entry.value === method)?.label ?? method;
    setRoster((current) => applyResult(current, fighterA, fighterB, winnerId, method));
    setNote(`${winner?.name ?? "Winner"} def. ${loser?.name ?? "opponent"} by ${finish.toLowerCase()}. Results and recent form moved the board.`);
    setWinnerId("");
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <SectionBanner>Hard limits</SectionBanner>
        <p className="copy-slab max-w-3xl text-sm">
          Gender, belt band, weight, and age decide who can meet. This board is one group: men, blue and purple belts, one weight band. The score only sorts people inside that group.
        </p>
      </section>

      <section className="space-y-4">
        <SectionBanner>Score out of 100</SectionBanner>
        <ul className="grid max-w-3xl gap-2 text-sm sm:grid-cols-2">
          <li className="copy-slab">Up ’n Roll results, about 45. A finish against a stronger athlete counts more.</li>
          <li className="copy-slab">Belt and time at that belt, about 18. Purple sits above blue.</li>
          <li className="copy-slab">Verified competition experience, 15.</li>
          <li className="copy-slab">Years training, 10. Useful, and still a weak signal on its own.</li>
          <li className="copy-slab">Last two or three matches, 10.</li>
          <li className="copy-slab">Coach rating, 2, and only when there is no Up ’n Roll record.</li>
        </ul>
        <ol className="space-y-3">
          {board.map((athlete) => (
            <li key={athlete.id} className="manga-panel p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-display text-xl font-semibold">
                  #{athlete.rank} {athlete.name}
                </p>
                <p className="text-display text-2xl text-brand-red">{athlete.score}</p>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {athlete.belt === "purple" ? "Purple" : "Blue"} belt · {athlete.wins}-{athlete.losses}
                {athlete.matches.length === 0 ? " · new on the card" : ""}
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {athlete.reasons.map((reason) => (
                  <li key={reason.label}>
                    <span className="font-medium">{reason.label} {reason.points}.</span> {reason.note}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <SectionBanner>The card</SectionBanner>
        <p className="copy-slab max-w-3xl text-sm">
          Seed 1 and seed 2 open in opposite halves. Two lines run on the card: one keeps moving forward, and the one who is out drops down and keeps moving on the second line.
        </p>
        <BracketChart
          flow={flow}
          onDecide={(matchId, winnerId) => {
            const match = [...flow.forward, ...flow.out].find((entry) => entry.id === matchId);
            const loserId = match?.top?.id === winnerId ? match.bottom?.id : match?.top?.id;
            const winner = board.find((athlete) => athlete.id === winnerId);
            const loser = board.find((athlete) => athlete.id === loserId);
            setFlow((current) => decideMatch(current, matchId, winnerId));
            if (loserId) setRoster((current) => applyResult(current, winnerId, loserId, winnerId, method));
            if (winner && loser) {
              const finish = FINISHES.find((entry) => entry.value === method)?.label ?? method;
              setNote(`${winner.name} slides forward. ${loser.name} drops down. ${finish}.`);
            }
          }}
        />
        {note && <p className="copy-slab text-sm">{note}</p>}
      </section>

      <section className="space-y-4">
        <SectionBanner>Judge panel</SectionBanner>
        <p className="copy-slab max-w-3xl text-sm">
          Record a result from the mat. The score and the list move. Clicking a name on the card is what slides someone forward. Nothing here is written to the live rankings table.
        </p>
        <div className="manga-panel p-4 grid sm:grid-cols-2 gap-4 max-w-3xl">
          <div>
            <Label htmlFor="fighter-a" className="mb-1.5 block">Fighter A</Label>
            <select id="fighter-a" className={selectClass} value={fighterA} onChange={(event) => { setFighterA(event.target.value); setWinnerId(""); }}>
              <option value="">Choose</option>
              {board.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>{athlete.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="fighter-b" className="mb-1.5 block">Fighter B</Label>
            <select id="fighter-b" className={selectClass} value={fighterB} onChange={(event) => { setFighterB(event.target.value); setWinnerId(""); }}>
              <option value="">Choose</option>
              {board.map((athlete) => (
                <option key={athlete.id} value={athlete.id} disabled={athlete.id === fighterA}>{athlete.name}</option>
              ))}
            </select>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium mb-1.5">Winner</legend>
            <div className="flex flex-wrap gap-4">
              {[fighterA, fighterB].filter(Boolean).map((id) => {
                const athlete = board.find((entry) => entry.id === id);
                if (!athlete || !pairReady) return null;
                return (
                  <label key={id} className="flex items-center gap-2 text-sm">
                    <input type="radio" name="winner" checked={winnerId === id} onChange={() => setWinnerId(id)} />
                    {athlete.name}
                  </label>
                );
              })}
              {!pairReady && <p className="text-sm text-muted-foreground">Choose two different fighters.</p>}
            </div>
          </fieldset>
          <div className="sm:col-span-2">
            <Label htmlFor="finish" className="mb-1.5 block">How it ended</Label>
            <select id="finish" className={selectClass} value={method} onChange={(event) => setMethod(event.target.value as Finish)}>
              {FINISHES.map((finish) => (
                <option key={finish.value} value={finish.value}>{finish.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <Button type="button" disabled={!pairReady || !winnerReady} onClick={recordResult}>Record result</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const fresh = seedRoster();
                setRoster(fresh);
                setFlow(openingFlow(scoreBoard(fresh)));
                setNote("");
                setFighterA("");
                setFighterB("");
                setWinnerId("");
              }}
            >
              Reset the board
            </Button>
          </div>
        </div>
      </section>

      <p className="copy-slab max-w-3xl text-sm text-muted-foreground">
        After a few events, the results slice can switch to an Elo-style rating that updates after every match and accounts for opponent strength. This page keeps the six weights from the seeding sheet so the reasons stay visible.
      </p>
    </div>
  );
}
