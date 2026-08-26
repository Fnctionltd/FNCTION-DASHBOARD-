"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/store";
import { Notes } from "@/components/notes";
import {
  Button, EditableStatus, EditableText, EmptyState, Field, inputClass,
} from "@/components/ui";
import { PARTNER_STAGES } from "@/lib/status";
import { formatDate, formatMoney, formatMoneyShort, parseMoney, today } from "@/lib/format";
import type { Partner } from "@/lib/types";

const ACTIVATION_STATUSES = ["Planned", "Live", "Complete", "On Hold"];

/**
 * Everything about one partner, on its own screen: details and margin, order
 * history, marketing activations, and notes. Opened by tapping a partner, and
 * covers the dashboard so there is room to work on a phone.
 */
export function PartnerDetail({ partner, onClose }: { partner: Partner; onClose: () => void }) {
  const { data, update, remove } = useStore();
  const [addingOrder, setAddingOrder] = useState(false);
  const [addingActivation, setAddingActivation] = useState(false);

  const orders = data.orders.filter((o) => o.partner_id === partner.id);
  const activations = data.activations.filter((a) => a.partner_id === partner.id);
  const notes = data.notes.filter((n) => n.partner_id === partner.id);

  const revenue = orders.reduce((sum, o) => sum + o.amount_pence, 0);
  const activationSpend = activations.reduce((sum, a) => sum + (a.spend_pence ?? 0), 0);
  const isFuture = partner.type === "future";

  // Escape closes, and the page behind must not scroll while this is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const set = (patch: Record<string, unknown>) => void update("partners", partner.id, patch);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg" role="dialog" aria-label={partner.name}>
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-bg/95 px-5 py-4 backdrop-blur sm:px-8">
        <Button onClick={onClose}>← Back</Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base">{partner.name}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            {isFuture ? "Future partner" : "Existing partner"}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Summary label="Orders" value={formatMoneyShort(revenue)} sub={`${orders.length} recorded`} />
          <Summary
            label="Margin"
            value={partner.margin_percent == null ? "—" : `${partner.margin_percent}%`}
            sub="trade margin"
          />
          <Summary
            label="Activation spend"
            value={formatMoneyShort(activationSpend)}
            sub={`${activations.length} activation${activations.length === 1 ? "" : "s"}`}
          />
        </div>

        <Section title="Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Labelled label="Partner name">
              <EditableText
                value={partner.name}
                ariaLabel="Partner name"
                className="text-sm"
                onSave={(v) => v && set({ name: v })}
              />
            </Labelled>
            <Labelled label="Margin %">
              <EditableText
                value={partner.margin_percent == null ? "" : String(partner.margin_percent)}
                ariaLabel="Trade margin percentage"
                placeholder="e.g. 42.5"
                className="text-sm"
                onSave={(v) => {
                  if (v === "") return set({ margin_percent: null });
                  const n = Number(v.replace("%", "").trim());
                  // Ignore anything that is not a sensible percentage rather
                  // than storing a number that would mislead later.
                  if (Number.isFinite(n) && n >= 0 && n <= 999) set({ margin_percent: n });
                }}
              />
            </Labelled>
            <Labelled label="Contact name">
              <EditableText value={partner.contact_name} ariaLabel="Contact name" placeholder="Name"
                className="text-sm" onSave={(v) => set({ contact_name: v || null })} />
            </Labelled>
            <Labelled label="Contact email">
              <EditableText value={partner.contact_email} ariaLabel="Contact email" placeholder="Email"
                className="text-sm" onSave={(v) => set({ contact_email: v || null })} />
            </Labelled>
            <Labelled label="Phone">
              <EditableText value={partner.contact_phone} ariaLabel="Contact phone" placeholder="Phone"
                className="text-sm" onSave={(v) => set({ contact_phone: v || null })} />
            </Labelled>
            <Labelled label="Location">
              <EditableText value={partner.location} ariaLabel="Location" placeholder="Where"
                className="text-sm" onSave={(v) => set({ location: v || null })} />
            </Labelled>
          </div>

          <div className="mt-4">
            <Labelled label="Next action">
              <EditableText value={partner.next_action} ariaLabel="Next action" multiline
                placeholder="What happens next?" className="text-sm"
                onSave={(v) => set({ next_action: v || null })} />
            </Labelled>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            {isFuture ? (
              <span className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Progress</span>
                <EditableStatus value={partner.stage ?? ""} options={PARTNER_STAGES}
                  ariaLabel="Pipeline progress" onSave={(stage) => set({ stage })} />
              </span>
            ) : (
              <label className="flex items-center gap-2 font-mono text-xs text-ink-dim">
                <input type="checkbox" checked={partner.needs_follow_up} className="accent-progress"
                  onChange={(e) => set({ needs_follow_up: e.target.checked })} />
                Needs follow-up
              </label>
            )}
          </div>
        </Section>

        <Section
          title="Orders"
          action={
            <Button onClick={() => setAddingOrder(!addingOrder)} ariaLabel="Add an order">
              + Add
            </Button>
          }
        >
          {addingOrder && (
            <AddOrder partnerId={partner.id} onDone={() => setAddingOrder(false)} />
          )}
          {orders.length === 0 ? (
            <EmptyState>No orders recorded yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-line-soft">
              {orders.map((o) => (
                <li key={o.id} className="group flex items-center gap-3 py-2.5 text-sm">
                  <span className="w-24 shrink-0 font-mono text-xs text-ink-faint">
                    {formatDate(o.ordered_on)}
                  </span>
                  <span className="flex-1 truncate">{o.description || o.reference || "Order"}</span>
                  <span className="font-mono">{formatMoney(o.amount_pence)}</span>
                  <RemoveButton label={`Delete order from ${formatDate(o.ordered_on)}`}
                    onConfirm={() => void remove("orders", o.id)} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Activations"
          action={
            <Button
              onClick={() => setAddingActivation(!addingActivation)}
              ariaLabel="Add a marketing activation"
            >
              + Add
            </Button>
          }
        >
          {addingActivation && (
            <AddActivation partnerId={partner.id} onDone={() => setAddingActivation(false)} />
          )}
          {activations.length === 0 ? (
            <EmptyState>Nothing recorded yet — features, samplings, campaigns.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {activations.map((a) => (
                <li key={a.id} className="group rounded-[10px] border border-line-soft bg-surface-2 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{a.title}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
                        {formatDate(a.happened_on)}
                        {a.channel ? ` · ${a.channel}` : ""}
                        {a.spend_pence != null ? ` · ${formatMoney(a.spend_pence)}` : ""}
                      </p>
                    </div>
                    <EditableStatus value={a.status} options={ACTIVATION_STATUSES}
                      ariaLabel={`Status for ${a.title}`}
                      onSave={(status) => void update("partner_activations", a.id, { status })} />
                  </div>
                  <EditableText value={a.notes} ariaLabel={`Notes for ${a.title}`} multiline
                    placeholder="How did it go?" className="mt-2 text-sm"
                    onSave={(v) => void update("partner_activations", a.id, { notes: v || null })} />
                  <div className="mt-1">
                    <RemoveButton label={`Delete activation ${a.title}`}
                      onConfirm={() => void remove("partner_activations", a.id)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={isFuture ? "Progress notes" : "Notes"}>
          <Notes notes={notes} parent={{ partner_id: partner.id }} label={partner.name} />
        </Section>

        <div className="mt-8 border-t border-line pt-4">
          <Button
            variant="danger"
            onClick={() => {
              if (confirm(`Delete ${partner.name}? Their orders, activations and notes go too.`)) {
                onClose();
                void remove("partners", partner.id);
              }
            }}
          >
            Delete partner
          </Button>
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[10px] border border-line-soft bg-surface-2 px-4 py-3">
      <span className="block font-mono text-xl">{value}</span>
      <span className="mt-1 block text-[11px] uppercase tracking-[0.1em] text-ink-dim">{label}</span>
      <span className="block font-mono text-[11px] text-ink-faint">{sub}</span>
    </div>
  );
}

function Section({
  title, children, action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-ink-faint">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-0.5 text-[11px] uppercase tracking-[0.1em] text-ink-faint">{label}</p>
      {children}
    </div>
  );
}

function RemoveButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  return (
    <button
      onClick={onConfirm}
      aria-label={label}
      className="font-mono text-[11px] text-ink-faint opacity-0 transition-opacity hover:text-blocked group-hover:opacity-100 focus:opacity-100"
    >
      delete
    </button>
  );
}

function AddOrder({ partnerId, onDone }: { partnerId: string; onDone: () => void }) {
  const { insert } = useStore();
  const [form, setForm] = useState({ ordered_on: today(), description: "", amount: "" });
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const pence = parseMoney(form.amount);
    if (pence === null) return setError("Enter an amount, like 1250 or 1250.00");
    await insert("orders", {
      partner_id: partnerId,
      ordered_on: form.ordered_on,
      description: form.description.trim() || null,
      amount_pence: pence,
    });
    setForm({ ordered_on: today(), description: "", amount: "" });
    setError(null);
    onDone();
  };

  return (
    <FormCard onCancel={onDone} onSave={() => void submit()} error={error}>
      <Field label="Date">
        <input type="date" className={inputClass} value={form.ordered_on}
          onChange={(e) => setForm({ ...form, ordered_on: e.target.value })} />
      </Field>
      <Field label="Description">
        <input className={inputClass} value={form.description} placeholder="What was ordered"
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </Field>
      <Field label="Amount (£)">
        <input className={inputClass} value={form.amount} inputMode="decimal" placeholder="0.00"
          onChange={(e) => { setForm({ ...form, amount: e.target.value }); setError(null); }} />
      </Field>
    </FormCard>
  );
}

function AddActivation({ partnerId, onDone }: { partnerId: string; onDone: () => void }) {
  const { insert } = useStore();
  const [form, setForm] = useState({ happened_on: today(), title: "", channel: "", spend: "" });
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!form.title.trim()) return setError("Give the activation a name");
    const spend = form.spend.trim() === "" ? null : parseMoney(form.spend);
    if (form.spend.trim() !== "" && spend === null) return setError("Spend must be a number, or left blank");

    await insert("partner_activations", {
      partner_id: partnerId,
      happened_on: form.happened_on,
      title: form.title.trim(),
      channel: form.channel.trim() || null,
      spend_pence: spend,
    });
    setForm({ happened_on: today(), title: "", channel: "", spend: "" });
    setError(null);
    onDone();
  };

  return (
    <FormCard onCancel={onDone} onSave={() => void submit()} error={error}>
      <Field label="Date">
        <input type="date" className={inputClass} value={form.happened_on}
          onChange={(e) => setForm({ ...form, happened_on: e.target.value })} />
      </Field>
      <Field label="What">
        <input className={inputClass} value={form.title} placeholder="e.g. Autumn end-cap"
          onChange={(e) => { setForm({ ...form, title: e.target.value }); setError(null); }} />
      </Field>
      <Field label="Channel">
        <input className={inputClass} value={form.channel} placeholder="In-store, email, social…"
          onChange={(e) => setForm({ ...form, channel: e.target.value })} />
      </Field>
      <Field label="Spend (£, optional)">
        <input className={inputClass} value={form.spend} inputMode="decimal" placeholder="0.00"
          onChange={(e) => { setForm({ ...form, spend: e.target.value }); setError(null); }} />
      </Field>
    </FormCard>
  );
}

/** The add forms differ only in their fields, so the frame lives here. */
function FormCard({
  children, onSave, onCancel, error,
}: {
  children: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  error: string | null;
}) {
  return (
    <div className="mb-4 w-full rounded-[10px] border border-line-soft bg-surface-2 p-3">
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
      {error && <p className="mt-2 text-xs text-blocked">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button variant="solid" onClick={onSave}>Save</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
