import { type Copy, site } from "@/content/site";

export function Footer({ t }: { t: Copy }) {
  return (
    <footer
      id="footer"
      className="relative z-10 overflow-hidden border-t border-line px-5 pb-8 pt-10 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        <p
          aria-hidden
          lang="en"
          className="text-outline select-none text-center text-[clamp(5rem,24vw,24rem)] font-medium leading-[0.85] tracking-[-0.05em]"
        >
          {site.firstName}
        </p>

        <div className="mt-10 flex flex-col gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ash md:flex-row md:items-center md:justify-between">
          <p>© {site.name}</p>
          <p>{t.footer.tagline}</p>
          <a href="#top" className="transition-colors hover:text-bone">
            {t.footer.top} ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
