/**
 * Connection settings, read at runtime from public/config.js rather than baked
 * in at build time. That means the two Supabase values can be corrected by
 * editing one file on GitHub, with no rebuild.
 */
declare global {
  interface Window {
    FNCTION_CONFIG?: { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string };
  }
}

const PLACEHOLDER = /^PASTE_/;

export type Config = { url: string; key: string };

export function readConfig(): Config | null {
  if (typeof window === "undefined") return null;

  const url = window.FNCTION_CONFIG?.SUPABASE_URL?.trim();
  const key = window.FNCTION_CONFIG?.SUPABASE_ANON_KEY?.trim();

  if (!url || !key || PLACEHOLDER.test(url) || PLACEHOLDER.test(key)) return null;
  return { url, key };
}

/** Where the app is served from, e.g. "/FNCTION-DASHBOARD-" on GitHub Pages. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
