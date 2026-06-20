import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hang your Favorite photos",
  description: "Drag and arrange your favorite photo memories on a cork board.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
