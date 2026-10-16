import { todayISO } from "@/lib/utils";

/** "YYYY-MM-DD" -> local Date at midnight. */
export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Local Date -> "YYYY-MM-DD". */
export function dateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const dayFormatter = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Header for a group of transactions: "Hoy", "Ayer" or "lunes 14 de octubre". */
export function dayLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return "Hoy";
  const yesterday = new Date(isoToDate(today));
  yesterday.setDate(yesterday.getDate() - 1);
  if (iso === dateToISO(yesterday)) return "Ayer";
  const label = dayFormatter.format(isoToDate(iso));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
