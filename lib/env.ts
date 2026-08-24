/**
 * Reads the two Supabase values. They are validated in one place so a missing
 * or mistyped value produces a clear message instead of a cryptic runtime
 * failure deep inside the client library.
 */
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("YOUR-PROJECT") || key.includes("YOUR-")) {
    throw new Error(
      "Supabase is not configured yet. Copy .env.local.example to .env.local " +
        "and fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return { url, key };
}

export function isSupabaseConfigured() {
  try {
    supabaseEnv();
    return true;
  } catch {
    return false;
  }
}
