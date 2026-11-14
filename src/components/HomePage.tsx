import { About } from "@/components/About";
import { Background } from "@/components/background/Background";
import { Contact } from "@/components/Contact";
import { Cursor } from "@/components/Cursor";
import { Development } from "@/components/Development";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Horizon } from "@/components/Horizon";
import { Intro } from "@/components/Intro";
import { Marquee } from "@/components/Marquee";
import { Nav } from "@/components/Nav";
import { Photography } from "@/components/Photography";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SmoothScroll } from "@/components/SmoothScroll";
import { heroPhotos } from "@/content/media";
import { getCopy, type Lang, settings, site } from "@/content/site";

/** The whole one-page site, in either language. */
export function HomePage({ lang }: { lang: Lang }) {
  const t = getCopy(lang);

  /** Structured data that tells search engines who this site is about. */
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.roles,
    description: t.meta.description,
    sameAs: [settings.contact.instagram.href, settings.contact.telegram.href],
    knowsAbout: ["Photography", "Web development", "Full-stack development"],
  };

  return (
    // The root <html> is always lang="en"; this marks the Amharic page's content.
    <div lang={lang} className={`lang-${lang}`}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-bone focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-ink"
      >
        {t.nav.skip}
      </a>

      <Intro />
      <Background photos={heroPhotos} />
      <ScrollProgress />
      <SmoothScroll />
      <Cursor viewLabel={t.photography.view} />
      <Nav lang={lang} t={t} />

      <main id="main" className="relative z-10">
        <Hero t={t} />
        <Marquee words={t.marquee} />
        <About t={t} />
        <Photography t={t} />
        <Development lang={lang} t={t} />
        <Horizon t={t} />
        <Contact t={t} />
      </main>

      <Footer t={t} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(person).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
