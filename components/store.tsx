"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { DashboardData } from "@/lib/types";

type Table =
  | "partners" | "orders" | "partner_activations" | "expenses" | "invoices"
  | "manufacturing_items" | "marketing_channels" | "notes";

/** Which slice of state each table's rows live in. */
const TABLE_KEY: Record<Table, keyof DashboardData> = {
  partners: "partners",
  orders: "orders",
  partner_activations: "activations",
  expenses: "expenses",
  invoices: "invoices",
  manufacturing_items: "items",
  marketing_channels: "channels",
  notes: "notes",
};

type Row = { id: string; [key: string]: unknown };
type SaveState = "idle" | "saving" | "saved" | "error";

type Store = {
  data: DashboardData;
  userId: string;
  saveState: SaveState;
  errorMessage: string | null;
  nameFor: (authorId: string) => string;
  update: (table: Table, id: string, patch: Record<string, unknown>) => Promise<void>;
  insert: (table: Table, row: Record<string, unknown>) => Promise<void>;
  remove: (table: Table, id: string) => Promise<void>;
};

const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}

function sortRows(key: keyof DashboardData, rows: Row[]): Row[] {
  const by = (field: string, dir: 1 | -1 = 1) => (a: Row, b: Row) =>
    String(a[field] ?? "").localeCompare(String(b[field] ?? "")) * dir;

  switch (key) {
    case "items":
    case "channels":
      return [...rows].sort(
        (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || by("name")(a, b)
      );
    case "notes":
      return [...rows].sort(by("created_at", -1));
    case "orders":
      return [...rows].sort(by("ordered_on", -1));
    case "activations":
      return [...rows].sort(by("happened_on", -1));
    case "expenses":
      return [...rows].sort(by("spent_on", -1));
    case "invoices":
      return [...rows].sort(by("due_on"));
    case "partners":
      return [...rows].sort(by("name"));
    default:
      return rows;
  }
}

export function StoreProvider({
  initial, userId, children,
}: {
  initial: DashboardData;
  userId: string;
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [data, setData] = useState<DashboardData>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashSaved = useCallback(() => {
    setSaveState("saved");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaveState("idle"), 1600);
  }, []);

  const fail = useCallback((message: string) => {
    setSaveState("error");
    setErrorMessage(message);
  }, []);

  /** Applies a change to local state immediately, before the server confirms. */
  const patchLocal = useCallback(
    (key: keyof DashboardData, id: string, patch: Record<string, unknown>) => {
      setData((current) => {
        const rows = current[key] as unknown as Row[];
        return {
          ...current,
          [key]: sortRows(key, rows.map((r) => (r.id === id ? { ...r, ...patch } : r))),
        } as DashboardData;
      });
    },
    []
  );

  const upsertLocal = useCallback((key: keyof DashboardData, row: Row) => {
    setData((current) => {
      const rows = current[key] as unknown as Row[];
      const exists = rows.some((r) => r.id === row.id);
      const next = exists ? rows.map((r) => (r.id === row.id ? { ...r, ...row } : r)) : [...rows, row];
      return { ...current, [key]: sortRows(key, next) } as DashboardData;
    });
  }, []);

  const removeLocal = useCallback((key: keyof DashboardData, id: string) => {
    setData((current) => {
      const rows = current[key] as unknown as Row[];
      return { ...current, [key]: rows.filter((r) => r.id !== id) } as DashboardData;
    });
  }, []);

  const update = useCallback<Store["update"]>(
    async (table, id, patch) => {
      const key = TABLE_KEY[table];
      const rows = data[key] as unknown as Row[];
      const previous = rows.find((r) => r.id === id);

      setSaveState("saving");
      patchLocal(key, id, patch);

      const { error } = await supabase.from(table).update(patch).eq("id", id);
      if (error) {
        // Put the old value back so the screen never shows an unsaved edit
        // as though it had been saved.
        if (previous) patchLocal(key, id, previous);
        fail(error.message);
        return;
      }
      flashSaved();
    },
    [data, patchLocal, supabase, flashSaved, fail]
  );

  const insert = useCallback<Store["insert"]>(
    async (table, row) => {
      setSaveState("saving");
      const { data: inserted, error } = await supabase.from(table).insert(row).select().single();
      if (error) {
        fail(error.message);
        return;
      }
      upsertLocal(TABLE_KEY[table], inserted as Row);
      flashSaved();
    },
    [supabase, upsertLocal, flashSaved, fail]
  );

  const remove = useCallback<Store["remove"]>(
    async (table, id) => {
      const key = TABLE_KEY[table];
      const previous = (data[key] as unknown as Row[]).find((r) => r.id === id);

      setSaveState("saving");
      removeLocal(key, id);

      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) {
        if (previous) upsertLocal(key, previous);
        fail(error.message);
        return;
      }
      flashSaved();
    },
    [data, removeLocal, upsertLocal, supabase, flashSaved, fail]
  );

  /* Live sync: the other person's edits arrive here and merge into state. */
  useEffect(() => {
    const channel = supabase.channel("dashboard");

    (Object.keys(TABLE_KEY) as Table[]).forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload: RealtimePostgresChangesPayload<Row>) => {
          const key = TABLE_KEY[table];
          if (payload.eventType === "DELETE") {
            removeLocal(key, (payload.old as Row).id);
          } else {
            upsertLocal(key, payload.new as Row);
          }
        }
      );
    });

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, upsertLocal, removeLocal]);

  const nameFor = useCallback(
    (authorId: string) =>
      data.profiles.find((p) => p.id === authorId)?.display_name ?? "Someone",
    [data.profiles]
  );

  const value = useMemo<Store>(
    () => ({ data, userId, saveState, errorMessage, nameFor, update, insert, remove }),
    [data, userId, saveState, errorMessage, nameFor, update, insert, remove]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
