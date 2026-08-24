/**
 * Shown when the Supabase keys are missing, so the app explains itself instead
 * of crashing with a stack trace.
 */
export function SetupNotice() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <p className="font-mono text-xl uppercase tracking-[0.34em]">FNCTION</p>
      <h1 className="mt-6 font-mono text-sm uppercase tracking-[0.2em] text-ink-dim">
        Almost there
      </h1>
      <p className="mt-3 text-sm text-ink-dim">
        The dashboard is built and waiting for its database connection. Once the
        two Supabase values are added to <code className="font-mono">.env.local</code>,
        this page becomes the login screen.
      </p>
    </main>
  );
}
