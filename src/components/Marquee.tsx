import { marqueeWords } from "@/content/site";
import { Spark } from "./ui/icons";

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {marqueeWords.map((word, index) => (
        <li key={word} className="flex items-center">
          <span
            className={`px-6 text-[clamp(2.2rem,6.5vw,5.5rem)] leading-none md:px-10 ${
              index % 2
                ? "text-outline font-serif italic tracking-[-0.01em]"
                : "font-medium tracking-[-0.035em]"
            }`}
          >
            {word}
          </span>
          <Spark className="size-5 animate-spin-slow text-ember md:size-8" />
        </li>
      ))}
    </ul>
  );
}

/** An endless band of words. The list is rendered twice so the loop is seamless. */
export function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-line bg-ink/60 py-6 md:py-9">
      <div className="flex w-max animate-marquee">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
