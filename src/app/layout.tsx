import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Instrument_Serif,
  Noto_Sans_Ethiopic,
  Noto_Serif_Ethiopic,
} from "next/font/google";
import { getCopy, site } from "@/content/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// Ge'ez script for the Amharic page. Browsers only download these when
// Ethiopic characters are on screen, so the English page doesn't pay for them.
const ethiopicSans = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic-sans",
  subsets: ["ethiopic"],
  preload: false,
});

const ethiopicSerif = Noto_Serif_Ethiopic({
  variable: "--font-ethiopic-serif",
  subsets: ["ethiopic"],
  preload: false,
});

const t = getCopy("en");
const title = `${site.name} — ${t.meta.title}`;

// Set NEXT_PUBLIC_SITE_URL (e.g. https://elroe.com) once the site has a domain,
// so links shared on social media point at the right address.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: title,
    template: `%s — ${site.name}`,
  },
  description: t.meta.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  keywords: [
    site.name,
    "photographer",
    "full-stack developer",
    "web developer",
    "photography portfolio",
  ],
  openGraph: {
    type: "website",
    title,
    description: t.meta.description,
    siteName: site.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: t.meta.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark light",
};

/**
 * Runs before the first paint (see the Next.js guide "Preventing flash before
 * hydration"): applies the saved theme, and shortens the intro when the visitor
 * arrives through a page transition.
 */
const beforePaint = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")d.setAttribute("data-theme",t)}catch(e){}try{if(sessionStorage.getItem("shutter")){sessionStorage.removeItem("shutter");d.classList.add("arriving")}}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${ethiopicSans.variable} ${ethiopicSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: beforePaint }} />
      </head>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
