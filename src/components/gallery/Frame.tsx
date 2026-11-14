import Image from "next/image";
import type { GalleryItem } from "@/content/media";
import { CameraIcon } from "../ui/icons";

/** Colour moods for placeholder frames: [from, to, glow]. */
const TONES: Array<[string, string, string]> = [
  ["#3a2a22", "#141110", "rgb(255 160 110 / 0.3)"],
  ["#1f2a36", "#0e1114", "rgb(120 170 255 / 0.26)"],
  ["#2f3323", "#111210", "rgb(210 220 140 / 0.2)"],
  ["#35232c", "#131012", "rgb(255 140 180 / 0.22)"],
  ["#3a3226", "#141311", "rgb(255 215 150 / 0.24)"],
  ["#203031", "#0e1212", "rgb(120 230 220 / 0.2)"],
];

/**
 * Fills its parent with either a real photo or a styled placeholder.
 * `large` is used by the full-screen viewer.
 */
export function Frame({
  item,
  sizes,
  placeholder,
  large = false,
}: {
  item: GalleryItem;
  sizes: string;
  /** Text shown on placeholder frames, e.g. "Your photo here". */
  placeholder: string;
  large?: boolean;
}) {
  if (item.kind === "photo") {
    return (
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes={sizes}
        quality={large ? 90 : 75}
        placeholder="blur"
        blurDataURL={item.blurDataURL}
        draggable={false}
        className={large ? "object-contain" : "object-cover"}
      />
    );
  }

  const [from, to, glow] = TONES[item.tone % TONES.length];
  const number = String(item.tone + 1).padStart(2, "0");

  return (
    <div
      data-theme="dark"
      className="absolute inset-0 text-bone"
      style={{
        background: `radial-gradient(90% 70% at 25% 15%, ${glow}, transparent 60%), linear-gradient(155deg, ${from}, ${to})`,
      }}
    >
      <span
        className={`absolute font-mono uppercase tracking-[0.22em] text-bone/55 ${
          large
            ? "left-6 top-6 text-xs"
            : "left-3 top-3 text-[9px] sm:left-4 sm:top-4 sm:text-[10px]"
        }`}
      >
        {item.category}
      </span>

      <span className="absolute inset-0 grid place-items-center">
        <span className="flex flex-col items-center gap-3 text-bone/45">
          <CameraIcon className={large ? "size-10" : "size-6 sm:size-7"} />
          <span
            className={`font-mono uppercase tracking-[0.22em] ${
              large ? "text-xs" : "hidden text-[10px] sm:block"
            }`}
          >
            {placeholder}
          </span>
        </span>
      </span>

      <span
        aria-hidden
        className={`absolute font-serif italic leading-none text-bone/15 ${
          large
            ? "bottom-4 right-6 text-9xl"
            : "bottom-2 right-3 text-5xl sm:right-4 sm:text-7xl"
        }`}
      >
        {number}
      </span>
    </div>
  );
}
