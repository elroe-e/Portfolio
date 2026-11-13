"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

/**
 * Eases mouse-wheel scrolling so the page glides instead of stepping.
 * Only used with a mouse or trackpad: phones already scroll smoothly, and
 * visitors who ask for reduced motion keep the browser's normal scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    const wantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const hasMouse = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (!wantsMotion || !hasMouse) return;

    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.11 });

    // Hold still while the menu or photo viewer has the page locked.
    const root = document.documentElement;
    const sync = () =>
      root.classList.contains("is-locked") ? lenis.stop() : lenis.start();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      lenis.destroy();
    };
  }, []);

  return null;
}
