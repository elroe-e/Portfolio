import type { Metadata } from "next";
import { TransitionLink } from "@/components/TransitionLink";
import { ArrowUpRight } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main
      id="main"
      className="backdrop-glow flex min-h-svh flex-col items-start justify-center px-5 sm:px-8 lg:px-12"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ash">
        <span className="text-ember">404</span> — Out of frame
      </p>
      <h1 className="mt-6 text-[clamp(3rem,10vw,9rem)] font-medium leading-[0.9] tracking-[-0.045em]">
        Nothing
        <span className="block font-serif font-normal italic">
          to see here.
        </span>
      </h1>
      <TransitionLink
        href="/"
        className="group mt-10 inline-flex items-center gap-3 rounded-full bg-bone py-2 pl-6 pr-2 text-sm font-medium text-ink transition-colors duration-300 hover:bg-ember"
      >
        Back to the portfolio
        <span className="grid size-9 place-items-center rounded-full bg-ink text-bone">
          <ArrowUpRight className="size-4" />
        </span>
      </TransitionLink>
    </main>
  );
}
