"use client";

import { StoreProvider, useStore } from "@/components/store";
import { Distribution } from "@/components/sections/distribution";
import { Finance } from "@/components/sections/finance";
import { Manufacturing } from "@/components/sections/manufacturing";
import { Marketing } from "@/components/sections/marketing";
import { ThemeToggle } from "@/components/theme-toggle";
import type { DashboardData } from "@/lib/types";

export function Dashboard({
  initial, userId, userName,
}: {
  initial: DashboardData;
  userId: string;
  userName: string;
}) {
  return (
    <StoreProvider initial={initial} userId={userId}>
      <Shell userName={userName} />
    </StoreProvider>
  );
}

function Shell({ userName }: { userName: string }) {
  const { saveState, errorMessage } = useStore();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line px-5 py-5 sm:px-10">
        <div className="flex flex-wrap items-baseline gap-3.5">
          <span className="font-mono text-xl uppercase tracking-[0.34em] sm:text-2xl">FNCTION</span>
          <span className="text-xs uppercase tracking-[0.14em] text-ink-faint">Business Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <SaveIndicator state={saveState} />
          <span className="font-mono text-xs text-ink-faint">{userName}</span>
          <ThemeToggle />
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="rounded-full border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-ink-dim hover:border-ink-faint hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {errorMessage && (
        <p role="alert" className="border-b border-blocked/40 bg-blocked/10 px-5 py-2.5 text-sm text-blocked sm:px-10">
          Could not save: {errorMessage}
        </p>
      )}

      <main className="grid flex-1 auto-rows-max grid-cols-1 gap-5 px-5 py-6 sm:px-10 lg:grid-cols-12">
        <Distribution />
        <Finance />
        <Manufacturing />
        <Marketing />
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs uppercase tracking-[0.08em] text-ink-faint sm:px-10">
        <span>FNCTION operating view</span>
        <span className="flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-live" />On track</span>
          <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-progress" />In progress</span>
          <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-blocked" />Needs action</span>
        </span>
      </footer>
    </div>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  const text = { saving: "Saving…", saved: "Saved", error: "Not saved" }[state];
  const colour = state === "error" ? "text-blocked" : "text-ink-faint";
  return <span className={`font-mono text-xs ${colour}`} aria-live="polite">{text}</span>;
}
