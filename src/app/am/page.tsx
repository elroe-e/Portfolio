import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { getCopy, languages, site } from "@/content/site";

const t = getCopy("am");

export const metadata: Metadata = {
  title: { absolute: `${site.name} — ${t.meta.title}` },
  description: t.meta.description,
  alternates: { languages: { en: "/", am: "/am" } },
  openGraph: {
    title: `${site.name} — ${t.meta.title}`,
    description: t.meta.description,
    locale: languages.am.locale,
  },
};

export default function AmharicHome() {
  return <HomePage lang="am" />;
}
