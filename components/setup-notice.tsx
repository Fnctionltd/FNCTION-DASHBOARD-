/**
 * Shown when public/config.js still holds its placeholder values, so the app
 * explains itself instead of failing with a stack trace.
 */
export function SetupNotice() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <p className="font-mono text-xl uppercase tracking-[0.34em]">FNCTION</p>
      <h1 className="mt-6 font-mono text-sm uppercase tracking-[0.2em] text-ink-dim">
        Almost there
      </h1>
      <p className="mt-3 text-sm text-ink-dim">
        The dashboard is built and waiting for its database connection. Open
        <code className="mx-1 font-mono">public/config.js</code> in the
        repository, replace the two placeholder values with the Supabase Project
        URL and Publishable key, and commit. This page becomes the login screen.
      </p>
    </main>
  );
}
