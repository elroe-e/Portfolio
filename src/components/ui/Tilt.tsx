"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import type { PointerEvent, ReactNode } from "react";

const SPRING = { stiffness: 170, damping: 20, mass: 0.6 };

/**
 * Tilts its content in 3D towards the mouse cursor, with a soft moving highlight.
 * Touch input is ignored, so on phones the content simply stays flat.
 */
export function Tilt({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  /** Largest tilt angle, in degrees. */
  max?: number;
}) {
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useSpring(0, SPRING);
  const glare = useMotionTemplate`radial-gradient(36rem circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.12), transparent 50%)`;

  const follow = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    rotateY.set((x - 0.5) * 2 * max);
    rotateX.set((0.5 - y) * 2 * max);
    glareX.set(x * 100);
    glareY.set(y * 100);
    glareOpacity.set(1);
  };

  const release = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
  };

  return (
    <div
      className={className}
      style={{ perspective: 1400 }}
      onPointerMove={follow}
      onPointerLeave={release}
    >
      <motion.div
        className="relative"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {children}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glare, opacity: glareOpacity }}
        />
      </motion.div>
    </div>
  );
}
