const CARDS = [
  { title: "Takedown", line: "Level change, drive through, and finish on top." },
  { title: "Guard", line: "Closed guard. Frames in, hips close, look for the sweep." },
  { title: "Scramble", line: "Someone is out of position. Both keep fighting for the top." },
];

export function MangaCards() {
  return (
    <ul className="grid gap-5 sm:grid-cols-3">
      {CARDS.map((card) => (
        <li key={card.title} className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000]">
          <p className="border-b-2 border-black px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em]">
            {card.title}
          </p>
          <div className="aspect-[3/4] bg-white" aria-hidden="true" />
          <p className="border-t-2 border-dashed border-black px-3 py-3 text-center text-xs leading-relaxed">{card.line}</p>
        </li>
      ))}
    </ul>
  );
}
