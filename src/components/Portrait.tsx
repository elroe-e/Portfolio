"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import type { MediaAsset } from "@/content/media";

/** The About portrait. It drifts slightly as the page scrolls past it. */
export function Portrait({
  image,
  name,
  initials,
  alt,
  soon,
  mark,
}: {
  image: MediaAsset | null;
  name: string;
  initials: string;
  alt: string;
  soon: string;
  mark: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: frame,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  const corner = "absolute size-4 border-bone/50";

  return (
    <figure>
      {/* Photographs always sit on a dark mount, whichever theme is active. */}
      <div
        ref={frame}
        data-theme="dark"
        className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-coal text-bone"
      >
        <motion.div style={{ y }} className="absolute -inset-[7%]">
          {image ? (
            <Image
              src={image.src}
              alt={alt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              placeholder="blur"
              blurDataURL={image.blurDataURL}
              className="object-cover"
            />
          ) : (
            <div
              className="grid h-full w-full place-items-center"
              style={{
                background:
                  "radial-gradient(80% 60% at 30% 20%, rgb(255 140 90 / 0.28), transparent 60%), linear-gradient(160deg, #2a201b, #0f0d0c 70%)",
              }}
            >
              <span className="font-serif text-[clamp(6rem,16vw,11rem)] italic leading-none text-bone/15">
                {initials}
              </span>
            </div>
          )}
        </motion.div>

        {/* Viewfinder marks */}
        <div aria-hidden className="pointer-events-none absolute inset-4">
          <span className={`${corner} left-0 top-0 border-l border-t`} />
          <span className={`${corner} right-0 top-0 border-r border-t`} />
          <span className={`${corner} bottom-0 left-0 border-b border-l`} />
          <span className={`${corner} bottom-0 right-0 border-b border-r`} />
        </div>

        {!image && (
          <p className="absolute inset-x-0 bottom-8 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
            {soon}
          </p>
        )}
      </div>

      <figcaption className="mt-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
        <span>{name}</span>
        <span className="text-ember">{mark}</span>
      </figcaption>
    </figure>
  );
}
