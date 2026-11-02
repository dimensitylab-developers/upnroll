"use client";

import { useState } from "react";
import { Chapter, FixtureBadge } from "../chapter";
import { Button } from "@/components/ui/button";
import { previewChatScript } from "@/lib/preview/fixtures";
import { MessageCircle, X, Loader2 } from "lucide-react";

export function Chatbot() {
  const [open, setOpen] = useState(true);
  const [shown, setShown] = useState(2);
  const [loading, setLoading] = useState(false);

  const advance = () => {
    if (shown >= previewChatScript.length) return;
    setLoading(true);
    setTimeout(() => {
      setShown((s) => s + 1);
      setLoading(false);
    }, 600);
  };

  return (
    <Chapter id="chatbot" title="Chatbot" subtitle="Scripted demonstration using fictional examples, bounded to approved-FAQ-style answers — including an honest unsupported-question fallback (last message below).">
      <div className="relative h-[420px] max-w-sm">
        {!open && (
          <Button className="rounded-full size-14 p-0" aria-label="Open chat demo" onClick={() => setOpen(true)}>
            <MessageCircle className="size-6" />
          </Button>
        )}
        {open && (
          <div className="manga-panel flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
              <span className="font-medium text-sm">Up &apos;n Roll Support — UI demo</span>
              <Button variant="ghost" size="icon" aria-label="Close chat" onClick={() => setOpen(false)}><X className="size-4" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {previewChatScript.slice(0, shown).map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "manga-speech-bubble manga-speech-bubble-right ml-auto max-w-[80%]"
                      : "manga-speech-bubble max-w-[80%]"
                  }
                >
                  {m.text}
                </div>
              ))}
              {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            </div>
            <div className="p-3 border-t border-black/10">
              <Button size="sm" className="w-full" disabled={shown >= previewChatScript.length} onClick={advance}>
                {shown >= previewChatScript.length ? "Scripted demo complete" : "Show next scripted exchange"}
              </Button>
            </div>
          </div>
        )}
      </div>
      <FixtureBadge>Scripted conversation — not a real chatbot integration</FixtureBadge>
    </Chapter>
  );
}
