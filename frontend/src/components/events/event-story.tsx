const STOPS = [
  {
    n: "01",
    title: "Enter",
    body: "Sign up, choose a weight class / division, pay with the UPI instructions, and wait for admin confirmation.",
  },
  {
    n: "02",
    title: "Division",
    body: "You fight inside one group: name, discipline, and a set number of spots. Small groups may merge.",
  },
  {
    n: "03",
    title: "Mat",
    body: "The floor is split into mats. Your bout gets one. Follow the mat you are assigned.",
  },
  {
    n: "04",
    title: "Call",
    body: "When your name is up, you step on. The referee runs the match. Safety comes before the score.",
  },
  {
    n: "05",
    title: "Result",
    body: "Brackets, call times, and winners stay published. A past card keeps its date on the record.",
  },
];

export function EventStory() {
  return (
    <div>
      <p className="copy-slab mb-6 max-w-xl text-sm leading-relaxed">
        From the form to the mat to the board. Five steps.
      </p>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STOPS.map((stop) => (
          <li key={stop.n} className="flex flex-col border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
            <p className="text-display text-3xl font-semibold leading-none text-brand-red">{stop.n}</p>
            <h3 className="mt-4 text-display text-xl font-semibold">{stop.title}</h3>
            <p className="mt-2 text-sm leading-relaxed">{stop.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
