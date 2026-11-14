import { site } from "@/content/site";

/**
 * The opening moment: a dark screen with viewfinder marks focuses on the name,
 * then opens like a camera shutter to reveal the page.
 *
 * It is pure CSS (see "Intro" in globals.css), so it starts instantly, never
 * blocks the page from loading, and is skipped for visitors who prefer reduced
 * motion. Change `--intro` in globals.css to make it longer or shorter.
 */
export function Intro() {
  const corner = "absolute size-5 border-bone/60";

  return (
    <>
      {/* Page transitions: closes over the page before moving to another one. */}
      <div aria-hidden className="leave-shutter fixed inset-0 z-[85]">
        <div className="leave-shutter-top absolute inset-x-0 top-0 h-1/2 bg-ink" />
        <div className="leave-shutter-bottom absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      </div>

      <div aria-hidden className="intro fixed inset-0 z-[80]">
        <div className="intro-shutter intro-shutter-top absolute inset-x-0 top-0 h-1/2 bg-ink" />
        <div className="intro-shutter intro-shutter-bottom absolute inset-x-0 bottom-0 h-1/2 bg-ink" />

        <div className="intro-mark absolute inset-0 grid place-items-center">
          <div className="relative px-10 py-8 sm:px-16 sm:py-10">
            <span className={`${corner} left-0 top-0 border-l border-t`} />
            <span className={`${corner} right-0 top-0 border-r border-t`} />
            <span className={`${corner} bottom-0 left-0 border-b border-l`} />
            <span className={`${corner} bottom-0 right-0 border-b border-r`} />

            <p
              lang="en"
              className="text-center text-3xl font-medium tracking-[-0.03em] sm:text-5xl"
            >
              {site.firstName}{" "}
              <span className="font-serif font-normal italic">
                {site.lastName}
              </span>
            </p>
            <p className="mt-3 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-ash sm:text-[11px]">
              <span className="intro-dot size-1.5 rounded-full bg-ember" />
              Photo + Code
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
