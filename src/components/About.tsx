import { portrait } from "@/content/media";
import { type Copy, site } from "@/content/site";
import { Portrait } from "./Portrait";
import { CameraIcon } from "./ui/icons";
import { Reveal, RevealLine } from "./ui/Reveal";
import { SectionLabel } from "./ui/SectionHeading";

function CodeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" />
    </svg>
  );
}

const serviceIcons = [
  <CameraIcon key="camera" className="size-5" />,
  <CodeIcon key="code" />,
];

export function About({ t }: { t: Copy }) {
  const about = t.about;

  return (
    <section id="about" className="px-5 py-24 sm:px-8 md:py-32 lg:px-12">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 md:grid-cols-12 md:gap-10 lg:gap-16">
        <Reveal className="md:sticky md:top-24 md:col-span-5 md:self-start lg:col-span-4">
          <Portrait
            image={portrait}
            name={site.name}
            initials={`${site.firstName[0] ?? ""}${site.lastName[0] ?? ""}`}
            alt={about.portraitAlt}
            soon={about.portraitSoon}
            mark={`${t.hero.markA} + ${t.hero.markB}`}
          />
        </Reveal>

        <div className="md:col-span-7 lg:col-span-7 lg:col-start-6">
          <Reveal>
            <SectionLabel index="01" label={about.label} />
          </Reveal>

          <h2 className="mt-6 text-[clamp(2.75rem,7.5vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.04em]">
            <RevealLine>{about.headingPlain}</RevealLine>
            <RevealLine
              delay={0.08}
              className="font-serif font-normal italic tracking-[-0.02em] text-ember"
            >
              {about.headingAccent}
            </RevealLine>
          </h2>

          <div className="mt-10 max-w-2xl space-y-6 text-lg leading-relaxed text-bone/75 md:text-xl">
            {about.paragraphs.map((paragraph, index) => (
              <Reveal key={index} delay={index * 0.08}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <dl className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {about.services.map((service, index) => (
              <div key={index} className="bg-ink/90 p-7 md:p-8">
                <Reveal delay={index * 0.1}>
                  <dt className="flex items-center gap-3 text-lg font-medium">
                    <span className="grid size-10 place-items-center rounded-full border border-line text-ember">
                      {serviceIcons[index % serviceIcons.length]}
                    </span>
                    {service.title}
                  </dt>
                  <dd className="mt-4 leading-relaxed text-ash">
                    {service.text}
                  </dd>
                </Reveal>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
