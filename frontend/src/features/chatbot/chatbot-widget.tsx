"use client";

import { useEffect, useRef, useState } from "react";
import { askChatbotAction } from "./ask-chatbot-action";
import { setSkipPageLoader } from "@/components/layout/page-loader-skip";

type Message = { role: "user" | "assistant"; text: string };

const TYPING_PAUSE_MS = 900;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2" aria-live="polite" aria-label="Typing">
      <span className="shrink-0">
        <LogoRobot small soft />
      </span>
      <p className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm">
        <span className="size-1.5 animate-bounce rounded-full bg-black/45 [animation-delay:0ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-black/45 [animation-delay:150ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-black/45 [animation-delay:300ms]" />
      </p>
    </div>
  );
}

function Mark({ className }: { className: string }) {
  return <img src="/logo-mark.png" alt="" width={40} height={48} className={className} />;
}

function LogoRobot({ small = false, soft = false }: { small?: boolean; soft?: boolean }) {
  return (
    <span className={small ? "relative block size-9" : "relative block size-[3.75rem]"}>
      {!small && (
        <>
          <span className="absolute left-[22%] top-0 h-3 w-0.5 -translate-y-full bg-black" aria-hidden="true" />
          <span className="absolute left-[22%] top-0 size-2 -translate-x-[3px] -translate-y-[calc(100%+10px)] rounded-full border border-black bg-brand-red" aria-hidden="true" />
          <span className="absolute right-[22%] top-0 h-3 w-0.5 -translate-y-full bg-black" aria-hidden="true" />
          <span className="absolute right-[22%] top-0 size-2 translate-x-[3px] -translate-y-[calc(100%+10px)] rounded-full border border-black bg-brand-red" aria-hidden="true" />
          <span className="absolute top-1/2 left-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white" aria-hidden="true" />
          <span className="absolute top-1/2 right-0 size-3 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white" aria-hidden="true" />
        </>
      )}
      <span
        className={`flex size-full items-center justify-center rounded-full bg-white ${
          soft ? "shadow-[0_4px_12px_rgba(0,0,0,0.12)]" : "border-2 border-black shadow-[3px_3px_0_0_#000]"
        }`}
      >
        <Mark className={small ? "h-5 w-4 object-contain" : "h-8 w-6 object-contain"} />
      </span>
    </span>
  );
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi, how can I help you? Ask me about registration, events, or the rules.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
    inputRef.current?.focus();
  }, [open, messages, loading]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    setSkipPageLoader(true);
    try {
      const [{ answer }] = await Promise.all([askChatbotAction(q), wait(TYPING_PAUSE_MS)]);
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    } finally {
      setSkipPageLoader(false);
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open && (
        <section
          className="mb-3 flex h-[min(28rem,70vh)] w-[min(22.5rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
          aria-label="Up 'n Roll chat"
        >
          <header className="flex items-center gap-3 px-4 py-3.5">
            <LogoRobot small soft />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-none">Up &apos;n Roll</p>
              <p className="mt-1 text-xs text-muted-foreground">How can I help you?</p>
            </div>
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-full text-lg leading-none text-muted-foreground hover:bg-black/5"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>
          <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f6f5f3] px-4 py-4">
            {messages.map((m, i) =>
              m.role === "assistant" ? (
                <div key={i} className="flex items-end gap-2">
                  <span className="shrink-0"><LogoRobot small soft /></span>
                  <p className="max-w-[80%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm leading-relaxed shadow-sm">{m.text}</p>
                </div>
              ) : (
                <p key={i} className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand-red px-3.5 py-2.5 text-sm leading-relaxed text-white">
                  {m.text}
                </p>
              ),
            )}
            {loading && <TypingDots />}
          </div>
          <form onSubmit={handleAsk} className="flex items-center gap-2 px-3 py-3">
            <input
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type a message…"
              aria-label="Your question"
              className="h-11 min-w-0 flex-1 rounded-full bg-[#f3f2f0] px-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              aria-label="Send"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-red text-white disabled:opacity-40"
            >
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="currentColor">
                <path d="M3.2 9.2 16.5 3.4c.7-.3 1.4.4 1.1 1.1l-5.8 13.3c-.3.7-1.3.6-1.5-.1l-1.6-5.4-5.4-1.6c-.7-.2-.8-1.2-.1-1.5Z" />
              </svg>
            </button>
          </form>
        </section>
      )}

      {!open && (
        <div className="group relative mt-4">
          <span className="pointer-events-none absolute bottom-3 right-[calc(100%+0.45rem)] whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-xs opacity-0 shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            Hi, how can I help you?
          </span>
          <button
            type="button"
            className="chatbot-float"
            aria-label="Open support chat"
            aria-expanded={false}
            onClick={() => setOpen(true)}
          >
            <LogoRobot />
          </button>
        </div>
      )}
    </div>
  );
}
