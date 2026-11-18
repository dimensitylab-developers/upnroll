"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Site-wide comic red follower (Sign-up punch). Desktop + fine pointer only;
 * skipped for touch and prefers-reduced-motion.
 */
export function RedCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const raf = useRef(0);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    function syncEnabled() {
      setEnabled(fine.matches && !reduce.matches);
    }
    syncEnabled();
    fine.addEventListener("change", syncEnabled);
    reduce.addEventListener("change", syncEnabled);
    return () => {
      fine.removeEventListener("change", syncEnabled);
      reduce.removeEventListener("change", syncEnabled);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const interactive = "a, button, [role='button'], input, textarea, select, label, summary";

    function onMove(event: MouseEvent) {
      target.current = { x: event.clientX, y: event.clientY };
      setVisible(true);
    }

    function onOver(event: MouseEvent) {
      const el = event.target;
      if (!(el instanceof Element)) {
        setActive(false);
        return;
      }
      setActive(Boolean(el.closest(interactive)));
    }

    function onLeave() {
      setVisible(false);
    }

    function tick() {
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;
      current.current.x += dx * 0.28;
      current.current.y += dy * 0.28;
      const node = dotRef.current;
      if (node) {
        node.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = window.requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className={`pointer-events-none fixed left-0 top-0 z-[9999] border-2 border-black bg-brand-red shadow-[3px_3px_0_0_#000] transition-[width,height,opacity,border-radius] duration-150 ease-out ${
        visible ? "opacity-90" : "opacity-0"
      } ${active ? "h-10 w-10 rounded-sm" : "h-3.5 w-3.5 rounded-full"}`}
    />
  );
}
