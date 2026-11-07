const FLOATERS = ["🥋", "🤼", "💪", "🏆", "🔥", "⚡", "🥊", "🎯", "🙌", "⭐"];

export function MatEmojis({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <span className="absolute left-[4%] top-[12%] text-2xl opacity-70 sm:text-3xl">🥋</span>
      <span className="absolute right-[8%] top-[18%] rotate-12 text-xl opacity-60 sm:text-2xl">🤼</span>
      <span className="absolute bottom-[16%] left-[10%] -rotate-6 text-2xl opacity-65">💪</span>
      <span className="absolute bottom-[22%] right-[12%] text-xl opacity-55">🏆</span>
      <span className="absolute left-[46%] top-[8%] text-lg opacity-50">🔥</span>
      <span className="absolute right-[28%] bottom-[10%] text-lg opacity-50">⚡</span>
    </div>
  );
}

export function EmojiStrip({ items = FLOATERS }: { items?: string[] }) {
  return (
    <p className="flex flex-wrap items-center justify-center gap-3 text-xl sm:gap-4 sm:text-2xl" aria-hidden="true">
      {items.map((emoji, index) => (
        <span key={`${emoji}-${index}`} className={index % 2 === 0 ? "-rotate-6" : "rotate-6"}>
          {emoji}
        </span>
      ))}
    </p>
  );
}
