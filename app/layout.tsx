import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Darkroom Image Editor",
  description: "A small browser-based image editor: crop, draw, annotate, rotate, export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
