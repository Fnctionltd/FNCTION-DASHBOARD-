/**
 * Money is stored as whole pence and only becomes pounds for display or entry.
 * Doing arithmetic in pounds would accumulate floating point error on totals.
 */
export function formatMoney(pence: number): string {
  return "£" + (pence / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Whole pounds, for the headline figures where pennies are noise. */
export function formatMoneyShort(pence: number): string {
  return "£" + Math.round(pence / 100).toLocaleString("en-GB");
}

/** Parses typed input like "1,234.50", "£1234.5" or "1234" into pence. */
export function parseMoney(input: string): number | null {
  const cleaned = input.replace(/[£,\s]/g, "");
  if (cleaned === "") return null;
  const pounds = Number(cleaned);
  if (!Number.isFinite(pounds) || pounds < 0) return null;
  return Math.round(pounds * 100);
}

export function formatDate(iso: string): string {
  const date = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) +
    " · " +
    date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function startOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}
