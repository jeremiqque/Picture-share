import type { Metadata } from "next";
import { Caveat, DM_Sans } from "next/font/google";
import "./globals.css";

// next/font downloads & self-hosts these at build time as WOFF2 —
// they're preloaded automatically and work on Vercel with zero extra config.
const caveat = Caveat({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "hang your Favorite photos",
  description: "Drag and arrange your favorite photo memories on a cork board.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // next/font injects the CSS variables via these class names
    <html lang="en" className={`h-full ${caveat.variable} ${dmSans.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
