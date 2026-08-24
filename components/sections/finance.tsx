"use client";

import { useState } from "react";
import { useStore } from "@/components/store";
import {
  Button, EmptyState, Field, Metric, Panel, inputClass,
} from "@/components/ui";
import { formatDate, formatMoney, formatMoneyShort, parseMoney, startOfMonth, today } from "@/lib/format";
import type { Invoice } from "@/lib/types";

/** Paid, overdue or simply outstanding — worked out from the dates, not stored. */
function invoiceState(invoice: Invoice): "paid" | "overdue" | "due" {
  if (invoice.paid_on) return "paid";
  return invoice.due_on < today() ? "overdue" : "due";
}

export function Finance() {
  const { data } = useStore();
  const [tab, setTab] = useState<"spending" | "invoices">("spending");

  const monthStart = startOfMonth();
  const spentThisMonth = data.expenses
    .filter((e) => e.spent_on >= monthStart)
    .reduce((sum, e) => sum + e.amount_pence, 0);

  const open = data.invoices.filter((i) => !i.paid_on);
  const outstanding = open.reduce((sum, i) => sum + i.amount_pence, 0);
  const overdue = open
    .filter((i) => invoiceState(i) === "overdue")
    .reduce((sum, i) => sum + i.amount_pence, 0);

  return (
    <Panel
      title="Finance"
      className="lg:col-span-12"
      action={
        <div className="flex gap-1.5">
          <Button variant={tab === "spending" ? "solid" : "ghost"} onClick={() => setTab("spending")}>
            Spending
          </Button>
          <Button variant={tab === "invoices" ? "solid" : "ghost"} onClick={() => setTab("invoices")}>
            Invoices
          </Button>
        </div>
      }
    >
      <div className="mb-6 grid gap-3.5 sm:grid-cols-3">
        <Metric value={formatMoneyShort(spentThisMonth)} label="Spent This Month" />
        <Metric value={formatMoneyShort(outstanding)} label="Outstanding Invoices" />
        <Metric value={formatMoneyShort(overdue)} label="Overdue" tone={overdue > 0 ? "alert" : "default"} />
      </div>

      {tab === "spending" ? <Spending /> : <Invoices />}
    </Panel>
  );
}

