import type { Metadata, Viewport } from "next";
import { basePath } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "FNCTION — Business Dashboard",
  description: "Distribution, finance, manufacturing and marketing in one view.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
};

/** Applies the saved theme before first paint, so there is no light flash. */
const THEME_SCRIPT = `
try {
  var t = localStorage.getItem('fnction-theme');
  if (!t) t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
} catch (e) {
  document.documentElement.dataset.theme = 'dark';
}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Plain, non-deferred script: it must set window.FNCTION_CONFIG before
            the application bundle runs. Next's own scripts are deferred, so
            this always wins the race. */}
        <script src={`${basePath}/config.js`} />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
