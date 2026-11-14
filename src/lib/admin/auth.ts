import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Login for the admin page.
 *
 * There is one password, set as the ADMIN_PASSWORD environment variable.
 * Logging in sets a signed, HTTP-only cookie that is valid for 7 days and is
 * only ever sent to /api/admin. Changing the password logs everyone out.
 */

const COOKIE = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function adminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password ? password : null;
}

function secret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    createHash("sha256")
      .update(
        `portfolio-admin:${adminPassword() ?? ""}:${process.env.ADMIN_GITHUB_TOKEN ?? ""}`,
      )
      .digest("hex")
  );
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function same(a: string, b: string) {
  // Hash first so the comparison takes the same time whatever the lengths.
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function passwordMatches(attempt: string): boolean {
  const password = adminPassword();
  return password !== null && same(attempt, password);
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function isLoggedIn(request: Request): boolean {
  if (!adminPassword()) return false;
  const token = readCookie(request, COOKIE);
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  if (!same(signature, sign(expires))) return false;
  return Number(expires) > Date.now() / 1000;
}

function cookieFlags(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `Path=/api/admin; HttpOnly; SameSite=Strict${secure}`;
}

export function sessionCookie(request: Request): string {
  const expires = String(Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS);
  return `${COOKIE}=${expires}.${sign(expires)}; Max-Age=${MAX_AGE_SECONDS}; ${cookieFlags(request)}`;
}

export function clearedCookie(request: Request): string {
  return `${COOKIE}=; Max-Age=0; ${cookieFlags(request)}`;
}

/**
 * Changes must come from the admin page itself, not from another website
 * that a logged-in browser happens to visit.
 */
export function sameOrigin(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function json(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: { "Cache-Control": "no-store", ...init?.headers },
  });
}

/** Returns an error response, or null when the request may go ahead. */
export function guard(
  request: Request,
  { write = false } = {},
): Response | null {
  if (!adminPassword()) {
    return json(
      { error: "The admin page is not set up yet: ADMIN_PASSWORD is missing." },
      { status: 503 },
    );
  }
  if (write && !sameOrigin(request)) {
    return json(
      { error: "This request didn't come from the admin page." },
      { status: 403 },
    );
  }
  if (!isLoggedIn(request)) {
    return json({ error: "Please log in again." }, { status: 401 });
  }
  return null;
}
