import { LoginForm } from "@/components/login-form";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";

// Rendered per request so the configured/not-configured check reflects the
// live environment rather than whatever was true at build time.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-2xl uppercase tracking-[0.34em]">FNCTION</p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink-faint">Business Dashboard</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
