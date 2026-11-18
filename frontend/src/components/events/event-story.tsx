import Link from "next/link";

const STOPS = [
  {
    n: "01",
    title: "Enter",
    body: "Sign up, choose your weight class and division, pay with the UPI instructions, and wait for admin confirmation.",
  },
  {
    n: "02",
    title: "Division",
    body: "Fight inside your chosen division and secure a rank based on your performance.",
  },
  {
    n: "03",
    title: "Call",
    body: "You will be notified in your Grappler account or on your profile dashboard.",
  },
  {
    n: "04",
    title: "Rules",
    body: "Every match follows the published rule set. Safety comes first, and the referee's decision is final.",
    link: true,
  },
  {
    n: "05",
    title: "Standings",
    body: "Your win will display as per your division.",
  },
];

export function EventStory({ rulesHref = "/events" }: { rulesHref?: string }) {
  return (
    <div>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STOPS.map((stop) => (
          <li key={stop.n} className="flex flex-col border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
            <p className="text-display text-3xl font-semibold leading-none text-brand-red">{stop.n}</p>
            <h3 className="mt-4 text-display text-xl font-semibold">{stop.title}</h3>
            <p className="mt-2 text-sm leading-relaxed">{stop.body}</p>
            {"link" in stop && stop.link ? (
              <Link href={rulesHref} className="mt-3 text-sm font-semibold text-brand-red underline underline-offset-4">
                Read the rules
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
