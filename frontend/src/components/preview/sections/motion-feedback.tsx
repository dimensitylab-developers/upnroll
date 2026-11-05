"use client";

import { useState } from "react";
import { Chapter, FixtureBadge } from "../chapter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function MotionFeedback() {
  const [revealed, setRevealed] = useState(false);

  return (
    <Chapter id="motion-feedback" title="Motion and Feedback" subtitle="Deliberate motion vocabulary: masked reveal, result-reveal, and a live-pulse status indicator. Respects prefers-reduced-motion (see .live-pulse rule in globals.css).">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="manga-panel p-6">
          <p className="text-sm font-semibold text-muted-foreground mb-3">Masked heading reveal</p>
          <Button size="sm" variant="outline" onClick={() => setRevealed((r) => !r)} className="mb-4">
            {revealed ? "Reset" : "Play reveal"}
          </Button>
          <div className="overflow-hidden h-12">
            <motion.p
              className="text-display text-3xl font-semibold"
              initial={{ y: "100%" }}
              animate={{ y: revealed ? "0%" : "100%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              WINNER
            </motion.p>
          </div>
        </div>

        <div className="manga-panel p-6">
          <p className="text-sm font-semibold text-muted-foreground mb-3">Result reveal transition</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={revealed ? "result" : "pending"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="h-12 flex items-center"
            >
              {revealed ? (
                <span className="text-brand-gold font-semibold">Rhea Kolhapure wins by submission</span>
              ) : (
                <span className="text-muted-foreground">Awaiting result…</span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="manga-panel p-6">
          <p className="text-sm font-semibold text-muted-foreground mb-3">Live-state pulse (reduced-motion safe)</p>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-brand-cyan live-pulse" />
            <span className="text-sm">Mat 2 — live</span>
          </div>
        </div>

        <div className="manga-panel p-6">
          <p className="text-sm font-semibold text-muted-foreground mb-3">Button feedback</p>
          <motion.div whileTap={{ scale: 0.96 }} className="inline-block">
            <Button>Press me</Button>
          </motion.div>
        </div>
      </div>
      <FixtureBadge>GSAP reserved for longer sequenced reveals (e.g. bracket draw); Framer Motion used here for component-level transitions — not both for the same animation</FixtureBadge>
    </Chapter>
  );
}