function Spending() {
  const { data, insert, remove } = useStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ spent_on: today(), supplier: "", description: "", amount: "" });
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const pence = parseMoney(form.amount);
    if (!form.supplier.trim()) return setError("Who was this paid to?");
    if (pence === null) return setError("Enter an amount, like 250 or 250.00");

    await insert("expenses", {
      spent_on: form.spent_on,
      supplier: form.supplier.trim(),
      description: form.description.trim() || null,
      amount_pence: pence,
    });
    setForm({ spent_on: today(), supplier: "", description: "", amount: "" });
    setAdding(false);
    setError(null);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-dim">
          Spending history
        </h3>
        <Button onClick={() => setAdding(!adding)}>+ Add expense</Button>
      </div>

      {adding && (
        <div className="mb-3 rounded-[10px] border border-line-soft bg-surface-2 p-3">
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Date">
              <input type="date" className={inputClass} value={form.spent_on}
                onChange={(e) => setForm({ ...form, spent_on: e.target.value })} />
            </Field>
            <Field label="Paid to">
              <input className={inputClass} value={form.supplier} placeholder="Supplier"
                onChange={(e) => { setForm({ ...form, supplier: e.target.value }); setError(null); }} />
            </Field>
            <Field label="Description">
              <input className={inputClass} value={form.description} placeholder="What for"
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Amount (£)">
              <input className={inputClass} value={form.amount} inputMode="decimal" placeholder="0.00"
                onChange={(e) => { setForm({ ...form, amount: e.target.value }); setError(null); }} />
            </Field>
          </div>
          {error && <p className="mt-2 text-xs text-blocked">{error}</p>}
          <div className="mt-3 flex gap-2">
            <Button variant="solid" onClick={() => void submit()}>Save expense</Button>
            <Button onClick={() => { setAdding(false); setError(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      {data.expenses.length === 0 ? (
        <EmptyState>No spending recorded yet.</EmptyState>
      ) : (
        <ul className="divide-y divide-line-soft">
          {data.expenses.map((e) => (
            <li key={e.id} className="group flex items-center gap-3 py-2 text-sm">
              <span className="w-24 shrink-0 font-mono text-xs text-ink-faint">{formatDate(e.spent_on)}</span>
              <span className="w-40 shrink-0 truncate">{e.supplier}</span>
              <span className="flex-1 truncate text-ink-dim">{e.description}</span>
              <span className="font-mono">{formatMoney(e.amount_pence)}</span>
              <button
                onClick={() => void remove("expenses", e.id)}
                aria-label={`Delete expense paid to ${e.supplier}`}
                className="font-mono text-[11px] text-ink-faint opacity-0 transition-opacity hover:text-blocked group-hover:opacity-100 focus:opacity-100"
              >
                delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Invoices() {
  const { data, insert, update, remove } = useStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ counterparty: "", description: "", amount: "", due_on: today() });
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const pence = parseMoney(form.amount);
    if (!form.counterparty.trim()) return setError("Who is this invoice with?");
    if (pence === null) return setError("Enter an amount, like 1250 or 1250.00");

    await insert("invoices", {
      counterparty: form.counterparty.trim(),
      description: form.description.trim() || null,
      amount_pence: pence,
      issued_on: today(),
      due_on: form.due_on,
    });
    setForm({ counterparty: "", description: "", amount: "", due_on: today() });
    setAdding(false);
    setError(null);
  };

  const label = { paid: "Paid", overdue: "Overdue", due: "Due" } as const;
  const colour = { paid: "text-live", overdue: "text-blocked", due: "text-progress" } as const;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-dim">
          Invoices
        </h3>
        <Button onClick={() => setAdding(!adding)}>+ Add invoice</Button>
      </div>

      {adding && (
        <div className="mb-3 rounded-[10px] border border-line-soft bg-surface-2 p-3">
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Who with">
              <input className={inputClass} value={form.counterparty} placeholder="Partner or supplier"
                onChange={(e) => { setForm({ ...form, counterparty: e.target.value }); setError(null); }} />
            </Field>
            <Field label="Description">
              <input className={inputClass} value={form.description} placeholder="What for"
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Amount (£)">
              <input className={inputClass} value={form.amount} inputMode="decimal" placeholder="0.00"
                onChange={(e) => { setForm({ ...form, amount: e.target.value }); setError(null); }} />
            </Field>
            <Field label="Due date">
              <input type="date" className={inputClass} value={form.due_on}
                onChange={(e) => setForm({ ...form, due_on: e.target.value })} />
            </Field>
          </div>
          {error && <p className="mt-2 text-xs text-blocked">{error}</p>}
          <div className="mt-3 flex gap-2">
            <Button variant="solid" onClick={() => void submit()}>Save invoice</Button>
            <Button onClick={() => { setAdding(false); setError(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      {data.invoices.length === 0 ? (
        <EmptyState>No invoices recorded yet.</EmptyState>
      ) : (
        <ul className="divide-y divide-line-soft">
          {data.invoices.map((i) => {
            const state = invoiceState(i);
            return (
              <li key={i.id} className="group flex items-center gap-3 py-2 text-sm">
                <span className={`w-20 shrink-0 font-mono text-xs ${colour[state]}`}>{label[state]}</span>
                <span className="w-40 shrink-0 truncate">{i.counterparty}</span>
                <span className="flex-1 truncate text-ink-dim">{i.description}</span>
                <span className="hidden font-mono text-xs text-ink-faint sm:inline">
                  due {formatDate(i.due_on)}
                </span>
                <span className="font-mono">{formatMoney(i.amount_pence)}</span>
                <Button
                  onClick={() =>
                    void update("invoices", i.id, { paid_on: i.paid_on ? null : today() })
                  }
                >
                  {i.paid_on ? "Undo" : "Mark paid"}
                </Button>
                <button
                  onClick={() => void remove("invoices", i.id)}
                  aria-label={`Delete invoice for ${i.counterparty}`}
                  className="font-mono text-[11px] text-ink-faint opacity-0 transition-opacity hover:text-blocked group-hover:opacity-100 focus:opacity-100"
                >
                  delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
