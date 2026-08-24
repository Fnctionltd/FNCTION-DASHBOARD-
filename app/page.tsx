"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { readConfig } from "@/lib/config";
import { loadDashboard } from "@/lib/load";
import { Dashboard } from "@/components/dashboard";
import { SetupNotice } from "@/components/setup-notice";
import { Splash } from "@/components/splash";
import type { DashboardData } from "@/lib/types";

type State =
  | { phase: "starting" }
  | { phase: "unconfigured" }
  | { phase: "ready"; data: DashboardData; userId: string; userName: string }
  | { phase: "error"; message: string };

export default function Page() {
  const router = useRouter();
  const [state, setState] = useState<State>({ phase: "starting" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!readConfig()) {
        setState({ phase: "unconfigured" });
        return;
      }

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const result = await loadDashboard(supabase);
      if (cancelled) return;

      if ("error" in result) {
        setState({ phase: "error", message: result.error });
        return;
      }

      const userId = session.user.id;
      const userName =
        result.data.profiles.find((p) => p.id === userId)?.display_name ??
        session.user.email?.split("@")[0] ??
        "You";

      setState({ phase: "ready", data: result.data, userId, userName });
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state.phase === "starting") return <Splash>Loading your dashboard…</Splash>;
  if (state.phase === "unconfigured") return <SetupNotice />;

  if (state.phase === "error") {
    return (
      <Splash>
        <span className="text-blocked">Could not load the dashboard.</span>
        <span className="mt-2 block text-ink-dim">{state.message}</span>
        <span className="mt-3 block text-ink-faint">
          If this says a table does not exist, the database setup step has not been run yet.
        </span>
      </Splash>
    );
  }

  return <Dashboard initial={state.data} userId={state.userId} userName={state.userName} />;
}
