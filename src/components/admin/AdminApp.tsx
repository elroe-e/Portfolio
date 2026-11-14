"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Copy, Project, Settings } from "@/content/site";
import { humanize, publicUrl, slugify } from "@/lib/admin/paths";
import {
  buttonClass,
  Card,
  Field,
  inputClass,
  primaryButtonClass,
  TextInput,
  TextTree,
  Toggle,
} from "./fields";
import { resizeImage } from "./resize";

/* ------------------------------------------------------------------ */
/* Types and helpers                                                    */
/* ------------------------------------------------------------------ */

type Storage = { mode: "github" | "local"; label: string };

type Content = {
  storage: Storage;
  settings: Settings;
  copy: { en: Copy; am: Copy };
  projects: Project[];
  images: string[];
};

type Draft = Pick<Content, "settings" | "copy" | "projects">;

/** A photo chosen on this page, uploaded and waiting to be published. */
type Upload = {
  id: string;
  path: string;
  preview: string;
  title: string;
  folder: string;
  kind: "photo" | "portrait" | "screenshot";
  status: "uploading" | "ready" | "failed";
  token?: string;
  error?: string;
};

type Tab = "photos" | "text" | "projects" | "settings";

const TABS: Array<[Tab, string]> = [
  ["photos", "Photos"],
  ["text", "Text"],
  ["projects", "Projects"],
  ["settings", "Settings"],
];

const SECTION_TITLES: Record<string, string> = {
  meta: "Search results & link previews",
  nav: "Navigation & buttons",
  hero: "Top of the page",
  marquee: "Moving band of words",
  about: "About",
  photography: "Photography",
  development: "Development",
  next: "What's next",
  contact: "Contact",
  footer: "Footer",
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "same-origin", ...init });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      body.error ?? `Something went wrong (${response.status}).`,
    );
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  return body as T;
}

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

/** Camera names like IMG_1234 carry no meaning, so they get no title. */
function titleFromFile(name: string) {
  const title = humanize(name);
  return !/[a-z]{3,}/i.test(title) ||
    /^(img|dsc[fn]?|pxl|mvimg|photo|image|screenshot)\b[\s\d]*$/i.test(title)
    ? ""
    : title;
}

/** Number prefix of a file name: "07-night-bus.jpg" → 7 */
const leadingNumber = (file: string) =>
  Number(/^(\d+)/.exec(file.split("/").pop() ?? "")?.[1] ?? 0);

function photoPath(folder: string, number: number, title: string) {
  return `public/photos/${folder}/${String(number).padStart(2, "0")}-${slugify(title) || "photo"}.jpg`;
}

