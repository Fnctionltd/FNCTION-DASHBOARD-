"use client";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { readConfig } from "@/lib/config";

let cached: SupabaseClient | null = null;

/**
 * The one Supabase client for the whole app. There is no server side: the
 * browser talks to Supabase directly, and the session is kept in localStorage
 * so Sam and Helen each stay signed in on their own device.
 */
export function createClient(): SupabaseClient {
  if (cached) return cached;

  const config = readConfig();
  if (!config) {
    throw new Error(
      "Supabase is not configured. Fill in the two values in public/config.js."
    );
  }

  cached = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // There is no server route to receive an OAuth redirect, and sign-in is
      // by password only, so URL detection is unnecessary.
      detectSessionInUrl: false,
    },
  });
  return cached;
}
