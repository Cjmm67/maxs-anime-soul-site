import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Max's Anime Soul Site — The Three Greats",
  description: "The power of the three greats awakens the legends. Created by Max.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Dots&family=Noto+Serif+JP:wght@400;700&family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Bungee+Shade&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
