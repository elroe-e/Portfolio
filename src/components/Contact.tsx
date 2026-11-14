import { type Copy, settings } from "@/content/site";
import {
  ArrowUpRight,
  InstagramIcon,
  PhoneIcon,
  TelegramIcon,
} from "./ui/icons";
import { Reveal, RevealLine } from "./ui/Reveal";
import { SectionLabel } from "./ui/SectionHeading";

export function Contact({ t }: { t: Copy }) {
  const copy = t.contact;
  const channels = [
    { label: copy.telegram, ...settings.contact.telegram, Icon: TelegramIcon },
    {
      label: copy.instagram,
      ...settings.contact.instagram,
      Icon: InstagramIcon,
    },
    { label: copy.phone, ...settings.contact.phone, Icon: PhoneIcon },
  ];

  return (
    <section
      id="contact"
      className="px-5 pb-24 pt-20 sm:px-8 md:pb-32 md:pt-28 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <SectionLabel index="05" label={copy.label} />
        </Reveal>

        <h2 className="mt-6 text-[clamp(2.75rem,9.5vw,9rem)] font-medium leading-[0.92] tracking-[-0.045em]">
          {copy.lines.map((line, index) => (
            <RevealLine key={index} delay={index * 0.08}>
              {line}
            </RevealLine>
          ))}
          <RevealLine
            delay={copy.lines.length * 0.08}
            className="font-serif font-normal italic tracking-[-0.02em] text-ember"
          >
            {copy.accent}
          </RevealLine>
        </h2>

        <ul className="mt-14 border-t border-line md:mt-20">
          {channels.map(({ label, value, href, Icon }, index) => {
            const external = /^https?:/.test(href);
            return (
              <li key={href} className="border-b border-line">
                <Reveal delay={index * 0.08}>
                  <a
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group relative flex items-center justify-between gap-5 overflow-hidden px-1 py-6 sm:px-4 md:py-9"
                  >
                    {/* Colour sweep on hover and keyboard focus */}
                    <span
                      aria-hidden
                      className="absolute inset-0 origin-bottom scale-y-0 bg-ember transition-transform duration-500 ease-expo group-hover:scale-y-100 group-focus-visible:scale-y-100"
                    />

                    <span className="relative flex items-center gap-4 transition-colors duration-300 group-hover:text-[#0a0a0a] group-focus-visible:text-[#0a0a0a] sm:gap-8">
                      <span className="hidden font-mono text-[11px] text-ash transition-colors duration-300 group-hover:text-[#0a0a0a]/70 group-focus-visible:text-[#0a0a0a]/70 sm:block">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Icon className="size-6 shrink-0 md:size-8" />
                      <span>
                        <span className="block text-[clamp(1.75rem,5vw,3.75rem)] font-medium leading-none tracking-[-0.035em]">
                          {label}
                        </span>
                        <span className="mt-2 block font-mono text-sm text-ash transition-colors duration-300 group-hover:text-[#0a0a0a]/75 group-focus-visible:text-[#0a0a0a]/75 md:hidden">
                          {value}
                        </span>
                      </span>
                    </span>

                    <span className="relative flex items-center gap-6 text-ash transition-colors duration-300 group-hover:text-[#0a0a0a] group-focus-visible:text-[#0a0a0a]">
                      <span className="hidden font-mono text-base md:block lg:text-lg">
                        {value}
                      </span>
                      <ArrowUpRight className="size-6 transition-transform duration-500 ease-expo group-hover:rotate-45 group-focus-visible:rotate-45 md:size-8" />
                      {external && (
                        <span className="sr-only">{t.development.newTab}</span>
                      )}
                    </span>
                  </a>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
