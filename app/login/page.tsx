"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { readConfig } from "@/lib/config";
import { LoginForm } from "@/components/login-form";
import { SetupNotice } from "@/components/setup-notice";
import { Splash } from "@/components/splash";

export default function LoginPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"checking" | "unconfigured" | "form">("checking");

  useEffect(() => {
    if (!readConfig()) {
      setPhase("unconfigured");
      return;
    }
    // Someone already signed in on this device goes straight through.
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (session) router.replace("/");
        else setPhase("form");
      });
  }, [router]);

  if (phase === "checking") return <Splash>Checking your sign-in…</Splash>;
  if (phase === "unconfigured") return <SetupNotice />;

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
