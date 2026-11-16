import { execFileSync } from "node:child_process";
import type { NextConfig } from "next";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Serve photos as AVIF where the browser supports it, WebP otherwise.
    formats: ["image/avif", "image/webp"],
    // 75 for thumbnails, 90 for the full-screen photo viewer.
    qualities: [75, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default function config(phase: string): NextConfig {
  // Index the photos in public/ before every build and dev start, however the
  // build is started (`npm run build`, `next build`, or a host's own command).
  // Without this, photos added through the admin page wouldn't show up.
  if (phase === PHASE_PRODUCTION_BUILD || phase === PHASE_DEVELOPMENT_SERVER) {
    execFileSync(process.execPath, ["scripts/sync-photos.mjs"], {
      stdio: "inherit",
    });
  }
  return nextConfig;
}
