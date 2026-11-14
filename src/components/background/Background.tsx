"use client";

import { motion, useScroll, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import type { HeroPhoto } from "@/content/media";
import { Component, type ReactNode, useEffect, useState } from "react";

// The 3D scene is loaded separately, after the page itself, so it never slows
// down the first paint.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** If WebGL is unavailable the scene is skipped and the gradient backdrop stays. */
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function Background({ photos }: { photos: HeroPhoto[] }) {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  // Full strength behind the hero, quieter behind the reading sections.
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 800], [1, 0.7]);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setMounted(true), {
        timeout: 1200,
      });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="backdrop-glow absolute inset-0" />

      <motion.div
        style={{ opacity }}
        className="absolute left-0 top-0 h-lvh w-full"
      >
        <div
          className={`h-full w-full transition-opacity duration-[1800ms] ease-out ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          {mounted && (
            <SceneBoundary>
              <Scene photos={photos} onReady={() => setReady(true)} />
            </SceneBoundary>
          )}
        </div>
      </motion.div>

      <div className="grain absolute inset-0 opacity-(--grain)" />
      <div className="vignette absolute inset-0" />
    </div>
  );
}
