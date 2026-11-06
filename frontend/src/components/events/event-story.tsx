const STOPS = [
  {
    title: "You enter",
    body: "Create a fighter account, choose an open division, and agree to the rules. Payment is the organizer’s QR instructions. An admin confirms your place before your name is on the card.",
  },
  {
    title: "You get a division",
    body: "A division is the group you fight in: a name, a discipline such as grappling or MMA, and a set number of spots. You meet the athletes in that group. Organizers may merge a small division.",
  },
  {
    title: "You get a mat",
    body: "The floor is split into mats. Two, four, or more. Each open match is given one mat, and you follow the mat you are assigned to.",
  },
  {
    title: "You are called",
    body: "When your bout is up, you step on. Warm up when it is inside 15 minutes. The referee runs the match, and safety comes before the score.",
  },
  {
    title: "The result stays up",
    body: "Brackets keep every round. The schedule keeps the call times. Results keep who won. A past card keeps its date.",
  },
];

export function EventStory() {
  return (
    <ol className="border-l-2 border-black">
      {STOPS.map((stop) => (
        <li key={stop.title} className="relative pb-10 pl-8 last:pb-0">
          <span className="absolute top-1.5 -left-[7px] size-3 border-2 border-black bg-brand-red" aria-hidden="true" />
          <h3 className="text-display text-2xl font-semibold">{stop.title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed">{stop.body}</p>
        </li>
      ))}
    </ol>
  );
}
