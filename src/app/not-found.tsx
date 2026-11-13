import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

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
      <ButtonLink href="/" className="mt-10">
        Back to the portfolio
      </ButtonLink>
    </main>
  );
}
