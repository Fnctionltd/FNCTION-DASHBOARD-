import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages. No server is involved: the whole app is
 * plain HTML, CSS and JavaScript, talking to Supabase directly from the
 * browser.
 *
 * basePath is the repository name, because a project Pages site is served
 * from https://<user>.github.io/<repo>/ rather than the domain root. The
 * deploy workflow sets it; local development leaves it empty.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  // Pages serves directories, so /login must become /login/index.html.
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
