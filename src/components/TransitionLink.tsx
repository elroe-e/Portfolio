"use client";

import { type ComponentProps, type MouseEvent, useEffect } from "react";

/** Must match the shutter-closing transition in globals.css ("Page transitions"). */
const CLOSE_MS = 550;

/** Read by the inline script in the root layout to shorten the next intro. */
export const ARRIVING_KEY = "shutter";

/**
 * A link to another page of the site. The shutter closes over the current page,
 * the next page loads behind it, and its intro opens the shutter again.
 */
export function TransitionLink({
  href,
  onClick,
  ...props
}: ComponentProps<"a"> & { href: string }) {
  // Coming back with the browser's back button can restore this page from
  // memory with the shutter still closed — open it again.
  useEffect(() => {
    const onShow = () =>
      document.documentElement.classList.remove("is-leaving");
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const go = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const newTab =
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (event.defaultPrevented || newTab || reduced) return;

    event.preventDefault();
    try {
      sessionStorage.setItem(ARRIVING_KEY, "1");
    } catch {
      // Without storage the next page simply plays its full intro.
    }
    document.documentElement.classList.add("is-leaving");
    window.setTimeout(() => window.location.assign(href), CLOSE_MS);
  };

  return <a href={href} onClick={go} {...props} />;
}
