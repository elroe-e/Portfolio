"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

const EXPO = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.95, delay, ease: EXPO }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slides a line of text up from behind a mask — used for the big headings.
 * Renders inline so it can sit inside an <h2>.
 */
export function RevealLine({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
      <motion.span
        className={`block ${className ?? ""}`}
        initial={{ y: "112%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.05, delay, ease: EXPO }}
      >
        {children}
      </motion.span>
    </span>
  );
}
