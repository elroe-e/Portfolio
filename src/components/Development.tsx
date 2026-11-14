import Image from "next/image";
import { type MediaAsset, projectScreenshot } from "@/content/media";
import { type Copy, type Lang, type Project, projects } from "@/content/site";
import { ButtonLink } from "./ui/Button";
import { Plus } from "./ui/icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";
import { Tilt } from "./ui/Tilt";

/** Shown inside the browser frame until a real screenshot is added. */
function PreviewPlaceholder({
  project,
  note,
}: {
  project: Project;
  note: string;
}) {
  return (
    <div
      data-theme="dark"
      className="absolute inset-0 flex flex-col p-[6%] text-bone"
      style={{
        background:
          "radial-gradient(70% 80% at 85% 10%, rgb(255 106 61 / 0.3), transparent 60%), radial-gradient(60% 70% at 0% 100%, rgb(88 116 255 / 0.2), transparent 60%), linear-gradient(160deg, #1b1b20, #0c0c0f)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="size-4 rounded-full bg-ember sm:size-5" />
        <span className="flex gap-2 sm:gap-3">
          <span className="h-1.5 w-8 rounded-full bg-bone/20 sm:w-12" />
          <span className="h-1.5 w-8 rounded-full bg-bone/20 sm:w-12" />
          <span className="h-1.5 w-8 rounded-full bg-bone/20 sm:w-12" />
        </span>
      </div>

      <div className="my-auto">
        <p className="font-serif text-[clamp(2rem,6.5vw,5.5rem)] italic leading-none tracking-[-0.02em]">
          {project.title}
        </p>
        <div className="mt-[4%] space-y-2">
          <span className="block h-1.5 w-2/5 animate-shimmer rounded-full bg-bone/25" />
          <span className="block h-1.5 w-1/4 animate-shimmer rounded-full bg-bone/15 [animation-delay:400ms]" />
        </div>
      </div>

      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-bone/50 sm:text-[10px]">
        {note}
      </p>
    </div>
  );
}

function BrowserFrame({
  project,
  screenshot,
  t,
}: {
  project: Project;
  screenshot: MediaAsset | null;
  t: Copy["development"];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-coal shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="size-2.5 rounded-full bg-bone/15" />
        <span className="size-2.5 rounded-full bg-bone/15" />
        <span className="size-2.5 rounded-full bg-bone/15" />
        <span className="ml-3 flex-1 truncate rounded-full bg-bone/5 px-4 py-1 text-center font-mono text-[11px] text-ash">
          {project.displayUrl}
        </span>
        <span className="w-10" />
      </div>
      <div className="relative aspect-[16/10]">
        {screenshot ? (
          <Image
            src={screenshot.src}
            alt={`${t.screenshotAlt}: ${project.title}`}
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            placeholder="blur"
            blurDataURL={screenshot.blurDataURL}
            className="object-cover object-top"
          />
        ) : (
          <PreviewPlaceholder project={project} note={t.preview} />
        )}
      </div>
    </div>
  );
}

function ProjectRow({
  project,
  index,
  lang,
  t,
}: {
  project: Project;
  index: number;
  lang: Lang;
  t: Copy["development"];
}) {
  const text = project[lang];
  const number = String(index + 1).padStart(2, "0");
  const flipped = index % 2 === 1;

  return (
    <article className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
      <Reveal className={`lg:col-span-7 ${flipped ? "lg:order-2" : ""}`}>
        <Tilt>
          <BrowserFrame
            project={project}
            screenshot={projectScreenshot(project.slug)}
            t={t}
          />
        </Tilt>
      </Reveal>

      <Reveal delay={0.12} className="lg:col-span-5">
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ash">
          <span className="text-ember">{number}</span>
          <span aria-hidden className="h-px w-8 bg-line" />
          {text.kind}
          <span className="ml-1 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-bone">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            {text.status}
          </span>
        </p>

        <h3 className="mt-5 text-[clamp(2.25rem,5vw,4rem)] font-medium leading-none tracking-[-0.035em]">
          {project.title}
        </h3>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-bone/75">
          {text.summary}
        </p>

        <dl className="mt-8 grid max-w-md grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 text-sm">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
              {t.role}
            </dt>
            <dd className="mt-1.5">{text.role}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
              {t.address}
            </dt>
            <dd className="mt-1.5">{project.displayUrl}</dd>
          </div>
          {project.stack.length > 0 && (
            <div className="col-span-2">
              <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                {t.builtWith}
              </dt>
              <dd className="mt-2.5 flex flex-wrap gap-2">
                {project.stack.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full border border-line px-3 py-1 text-xs"
                  >
                    {tool}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>

        <ButtonLink
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-9"
        >
          {t.visit}
          <span className="sr-only"> {t.newTab}</span>
        </ButtonLink>
      </Reveal>
    </article>
  );
}

/** An invitation where the next project will go. */
function NextProject({ index, t }: { index: number; t: Copy["development"] }) {
  return (
    <Reveal>
      <a
        href="#contact"
        className="group relative flex min-h-64 flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-bone/25 bg-ink/40 p-7 transition-colors duration-500 hover:border-ember md:p-10"
      >
        <span className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ash">
            <span className="text-ember">
              {String(index + 1).padStart(2, "0")}
            </span>{" "}
            — {t.nextLabel}
          </span>
          <span className="grid size-12 place-items-center rounded-full border border-line transition-all duration-500 ease-expo group-hover:rotate-90 group-hover:border-ember group-hover:bg-ember group-hover:text-ink">
            <Plus className="size-5" />
          </span>
        </span>

        <span className="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <span className="text-[clamp(3rem,9vw,7.5rem)] font-medium leading-[0.9] tracking-[-0.045em]">
            {t.nextTitle}
            <span className="font-serif font-normal italic text-ember">?</span>
          </span>
          <span className="max-w-sm text-base leading-relaxed text-ash md:pb-3 md:text-lg">
            {t.nextText}
          </span>
        </span>
      </a>
    </Reveal>
  );
}

export function Development({ lang, t }: { lang: Lang; t: Copy }) {
  const copy = t.development;

  return (
    <section id="development" className="px-5 py-20 sm:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          index="03"
          label={copy.label}
          plain={copy.headingPlain}
          accent={copy.headingAccent}
        >
          {copy.intro}
        </SectionHeading>

        <div className="space-y-20 md:space-y-28">
          {projects.map((project, index) => (
            <ProjectRow
              key={project.slug}
              project={project}
              index={index}
              lang={lang}
              t={copy}
            />
          ))}
          <NextProject index={projects.length} t={copy} />
        </div>
      </div>
    </section>
  );
}
