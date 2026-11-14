import { guard, json } from "@/lib/admin/auth";
import {
  CONTENT_FILES,
  isRemovableImagePath,
  isWritableImagePath,
} from "@/lib/admin/paths";
import {
  getStore,
  NOT_CONFIGURED,
  type StagedImage,
  StoreError,
  type TextFile,
} from "@/lib/admin/store";
import { checkCopy, checkProjects, checkSettings } from "@/lib/admin/validate";

type SaveRequest = {
  summary?: unknown;
  settings?: unknown;
  copy?: { en?: unknown; am?: unknown };
  projects?: unknown;
  images?: unknown;
  remove?: unknown;
};

const pretty = (value: unknown) => JSON.stringify(value, null, 2) + "\n";

/** Saves everything that changed on the admin page as one change to the site. */
export async function POST(request: Request) {
  const denied = guard(request, { write: true });
  if (denied) return denied;

  const store = getStore();
  if (!store) return json({ error: NOT_CONFIGURED }, { status: 503 });

  const body = (await request.json().catch(() => null)) as SaveRequest | null;
  if (!body) return json({ error: "Nothing to save." }, { status: 400 });

  const write: TextFile[] = [];
  const bad = (error: string) => json({ error }, { status: 400 });

  if (body.settings !== undefined) {
    const error = checkSettings(body.settings);
    if (error) return bad(error);
    write.push({
      path: CONTENT_FILES.settings,
      content: pretty(body.settings),
    });
  }
  for (const language of ["en", "am"] as const) {
    const copy = body.copy?.[language];
    if (copy === undefined) continue;
    const error = checkCopy(copy, language);
    if (error) return bad(error);
    write.push({ path: CONTENT_FILES[language], content: pretty(copy) });
  }
  if (body.projects !== undefined) {
    const error = checkProjects(body.projects);
    if (error) return bad(error);
    write.push({
      path: CONTENT_FILES.projects,
      content: pretty(body.projects),
    });
  }

  const images = Array.isArray(body.images) ? body.images : [];
  if (images.length > 60) return bad("Upload at most 60 images at a time.");
  const staged: StagedImage[] = [];
  for (const image of images) {
    const entry = image as { path?: unknown; token?: unknown };
    if (
      typeof entry.path !== "string" ||
      typeof entry.token !== "string" ||
      !isWritableImagePath(entry.path) ||
      !/^[0-9a-f-]{36,40}$/.test(entry.token)
    ) {
      return bad("One of the uploads has an invalid name.");
    }
    staged.push({ path: entry.path, token: entry.token });
  }

  const remove = Array.isArray(body.remove) ? body.remove : [];
  if (
    !remove.every(
      (file) => typeof file === "string" && isRemovableImagePath(file),
    )
  ) {
    return bad("One of the files to delete isn't an image the admin manages.");
  }

  if (write.length === 0 && staged.length === 0 && remove.length === 0) {
    return bad("Nothing changed.");
  }

  const summary =
    typeof body.summary === "string" && body.summary.trim()
      ? body.summary.trim().slice(0, 120)
      : "Update site content";

  try {
    const result = await store.commit({
      message: `${summary}\n\nSaved from the admin page.`,
      write,
      images: staged,
      remove: remove as string[],
    });
    return json({ ok: true, url: result.url, mode: store.mode });
  } catch (error) {
    if (!(error instanceof StoreError)) console.error(error);
    return json(
      { error: error instanceof StoreError ? error.message : "Saving failed." },
      { status: error instanceof StoreError ? error.status : 500 },
    );
  }
}
