import { galleryItems, hasRealPhotos } from "@/content/media";
import { Gallery } from "./gallery/Gallery";
import { SectionHeading } from "./ui/SectionHeading";

export function Photography() {
  return (
    <section id="photography" className="px-5 py-20 sm:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading index="02" label="Photography" plain="Selected" accent="frames.">
          {hasRealPhotos
            ? "A selection of recent work. Open any frame to see it full screen."
            : "The gallery is being put together — these frames mark where the photographs will hang."}
        </SectionHeading>

        <Gallery items={galleryItems} />
      </div>
    </section>
  );
}
