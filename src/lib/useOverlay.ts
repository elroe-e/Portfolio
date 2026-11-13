"use client";

import { useEffect, useRef } from "react";

/**
 * Shared behaviour for full-screen layers (mobile menu, photo viewer):
 * locks page scrolling, makes the page behind unreachable by keyboard and
 * screen readers, closes on Escape, and returns focus when the layer closes.
 *
 * `backgroundIds` must be a stable array (define it outside the component).
 */
export function useOverlay(
  onClose: () => void,
  backgroundIds: readonly string[],
) {
  const close = useRef(onClose);

  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    const returnTo =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const background = backgroundIds
      .map((id) => document.getElementById(id))
      .filter((element) => element !== null);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close.current();
    };

    document.documentElement.classList.add("is-locked");
    background.forEach((element) => element.setAttribute("inert", ""));
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.classList.remove("is-locked");
      background.forEach((element) => element.removeAttribute("inert"));
      window.removeEventListener("keydown", onKeyDown);
      returnTo?.focus({ preventScroll: true });
    };
  }, [backgroundIds]);
}
