import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Image optimisation ─────────────────────────────────────────────────
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // serve modern formats (WebP / AVIF) automatically
    formats: ["image/avif", "image/webp"],
  },

  // ── Long-lived cache headers for static assets ─────────────────────────
  // Fonts, SVGs, and photos are content-addressed; cache them aggressively.
  async headers() {
    return [
      {
        source: "/fonts/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/photos/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/mosaic.svg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
