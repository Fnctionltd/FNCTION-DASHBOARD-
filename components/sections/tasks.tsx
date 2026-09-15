"use client";

import { useState } from "react";
import { useStore } from "@/components/store";
import { Button, EditableText, Panel } from "@/components/ui";

/** Monday to Sunday of the week we are in, e.g. "15 – 21 Sep". */
function weekLabel(): string {
  const now = new Date();
  const monday = new Date(now);
  // getDay() is 0 for Sunday, so shift it to make Monday the first day.
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const day = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric" });
  const month = (d: Date) => d.toLocaleDateString("en-GB", { month: "short" });

  return monday.getMonth() === sunday.getMonth()
    ? `${day(monday)} – ${day(sunday)} ${month(sunday)}`
    : `${day(monday)} ${month(monday)} – ${day(sunday)} ${month(sunday)}`;
}

export function Tasks() {
  const { data, userId, nameFor, insert, update, remove } = useStore();
  const [draft, setDraft] = useState("");

  const done = data.tasks.filter((t) => t.done);
  const open = data.tasks.filter((t) => !t.done);

  const add = async () => {
    const title = draft.trim();
    if (!title) return;
    setDraft("");
    await insert("tasks", { title, created_by: userId });
  };

  const clearDone = async () => {
    if (!confirm(`Clear ${done.length} finished task${done.length === 1 ? "" : "s"}?`)) return;
    // Sequential rather than parallel, so a failure part way through leaves
    // the rest of the list intact rather than half-removed on screen.
    for (const task of done) await remove("tasks", task.id);
  };

  return (
    <Panel
      title="Weekly Tasks"
      className="lg:col-span-12"
      action={
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-ink-faint">{weekLabel()}</span>
          {done.length > 0 && <Button onClick={() => void clearDone()}>Clear done</Button>}
        </div>
      }
    >
      <div className="flex items-start gap-2">
        <input
          aria-label="Add a task"
          value={draft}
          placeholder="Add a task…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void add()}
          className="min-h-9 flex-1 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm placeholder:text-ink-faint"
        />
        <Button onClick={() => void add()} disabled={!draft.trim()}>Add</Button>
      </div>

      {data.tasks.length === 0 ? (
        <p className="py-3 text-sm text-ink-faint">
          Nothing on the list. Add what needs doing this week.
        </p>
      ) : (
        <ul className="mt-3">
          {[...open, ...done].map((task) => (
            <li
              key={task.id}
              className="group flex items-start gap-3 border-t border-line-soft py-2.5 first:border-t-0"
            >
              <input
                type="checkbox"
                checked={task.done}
                aria-label={`Mark "${task.title}" as ${task.done ? "not done" : "done"}`}
                onChange={(e) =>
                  void update("tasks", task.id, {
                    done: e.target.checked,
                    done_at: e.target.checked ? new Date().toISOString() : null,
                    done_by: e.target.checked ? userId : null,
                  })
                }
                className="mt-1 size-4 shrink-0 accent-live"
              />

              <span className="min-w-0 flex-1">
                <EditableText
                  value={task.title}
                  ariaLabel={`Task: ${task.title}`}
                  className={`text-sm ${task.done ? "text-ink-faint line-through" : ""}`}
                  onSave={(title) => title && void update("tasks", task.id, { title })}
                />
                {task.done && task.done_by && (
                  <span className="ml-1.5 block font-mono text-[11px] text-ink-faint">
                    done by {nameFor(task.done_by)}
                  </span>
                )}
              </span>

              <button
                onClick={() => void remove("tasks", task.id)}
                aria-label={`Delete task "${task.title}"`}
                className="mt-1 font-mono text-[11px] text-ink-faint opacity-0 transition-opacity hover:text-blocked group-hover:opacity-100 focus:opacity-100"
              >
                delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {open.length > 0 && (
        <p className="mt-3 font-mono text-[11px] text-ink-faint">
          {open.length} outstanding{done.length > 0 && ` · ${done.length} done`}
        </p>
      )}
    </Panel>
  );
}
