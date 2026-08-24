"use client";

import { useState } from "react";
import { useStore } from "@/components/store";
import { Notes } from "@/components/notes";
import { EditableStatus, EditableText, Panel } from "@/components/ui";
import { MARKETING_STATUSES } from "@/lib/status";

export function Marketing() {
  const { data, update } = useStore();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <Panel title="Marketing" className="lg:col-span-5">
      <ul>
        {data.channels.map((channel) => {
          const isOpen = open === channel.id;
          const notes = data.notes.filter((n) => n.marketing_channel_id === channel.id);

          return (
            <li key={channel.id} className="border-t border-line-soft first:border-t-0">
              <div className="flex items-center justify-between gap-2 py-2.5">
                <button
                  onClick={() => setOpen(isOpen ? null : channel.id)}
                  className="flex-1 text-left text-sm hover:text-ink-dim"
                  aria-expanded={isOpen}
                >
                  {channel.name}
                  {notes.length > 0 && (
                    <span className="ml-2 font-mono text-[11px] text-ink-faint">{notes.length}</span>
                  )}
                </button>
                <EditableStatus
                  value={channel.status}
                  options={MARKETING_STATUSES}
                  ariaLabel={`Status for ${channel.name}`}
                  onSave={(status) => void update("marketing_channels", channel.id, { status })}
                />
              </div>

              {isOpen && (
                <div className="mb-3 rounded-[10px] border border-line-soft bg-surface-2 px-3.5 py-3">
                  <p className="mb-1 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                    Current action
                  </p>
                  <EditableText
                    value={channel.current_action}
                    ariaLabel={`Current action for ${channel.name}`}
                    placeholder="What happens next?"
                    className="text-sm"
                    onSave={(current_action) =>
                      void update("marketing_channels", channel.id, {
                        current_action: current_action || null,
                      })
                    }
                  />
                  <Notes notes={notes} parent={{ marketing_channel_id: channel.id }} label={channel.name} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
