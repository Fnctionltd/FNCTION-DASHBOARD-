import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Dashboard } from "@/components/dashboard";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";
import type { DashboardData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // One round trip per table, in parallel. Row level security scopes every
  // one of these to signed-in users, so no filtering is needed here.
  const [
    profiles, partners, orders, expenses, invoices, suppliers, items, channels, notes,
  ] = await Promise.all([
    supabase.from("profiles").select("id, display_name"),
    supabase.from("partners").select("*").order("name"),
    supabase.from("orders").select("*").order("ordered_on", { ascending: false }),
    supabase.from("expenses").select("*").order("spent_on", { ascending: false }),
    supabase.from("invoices").select("*").order("due_on"),
    supabase.from("manufacturing_suppliers").select("*").order("sort_order"),
    supabase.from("manufacturing_items").select("*").order("sort_order"),
    supabase.from("marketing_channels").select("*").order("sort_order"),
    supabase.from("notes").select("*").order("created_at", { ascending: false }),
  ]);

  const failure = [profiles, partners, orders, expenses, invoices, suppliers, items, channels, notes]
    .find((result) => result.error);

  if (failure?.error) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20">
        <h1 className="font-mono text-lg uppercase tracking-[0.2em]">Could not load the dashboard</h1>
        <p className="mt-3 text-sm text-ink-dim">{failure.error.message}</p>
        <p className="mt-3 text-sm text-ink-faint">
          This usually means the database setup step has not been run yet.
        </p>
      </main>
    );
  }

  const initial: DashboardData = {
    profiles: profiles.data ?? [],
    partners: partners.data ?? [],
    orders: orders.data ?? [],
    expenses: expenses.data ?? [],
    invoices: invoices.data ?? [],
    suppliers: suppliers.data ?? [],
    items: items.data ?? [],
    channels: channels.data ?? [],
    notes: notes.data ?? [],
  };

  const userName =
    initial.profiles.find((p) => p.id === user.id)?.display_name ??
    user.email?.split("@")[0] ??
    "You";

  return <Dashboard initial={initial} userId={user.id} userName={userName} />;
}
