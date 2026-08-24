"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("fnction-theme");
    } catch {
      // Private browsing can throw on access; the default is fine.
    }
    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
    apply((stored as "dark" | "light" | null) ?? (prefersLight ? "light" : "dark"));
  }, []);

  function apply(next: "dark" | "light") {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("fnction-theme", next);
    } catch {
      // Not being able to remember the choice is not worth failing over.
    }
  }

  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => apply(next)}
      aria-label={`Switch to ${next} theme`}
      className="rounded-full border border-line px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-ink-dim hover:border-ink-faint hover:text-ink"
    >
      {theme === "dark" ? "◐ Light" : "◑ Dark"}
    </button>
  );
}
