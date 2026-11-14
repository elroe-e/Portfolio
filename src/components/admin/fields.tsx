"use client";

import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-line bg-ink px-3 py-2.5 text-sm text-bone placeholder:text-ash/60 transition-colors focus:border-ember focus:outline-none";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-bone/60 disabled:cursor-not-allowed disabled:opacity-40";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-bone px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ember disabled:cursor-not-allowed disabled:opacity-40";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ash">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ash/80">{hint}</span>}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  multiline = false,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  disabled?: boolean;
  lang?: string;
}) {
  return multiline ? (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={Math.min(8, Math.max(2, Math.ceil(value.length / 70)))}
      className={`${inputClass} resize-y leading-relaxed`}
      {...props}
    />
  ) : (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
      {...props}
    />
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-ember" : "bg-bone/20"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </span>
      {label}
    </button>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-coal/60 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-ash">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Text editor: renders a form for any piece of the site's text         */
/* ------------------------------------------------------------------ */

type Json = string | Json[] | { [key: string]: Json };

/** Clearer names for fields whose key alone isn't obvious. */
const LABELS: Record<string, string> = {
  headingPlain: "Heading",
  headingAccent: "Heading — coloured part",
  roleA: "First role",
  roleB: "Second role",
  ctaPhoto: "Photography button",
  ctaWeb: "Web work button",
  cta: "Contact button",
  markA: "Corner word 1",
  markB: "Corner word 2",
  available: "Availability badge",
  introEmpty: "Intro (before there are photos)",
  placeholder: "Placeholder frame text",
  nextLabel: "Next-project card label",
  nextTitle: "Next-project card heading",
  nextText: "Next-project card text",
  portraitSoon: "Portrait placeholder text",
  portraitAlt: "Portrait description (for screen readers)",
  screenshotAlt: "Screenshot description (for screen readers)",
  newTab: '"Opens in a new tab" (for screen readers)',
  rec: "Recording label",
  soon: "Coming-soon label",
  lines: "Heading lines",
  accent: "Heading — coloured part",
  meta: "Search & sharing",
};

/** "headingPlain" → "Heading plain" */
function labelFor(key: string) {
  if (LABELS[key]) return LABELS[key];
  const words = key.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const LONG_FIELDS = /summary|text|intro|description|paragraph|tagline|^\d+$/;

/** An empty copy of an item, used when "Add" is pressed in a list. */
function blank(model: Json): Json {
  if (typeof model === "string") return "";
  if (Array.isArray(model)) return [];
  return Object.fromEntries(
    Object.entries(model).map(([key, value]) => [key, blank(value)]),
  );
}

export function TextTree({
  value,
  onChange,
  name,
  lang,
}: {
  value: Json;
  onChange: (value: Json) => void;
  name: string;
  lang: string;
}) {
  if (typeof value === "string") {
    return (
      <Field label={labelFor(name)}>
        <TextInput
          value={value}
          onChange={onChange}
          lang={lang}
          multiline={LONG_FIELDS.test(name) || value.length > 70}
        />
      </Field>
    );
  }

  if (Array.isArray(value)) {
    return (
      <fieldset className="space-y-3 rounded-xl border border-dashed border-line p-4">
        <legend className="px-1 text-xs font-medium text-ash">
          {labelFor(name)}
        </legend>
        {value.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <TextTree
                value={item}
                name={
                  typeof item === "string"
                    ? String(index)
                    : `${labelFor(name)} ${index + 1}`
                }
                lang={lang}
                onChange={(next) =>
                  onChange(value.map((old, i) => (i === index ? next : old)))
                }
              />
            </div>
            <button
              type="button"
              aria-label={`Remove item ${index + 1}`}
              disabled={value.length <= 1}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className={`${buttonClass} mt-6 size-9 shrink-0 px-0`}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...value, blank(value[0] ?? "")])}
          className={buttonClass}
        >
          + Add
        </button>
      </fieldset>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(value).map(([key, child]) => (
        <TextTree
          key={key}
          name={key}
          value={child}
          lang={lang}
          onChange={(next) => onChange({ ...value, [key]: next })}
        />
      ))}
    </div>
  );
}
