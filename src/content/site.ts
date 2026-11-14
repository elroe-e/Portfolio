/**
 * Everything written on the site lives in this folder:
 *
 *   settings.json   name, availability badge, hero photos and contact details
 *   copy.en.json    all English text
 *   copy.am.json    all Amharic text (same keys as the English file)
 *   projects.json   websites and apps in the Development section
 *
 * Edit them by hand, or from the admin page at /admin.
 */

import am from "./copy.am.json";
import en from "./copy.en.json";
import projectsFile from "./projects.json";
import settingsFile from "./settings.json";

export type Copy = typeof en;
export type Lang = "en" | "am";

export const languages: Record<
  Lang,
  { label: string; short: string; path: string; locale: string }
> = {
  en: { label: "English", short: "EN", path: "/", locale: "en_US" },
  am: { label: "አማርኛ", short: "አማ", path: "/am", locale: "am_ET" },
};

const dictionaries: Record<Lang, Copy> = { en, am: am as Copy };

export function getCopy(lang: Lang): Copy {
  return dictionaries[lang];
}

export type ContactLink = { value: string; href: string };

export type Settings = {
  name: { first: string; last: string };
  available: boolean;
  /** Gallery photos (their /photos/... paths) floating in the hero. Up to 3. */
  heroPhotos: string[];
  contact: {
    telegram: ContactLink;
    instagram: ContactLink;
    phone: ContactLink;
  };
};

export const settings = settingsFile as Settings;

type ProjectText = {
  kind: string;
  role: string;
  status: string;
  summary: string;
};

export type Project = {
  /** Used for the screenshot file name: public/projects/<slug>.jpg */
  slug: string;
  title: string;
  url: string;
  displayUrl: string;
  /** Technologies used, e.g. ["Next.js", "PostgreSQL"]. Hidden when empty. */
  stack: string[];
} & Record<Lang, ProjectText>;

export const projects = projectsFile as Project[];

/** Page sections in order. The ids are also the #links in the navigation. */
export const sectionIds = [
  "about",
  "photography",
  "development",
  "next",
  "contact",
] as const;

/** Language-independent facts for page titles and link previews. */
export const site = {
  name: `${settings.name.first} ${settings.name.last}`,
  firstName: settings.name.first,
  lastName: settings.name.last,
  roles: ["Photographer", "Full-Stack Developer"],
  description: en.meta.description,
};
