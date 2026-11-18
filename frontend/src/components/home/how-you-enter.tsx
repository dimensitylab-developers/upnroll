import { SectionBanner } from "@/components/home/section-banner";

const PATH_STEPS = [
  {
    n: "01",
    title: "Create an account",
    body: "Register as a grappler and sign in.",
  },
  {
    n: "02",
    title: "Choose a division / weight class",
    body: "Pick the division and weight class you fight in.",
  },
  {
    n: "03",
    title: "Follow the bracket",
    body: "On fight day, track every round through to the finals.",
  },
] as const;

export function HowYouEnter() {
  return (
    <section>
      <SectionBanner>How you enter</SectionBanner>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {PATH_STEPS.map((step) => (
          <li
            key={step.n}
            className="group cursor-pointer border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_#000] transition-[color,background-color,box-shadow,transform] duration-150 ease-out hover:bg-brand-red hover:text-white hover:shadow-[7px_7px_0_0_#000] active:translate-y-0.5 active:shadow-[2px_2px_0_0_#000]"
          >
            <p className="text-display text-3xl font-semibold text-brand-red transition-colors group-hover:text-white">
              {step.n}
            </p>
            <p className="mt-2 font-semibold">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
