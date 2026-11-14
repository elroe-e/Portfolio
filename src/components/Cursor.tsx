"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

type Mode = "idle" | "link" | "view";

const SPRING = { stiffness: 420, damping: 34, mass: 0.5 };

/**
 * A ring that trails the mouse, grows over anything clickable and reads
 * "View" over photos. It sits on top of the normal cursor and never appears
 * on touch screens.
 */
export function Cursor({ viewLabel }: { viewLabel: string }) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, SPRING);
  const ringY = useSpring(y, SPRING);

  useEffect(() => {
    const hasMouse = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const wantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (!hasMouse || !wantsMotion) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);

      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("[data-cursor='view']")) setMode("view");
      else if (target?.closest("a, button")) setMode("link");
      else setMode("idle");
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y]);

  const size = mode === "view" ? 76 : mode === "link" ? 46 : 26;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90]"
      style={{ x: ringX, y: ringY }}
    >
      <motion.div
        className={`grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
          mode === "view"
            ? "border-ember bg-ember text-ink"
            : mode === "link"
              ? "border-ember bg-ember/10"
              : "border-bone/50"
        }`}
        animate={{ width: size, height: size, opacity: visible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        {mode === "view" && viewLabel}
      </motion.div>
    </motion.div>
  );
}
