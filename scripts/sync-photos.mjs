#!/usr/bin/env node
/**
 * Indexes the images in /public so the site can show them with no manual wiring.
 *
 *   public/photos/<category>/*   → gallery photos, grouped by folder
 *   public/portrait.*            → portrait in the About section
 *   public/projects/<slug>.*     → project screenshots
 *
 * It writes src/content/media.generated.json with each image's size and a tiny
 * blurred preview. Runs automatically before `npm run dev` and `npm run build`;
 * run `npm run photos` yourself after adding images while the dev server is up.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const outFile = path.join(root, "src", "content", "media.generated.json");

const IMAGE = /\.(jpe?g|png|webp|avif)$/i;
const LARGE_FILE_BYTES = 3 * 1024 * 1024;
const byName = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

/** "02-street-life" → "Street life" */
function humanize(name) {
  const text = name
    .replace(/^\d+[\s._-]*/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

/** Camera file names such as IMG_1234 or DSC00012 carry no meaning, so they get no title. */
function titleFromFile(file) {
  const base = path.basename(file, path.extname(file));
  const title = humanize(base);
  const looksGenerated =
    !/[a-z]{3,}/i.test(title) ||
    /^(img|dsc[fn]?|pxl|mvimg|photo|image|screenshot)\b[\s\d]*$/i.test(title);
  return looksGenerated ? "" : title;
}

function toUrl(absolutePath) {
  return (
    "/" +
    path
      .relative(publicDir, absolutePath)
      .split(path.sep)
      .map(encodeURIComponent)
      .join("/")
  );
}

async function entries(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function imagesIn(dir) {
  return (await entries(dir))
    .filter((entry) => entry.isFile() && IMAGE.test(entry.name))
    .map((entry) => path.join(dir, entry.name))
    .sort(byName.compare);
}

async function describe(file) {
  try {
    const meta = await sharp(file).metadata();
    if (!meta.width || !meta.height) throw new Error("unknown dimensions");

    // EXIF orientations 5–8 mean the picture is stored on its side.
    const sideways = (meta.orientation ?? 1) >= 5;
    const preview = await sharp(file)
      .rotate()
      .resize(24, 24, { fit: "inside" })
      .webp({ quality: 45 })
      .toBuffer();

    const { size } = await fs.stat(file);
    if (size > LARGE_FILE_BYTES) {
      console.warn(
        `  ! ${path.relative(root, file)} is ${(size / 1024 / 1024).toFixed(1)} MB — ` +
          "export around 2400px on the long edge to keep the repo light.",
      );
    }

    return {
      src: toUrl(file),
      width: sideways ? meta.height : meta.width,
      height: sideways ? meta.width : meta.height,
      blurDataURL: `data:image/webp;base64,${preview.toString("base64")}`,
    };
  } catch (error) {
    console.warn(`  ! Skipped ${path.relative(root, file)} (${error.message})`);
    return null;
  }
}

async function collectPhotos() {
  const photosDir = path.join(publicDir, "photos");
  const folders = (await entries(photosDir))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(byName.compare);

  const groups = [
    // Images placed directly in public/photos have no category of their own.
    { category: "Photos", files: await imagesIn(photosDir) },
    ...(await Promise.all(
      folders.map(async (folder) => ({
        category: humanize(folder) || folder,
        files: await imagesIn(path.join(photosDir, folder)),
      })),
    )),
  ];

  const photos = [];
  for (const { category, files } of groups) {
    for (const file of files) {
      const asset = await describe(file);
      if (!asset) continue;
      const title = titleFromFile(file);
      photos.push({
        ...asset,
        category,
        title,
        alt: title || `${category} photograph by Elroe Fikremariam`,
      });
    }
  }
  return photos;
}

async function collectPortrait() {
  const [file] = (await imagesIn(publicDir)).filter((candidate) =>
    /^portrait\./i.test(path.basename(candidate)),
  );
  return file ? describe(file) : null;
}

async function collectProjects() {
  const projects = {};
  for (const file of await imagesIn(path.join(publicDir, "projects"))) {
    const asset = await describe(file);
    if (asset) projects[path.basename(file, path.extname(file))] = asset;
  }
  return projects;
}

const manifest = {
  photos: await collectPhotos(),
  portrait: await collectPortrait(),
  projects: await collectProjects(),
};

const next = JSON.stringify(manifest, null, 2) + "\n";
const previous = await fs.readFile(outFile, "utf8").catch(() => "");
if (next !== previous) await fs.writeFile(outFile, next);

const categories = new Set(manifest.photos.map((photo) => photo.category));
console.log(
  manifest.photos.length
    ? `✓ ${manifest.photos.length} photo${manifest.photos.length === 1 ? "" : "s"} in ${categories.size} categor${categories.size === 1 ? "y" : "ies"}`
    : "• No photos in public/photos yet — the gallery will show placeholders.",
);
console.log(
  `${manifest.portrait ? "✓" : "•"} Portrait ${manifest.portrait ? "found" : "not added yet (public/portrait.jpg)"}`,
);
const shots = Object.keys(manifest.projects);
console.log(
  shots.length
    ? `✓ Project screenshots: ${shots.join(", ")}`
    : "• No project screenshots yet (public/projects/<slug>.jpg)",
);
