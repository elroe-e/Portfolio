"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/content/site";
import { useOverlay } from "@/lib/useOverlay";
import { ArrowUpRight } from "./ui/icons";

const EXPO = [0.16, 1, 0.3, 1] as const;
const SECTION_IDS = ["top", ...navLinks.map((link) => link.id)];
const BEHIND_MENU = ["main", "footer"] as const;

/** Reports which section is crossing the middle of the screen. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setActive(entry.target.id === "top" ? null : entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    for (const id of SECTION_IDS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return active;
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  useOverlay(onClose, BEHIND_MENU);

  const contacts = [
    site.contact.telegram,
    site.contact.instagram,
    site.contact.phone,
  ];

  return (
    <motion.div
      id="mobile-menu"
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink/[0.98] px-5 pb-8 pt-24 sm:px-8 md:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <nav aria-label="Mobile">
        <ul>
          {navLinks.map((link, index) => (
            <li key={link.id} className="overflow-hidden border-b border-line">
              <motion.a
                href={`#${link.id}`}
                onClick={onClose}
                className="flex items-baseline gap-4 py-4"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.05 + index * 0.06,
                  ease: EXPO,
                }}
              >
                <span className="font-mono text-[11px] text-ember">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[2.6rem] font-medium leading-none tracking-[-0.03em]">
                  {link.label}
                </span>
              </motion.a>
            </li>
          ))}
        </ul>
      </nav>

      <motion.ul
        className="mt-auto space-y-3 pt-10 font-mono text-xs uppercase tracking-[0.18em] text-ash"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.45 }}
      >
        {contacts.map((contact) => (
          <li key={contact.label}>
            <a
              href={contact.href}
              className="flex items-center justify-between py-1"
            >
              <span>{contact.label}</span>
              <span className="text-bone">{contact.value}</span>
            </a>
          </li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

export function Nav() {
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The menu only exists on small screens; close it if the window grows.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const onChange = () => desktop.matches && setOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header
        id="header"
        className={`fixed inset-x-0 top-0 z-50 animate-fade-in border-b transition-colors duration-500 ${
          scrolled && !open ? "border-line bg-ink/90" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a
            href="#top"
            onClick={() => setOpen(false)}
            aria-label={`${site.name} — back to top`}
            className="text-lg font-medium tracking-tight"
          >
            {site.firstName}
            <span className="text-ember">.</span>
          </a>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const current = active === link.id;
                return (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      aria-current={current ? "true" : undefined}
                      className={`relative block rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                        current ? "text-bone" : "text-ash hover:text-bone"
                      }`}
                    >
                      {current && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full bg-white/10"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                        />
                      )}
                      <span className="relative">{link.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <a
            href="#contact"
            className="group hidden items-center gap-2 rounded-full border border-line px-4 py-2 text-sm transition-colors duration-300 hover:border-ember hover:bg-ember hover:text-ink md:inline-flex"
          >
            Let&apos;s talk
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
          </a>

          <button
            type="button"
            className="relative -mr-2 grid size-11 place-items-center md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden className="relative block h-3 w-6">
              <span
                className={`absolute left-0 top-0 h-px w-full bg-bone transition-transform duration-300 ease-expo ${
                  open ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-px w-full bg-bone transition-transform duration-300 ease-expo ${
                  open ? "-translate-y-[5px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && <MobileMenu onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
