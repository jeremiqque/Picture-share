import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Image optimisation ─────────────────────────────────────────────────
  images: {
    // SVG photos from Figma contain embedded base64 raster images.
    // The restrictive sandbox CSP blocks those embedded images on Vercel —
    // removing it fixes the faint/blank rendering in production.
    dangerouslyAllowSVG: true,
    // serve modern formats (WebP / AVIF) automatically for JPG/PNG photos
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
