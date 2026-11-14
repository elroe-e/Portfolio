import { guard, json } from "@/lib/admin/auth";
import { getStore, NOT_CONFIGURED, StoreError } from "@/lib/admin/store";

/** The browser resizes photos first, so a real upload is well under this. */
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Receives one resized JPEG and keeps it until the next save.
 * Returns a token that the save request uses to place it.
 */
export async function POST(request: Request) {
  const denied = guard(request, { write: true });
  if (denied) return denied;

  const store = getStore();
  if (!store) return json({ error: NOT_CONFIGURED }, { status: 503 });

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES)
    return json({ error: "That image is too large." }, { status: 413 });

  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    return json(
      { error: "That image is empty or too large." },
      { status: 413 },
    );
  }
  // JPEG files start with FF D8 FF.
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
    return json(
      { error: "Only JPEG images can be uploaded." },
      { status: 415 },
    );
  }

  try {
    return json({ token: await store.stageImage(bytes) });
  } catch (error) {
    if (!(error instanceof StoreError)) console.error(error);
    return json(
      {
        error:
          error instanceof StoreError ? error.message : "The upload failed.",
      },
      { status: 502 },
    );
  }
}
