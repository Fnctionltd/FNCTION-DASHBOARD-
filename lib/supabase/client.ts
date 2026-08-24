"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/env";

let cached: ReturnType<typeof createBrowserClient> | null = null;

/** Browser-side client. Cached so every component shares one realtime socket. */
export function createClient() {
  if (!cached) {
    const { url, key } = supabaseEnv();
    cached = createBrowserClient(url, key);
  }
  return cached;
}
