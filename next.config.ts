import type { NextConfig } from "next";

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

export default nextConfig;
