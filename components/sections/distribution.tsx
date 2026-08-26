"use client";

import { useState } from "react";
import { useStore } from "@/components/store";
import { PartnerDetail } from "@/components/partner-detail";
import { Button, EmptyState, Field, Metric, Panel, StatusDot, inputClass } from "@/components/ui";
import { formatMoneyShort } from "@/lib/format";
import type { Partner } from "@/lib/types";

export function Distribution() {
  const { data, insert } = useStore();
  const [adding, setAdding] = useState<null | "existing" | "future">(null);
  const [name, setName] = useState("");
  const [openPartnerId, setOpenPartnerId] = useState<string | null>(null);

  const existing = data.partners.filter((p) => p.type === "existing");
  const future = data.partners.filter((p) => p.type === "future");
  const revenue = data.orders.reduce((sum, o) => sum + o.amount_pence, 0);
  const followUp = data.partners.filter((p) => p.needs_follow_up).length;

  // Read from the live list, so edits made in the panel show immediately and
  // the panel closes by itself if the partner is deleted.
  const openPartner = data.partners.find((p) => p.id === openPartnerId) ?? null;

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
        <Metric value={String(followUp)} label="Need Follow-Up" tone={followUp > 0 ? "warn" : "default"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PartnerColumn
          heading="Existing Partners"
          partners={existing}
          onAdd={() => setAdding("existing")}
          onOpen={setOpenPartnerId}
        />
        <PartnerColumn
          heading="Future Partners"
          partners={future}
          onAdd={() => setAdding("future")}
          onOpen={setOpenPartnerId}
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

      {openPartner && (
        <PartnerDetail partner={openPartner} onClose={() => setOpenPartnerId(null)} />
      )}
    </Panel>
  );
}

function PartnerColumn({
  heading, partners, onAdd, onOpen,
}: {
  heading: string;
  partners: Partner[];
  onAdd: () => void;
  onOpen: (id: string) => void;
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
            <PartnerRow key={p.id} partner={p} onOpen={onOpen} />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * One row, entirely a button: tapping anywhere on it opens that partner's own
 * screen. The summary on the right is what matters at a glance — money for
 * existing partners, pipeline stage for future ones.
 */
function PartnerRow({ partner, onOpen }: { partner: Partner; onOpen: (id: string) => void }) {
  const { data } = useStore();

  const orders = data.orders.filter((o) => o.partner_id === partner.id);
  const notes = data.notes.filter((n) => n.partner_id === partner.id);
  const activations = data.activations.filter((a) => a.partner_id === partner.id);
  const total = orders.reduce((sum, o) => sum + o.amount_pence, 0);
  const isFuture = partner.type === "future";

  const counts = [
    orders.length > 0 && `${orders.length} order${orders.length === 1 ? "" : "s"}`,
    activations.length > 0 && `${activations.length} activation${activations.length === 1 ? "" : "s"}`,
    notes.length > 0 && `${notes.length} note${notes.length === 1 ? "" : "s"}`,
  ].filter(Boolean) as string[];

  return (
    <li>
      <button
        onClick={() => onOpen(partner.id)}
        className="flex w-full items-center gap-3 rounded-[10px] border border-line-soft bg-surface-2 px-3.5 py-3 text-left transition-colors hover:border-ink-faint"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            {partner.needs_follow_up && <StatusDot status="Need Follow-Up" />}
            <span className="truncate text-sm">{partner.name}</span>
          </span>
          <span className="mt-0.5 block truncate font-mono text-[11px] text-ink-faint">
            {counts.length > 0 ? counts.join(" · ") : "Tap to add details"}
          </span>
        </span>

        <span className="shrink-0 text-right">
          {isFuture ? (
            <span className="font-mono text-xs text-ink-dim">{partner.stage || "No stage"}</span>
          ) : (
            <span className="font-mono text-sm">{formatMoneyShort(total)}</span>
          )}
          {partner.margin_percent != null && (
            <span className="block font-mono text-[11px] text-ink-faint">
              {partner.margin_percent}% margin
            </span>
          )}
        </span>

        <span aria-hidden="true" className="shrink-0 font-mono text-ink-faint">›</span>
      </button>
    </li>
  );
}