/* ------------------------------------------------------------------ */
/* Login                                                                */
/* ------------------------------------------------------------------ */

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await request("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      onDone();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-[18vh] w-full max-w-sm space-y-5"
    >
      <h1 className="text-3xl font-medium tracking-tight">
        Admin<span className="text-ember">.</span>
      </h1>
      <Field label="Password">
        <input
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
        />
      </Field>
      {error && (
        <p role="alert" className="text-sm text-ember">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !password}
        className={`${primaryButtonClass} w-full`}
      >
        {busy ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}

function Setup() {
  return (
    <div className="mx-auto mt-[14vh] max-w-lg space-y-4">
      <h1 className="text-3xl font-medium tracking-tight">
        Admin isn&apos;t set up yet<span className="text-ember">.</span>
      </h1>
      <p className="leading-relaxed text-ash">
        Add an <code className="text-bone">ADMIN_PASSWORD</code> environment
        variable to turn on this page. On Vercel: Project → Settings →
        Environment Variables. On your computer: put it in a file called{" "}
        <code className="text-bone">.env.local</code>. The README has the full
        steps.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Image thumbnail                                                      */
/* ------------------------------------------------------------------ */

function Thumb({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="grid h-full w-full place-items-center bg-bone/5 p-2 text-center text-[11px] text-ash">
      Published — appears after the site updates
    </span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- plain thumbnails, including ones not yet deployed
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

/* ------------------------------------------------------------------ */
/* The admin app                                                        */
/* ------------------------------------------------------------------ */

export function AdminApp() {
  const [phase, setPhase] = useState<"checking" | "setup" | "login" | "ready">(
    "checking",
  );
  const [content, setContent] = useState<Content | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<Tab>("photos");
  const [lang, setLang] = useState<"en" | "am">("en");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
    url?: string | null;
  } | null>(null);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await request<Content>("/api/admin/content", {
        cache: "no-store",
      });
      setContent(data);
      setDraft({
        settings: data.settings,
        copy: data.copy,
        projects: data.projects,
      });
      setPhase("ready");
    } catch (failure) {
      if ((failure as { status?: number }).status === 401) setPhase("login");
      else {
        setLoadError((failure as Error).message);
        setPhase("ready");
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    request<{ configured: boolean; loggedIn: boolean }>("/api/admin/session", {
      cache: "no-store",
    })
      .then((session) => {
        if (!active) return;
        if (!session.configured) setPhase("setup");
        else if (!session.loggedIn) setPhase("login");
        else void load();
      })
      .catch(() => active && setPhase("login"));
    return () => {
      active = false;
    };
  }, [load]);

  /* ---------------- what changed ---------------- */

  const readyUploads = uploads.filter((upload) => upload.status === "ready");
  const busyUploads = uploads.filter(
    (upload) => upload.status === "uploading",
  ).length;
  const changes = useMemo(() => {
    if (!content || !draft) return [];
    const list: string[] = [];
    const photos = readyUploads.filter(
      (upload) => upload.kind === "photo",
    ).length;
    if (photos) list.push(`Add ${photos} photo${photos === 1 ? "" : "s"}`);
    if (readyUploads.some((upload) => upload.kind === "portrait"))
      list.push("New portrait");
    if (readyUploads.some((upload) => upload.kind === "screenshot"))
      list.push("New screenshot");
    if (removed.length)
      list.push(
        `Remove ${removed.length} image${removed.length === 1 ? "" : "s"}`,
      );
    if (!same(draft.settings, content.settings)) list.push("Settings");
    if (!same(draft.copy.en, content.copy.en)) list.push("English text");
    if (!same(draft.copy.am, content.copy.am)) list.push("Amharic text");
    if (!same(draft.projects, content.projects)) list.push("Projects");
    return list;
  }, [content, draft, readyUploads, removed]);

  const dirty = changes.length > 0 || busyUploads > 0;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /* ---------------- uploading ---------------- */

  const startUpload = useCallback(
    async (file: File, base: Omit<Upload, "id" | "preview" | "status">) => {
      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      setUploads((list) => [
        ...list.filter((item) => item.path !== base.path),
        { ...base, id, preview, status: "uploading" },
      ]);
      setRemoved((list) => list.filter((path) => path !== base.path));
      try {
        const blob = await resizeImage(file);
        const { token } = await request<{ token: string }>(
          "/api/admin/upload",
          {
            method: "POST",
            headers: { "Content-Type": "image/jpeg" },
            body: blob,
          },
        );
        setUploads((list) =>
          list.map((item) =>
            item.id === id ? { ...item, status: "ready", token } : item,
          ),
        );
      } catch (failure) {
        setUploads((list) =>
          list.map((item) =>
            item.id === id
              ? { ...item, status: "failed", error: (failure as Error).message }
              : item,
          ),
        );
      }
    },
    [],
  );

  const discardUpload = (id: string) => {
    setUploads((list) => {
      const gone = list.find((item) => item.id === id);
      if (gone) URL.revokeObjectURL(gone.preview);
      return list.filter((item) => item.id !== id);
    });
  };

  const changeUpload = (id: string, change: Partial<Upload>) =>
    setUploads((list) =>
      list.map((item) => (item.id === id ? { ...item, ...change } : item)),
    );

  /* ---------------- publishing ---------------- */

  const discardAll = () => {
    if (!content) return;
    uploads.forEach((upload) => URL.revokeObjectURL(upload.preview));
    setUploads([]);
    setRemoved([]);
    setDraft({
      settings: content.settings,
      copy: content.copy,
      projects: content.projects,
    });
    setNotice(null);
  };

  const publish = async () => {
    if (!content || !draft) return;
    setPublishing(true);
    setNotice(null);
    const uploadPaths = new Set(readyUploads.map((upload) => upload.path));
    try {
      const result = await request<{
        url: string | null;
        mode: Storage["mode"];
      }>("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: changes.join(", "),
          ...(same(draft.settings, content.settings)
            ? {}
            : { settings: draft.settings }),
          ...(same(draft.projects, content.projects)
            ? {}
            : { projects: draft.projects }),
          copy: {
            ...(same(draft.copy.en, content.copy.en)
              ? {}
              : { en: draft.copy.en }),
            ...(same(draft.copy.am, content.copy.am)
              ? {}
              : { am: draft.copy.am }),
          },
          images: readyUploads.map(({ path, token }) => ({ path, token })),
          remove: removed.filter((path) => !uploadPaths.has(path)),
        }),
      });
      // Keep showing the new photos until the rebuilt site serves them.
      setPreviews((old) => ({
        ...old,
        ...Object.fromEntries(
          readyUploads.map((upload) => [upload.path, upload.preview]),
        ),
      }));
      setUploads((list) => list.filter((upload) => upload.status !== "ready"));
      setRemoved([]);
      setNotice({
        kind: "ok",
        text:
          result.mode === "github"
            ? "Published. The live site updates in about a minute."
            : "Saved to the project files. Commit and push them when you're ready.",
        url: result.url,
      });
      await load();
    } catch (failure) {
      setNotice({ kind: "error", text: (failure as Error).message });
    } finally {
      setPublishing(false);
    }
  };

  const logout = async () => {
    if (
      dirty &&
      !window.confirm("You have changes that aren't published. Log out anyway?")
    )
      return;
    await request("/api/admin/session", { method: "DELETE" }).catch(
      () => undefined,
    );
    setContent(null);
    setDraft(null);
    setPhase("login");
  };

  /* ---------------- screens ---------------- */

  if (phase === "checking") {
    return <p className="mt-[30vh] text-center text-sm text-ash">Loading…</p>;
  }
  if (phase === "setup") return <Setup />;
  if (phase === "login") return <Login onDone={() => void load()} />;
  if (loadError || !content || !draft) {
    return (
      <div className="mx-auto mt-[20vh] max-w-lg space-y-4 text-center">
        <p className="text-ember">
          {loadError ?? "Couldn't load the content."}
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className={buttonClass}
        >
          Try again
        </button>
      </div>
    );
  }

  const update = (next: Partial<Draft>) => setDraft({ ...draft, ...next });
  const panelProps = {
    content,
    draft,
    update,
    uploads,
    removed,
    previews,
    startUpload,
    discardUpload,
    changeUpload,
    setRemoved,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-40 pt-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">
            Admin<span className="text-ember">.</span>
          </h1>
          <p className="mt-1 text-xs text-ash">
            Saving to:{" "}
            <span className="text-bone">{content.storage.label}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            View site ↗
          </a>
          <button
            type="button"
            onClick={() => void logout()}
            className={buttonClass}
          >
            Log out
          </button>
        </div>
      </header>

      <nav
        aria-label="Admin sections"
        className="sticky top-0 z-20 -mx-4 bg-ink/95 px-4 py-3 sm:-mx-6 sm:px-6"
      >
        <div role="tablist" className="flex gap-1 overflow-x-auto">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                tab === id ? "bg-bone text-ink" : "text-ash hover:text-bone"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-4 space-y-6">
        {tab === "photos" && <PhotosPanel {...panelProps} />}
        {tab === "text" && (
          <TextPanel
            draft={draft}
            update={update}
            lang={lang}
            setLang={setLang}
          />
        )}
        {tab === "projects" && <ProjectsPanel {...panelProps} />}
        {tab === "settings" && <SettingsPanel draft={draft} update={update} />}
      </div>

      {/* Publish bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/95 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div aria-live="polite" className="min-w-0 text-sm">
            {notice ? (
              <p
                className={
                  notice.kind === "ok" ? "text-emerald-500" : "text-ember"
                }
              >
                {notice.text}{" "}
                {notice.url && (
                  <a
                    href={notice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    See the change
                  </a>
                )}
              </p>
            ) : busyUploads > 0 ? (
              <p className="text-ash">Uploading {busyUploads}…</p>
            ) : changes.length > 0 ? (
              <p className="truncate text-ash">
                <span className="text-bone">Not published yet:</span>{" "}
                {changes.join(" · ")}
              </p>
            ) : (
              <p className="text-ash">Everything is published.</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={discardAll}
              disabled={!dirty || publishing}
              className={buttonClass}
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => void publish()}
              disabled={changes.length === 0 || busyUploads > 0 || publishing}
              className={primaryButtonClass}
            >
              {publishing ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Photos                                                               */
/* ------------------------------------------------------------------ */

type PanelProps = {
  content: Content;
  draft: Draft;
  update: (next: Partial<Draft>) => void;
  uploads: Upload[];
  removed: string[];
  previews: Record<string, string>;
  startUpload: (
    file: File,
    base: Omit<Upload, "id" | "preview" | "status">,
  ) => Promise<void>;
  discardUpload: (id: string) => void;
  changeUpload: (id: string, change: Partial<Upload>) => void;
  setRemoved: (update: (list: string[]) => string[]) => void;
};

const NEW_CATEGORY = "\u0000new";

function UploadTile({
  upload,
  onTitle,
  onDiscard,
}: {
  upload: Upload;
  onTitle?: (title: string) => void;
  onDiscard: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-ember/50 bg-coal">
      <div className="relative aspect-[4/3]">
        {/* eslint-disable-next-line @next/next/no-img-element -- local preview of a file being uploaded */}
        <img
          src={upload.preview}
          alt=""
          className="h-full w-full object-cover"
        />
        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] text-white">
          {upload.status === "uploading"
            ? "Uploading…"
            : upload.status === "failed"
              ? "Failed"
              : "New"}
        </span>
      </div>
      <div className="space-y-2 p-3">
        {onTitle && (
          <input
            value={upload.title}
            onChange={(event) => onTitle(event.target.value)}
            placeholder="Title (optional)"
            aria-label="Photo title"
            className={`${inputClass} py-1.5`}
          />
        )}
        {upload.error && <p className="text-xs text-ember">{upload.error}</p>}
        <button
          type="button"
          onClick={onDiscard}
          className="text-xs text-ash underline hover:text-bone"
        >
          Don&apos;t add
        </button>
      </div>
    </div>
  );
}

function PhotosPanel({
  content,
  draft,
  update,
  uploads,
  removed,
  previews,
  startUpload,
  discardUpload,
  changeUpload,
  setRemoved,
}: PanelProps) {
  const [category, setCategory] = useState<string>("");
  const [newCategory, setNewCategory] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const photos = content.images.filter((path) =>
    path.startsWith("public/photos/"),
  );
  const folders = useMemo(() => {
    const names = new Set(
      photos
        .filter((path) => path.split("/").length === 4)
        .map((path) => path.split("/")[2]),
    );
    return [...names].sort((a, b) =>
      a.localeCompare(b, "en", { numeric: true }),
    );
  }, [photos]);

  const chosen = category || folders[0] || NEW_CATEGORY;
  const folder = chosen === NEW_CATEGORY ? slugify(newCategory) : chosen;
  const hero = draft.settings.heroPhotos;
  const portrait = content.images.find((path) =>
    /^public\/portrait\./.test(path),
  );
  const portraitUpload = uploads.find((upload) => upload.kind === "portrait");

  const addPhotos = (files: FileList | null) => {
    setMessage(null);
    if (!files?.length) return;
    if (!folder) {
      setMessage("Type a name for the new category first.");
      return;
    }
    const taken = [
      ...photos.filter((path) => path.startsWith(`public/photos/${folder}/`)),
      ...uploads
        .filter((upload) => upload.folder === folder)
        .map((upload) => upload.path),
    ];
    let next = Math.max(0, ...taken.map(leadingNumber)) + 1;
    for (const file of Array.from(files)) {
      const title = titleFromFile(file.name);
      void startUpload(file, {
        path: photoPath(folder, next, title),
        title,
        folder,
        kind: "photo",
      });
      next += 1;
    }
  };

  // The file name carries the title, so renaming changes the path (not the upload).
  const retitle = (upload: Upload, title: string) =>
    changeUpload(upload.id, {
      title,
      path: photoPath(upload.folder, leadingNumber(upload.path), title),
    });

  const toggleHero = (path: string) => {
    const src = publicUrl(path);
    setMessage(null);
    if (hero.includes(src)) {
      update({
        settings: {
          ...draft.settings,
          heroPhotos: hero.filter((item) => item !== src),
        },
      });
    } else if (hero.length >= 3) {
      setMessage("The top of the page shows up to 3 photos. Unstar one first.");
    } else {
      update({ settings: { ...draft.settings, heroPhotos: [...hero, src] } });
    }
  };

  const toggleRemove = (path: string) => {
    const src = publicUrl(path);
    if (removed.includes(path)) {
      setRemoved((list) => list.filter((item) => item !== path));
      return;
    }
    setRemoved((list) => [...list, path]);
    if (hero.includes(src)) {
      update({
        settings: {
          ...draft.settings,
          heroPhotos: hero.filter((item) => item !== src),
        },
      });
    }
  };

  const grouped = folders.map((name) => ({
    name,
    paths: photos.filter((path) => path.startsWith(`public/photos/${name}/`)),
  }));
  const loose = photos.filter((path) => path.split("/").length === 3);

  return (
    <>
      <Card
        title="Add photos"
        description="Choose a category, then pick photos. They're resized automatically. Titles come from the file names — you can change them before publishing."
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Category">
            <select
              value={chosen}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
            >
              {folders.map((name) => (
                <option key={name} value={name}>
                  {humanize(name) || name}
                </option>
              ))}
              <option value={NEW_CATEGORY}>+ New category…</option>
            </select>
          </Field>
          {chosen === NEW_CATEGORY ? (
            <Field
              label="New category name"
              hint={folder ? `Folder: ${folder}` : undefined}
            >
              <TextInput
                value={newCategory}
                onChange={setNewCategory}
                placeholder="e.g. Weddings"
              />
            </Field>
          ) : (
            <span />
          )}
          <label className={`${primaryButtonClass} cursor-pointer`}>
            Choose photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                addPhotos(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        </div>
        {message && (
          <p role="alert" className="mt-3 text-sm text-ember">
            {message}
          </p>
        )}

        {uploads.some((upload) => upload.kind === "photo") && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {uploads
              .filter((upload) => upload.kind === "photo")
              .map((upload) => (
                <UploadTile
                  key={upload.id}
                  upload={upload}
                  onTitle={(title) => retitle(upload, title)}
                  onDiscard={() => discardUpload(upload.id)}
                />
              ))}
          </div>
        )}
      </Card>

      <Card
        title="Your photos"
        description="★ puts a photo in the floating prints at the top of the page (up to 3). Without any picked, the first two are used."
      >
        {photos.length === 0 ? (
          <p className="text-sm text-ash">
            No photos yet — the gallery shows placeholder frames until you add
            some.
          </p>
        ) : (
          <div className="space-y-6">
            {[
              ...grouped,
              ...(loose.length ? [{ name: "", paths: loose }] : []),
            ].map((group) => (
              <div key={group.name || "loose"}>
                <h3 className="mb-3 text-sm font-medium">
                  {group.name ? humanize(group.name) || group.name : "Photos"}{" "}
                  <span className="text-ash">({group.paths.length})</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {group.paths.map((path) => {
                    const gone = removed.includes(path);
                    const starred = hero.includes(publicUrl(path));
                    const name =
                      humanize(path.split("/").pop() ?? "") || "Untitled";
                    return (
                      <div
                        key={path}
                        className={`overflow-hidden rounded-xl border bg-coal transition-opacity ${
                          gone ? "border-ember opacity-40" : "border-line"
                        }`}
                      >
                        <div className="relative aspect-[4/3]">
                          <Thumb
                            src={previews[path] ?? publicUrl(path)}
                            alt={name}
                          />
                          <button
                            type="button"
                            onClick={() => toggleHero(path)}
                            aria-pressed={starred}
                            aria-label={
                              starred
                                ? `Remove ${name} from the top of the page`
                                : `Show ${name} at the top of the page`
                            }
                            className={`absolute right-2 top-2 grid size-8 place-items-center rounded-full text-base ${
                              starred
                                ? "bg-ember text-white"
                                : "bg-black/60 text-white/80 hover:text-white"
                            }`}
                          >
                            ★
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2 p-3">
                          <span className="truncate text-xs" title={path}>
                            {name}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRemove(path)}
                            className="shrink-0 text-xs text-ash underline hover:text-ember"
                          >
                            {gone ? "Keep" : "Delete"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="Portrait"
        description="The photo of you in the About section."
      >
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative aspect-[4/5] w-32 overflow-hidden rounded-xl border border-line bg-bone/5">
            {portraitUpload ? (
              // eslint-disable-next-line @next/next/no-img-element -- local preview
              <img
                src={portraitUpload.preview}
                alt="New portrait"
                className="h-full w-full object-cover"
              />
            ) : portrait && !removed.includes(portrait) ? (
              <Thumb
                src={previews[portrait] ?? publicUrl(portrait)}
                alt="Current portrait"
              />
            ) : (
              <span className="grid h-full place-items-center text-xs text-ash">
                None yet
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className={`${buttonClass} cursor-pointer`}>
              {portrait ? "Replace" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  // Other formats of an old portrait would compete with the new one.
                  const others = content.images.filter(
                    (path) =>
                      /^public\/portrait\./.test(path) &&
                      path !== "public/portrait.jpg",
                  );
                  setRemoved((list) => [...new Set([...list, ...others])]);
                  void startUpload(file, {
                    path: "public/portrait.jpg",
                    title: "",
                    folder: "",
                    kind: "portrait",
                  });
                }}
              />
            </label>
            {portraitUpload && (
              <button
                type="button"
                onClick={() => discardUpload(portraitUpload.id)}
                className={buttonClass}
              >
                Don&apos;t change
              </button>
            )}
            {portrait && !portraitUpload && (
              <button
                type="button"
                onClick={() => toggleRemove(portrait)}
                className={buttonClass}
              >
                {removed.includes(portrait) ? "Keep" : "Remove"}
              </button>
            )}
          </div>
          {portraitUpload?.error && (
            <p className="text-sm text-ember">{portraitUpload.error}</p>
          )}
        </div>
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Text                                                                 */
/* ------------------------------------------------------------------ */

function TextPanel({
  draft,
  update,
  lang,
  setLang,
}: {
  draft: Draft;
  update: (next: Partial<Draft>) => void;
  lang: "en" | "am";
  setLang: (lang: "en" | "am") => void;
}) {
  const copy = draft.copy[lang];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ash">
          Every word on the site, section by section.
        </p>
        <div
          role="group"
          aria-label="Language"
          className="flex rounded-full border border-line p-0.5 text-sm"
        >
          {(
            [
              ["en", "English"],
              ["am", "አማርኛ"],
            ] as const
          ).map(([code, label]) => (
            <button
              key={code}
              type="button"
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
              className={`rounded-full px-4 py-1.5 ${lang === code ? "bg-bone text-ink" : "text-ash"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(copy).map(([section, value]) => (
        <details
          key={`${lang}-${section}`}
          className="group rounded-2xl border border-line bg-coal/60"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-base font-medium">
            {SECTION_TITLES[section] ?? section}
            <span className="text-ash transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="border-t border-line p-5">
            <TextTree
              name={section}
              value={value as never}
              lang={lang}
              onChange={(next) =>
                update({
                  copy: { ...draft.copy, [lang]: { ...copy, [section]: next } },
                })
              }
            />
          </div>
        </details>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Projects                                                             */
/* ------------------------------------------------------------------ */

const EMPTY_TEXT = { kind: "", role: "", status: "", summary: "" };

function ProjectsPanel({
  content,
  draft,
  update,
  uploads,
  removed,
  previews,
  startUpload,
  discardUpload,
  setRemoved,
}: PanelProps) {
  const projects = draft.projects;
  const savedSlugs = new Set(content.projects.map((project) => project.slug));

  const change = (index: number, next: Project) =>
    update({
      projects: projects.map((project, i) => (i === index ? next : project)),
    });

  const move = (index: number, by: number) => {
    const target = index + by;
    if (target < 0 || target >= projects.length) return;
    const list = [...projects];
    [list[index], list[target]] = [list[target], list[index]];
    update({ projects: list });
  };

  const add = () =>
    update({
      projects: [
        ...projects,
        {
          slug: `project-${projects.length + 1}`,
          title: "New project",
          url: "https://",
          displayUrl: "",
          stack: [],
          en: { ...EMPTY_TEXT, kind: "Website", status: "Live" },
          am: { ...EMPTY_TEXT, kind: "ድረ-ገጽ", status: "በሥራ ላይ" },
        },
      ],
    });

  return (
    <>
      {projects.map((project, index) => {
        const isNew = !savedSlugs.has(project.slug);
        const screenshot = content.images.find((path) =>
          path.startsWith(`public/projects/${project.slug}.`),
        );
        const shotUpload = uploads.find(
          (upload) =>
            upload.kind === "screenshot" && upload.folder === project.slug,
        );

        return (
          <Card
            key={index}
            title={project.title || "Untitled project"}
            actions={
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className={`${buttonClass} size-9 px-0`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === projects.length - 1}
                  onClick={() => move(index, 1)}
                  className={`${buttonClass} size-9 px-0`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(`Remove "${project.title}" from the site?`)
                    ) {
                      update({
                        projects: projects.filter((_, i) => i !== index),
                      });
                      if (screenshot)
                        setRemoved((list) => [
                          ...new Set([...list, screenshot]),
                        ]);
                    }
                  }}
                  className={buttonClass}
                >
                  Remove
                </button>
              </div>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <TextInput
                  value={project.title}
                  onChange={(title) => change(index, { ...project, title })}
                />
              </Field>
              <Field
                label="Short name"
                hint={
                  isNew
                    ? "Used for the screenshot file. a–z, 0–9 and dashes."
                    : "Fixed once published."
                }
              >
                <TextInput
                  value={project.slug}
                  disabled={!isNew}
                  onChange={(slug) =>
                    change(index, {
                      ...project,
                      slug: slugify(slug) || slug.toLowerCase(),
                    })
                  }
                />
              </Field>
              <Field label="Link">
                <TextInput
                  value={project.url}
                  onChange={(url) => change(index, { ...project, url })}
                  placeholder="https://…"
                />
              </Field>
              <Field label="Address shown">
                <TextInput
                  value={project.displayUrl}
                  onChange={(displayUrl) =>
                    change(index, { ...project, displayUrl })
                  }
                  placeholder="example.com"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label="Built with"
                  hint="Separate with commas, e.g. Next.js, Node.js, PostgreSQL"
                >
                  <TextInput
                    value={project.stack.join(", ")}
                    onChange={(value) =>
                      change(index, {
                        ...project,
                        stack: value
                          .split(",")
                          .map((tool) => tool.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {(["en", "am"] as const).map((code) => (
                <fieldset
                  key={code}
                  lang={code}
                  className="space-y-3 rounded-xl border border-dashed border-line p-4"
                >
                  <legend className="px-1 text-xs font-medium text-ash">
                    {code === "en" ? "English" : "አማርኛ"}
                  </legend>
                  {(["kind", "role", "status"] as const).map((field) => (
                    <Field
                      key={field}
                      label={
                        field === "kind"
                          ? "Type"
                          : field === "role"
                            ? "My role"
                            : "Status"
                      }
                    >
                      <TextInput
                        value={project[code][field]}
                        onChange={(value) =>
                          change(index, {
                            ...project,
                            [code]: { ...project[code], [field]: value },
                          })
                        }
                      />
                    </Field>
                  ))}
                  <Field label="Description">
                    <TextInput
                      multiline
                      value={project[code].summary}
                      onChange={(summary) =>
                        change(index, {
                          ...project,
                          [code]: { ...project[code], summary },
                        })
                      }
                    />
                  </Field>
                </fieldset>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="relative aspect-[16/10] w-48 overflow-hidden rounded-lg border border-line bg-bone/5">
                {shotUpload ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local preview
                  <img
                    src={shotUpload.preview}
                    alt="New screenshot"
                    className="h-full w-full object-cover object-top"
                  />
                ) : screenshot && !removed.includes(screenshot) ? (
                  <Thumb
                    src={previews[screenshot] ?? publicUrl(screenshot)}
                    alt="Current screenshot"
                  />
                ) : (
                  <span className="grid h-full place-items-center text-xs text-ash">
                    No screenshot
                  </span>
                )}
              </div>
              <label className={`${buttonClass} cursor-pointer`}>
                {screenshot ? "Replace screenshot" : "Upload screenshot"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file || !/^[a-z0-9][a-z0-9-]*$/.test(project.slug))
                      return;
                    const target = `public/projects/${project.slug}.jpg`;
                    const others = content.images.filter(
                      (path) =>
                        path.startsWith(`public/projects/${project.slug}.`) &&
                        path !== target,
                    );
                    setRemoved((list) => [...new Set([...list, ...others])]);
                    void startUpload(file, {
                      path: target,
                      title: "",
                      folder: project.slug,
                      kind: "screenshot",
                    });
                  }}
                />
              </label>
              {shotUpload && (
                <button
                  type="button"
                  onClick={() => discardUpload(shotUpload.id)}
                  className={buttonClass}
                >
                  Don&apos;t change
                </button>
              )}
              {shotUpload?.error && (
                <p className="text-sm text-ember">{shotUpload.error}</p>
              )}
            </div>
          </Card>
        );
      })}

      <button type="button" onClick={add} className={buttonClass}>
        + Add a project
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Settings                                                             */
/* ------------------------------------------------------------------ */

function SettingsPanel({
  draft,
  update,
}: {
  draft: Draft;
  update: (next: Partial<Draft>) => void;
}) {
  const settings = draft.settings;
  const set = (next: Partial<Settings>) =>
    update({ settings: { ...settings, ...next } });
  const channels = [
    ["telegram", "Telegram", "https://t.me/…"],
    ["instagram", "Instagram", "https://www.instagram.com/…"],
    ["phone", "Phone", "tel:+251…"],
  ] as const;

  return (
    <>
      <Card
        title="Name"
        description="Shown in the hero, the intro, the footer and page titles."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <TextInput
              value={settings.name.first}
              onChange={(first) => set({ name: { ...settings.name, first } })}
            />
          </Field>
          <Field label="Last name">
            <TextInput
              value={settings.name.last}
              onChange={(last) => set({ name: { ...settings.name, last } })}
            />
          </Field>
        </div>
      </Card>

      <Card title="Availability">
        <Toggle
          checked={settings.available}
          onChange={(available) => set({ available })}
          label='Show the green "Available for new projects" badge'
        />
      </Card>

      <Card
        title="Contact"
        description="What visitors see, and where each link goes."
      >
        <div className="space-y-5">
          {channels.map(([key, label, example]) => (
            <div key={key} className="grid gap-3 sm:grid-cols-2">
              <Field label={`${label} — shown as`}>
                <TextInput
                  value={settings.contact[key].value}
                  onChange={(value) =>
                    set({
                      contact: {
                        ...settings.contact,
                        [key]: { ...settings.contact[key], value },
                      },
                    })
                  }
                />
              </Field>
              <Field label={`${label} — link`}>
                <TextInput
                  value={settings.contact[key].href}
                  placeholder={example}
                  onChange={(href) =>
                    set({
                      contact: {
                        ...settings.contact,
                        [key]: { ...settings.contact[key], href },
                      },
                    })
                  }
                />
              </Field>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
