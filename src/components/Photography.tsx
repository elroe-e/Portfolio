import { galleryItems, hasRealPhotos } from "@/content/media";
import type { Copy } from "@/content/site";
import { Gallery } from "./gallery/Gallery";
import { SectionHeading } from "./ui/SectionHeading";

export function Photography({ t }: { t: Copy }) {
  const copy = t.photography;

  return (
    <section id="photography" className="px-5 py-20 sm:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          index="02"
          label={copy.label}
          plain={copy.headingPlain}
          accent={copy.headingAccent}
        >
          {hasRealPhotos ? copy.intro : copy.introEmpty}
        </SectionHeading>

        <Gallery items={galleryItems} t={copy} />
      </div>
    </section>
  );
}
