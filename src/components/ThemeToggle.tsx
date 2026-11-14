"use client";

import { useSyncExternalStore } from "react";
import type { Copy } from "@/content/site";

export type Theme = "dark" | "light";

/** Shared with the inline script in the root layout, which applies it before paint. */
export const THEME_KEY = "theme";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

/** The current theme, kept in sync with the `data-theme` attribute on <html>. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "dark");
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  // A short-lived class lets every colour cross-fade instead of snapping.
  root.classList.add("theme-switching");
  root.dataset.theme = theme;
  window.setTimeout(() => root.classList.remove("theme-switching"), 450);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode or blocked storage: the choice just won't be remembered.
  }
}

export function ThemeToggle({ labels }: { labels: Copy["nav"] }) {
  const theme = useTheme();
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={next === "light" ? labels.toLight : labels.toDark}
      title={next === "light" ? labels.toLight : labels.toDark}
      className="group relative grid size-9 place-items-center overflow-hidden rounded-full border border-line text-bone transition-colors duration-300 hover:border-bone/60"
    >
      {/* Sun and moon swap places with a little rotation. */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={`absolute size-4 transition-all duration-500 ease-expo ${
          theme === "dark"
            ? "rotate-0 opacity-100"
            : "-rotate-90 scale-50 opacity-0"
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={`absolute size-4 transition-all duration-500 ease-expo ${
          theme === "light"
            ? "rotate-0 opacity-100"
            : "rotate-90 scale-50 opacity-0"
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}
