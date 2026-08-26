"use client";

import { useEffect, useRef, useState } from "react";
import { toneFor, TONE_DOT, TONE_TEXT } from "@/lib/status";

export function Panel({
  title, children, action, className = "",
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-line bg-surface p-5 sm:p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-ink-faint">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatusDot({ status }: { status: string | null | undefined }) {
  return <i className={`inline-block size-2 shrink-0 rounded-full ${TONE_DOT[toneFor(status)]}`} />;
}

export function StatusText({ status }: { status: string | null | undefined }) {
  const tone = toneFor(status);
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs whitespace-nowrap">
      <StatusDot status={status} />
      <span className={TONE_TEXT[tone]}>{status || "—"}</span>
    </span>
  );
}

export function Metric({
  value, label, tone = "default",
}: {
  value: string;
  label: string;
  tone?: "default" | "warn" | "alert";
}) {
  const border =
    tone === "warn" ? "border-progress/45" : tone === "alert" ? "border-blocked/45" : "border-line-soft";
  const colour =
    tone === "warn" ? "text-progress" : tone === "alert" ? "text-blocked" : "text-ink";

  return (
    <div className={`rounded-[10px] border ${border} bg-surface-2 px-4 py-3.5`}>
      <span className={`block font-mono text-2xl leading-tight sm:text-3xl ${colour}`}>{value}</span>
      <span className="mt-2 block text-xs uppercase tracking-[0.1em] text-ink-dim">{label}</span>
    </div>
  );
}

export function Button({
  children, onClick, type = "button", variant = "ghost", disabled, ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "ghost" | "solid" | "danger";
  disabled?: boolean;
  /** Use when the visible label is too short to stand on its own. */
  ariaLabel?: string;
}) {
  const styles = {
    ghost: "border-line text-ink-dim hover:border-ink-faint hover:text-ink",
    solid: "border-ink bg-ink text-bg hover:opacity-90",
    danger: "border-line text-ink-faint hover:border-blocked hover:text-blocked",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] transition-colors disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}

/**
 * A field that looks like plain text until you click it, then saves what you
 * typed on blur. Nothing is written while you are mid-word: the value is only
 * committed once you leave the field and it actually changed.
 */
export function EditableText({
  value, onSave, placeholder = "—", multiline = false, className = "", ariaLabel,
}: {
  value: string | null;
  onSave: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  ariaLabel: string;
}) {
  const [draft, setDraft] = useState(value ?? "");
  const [editing, setEditing] = useState(false);

  // Adopt changes made by the other user, but never overwrite what is being typed.
  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== (value ?? "").trim()) onSave(next);
  };

  const shared =
    "w-full rounded bg-transparent px-1.5 py-1 -mx-1.5 hover:bg-surface-2 focus:bg-surface-2 " +
    "placeholder:text-ink-faint " + className;

  if (multiline) {
    return (
      <textarea
        aria-label={ariaLabel}
        value={draft}
        rows={2}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setEditing(true)}
        onBlur={commit}
        className={`${shared} resize-y`}
      />
    );
  }

  return (
    <input
      aria-label={ariaLabel}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={() => setEditing(true)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setDraft(value ?? "");
          setEditing(false);
          e.currentTarget.blur();
        }
      }}
      className={shared}
    />
  );
}

/**
 * Status picker. It renders as plain text at its natural width and only
 * becomes an input once clicked, so a long status can never be clipped by a
 * guessed field width. Typing a value that is not in the list is allowed, so a
 * new status never needs a code change.
 */
export function EditableStatus({
  value, options, onSave, ariaLabel,
}: {
  value: string;
  options: string[];
  onSave: (next: string) => void;
  ariaLabel: string;
}) {
  const listId = useRef(`status-${Math.random().toString(36).slice(2)}`).current;
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== value) onSave(next);
    else setDraft(value);
  };

  if (!editing) {
    return (
      <button
        type="button"
        aria-label={`${ariaLabel} — ${value || "not set"}. Click to change.`}
        onClick={() => setEditing(true)}
        className="inline-flex shrink-0 items-center gap-2 rounded px-1.5 py-1 font-mono text-xs whitespace-nowrap hover:bg-surface-2"
      >
        <StatusDot status={draft} />
        <span className={TONE_TEXT[toneFor(draft)]}>{draft || "Set status"}</span>
      </button>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      <StatusDot status={draft} />
      <input
        autoFocus
        aria-label={ariaLabel}
        list={listId}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        className={`w-36 shrink-0 rounded border border-line bg-surface-2 px-1.5 py-1 font-mono text-xs ${TONE_TEXT[toneFor(draft)]}`}
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </span>
  );
}

export function Field({
  label, children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.1em] text-ink-faint">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm placeholder:text-ink-faint";

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="py-3 text-sm text-ink-faint">{children}</p>;
}
