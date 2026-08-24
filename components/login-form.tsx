"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { inputClass } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "That email and password did not match. Check for typos, or ask Sam to reset it."
          : error.message
      );
      setBusy(false);
      return;
    }

    // refresh() lets the server components re-run with the new session cookie.
    router.replace("/");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-line bg-surface p-6">
      <label className="block">
        <span className="mb-1 block text-[11px] uppercase tracking-[0.1em] text-ink-faint">Email</span>
        <input
          type="email"
          required
          autoFocus
          autoComplete="username"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@fnction.co"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1 block text-[11px] uppercase tracking-[0.1em] text-ink-faint">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      {error && <p role="alert" className="mt-4 text-sm text-blocked">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-full border border-ink bg-ink px-4 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-bg disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
