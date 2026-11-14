/**
 * File-name rules shared by the admin page (browser) and the API (server).
 * Every image the admin writes is a .jpg resized in the browser.
 */

/** "Night Bus!" → "night-bus" */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** "02-street-life" → "Street life" (same rule as scripts/sync-photos.mjs) */
export function humanize(name: string): string {
  const text = name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/^\d+[\s._-]*/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

/** public/photos/02-street/01 night.jpg → /photos/02-street/01%20night.jpg */
export function publicUrl(path: string): string {
  return (
    "/" +
    path
      .replace(/^public\//, "")
      .split("/")
      .map(encodeURIComponent)
      .join("/")
  );
}

export const IMAGE_FILE = /\.(jpe?g|png|webp|avif)$/i;

/** Paths the admin may create. */
const WRITABLE_IMAGE =
  /^public\/(?:photos\/[a-z0-9][a-z0-9-]{0,59}\/[a-z0-9][a-z0-9-]{0,79}\.jpg|portrait\.jpg|projects\/[a-z0-9][a-z0-9-]{0,59}\.jpg)$/;

export function isWritableImagePath(path: string): boolean {
  return WRITABLE_IMAGE.test(path);
}

/** Paths the admin may delete: images inside the photo, portrait and project spots. */
export function isRemovableImagePath(path: string): boolean {
  if (path.includes("..") || path.includes("\\") || !IMAGE_FILE.test(path)) {
    return false;
  }
  return (
    /^public\/photos\/[^/]+\/[^/]+$/.test(path) ||
    /^public\/photos\/[^/]+$/.test(path) ||
    /^public\/portrait\.[a-z]+$/i.test(path) ||
    /^public\/projects\/[^/]+$/.test(path)
  );
}

/** The four content files the admin edits. */
export const CONTENT_FILES = {
  settings: "src/content/settings.json",
  en: "src/content/copy.en.json",
  am: "src/content/copy.am.json",
  projects: "src/content/projects.json",
} as const;
