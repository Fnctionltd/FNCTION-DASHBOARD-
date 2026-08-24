import type { SupabaseClient } from "@supabase/supabase-js";
import type { DashboardData } from "@/lib/types";

/**
 * Fetches everything the dashboard shows, in parallel. Row level security
 * scopes each query to the signed-in user, so there is nothing to filter here.
 */
export async function loadDashboard(
  supabase: SupabaseClient
): Promise<{ data: DashboardData } | { error: string }> {
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

  const failed = [
    profiles, partners, orders, expenses, invoices, suppliers, items, channels, notes,
  ].find((result) => result.error);

  if (failed?.error) return { error: failed.error.message };

  return {
    data: {
      profiles: profiles.data ?? [],
      partners: partners.data ?? [],
      orders: orders.data ?? [],
      expenses: expenses.data ?? [],
      invoices: invoices.data ?? [],
      suppliers: suppliers.data ?? [],
      items: items.data ?? [],
      channels: channels.data ?? [],
      notes: notes.data ?? [],
    },
  };
}
