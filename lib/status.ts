export type Tone = "live" | "progress" | "blocked" | "neutral";

/**
 * Statuses are free text so the business is never blocked by a fixed list.
 * The colour is looked up here, and anything unrecognised shows neutral grey
 * rather than being rejected.
 */
const TONES: Record<string, Tone> = {
  active: "live",
  production: "live",
  "in production": "live",
  ordered: "live",
  delivered: "live",
  complete: "live",
  live: "live",

  shipping: "progress",
  sampling: "progress",
  reformulation: "progress",
  planning: "progress",
  drafting: "progress",
  scheduled: "progress",
  "in progress": "progress",
  negotiating: "progress",
  contacted: "progress",

  "awaiting quote": "blocked",
  "need follow-up": "blocked",
  blocked: "blocked",
  overdue: "blocked",
  paused: "blocked",
  "on hold": "blocked",
};

export function toneFor(status: string | null | undefined): Tone {
  if (!status) return "neutral";
  return TONES[status.trim().toLowerCase()] ?? "neutral";
}

/** Offered as suggestions in the status dropdown; typing anything else is fine. */
export const MANUFACTURING_STATUSES = [
  "Not Started", "Sampling", "Reformulation", "Awaiting Quote",
  "Ordered", "In Production", "Production", "Shipping", "Delivered", "On Hold",
];

export const MARKETING_STATUSES = [
  "Planning", "Drafting", "Scheduled", "Active", "Paused", "Complete",
];

export const PARTNER_STAGES = [
  "Contacted", "Samples Sent", "Negotiating", "Awaiting Decision", "Won", "Lost",
];

export const TONE_DOT: Record<Tone, string> = {
  live: "bg-live",
  progress: "bg-progress",
  blocked: "bg-blocked",
  neutral: "bg-ink-faint",
};

export const TONE_TEXT: Record<Tone, string> = {
  live: "text-live",
  progress: "text-progress",
  blocked: "text-blocked",
  neutral: "text-ink-dim",
};
