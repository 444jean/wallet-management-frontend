import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Short amount for chart axes: "$123", "$45 mil", "$1,2 M". */
export function formatCompactCurrency(value: number): string {
  return compactFormatter.format(Math.round(value));
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(Math.round(value));
}

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return dateFormatter.format(new Date(y, m - 1, d));
}

const monthFormatter = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
});

export function formatMonth(date: Date): string {
  return monthFormatter.format(date);
}

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export function todayISO(): string {
  const now = new Date();
  const tz = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 10);
}
