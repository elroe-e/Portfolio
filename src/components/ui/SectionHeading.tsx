import type { ReactNode } from "react";
import { Reveal, RevealLine } from "./Reveal";

export function SectionLabel({
  index,
  label,
}: {
  index: string;
  label: string;
}) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ash">
      <span className="text-ember">{index}</span>
      <span aria-hidden className="h-px w-8 bg-line" />
      {label}
    </p>
  );
}

/** Numbered label, large two-tone heading and an optional intro paragraph. */
export function SectionHeading({
  index,
  label,
  plain,
  accent,
  children,
}: {
  index: string;
  label: string;
  plain: string;
  accent: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-12 flex flex-col gap-8 md:mb-20 md:flex-row md:items-end md:justify-between">
      <div>
        <Reveal>
          <SectionLabel index={index} label={label} />
        </Reveal>
        <h2 className="mt-6 text-[clamp(2.75rem,7.5vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.04em]">
          <RevealLine>{plain}</RevealLine>
          <RevealLine
            delay={0.08}
            className="font-serif font-normal italic tracking-[-0.02em]"
          >
            {accent}
          </RevealLine>
        </h2>
      </div>
      {children && (
        <Reveal
          delay={0.15}
          className="max-w-sm text-base leading-relaxed text-ash md:pb-3 md:text-lg"
        >
          {children}
        </Reveal>
      )}
    </div>
  );
}
