"use client";

import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GalleryItem } from "@/content/media";
import { useOverlay } from "@/lib/useOverlay";
import { ArrowLeft, ArrowRight, Close } from "../ui/icons";
import { Frame } from "./Frame";

const EXPO = [0.16, 1, 0.3, 1] as const;
const BEHIND_VIEWER = ["header", "main", "footer"] as const;

const slide = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 70, scale: 0.98 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -70, scale: 0.98 }),
};

const controlButton =
  "grid size-11 place-items-center rounded-full border border-white/15 bg-white/5 text-bone backdrop-blur transition-colors duration-300 hover:bg-bone hover:text-ink";

/**
 * Full-screen photo viewer.
 * Arrow keys or swipe to move between photos, Escape or a click outside to close.
 */
export function Lightbox({
  items,
  index,
  onNavigate,
  onClose,
}: {
  items: GalleryItem[];
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}) {
  const [direction, setDirection] = useState(0);
  const closeButton = useRef<HTMLButtonElement>(null);
  const item = items[index];
  const many = items.length > 1;

  useOverlay(onClose, BEHIND_VIEWER);

  const step = useCallback(
    (offset: number) => {
      setDirection(offset);
      onNavigate((index + offset + items.length) % items.length);
    },
    [index, items.length, onNavigate],
  );

  useEffect(() => {
    closeButton.current?.focus();
  }, []);

  useEffect(() => {
    if (!many) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [many, step]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (swipe < -90) step(1);
    else if (swipe > 90) step(-1);
  };

  const ratio = item.width / item.height;
  const caption = [item.category, item.title].filter(Boolean).join(" · ");

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[70] flex flex-col bg-black/92 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <p
          aria-live="polite"
          className="font-mono text-xs uppercase tracking-[0.2em] text-ash"
        >
          <span className="sr-only">Photo </span>
          <span className="text-bone">{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden> / </span>
          <span className="sr-only"> of </span>
          {String(items.length).padStart(2, "0")}
        </p>
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className={controlButton}
        >
          <Close className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.figure
            key={item.id}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: EXPO }}
            drag={many ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            onDragEnd={onDragEnd}
            onClick={(event) => event.stopPropagation()}
            className={`relative overflow-hidden rounded-lg ${many ? "cursor-grab active:cursor-grabbing" : ""}`}
            style={{
              aspectRatio: `${item.width} / ${item.height}`,
              // As large as fits: limited by the screen width or the free height.
              width: `min(100%, calc((100svh - 11rem) * ${ratio}))`,
            }}
          >
            <Frame item={item} sizes="100vw" large />
          </motion.figure>
        </AnimatePresence>

        {many && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(event) => {
                event.stopPropagation();
                step(-1);
              }}
              className={`${controlButton} absolute left-4 top-1/2 hidden -translate-y-1/2 sm:grid`}
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(event) => {
                event.stopPropagation();
                step(1);
              }}
              className={`${controlButton} absolute right-4 top-1/2 hidden -translate-y-1/2 sm:grid`}
            >
              <ArrowRight className="size-5" />
            </button>
          </>
        )}
      </div>

      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ash">{caption}</p>
        {many && (
          <div className="flex gap-2 sm:hidden">
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(event) => {
                event.stopPropagation();
                step(-1);
              }}
              className={controlButton}
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(event) => {
                event.stopPropagation();
                step(1);
              }}
              className={controlButton}
            >
              <ArrowRight className="size-5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>,
    document.body,
  );
}
