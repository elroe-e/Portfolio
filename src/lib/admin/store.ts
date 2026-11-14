import "server-only";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { IMAGE_FILE } from "./paths";

/**
 * Where the admin page reads and saves the site's content.
 *
 * - GitHub (the live site): every save is one commit to the repository, and
 *   Vercel rebuilds the site from it automatically. Needs ADMIN_GITHUB_TOKEN.
 * - Local files (only with `npm run dev` on your own computer): saves write
 *   straight into the project folder; you commit them yourself.
 */

export type TextFile = { path: string; content: string };
export type StagedImage = { path: string; token: string };

export type Commit = {
  message: string;
  write: TextFile[];
  images: StagedImage[];
  remove: string[];
};

export interface Store {
  readonly mode: "github" | "local";
  readonly label: string;
  readText(file: string): Promise<string>;
  /** Image files under public/ (repository paths like public/photos/...). */
  listImages(): Promise<string[]>;
  /** Keeps an uploaded image until the next commit. Returns a token for it. */
  stageImage(bytes: Buffer): Promise<string>;
  commit(change: Commit): Promise<{ url: string | null }>;
}

export class StoreError extends Error {
  constructor(
    message: string,
    readonly status = 502,
  ) {
    super(message);
  }
}

/* ------------------------------------------------------------------ */
/* GitHub                                                              */
/* ------------------------------------------------------------------ */

class GitHubStore implements Store {
  readonly mode = "github" as const;
  readonly label: string;
  private readonly api = (
    process.env.GITHUB_API_URL ?? "https://api.github.com"
  ).replace(/\/$/, "");

  constructor(
    private readonly token: string,
    private readonly repo: string,
    private readonly branch: string,
  ) {
    this.label = `${repo} · ${branch}`;
  }

  private async call<T>(
    route: string,
    init: RequestInit & { raw?: boolean } = {},
  ): Promise<T> {
    const response = await fetch(`${this.api}/repos/${this.repo}${route}`, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: init.raw
          ? "application/vnd.github.raw+json"
          : "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      const hint =
        response.status === 401
          ? "GitHub didn't accept the access token (ADMIN_GITHUB_TOKEN)."
          : response.status === 403 || response.status === 404
            ? `GitHub refused access to ${this.repo}. Check that the token can read and write its contents.`
            : `GitHub answered ${response.status}.`;
      console.error(
        "GitHub API error",
        response.status,
        route,
        detail.slice(0, 500),
      );
      throw new StoreError(hint);
    }
    return (init.raw ? response.text() : response.json()) as Promise<T>;
  }

  private ref() {
    return `/git/ref/heads/${this.branch.split("/").map(encodeURIComponent).join("/")}`;
  }

  private async head() {
    const ref = await this.call<{ object: { sha: string } }>(this.ref());
    const commit = await this.call<{ tree: { sha: string } }>(
      `/git/commits/${ref.object.sha}`,
    );
    return { commit: ref.object.sha, tree: commit.tree.sha };
  }

  async readText(file: string) {
    const route = `/contents/${file.split("/").map(encodeURIComponent).join("/")}`;
    return this.call<string>(
      `${route}?ref=${encodeURIComponent(this.branch)}`,
      { raw: true },
    );
  }

  async listImages() {
    const { tree } = await this.head();
    const listing = await this.call<{
      tree: Array<{ path: string; type: string }>;
      truncated: boolean;
    }>(`/git/trees/${tree}?recursive=1`);
    return listing.tree
      .filter(
        (entry) =>
          entry.type === "blob" &&
          entry.path.startsWith("public/") &&
          IMAGE_FILE.test(entry.path),
      )
      .map((entry) => entry.path);
  }

  async stageImage(bytes: Buffer) {
    const blob = await this.call<{ sha: string }>("/git/blobs", {
      method: "POST",
      body: JSON.stringify({
        content: bytes.toString("base64"),
        encoding: "base64",
      }),
    });
    return blob.sha;
  }

