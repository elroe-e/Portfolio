"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  type Copy,
  type Lang,
  languages,
  sectionIds,
  settings,
} from "@/content/site";
import { useOverlay } from "@/lib/useOverlay";
import { ThemeToggle } from "./ThemeToggle";
import { TransitionLink } from "./TransitionLink";
import { ArrowUpRight } from "./ui/icons";

const EXPO = [0.16, 1, 0.3, 1] as const;
const OBSERVED = ["top", ...sectionIds];
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

    for (const id of OBSERVED) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return active;
}

/** "EN | አማ" — the current language is highlighted, the other one is a link. */
function LanguageSwitch({ lang, t }: { lang: Lang; t: Copy["nav"] }) {
  return (
    <div
      role="group"
      aria-label={t.language}
      className="flex items-center rounded-full border border-line p-0.5 text-xs"
    >
      {(Object.keys(languages) as Lang[]).map((code) => {
        const option = languages[code];
        const current = code === lang;
        const style = `rounded-full px-2.5 py-1.5 transition-colors duration-300 ${
          current ? "bg-bone text-ink" : "text-ash hover:text-bone"
        }`;
        return current ? (
          <span key={code} lang={code} aria-current="true" className={style}>
            {option.short}
          </span>
        ) : (
          <TransitionLink
            key={code}
            href={option.path}
            hrefLang={code}
            lang={code}
            aria-label={t.switchLanguage}
            className={style}
          >
            {option.short}
          </TransitionLink>
        );
      })}
    </div>
  );
}

function MobileMenu({ t, onClose }: { t: Copy; onClose: () => void }) {
  useOverlay(onClose, BEHIND_MENU);

  const contacts = [
    { label: t.contact.telegram, ...settings.contact.telegram },
    { label: t.contact.instagram, ...settings.contact.instagram },
    { label: t.contact.phone, ...settings.contact.phone },
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
          {sectionIds.map((id, index) => (
            <li key={id} className="overflow-hidden border-b border-line">
              <motion.a
                href={`#${id}`}
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
                  {t.nav[id]}
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
          <li key={contact.href}>
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

export function Nav({ lang, t }: { lang: Lang; t: Copy }) {
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
        className={`fixed inset-x-0 top-0 z-50 animate-fade-in border-b [animation-delay:var(--intro)] transition-colors duration-500 ${
          scrolled && !open ? "border-line bg-ink/90" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
          <a
            href="#top"
            onClick={() => setOpen(false)}
            aria-label={`${settings.name.first} ${settings.name.last} — ${t.nav.home}`}
            className="text-lg font-medium tracking-tight"
          >
            {settings.name.first}
            <span className="text-ember">.</span>
          </a>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {sectionIds.map((id) => {
                const current = active === id;
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      aria-current={current ? "true" : undefined}
                      className={`relative block rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                        current ? "text-bone" : "text-ash hover:text-bone"
                      }`}
                    >
                      {current && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full bg-bone/10"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                        />
                      )}
                      <span className="relative">{t.nav[id]}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitch lang={lang} t={t.nav} />
            <ThemeToggle labels={t.nav} />
            <a
              href="#contact"
              className="group hidden items-center gap-2 rounded-full border border-line px-4 py-2 text-sm transition-colors duration-300 hover:border-ember hover:bg-ember hover:text-ink lg:inline-flex"
            >
              {t.nav.cta}
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
            </a>

            <button
              type="button"
              className="relative -mr-2 grid size-11 place-items-center lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">
                {open ? t.nav.closeMenu : t.nav.openMenu}
              </span>
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
        </div>
      </header>

      <AnimatePresence>
        {open && <MobileMenu t={t} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
