import "server-only";
import template from "@/content/copy.en.json";

/**
 * Checks content sent from the admin page before it is saved, so a bad save
 * can never break the site's build. Returns an error message, or null if valid.
 */

const MAX_TEXT = 3000;

type Json = unknown;

function isObject(value: Json): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(
  value: Json,
  where: string,
  { max = MAX_TEXT, required = false } = {},
) {
  if (typeof value !== "string") return `${where} must be text.`;
  if (value.length > max) return `${where} is too long.`;
  if (required && !value.trim()) return `${where} can't be empty.`;
  return null;
}

/** Same keys and types as the template, all the way down. */
function sameShape(model: Json, value: Json, where: string): string | null {
  if (typeof model === "string") return text(value, where);
  if (Array.isArray(model)) {
    if (!Array.isArray(value)) return `${where} must be a list.`;
    if (value.length < 1 || value.length > 40)
      return `${where} needs 1–40 items.`;
    for (const [index, item] of value.entries()) {
      const error = sameShape(model[0], item, `${where} item ${index + 1}`);
      if (error) return error;
    }
    return null;
  }
  if (isObject(model)) {
    if (!isObject(value)) return `${where} is missing.`;
    const expected = Object.keys(model).sort().join(",");
    const actual = Object.keys(value).sort().join(",");
    if (expected !== actual) return `${where} has unexpected fields.`;
    for (const key of Object.keys(model)) {
      const error = sameShape(model[key], value[key], `${where} → ${key}`);
      if (error) return error;
    }
    return null;
  }
  return null;
}

export function checkCopy(value: Json, language: string) {
  return sameShape(
    template,
    value,
    language === "am" ? "Amharic text" : "English text",
  );
}

const SAFE_LINK = /^(https?:\/\/|tel:|mailto:)[^\s<>"']+$/i;

export function checkSettings(value: Json): string | null {
  if (!isObject(value)) return "Settings are missing.";
  const keys = Object.keys(value).sort().join(",");
  if (keys !== "available,contact,heroPhotos,name")
    return "Settings have unexpected fields.";

  const name = value.name;
  if (!isObject(name)) return "Name is missing.";
  const nameError =
    text(name.first, "First name", { max: 60, required: true }) ??
    text(name.last, "Last name", { max: 60, required: true });
  if (nameError) return nameError;

  if (typeof value.available !== "boolean")
    return "Availability must be on or off.";

  const hero = value.heroPhotos;
  if (!Array.isArray(hero) || hero.length > 3)
    return "Pick up to 3 hero photos.";
  if (
    !hero.every((src) => typeof src === "string" && src.startsWith("/photos/"))
  ) {
    return "Hero photos must be gallery photos.";
  }

  const contact = value.contact;
  if (!isObject(contact)) return "Contact details are missing.";
  for (const channel of ["telegram", "instagram", "phone"]) {
    const entry = contact[channel];
    if (!isObject(entry)) return `${channel} details are missing.`;
    const error = text(entry.value, `${channel} name`, {
      max: 80,
      required: true,
    });
    if (error) return error;
    if (typeof entry.href !== "string" || !SAFE_LINK.test(entry.href)) {
      return `The ${channel} link must start with https://, tel: or mailto:.`;
    }
  }
  return null;
}

export function checkProjects(value: Json): string | null {
  if (!Array.isArray(value)) return "Projects must be a list.";
  if (value.length > 30) return "That's more than 30 projects.";
  const slugs = new Set<string>();

  for (const [index, project] of value.entries()) {
    const where = `Project ${index + 1}`;
    if (!isObject(project)) return `${where} is missing.`;
    const keys = Object.keys(project).sort().join(",");
    if (keys !== "am,displayUrl,en,slug,stack,title,url")
      return `${where} has unexpected fields.`;
    if (
      typeof project.slug !== "string" ||
      !/^[a-z0-9][a-z0-9-]{0,59}$/.test(project.slug)
    ) {
      return `${where}: the short name may only use a–z, 0–9 and dashes.`;
    }
    if (slugs.has(project.slug))
      return `${where}: two projects share the short name "${project.slug}".`;
    slugs.add(project.slug);

    const error =
      text(project.title, `${where} title`, { max: 80, required: true }) ??
      text(project.displayUrl, `${where} address`, { max: 120 });
    if (error) return error;
    if (
      typeof project.url !== "string" ||
      !/^https?:\/\/[^\s<>"']+$/.test(project.url)
    ) {
      return `${where}: the link must start with http:// or https://.`;
    }
    if (
      !Array.isArray(project.stack) ||
      project.stack.length > 20 ||
      !project.stack.every(
        (tool) => typeof tool === "string" && tool.length <= 40,
      )
    ) {
      return `${where}: "Built with" must be a short list.`;
    }
    for (const language of ["en", "am"]) {
      const words = project[language];
      if (!isObject(words)) return `${where}: text is missing.`;
      if (Object.keys(words).sort().join(",") !== "kind,role,status,summary") {
        return `${where}: text has unexpected fields.`;
      }
      for (const field of ["kind", "role", "status", "summary"]) {
        const fieldError = text(words[field], `${where} ${field}`, {
          max: 600,
        });
        if (fieldError) return fieldError;
      }
    }
  }
  return null;
}
