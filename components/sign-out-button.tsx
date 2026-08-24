"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  const signOut = async () => {
    await createClient().auth.signOut();
    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="rounded-full border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-ink-dim hover:border-ink-faint hover:text-ink"
    >
      Sign out
    </button>
  );
}
