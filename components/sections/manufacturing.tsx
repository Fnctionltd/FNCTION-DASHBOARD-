"use client";

import { useState } from "react";
import { useStore } from "@/components/store";
import { Notes } from "@/components/notes";
import { EditableStatus, EditableText, Panel } from "@/components/ui";
import { MANUFACTURING_STATUSES } from "@/lib/status";

export function Manufacturing() {
  const { data, update } = useStore();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <Panel title="Manufacturing" className="lg:col-span-7">
      <div className="grid gap-4 sm:grid-cols-2">
        {data.suppliers.map((supplier) => {
          const items = data.items.filter((i) => i.supplier_id === supplier.id);

          return (
            <div key={supplier.id} className="overflow-hidden rounded-[10px] border border-line-soft bg-surface-2">
              <h3 className="border-b border-line-soft px-3.5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-dim">
                {supplier.name}
              </h3>

              <ul>
                {items.map((item) => {
                  const isOpen = open === item.id;
                  const notes = data.notes.filter((n) => n.manufacturing_item_id === item.id);

                  return (
                    <li key={item.id} className="border-t border-line-soft first:border-t-0">
                      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
                        <button
                          onClick={() => setOpen(isOpen ? null : item.id)}
                          className="flex-1 text-left text-sm hover:text-ink-dim"
                          aria-expanded={isOpen}
                        >
                          {item.name}
                          {notes.length > 0 && (
                            <span className="ml-2 font-mono text-[11px] text-ink-faint">
                              {notes.length}
                            </span>
                          )}
                        </button>
                        <EditableStatus
                          value={item.status}
                          options={MANUFACTURING_STATUSES}
                          ariaLabel={`Status for ${item.name}`}
                          onSave={(status) => void update("manufacturing_items", item.id, { status })}
                        />
                      </div>

                      {isOpen && (
                        <div className="border-t border-line-soft bg-surface px-3.5 py-3">
                          <p className="mb-1 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                            Current action
                          </p>
                          <EditableText
                            value={item.current_action}
                            ariaLabel={`Current action for ${item.name}`}
                            placeholder="What happens next?"
                            className="text-sm"
                            onSave={(current_action) =>
                              void update("manufacturing_items", item.id, {
                                current_action: current_action || null,
                              })
                            }
                          />
                          <Notes notes={notes} parent={{ manufacturing_item_id: item.id }} label={item.name} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
