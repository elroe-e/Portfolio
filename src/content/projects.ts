/**
 * Websites and apps shown in the Development section.
 *
 * To add a project, copy an entry and change the values.
 * To show a screenshot, save it as  public/projects/<slug>.jpg  (or .png / .webp)
 * and it appears automatically.
 */

export type Project = {
  /** Used for the screenshot file name: public/projects/<slug>.jpg */
  slug: string;
  title: string;
  kind: string;
  role: string;
  summary: string;
  url: string;
  displayUrl: string;
  /** Technologies used, e.g. ["Next.js", "Node.js", "PostgreSQL"]. Hidden when empty. */
  stack: string[];
  status: string;
};

export const projects: Project[] = [
  {
    slug: "siaab-mobile",
    title: "Siaab Mobile",
    kind: "Website",
    role: "Development",
    summary:
      "The first website I built and shipped. It's live at siaabmobile.com — and it's where this side of my work begins.",
    url: "https://www.siaabmobile.com",
    displayUrl: "siaabmobile.com",
    stack: [],
    status: "Live",
  },
];
