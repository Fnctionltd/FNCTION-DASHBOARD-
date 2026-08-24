"use client";

import { useState } from "react";
import { useStore } from "@/components/store";
import { Button } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import type { Note } from "@/lib/types";

type Parent =
  | { partner_id: string }
  | { manufacturing_item_id: string }
  | { marketing_channel_id: string };

/**
 * Chronological notes for a partner, manufacturing item or marketing channel.
 * Newest first, each stamped with who wrote it and when.
 */
export function Notes({ notes, parent, label }: { notes: Note[]; parent: Parent; label: string }) {
  const { insert, remove, nameFor, userId } = useStore();
  const [draft, setDraft] = useState("");

  const add = async () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    await insert("notes", { ...parent, body, author_id: userId });
  };

  return (
    <div className="mt-3">
      <div className="flex items-start gap-2">
        <textarea
          aria-label={`Add a note to ${label}`}
          value={draft}
          rows={1}
          placeholder="Add a note…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter starts a new line.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void add();
            }
          }}
          className="min-h-9 flex-1 resize-y rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm placeholder:text-ink-faint"
        />
        <Button onClick={() => void add()} disabled={!draft.trim()}>
          Add
        </Button>
      </div>

      {notes.length > 0 && (
        <ul className="mt-3 space-y-2.5">
          {notes.map((note) => (
            <li key={note.id} className="group text-sm">
              <p className="whitespace-pre-wrap text-ink">{note.body}</p>
              <p className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-ink-faint">
                <span>
                  {nameFor(note.author_id)} · {formatDateTime(note.created_at)}
                </span>
                {note.author_id === userId && (
                  <button
                    onClick={() => void remove("notes", note.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 hover:text-blocked"
                    aria-label="Delete this note"
                  >
                    delete
                  </button>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
