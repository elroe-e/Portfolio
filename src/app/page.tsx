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
import { site } from "@/content/site";

/** Structured data that tells search engines who this site is about. */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.roles,
  description: site.description,
  sameAs: [site.contact.instagram.href, site.contact.telegram.href],
  knowsAbout: ["Photography", "Web development", "Full-stack development"],
};

export default function Home() {
  return (
    <>
      <Intro />
      <Background />
      <ScrollProgress />
      <SmoothScroll />
      <Cursor />
      <Nav />

      <main id="main" className="relative z-10">
        <Hero />
        <Marquee />
        <About />
        <Photography />
        <Development />
        <Horizon />
        <Contact />
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
