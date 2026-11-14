"use client";

import { AnimatePresence, motion } from "motion/react";
import { type CSSProperties, useMemo, useState } from "react";
import type { GalleryItem } from "@/content/media";
import type { Copy } from "@/content/site";
import { ArrowUpRight } from "../ui/icons";
import { Frame } from "./Frame";
import { Lightbox } from "./Lightbox";

const EXPO = [0.16, 1, 0.3, 1] as const;
/** Marks the "show everything" filter. Not a category name a folder can produce. */
const ALL = "\u0000all";

/**
 * The grid is a masonry wall: photos keep their own proportions and fill the
 * shortest column first, so the order still reads left to right.
 *
 * It is built from thin rows, each as tall as the gap between photos, and every
 * photo spans as many rows as its height needs. The gap is a share of the grid
 * width (cqw), which keeps the maths the same at every screen size.
 * These two numbers must match the `cqw` values in the class names below.
 */
const GAP_TWO_COLUMNS = 2.6;
const GAP_THREE_COLUMNS = 1.2;
const ROWS_PER_COLUMN_WIDTH = {
  two: (100 - GAP_TWO_COLUMNS) / 2 / GAP_TWO_COLUMNS,
  three: (100 - 2 * GAP_THREE_COLUMNS) / 3 / GAP_THREE_COLUMNS,
};

/** How many grid rows a photo spans in each layout (+1 row for the gap below it). */
function rowSpans(item: GalleryItem) {
  const proportion = item.height / item.width;
  return {
    "--rows-two": Math.max(
      2,
      Math.round(proportion * ROWS_PER_COLUMN_WIDTH.two) + 1,
    ),
    "--rows-three": Math.max(
      2,
      Math.round(proportion * ROWS_PER_COLUMN_WIDTH.three) + 1,
    ),
  } as CSSProperties;
}

function label(item: GalleryItem) {
  return item.title ? `${item.title} — ${item.category}` : item.category;
}

function Tile({
  item,
  index,
  t,
  onOpen,
}: {
  item: GalleryItem;
  index: number;
  t: Copy["photography"];
  onOpen: () => void;
}) {
  return (
    <div
      className="pb-[2.6cqw] [grid-row-end:span_var(--rows-two)] lg:pb-[1.2cqw] lg:[grid-row-end:span_var(--rows-three)]"
      style={rowSpans(item)}
    >
      <motion.button
        type="button"
        data-cursor="view"
        onClick={onOpen}
        aria-label={`${t.open}: ${label(item)}`}
        className="group relative block h-full w-full overflow-hidden rounded-xl bg-coal text-left"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -6% 0px" }}
        transition={{ duration: 0.9, delay: (index % 3) * 0.07, ease: EXPO }}
      >
        <span className="absolute inset-0 transition-transform duration-[900ms] ease-expo group-hover:scale-[1.045] group-focus-visible:scale-[1.045]">
          <Frame
            item={item}
            sizes="(min-width: 1024px) 33vw, 50vw"
            placeholder={t.placeholder}
          />
        </span>

        {/* Caption, shown on hover and keyboard focus */}
        <span
          data-theme="dark"
          className="pointer-events-none absolute inset-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/70 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 sm:p-4"
        >
          <span className="min-w-0">
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">
              {item.category}
            </span>
            {item.title && (
              <span className="mt-1 block truncate text-sm font-medium text-bone sm:text-base">
                {item.title}
              </span>
            )}
          </span>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-bone text-ink">
            <ArrowUpRight className="size-4" />
          </span>
        </span>
      </motion.button>
    </div>
  );
}

export function Gallery({
  items,
  t,
}: {
  items: GalleryItem[];
  t: Copy["photography"];
}) {
  const [filter, setFilter] = useState(ALL);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return [...counts];
  }, [items]);

  const visible = useMemo(
    () =>
      filter === ALL ? items : items.filter((item) => item.category === filter),
    [items, filter],
  );

  const filters: Array<[name: string, count: number]> = [
    [ALL, items.length],
    ...categories,
  ];

  return (
    <>
      {categories.length > 1 && (
        <div
          role="group"
          aria-label={t.filter}
          className="mb-8 flex flex-wrap gap-2 md:mb-10"
        >
          {filters.map(([name, count]) => {
            const selected = filter === name;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(name)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors duration-300 sm:px-5 sm:py-2.5 ${
                  selected
                    ? "border-bone bg-bone text-ink"
                    : "border-line bg-ink/40 text-ash hover:border-bone/50 hover:text-bone"
                }`}
              >
                {name === ALL ? t.all : name}
                <sup className="ml-1.5 font-mono text-[10px] opacity-60">
                  {count}
                </sup>
              </button>
            );
          })}
        </div>
      )}

      <div className="@container">
        {/* Re-keyed on filter change so the tiles animate in again. */}
        <div
          key={filter}
          className="grid grid-flow-row-dense auto-rows-[2.6cqw] grid-cols-2 gap-x-[2.6cqw] lg:auto-rows-[1.2cqw] lg:grid-cols-3 lg:gap-x-[1.2cqw]"
        >
          {visible.map((item, index) => (
            <Tile
              key={item.id}
              item={item}
              index={index}
              t={t}
              onOpen={() => setOpenIndex(index)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {openIndex !== null && visible[openIndex] && (
          <Lightbox
            items={visible}
            index={openIndex}
            t={t}
            onNavigate={setOpenIndex}
            onClose={() => setOpenIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
