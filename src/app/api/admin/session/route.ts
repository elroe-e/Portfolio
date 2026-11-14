import {
  adminPassword,
  clearedCookie,
  isLoggedIn,
  json,
  passwordMatches,
  sameOrigin,
  sessionCookie,
} from "@/lib/admin/auth";
import { getStore } from "@/lib/admin/store";

/** Is the admin set up, and is this browser logged in? */
export async function GET(request: Request) {
  const store = getStore();
  return json({
    configured: adminPassword() !== null,
    loggedIn: isLoggedIn(request),
    storage: store ? { mode: store.mode, label: store.label } : null,
  });
}

/** Log in. */
export async function POST(request: Request) {
  if (!adminPassword()) {
    return json(
      { error: "Set ADMIN_PASSWORD first (see the README)." },
      { status: 503 },
    );
  }
  if (!sameOrigin(request)) {
    return json(
      { error: "This request didn't come from the admin page." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;
  const attempt = typeof body?.password === "string" ? body.password : "";

  if (!passwordMatches(attempt)) {
    // Slow down anyone guessing passwords.
    await new Promise((resolve) => setTimeout(resolve, 900));
    return json({ error: "That password isn't right." }, { status: 401 });
  }
  return json(
    { ok: true },
    { headers: { "Set-Cookie": sessionCookie(request) } },
  );
}

/** Log out. */
export async function DELETE(request: Request) {
  return json(
    { ok: true },
    { headers: { "Set-Cookie": clearedCookie(request) } },
  );
}
