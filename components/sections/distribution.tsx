"use client";

import { useState } from "react";
import { useStore } from "@/components/store";
import { Notes } from "@/components/notes";
import {
  Button, EditableStatus, EditableText, EmptyState, Field, Metric, Panel, inputClass,
} from "@/components/ui";
import { PARTNER_STAGES } from "@/lib/status";
import { formatDate, formatMoney, formatMoneyShort, parseMoney, today } from "@/lib/format";
import type { Partner } from "@/lib/types";

export function Distribution() {
  const { data, insert } = useStore();
  const [adding, setAdding] = useState<null | "existing" | "future">(null);
  const [name, setName] = useState("");

  const existing = data.partners.filter((p) => p.type === "existing");
  const future = data.partners.filter((p) => p.type === "future");
  const revenue = data.orders.reduce((sum, o) => sum + o.amount_pence, 0);
  const followUp = data.partners.filter((p) => p.needs_follow_up).length;

  const addPartner = async () => {
    const trimmed = name.trim();
    if (!trimmed || !adding) return;
    setName("");
    setAdding(null);
    await insert("partners", { name: trimmed, type: adding });
  };

  return (
    <Panel title="Distribution" className="lg:col-span-12">
      <div className="mb-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <Metric value={String(existing.length)} label="Existing Partners" />
        <Metric value={String(future.length)} label="Future Partners" />
        <Metric value={formatMoneyShort(revenue)} label="Partner Revenue" />
        <Metric
          value={String(followUp)}
          label="Need Follow-Up"
          tone={followUp > 0 ? "warn" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PartnerColumn
          heading="Existing Partners"
          partners={existing}
          onAdd={() => setAdding("existing")}
        />
        <PartnerColumn
          heading="Future Partners"
          partners={future}
          onAdd={() => setAdding("future")}
        />
      </div>

      {adding && (
        <div className="mt-4 rounded-[10px] border border-line-soft bg-surface-2 p-4">
          <Field label={adding === "existing" ? "New existing partner" : "New future partner"}>
            <input
              autoFocus
              className={inputClass}
              value={name}
              placeholder="Partner name"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void addPartner();
                if (e.key === "Escape") { setAdding(null); setName(""); }
              }}
            />
          </Field>
          <div className="mt-3 flex gap-2">
            <Button variant="solid" onClick={() => void addPartner()} disabled={!name.trim()}>
              Add partner
            </Button>
            <Button onClick={() => { setAdding(null); setName(""); }}>Cancel</Button>
          </div>
        </div>
      )}
    </Panel>
  );
}

function PartnerColumn({
  heading, partners, onAdd,
}: {
  heading: string;
  partners: Partner[];
  onAdd: () => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-dim">
          {heading}
        </h3>
        <Button onClick={onAdd}>+ Add</Button>
      </div>
      {partners.length === 0 ? (
        <EmptyState>None yet. Use Add to create the first one.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {partners.map((p) => (
            <PartnerRow key={p.id} partner={p} />
          ))}
        </ul>
      )}
    </div>
  );
}

