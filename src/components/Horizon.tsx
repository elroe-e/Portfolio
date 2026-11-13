import { upcoming } from "@/content/site";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

/** A phone wireframe with a softly pulsing layout. */
function AppsVisual() {
  return (
    <div aria-hidden className="relative flex h-56 items-end justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(70%_75%_at_50%_60%,black,transparent)]" />

      <div className="absolute bottom-0 left-1/2 h-44 w-28 -translate-x-[125%] translate-y-10 -rotate-12 rounded-t-3xl border border-b-0 border-bone/15 bg-ink/80" />
      <div className="absolute bottom-0 left-1/2 h-44 w-28 translate-x-[25%] translate-y-10 rotate-12 rounded-t-3xl border border-b-0 border-bone/15 bg-ink/80" />

      <div className="relative h-52 w-32 translate-y-6 rounded-t-[1.75rem] border border-b-0 border-bone/30 bg-ink p-2.5 shadow-2xl shadow-black">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-white/15" />
        <div className="mt-3 h-14 animate-shimmer rounded-xl bg-ember/85" />
        <div className="mt-2.5 space-y-1.5">
          <div className="h-2 w-3/4 animate-shimmer rounded-full bg-white/25 [animation-delay:300ms]" />
          <div className="h-2 w-1/2 animate-shimmer rounded-full bg-white/15 [animation-delay:600ms]" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <div className="h-10 rounded-lg bg-white/10" />
          <div className="h-10 rounded-lg bg-white/10" />
        </div>
      </div>
    </div>
  );
}

const FILM_TONES = [
  "linear-gradient(140deg, #4a2f22, #17100d)",
  "linear-gradient(140deg, #24323f, #0d1114)",
  "linear-gradient(140deg, #3a3524, #12110c)",
  "linear-gradient(140deg, #3d2530, #130d10)",
  "linear-gradient(140deg, #223634, #0c1211)",
];

const SPROCKETS =
  "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.28) 0 9px, transparent 9px 22px)";

/** A strip of film sliding past. */
function FilmVisual() {
  const frames = (key: string) => (
    <div key={key} className="flex shrink-0 gap-2 pr-2">
      {FILM_TONES.map((tone) => (
        <div key={tone} className="h-24 w-40 shrink-0 rounded-sm" style={{ background: tone }} />
      ))}
    </div>
  );

  return (
    <div
      aria-hidden
      className="relative flex h-56 items-center overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_14%,black_86%,transparent)]"
    >
      <div className="-mx-10 -rotate-3 bg-black/70 py-1.5">
        <div className="mx-2 h-2.5" style={{ background: SPROCKETS }} />
        <div className="my-1.5 flex w-max animate-film">
          {frames("a")}
          {frames("b")}
        </div>
        <div className="mx-2 h-2.5" style={{ background: SPROCKETS }} />
      </div>

      <p className="absolute left-[16%] top-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">
        <span className="size-2 animate-shimmer rounded-full bg-red-500" />
        Rec
      </p>
    </div>
  );
}

const visuals: Record<string, () => React.JSX.Element> = {
  apps: AppsVisual,
  cinematography: FilmVisual,
};

export function Horizon() {
  return (
    <section id="next" className="px-5 py-20 sm:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading index="04" label="Next" plain="On the" accent="horizon.">
          Two things I&apos;m working towards. It&apos;s too early to show them — but they&apos;re coming.
        </SectionHeading>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {upcoming.map((item, index) => {
            const Visual = visuals[item.id];
            return (
              <Reveal key={item.id} delay={index * 0.1}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-line bg-coal/90 transition-colors duration-500 hover:border-bone/30">
                  <div className="flex items-center justify-between px-7 pt-7 md:px-9 md:pt-9">
                    <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]">
                      <span className="relative flex size-1.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-ember/70" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-ember" />
                      </span>
                      {item.status}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                      Coming soon
                    </span>
                  </div>

                  {Visual && <Visual />}

                  <div className="border-t border-line px-7 py-7 md:px-9 md:py-8">
                    <h3 className="text-3xl font-medium tracking-[-0.03em] md:text-4xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-md leading-relaxed text-ash">{item.text}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
