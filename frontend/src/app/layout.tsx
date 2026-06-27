/**
 * @file src/app/layout.tsx
 */

import { Providers } from "@/lib/redux/provider";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import ToastContainer from "./toast-container";

import "./globals.css";

// ─────────────────────────────────────────────────────────────────────────────
// FONT SETUP
// `next/font` downloads Inter at build time.
// `subsets: ["latin"]` only includes the characters we need (smaller file!).
// `variable: "--font-inter"` creates a CSS variable we use in globals.css.
// `display: "swap"` means text shows in a fallback font while Inter loads.
// ─────────────────────────────────────────────────────────────────────────────

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// This is the DEFAULT metadata for the entire site.
// Individual pages can override `title` and `description`.
// The `template` in `title` means page titles will look like:
//   "Product Name | op-market"
//   "My Orders | op-market"
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  // `template` wraps child page titles. `default` is used if a page has no title.
  title: {
    template: "%s | op-market",
    default: "op-market — Your Premium Online Store",
  },
  description:
    "Discover a curated selection of quality products. Fast shipping, secure checkout, and exceptional service.",
  keywords: ["ecommerce", "online store", "shopping", "op-market"],
  authors: [{ name: "OnePiece Coding Team" }],

  // Open Graph — Controls how links look when shared on social media / messengers.
  openGraph: {
    type: "website",
    siteName: "op-market",
    title: "op-market — Your Premium Online Store",
    description:
      "Discover a curated selection of quality products. Fast shipping, secure checkout.",
  },

  // Robots — Tell search engines how to index the site.
  robots: {
    googleBot: { index: true, follow: true },
    follow: true,
    index: true,
  },
};

// Viewport is separate from metadata in Next.js 14+
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT LAYOUT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
     * `lang="en"` is critical for accessibility.
     * Screen readers use this to determine pronunciation.
     *
     * `inter.variable` adds the CSS variable `--font-inter` to the <html> element.
     * This is how globals.css can reference `var(--font-inter)`.
     *
     * `suppressHydrationWarning`:
     * Next.js renders HTML on the server, then React "hydrates" it on the client
     * (attaches event handlers). Sometimes minor differences between server and
     * client HTML cause "hydration warnings". On the root <html> element, browser
     * extensions can add attributes (like `class="dark"`) that cause these warnings.
     * `suppressHydrationWarning` silences them on this specific element.
     */
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        {/*
         * Providers wraps everything with the Redux store.
         * It's a Client Component, but its children can still be
         * Server Components — Next.js handles this correctly.
         */}
        <Providers>
          {/*
           * Skip Navigation Link — CRITICAL for keyboard/screen-reader accessibility.
           * Allows keyboard users to skip the header and jump straight to content.
           * Visually hidden by default, becomes visible on focus.
           */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          {children}

          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