  async commit(change: Commit) {
    const head = await this.head();
    const existing = new Set(await this.listImages());

    const tree = [
      ...change.write.map((file) => ({
        path: file.path,
        mode: "100644",
        type: "blob",
        content: file.content,
      })),
      ...change.images.map((image) => ({
        path: image.path,
        mode: "100644",
        type: "blob",
        sha: image.token,
      })),
      // Deleting a file means listing it with no content. Only files that exist.
      ...change.remove
        .filter((file) => existing.has(file))
        .map((file) => ({
          path: file,
          mode: "100644",
          type: "blob",
          sha: null,
        })),
    ];

    const newTree = await this.call<{ sha: string }>("/git/trees", {
      method: "POST",
      body: JSON.stringify({ base_tree: head.tree, tree }),
    });
    const commit = await this.call<{ sha: string }>("/git/commits", {
      method: "POST",
      body: JSON.stringify({
        message: change.message,
        tree: newTree.sha,
        parents: [head.commit],
      }),
    });
    await this.call(this.ref().replace("/git/ref/", "/git/refs/"), {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
    return { url: `https://github.com/${this.repo}/commit/${commit.sha}` };
  }
}

/* ------------------------------------------------------------------ */
/* Local files                                                         */
/* ------------------------------------------------------------------ */

const run = promisify(execFile);

class LocalStore implements Store {
  readonly mode = "local" as const;
  readonly label = "Files on this computer";
  private readonly root = process.cwd();
  private readonly staging = path.join(os.tmpdir(), "portfolio-admin-staging");

  private resolve(file: string) {
    const full = path.resolve(this.root, file);
    if (!full.startsWith(this.root + path.sep))
      throw new StoreError("Invalid path.", 400);
    return full;
  }

  async readText(file: string) {
    return fs.readFile(this.resolve(file), "utf8");
  }

  async listImages() {
    const found: string[] = [];
    const walk = async (dir: string) => {
      for (const entry of await fs
        .readdir(this.resolve(dir), { withFileTypes: true })
        .catch(() => [])) {
        const child = `${dir}/${entry.name}`;
        if (entry.isDirectory()) await walk(child);
        else if (IMAGE_FILE.test(entry.name)) found.push(child);
      }
    };
    await walk("public");
    return found.sort();
  }

  async stageImage(bytes: Buffer) {
    await fs.mkdir(this.staging, { recursive: true });
    const token = randomUUID();
    await fs.writeFile(path.join(this.staging, `${token}.jpg`), bytes);
    return token;
  }

  async commit(change: Commit) {
    for (const file of change.write) {
      await fs.writeFile(this.resolve(file.path), file.content);
    }
    for (const image of change.images) {
      if (!/^[0-9a-f-]{36}$/.test(image.token))
        throw new StoreError("Unknown upload.", 400);
      const target = this.resolve(image.path);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.copyFile(path.join(this.staging, `${image.token}.jpg`), target);
    }
    for (const file of change.remove) {
      await fs.rm(this.resolve(file), { force: true });
    }
    // Re-index the photos so the running dev server shows the changes.
    await run(process.execPath, ["scripts/sync-photos.mjs"], {
      cwd: this.root,
    });
    return { url: null };
  }
}

/* ------------------------------------------------------------------ */

export function getStore(): Store | null {
  const token = process.env.ADMIN_GITHUB_TOKEN?.trim();
  if (token) {
    const repo =
      process.env.GITHUB_REPO ??
      (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
        ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
        : null);
    const branch =
      process.env.GITHUB_BRANCH ?? process.env.VERCEL_GIT_COMMIT_REF ?? "main";
    if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
    return new GitHubStore(token, repo, branch);
  }
  if (process.env.NODE_ENV === "development") return new LocalStore();
  return null;
}

export const NOT_CONFIGURED =
  "Saving isn't set up yet. Add ADMIN_GITHUB_TOKEN in your Vercel project's environment variables (see the README).";
