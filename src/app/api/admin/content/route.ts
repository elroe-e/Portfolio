import { guard, json } from "@/lib/admin/auth";
import { CONTENT_FILES } from "@/lib/admin/paths";
import { getStore, NOT_CONFIGURED, StoreError } from "@/lib/admin/store";

/** Everything the admin page edits, read fresh from storage. */
export async function GET(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const store = getStore();
  if (!store) return json({ error: NOT_CONFIGURED }, { status: 503 });

  try {
    const [settings, en, am, projects, images] = await Promise.all([
      store.readText(CONTENT_FILES.settings),
      store.readText(CONTENT_FILES.en),
      store.readText(CONTENT_FILES.am),
      store.readText(CONTENT_FILES.projects),
      store.listImages(),
    ]);
    return json({
      storage: { mode: store.mode, label: store.label },
      settings: JSON.parse(settings),
      copy: { en: JSON.parse(en), am: JSON.parse(am) },
      projects: JSON.parse(projects),
      images,
    });
  } catch (error) {
    const message =
      error instanceof StoreError
        ? error.message
        : "Couldn't load the content.";
    if (!(error instanceof StoreError)) console.error(error);
    return json({ error: message }, { status: 502 });
  }
}
