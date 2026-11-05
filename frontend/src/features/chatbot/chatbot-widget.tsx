"use client";

import { useState } from "react";
import { askChatbotAction } from "./ask-chatbot-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi — ask me about registration, events, or policies. I can only answer from published FAQs." },
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    const { answer } = await askChatbotAction(q);
    setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    setLoading(false);
  }

  if (!open) {
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full size-14 p-0 shadow-lg z-50"
        aria-label="Open support chat"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="size-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-[70vh] manga-panel flex flex-col z-50 bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
        <span className="font-medium text-sm">Up &apos;n Roll Support</span>
        <Button variant="ghost" size="icon" aria-label="Close support chat" onClick={() => setOpen(false)}>
          <X className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "manga-speech-bubble manga-speech-bubble-right ml-auto max-w-[85%]" : "manga-speech-bubble max-w-[85%]"}
          >
            {m.text}
          </div>
        ))}
        {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>
      <form onSubmit={handleAsk} className="p-3 border-t border-black/10 flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question…"
          aria-label="Your question"
        />
        <Button type="submit" size="sm" disabled={loading || !question.trim()}>Send</Button>
      </form>
    </div>
  );
}