function PartnerRow({ partner }: { partner: Partner }) {
  const { data, update, insert, remove } = useStore();
  const [open, setOpen] = useState(false);
  const [addingOrder, setAddingOrder] = useState(false);

  const orders = data.orders.filter((o) => o.partner_id === partner.id);
  const notes = data.notes.filter((n) => n.partner_id === partner.id);
  const total = orders.reduce((sum, o) => sum + o.amount_pence, 0);
  const isFuture = partner.type === "future";

  return (
    <li className="overflow-hidden rounded-[10px] border border-line-soft bg-surface-2">
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
        <button
          onClick={() => setOpen(!open)}
          className="flex-1 text-left text-sm hover:text-ink-dim"
          aria-expanded={open}
        >
          {partner.name}
          <span className="ml-2 font-mono text-[11px] text-ink-faint">
            {isFuture
              ? notes.length > 0 && `${notes.length} notes`
              : orders.length > 0 && formatMoneyShort(total)}
          </span>
        </button>

        {isFuture ? (
          <EditableStatus
            value={partner.stage ?? ""}
            options={PARTNER_STAGES}
            ariaLabel={`Progress for ${partner.name}`}
            onSave={(stage) => void update("partners", partner.id, { stage })}
          />
        ) : (
          <label className="flex items-center gap-1.5 font-mono text-[11px] text-ink-faint">
            <input
              type="checkbox"
              checked={partner.needs_follow_up}
              onChange={(e) =>
                void update("partners", partner.id, { needs_follow_up: e.target.checked })
              }
              className="accent-progress"
            />
            follow-up
          </label>
        )}
      </div>

      {open && (
        <div className="border-t border-line-soft bg-surface px-3.5 py-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Contact</p>
              <EditableText
                value={partner.contact_name}
                ariaLabel={`Contact name for ${partner.name}`}
                placeholder="Name"
                className="text-sm"
                onSave={(v) => void update("partners", partner.id, { contact_name: v || null })}
              />
              <EditableText
                value={partner.contact_email}
                ariaLabel={`Contact email for ${partner.name}`}
                placeholder="Email"
                className="text-sm"
                onSave={(v) => void update("partners", partner.id, { contact_email: v || null })}
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Next action</p>
              <EditableText
                value={partner.next_action}
                ariaLabel={`Next action for ${partner.name}`}
                placeholder="What happens next?"
                className="text-sm"
                multiline
                onSave={(v) => void update("partners", partner.id, { next_action: v || null })}
              />
            </div>
          </div>

          {!isFuture && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                  Order history
                </p>
                <Button onClick={() => setAddingOrder(!addingOrder)}>+ Add order</Button>
              </div>

              {addingOrder && (
                <AddOrder
                  partnerId={partner.id}
                  onDone={() => setAddingOrder(false)}
                  onSubmit={(row) => insert("orders", row)}
                />
              )}

              {orders.length === 0 ? (
                <EmptyState>No orders recorded yet.</EmptyState>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {orders.map((o) => (
                    <li key={o.id} className="group flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="font-mono text-xs text-ink-faint">{formatDate(o.ordered_on)}</span>
                      <span className="flex-1 truncate">{o.description || o.reference || "Order"}</span>
                      <span className="font-mono">{formatMoney(o.amount_pence)}</span>
                      <button
                        onClick={() => void remove("orders", o.id)}
                        aria-label="Delete this order"
                        className="font-mono text-[11px] text-ink-faint opacity-0 transition-opacity hover:text-blocked group-hover:opacity-100 focus:opacity-100"
                      >
                        delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">
              {isFuture ? "Progress notes" : "Notes"}
            </p>
            <Notes notes={notes} parent={{ partner_id: partner.id }} label={partner.name} />
          </div>

          <div className="mt-4 border-t border-line-soft pt-3">
            <Button
              variant="danger"
              onClick={() => {
                if (confirm(`Delete ${partner.name}? Their orders and notes go too.`)) {
                  void remove("partners", partner.id);
                }
              }}
            >
              Delete partner
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function AddOrder({
  partnerId, onDone, onSubmit,
}: {
  partnerId: string;
  onDone: () => void;
  onSubmit: (row: Record<string, unknown>) => Promise<void>;
}) {
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const pence = parseMoney(amount);
    if (pence === null) {
      setError("Enter an amount, like 1250 or 1250.00");
      return;
    }
    await onSubmit({
      partner_id: partnerId,
      ordered_on: date,
      description: description.trim() || null,
      amount_pence: pence,
    });
    onDone();
  };

  return (
    <div className="mb-3 rounded-[10px] border border-line-soft bg-surface-2 p-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Date">
          <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Description">
          <input
            className={inputClass}
            value={description}
            placeholder="What was ordered"
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field label="Amount (£)">
          <input
            className={inputClass}
            value={amount}
            inputMode="decimal"
            placeholder="0.00"
            onChange={(e) => { setAmount(e.target.value); setError(null); }}
          />
        </Field>
      </div>
      {error && <p className="mt-2 text-xs text-blocked">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button variant="solid" onClick={() => void submit()}>Save order</Button>
        <Button onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}
