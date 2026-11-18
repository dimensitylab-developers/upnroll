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

const CARD_CLASS =
  "group flex cursor-pointer flex-col border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000] transition-[color,background-color,box-shadow,transform] duration-150 ease-out hover:bg-brand-red hover:text-white hover:shadow-[6px_6px_0_0_#000] active:translate-y-0.5 active:shadow-[2px_2px_0_0_#000]";

export function EventStory({ rulesHref = "/events" }: { rulesHref?: string }) {
  return (
    <div>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STOPS.map((stop) => (
          <li key={stop.n} className={CARD_CLASS}>
            <p className="text-display text-3xl font-semibold leading-none text-brand-red transition-colors group-hover:text-white">
              {stop.n}
            </p>
            <h3 className="mt-4 text-display text-xl font-semibold">{stop.title}</h3>
            <p className="mt-2 text-sm leading-relaxed">{stop.body}</p>
            {"link" in stop && stop.link ? (
              <Link
                href={rulesHref}
                className="mt-3 text-sm font-semibold text-brand-red underline underline-offset-4 transition-colors group-hover:text-white"
              >
                Read the rules
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
