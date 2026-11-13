import { site } from "@/content/site";
import { ButtonLink } from "./ui/Button";
import { Magnetic } from "./ui/Magnetic";

/** Camera-viewfinder corner marks that frame the first screen. */
function ViewfinderCorners() {
  const corner = "absolute size-5 border-bone/35";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-5 bottom-6 top-24 hidden animate-fade-in [animation-delay:900ms] sm:inset-x-8 md:block lg:inset-x-12"
    >
      <span className={`${corner} left-0 top-0 border-l border-t`} />
      <span className={`${corner} right-0 top-0 border-r border-t`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r`} />
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col justify-end px-5 pb-12 pt-32 sm:px-8 md:pb-16 lg:px-12"
    >
      <ViewfinderCorners />

      <div className="relative mx-auto w-full max-w-[1400px] md:px-8">
        {site.available && (
          <p className="flex animate-fade-up items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ash [animation-delay:150ms]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Available for new projects
          </p>
        )}

        <h1 className="mt-6 text-[clamp(3.25rem,17vw,13rem)] font-medium leading-[0.86] tracking-[-0.045em]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="block animate-rise [animation-delay:200ms]">
              {site.firstName}
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.16em]">
            <span className="block animate-rise font-serif font-normal italic tracking-[-0.02em] [animation-delay:320ms]">
              {site.lastName}
            </span>
          </span>
        </h1>

        <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-[1fr_auto] md:items-end">
          <p className="max-w-xl animate-fade-up text-lg leading-relaxed text-bone/80 [animation-delay:650ms] md:text-xl">
            Photographer <span className="font-serif italic text-ember">&amp;</span>{" "}
            full-stack developer. {site.tagline}
          </p>

          <div className="flex animate-fade-up flex-wrap gap-3 [animation-delay:800ms]">
            <Magnetic>
              <ButtonLink href="#photography">See photography</ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href="#development" variant="outline">
                See web work
              </ButtonLink>
            </Magnetic>
          </div>
        </div>

        <div className="mt-12 flex animate-fade-in items-center justify-between border-t border-line pt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-ash [animation-delay:1000ms] md:mt-16">
          <a
            href="#about"
            className="group flex items-center gap-3 transition-colors hover:text-bone"
          >
            <span className="relative block h-8 w-px overflow-hidden bg-line">
              <span className="absolute inset-0 animate-scroll-hint bg-ember" />
            </span>
            Scroll
          </a>
          <span className="hidden sm:block">ƒ/1.8 · 1/250s · ISO 200</span>
          <span>
            Photo <span className="text-ember">+</span> Code
          </span>
        </div>
      </div>
    </section>
  );
}
