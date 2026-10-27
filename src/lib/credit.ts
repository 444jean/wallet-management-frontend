import { isoToDate } from "@/lib/dates";
import { todayISO } from "@/lib/utils";
import type { CardPurchase, CreditCard } from "@/types";

/** Months shown in a card's simulation. */
export const SIMULATION_MONTHS = 12;
export const MAX_INSTALLMENTS = 60;
export const MAX_MONTHLY_RATE = 20;

type BillingDays = Pick<CreditCard, "closingDay" | "paymentDay">;

export interface Installment {
  /** 1-based position. */
  index: number;
  /** "YYYY-MM" in which it is paid. */
  month: string;
  amount: number;
}

/** "YYYY-MM" of the current month (local time, like the rest of the app). */
export function currentMonthKey(): string {
  return todayISO().slice(0, 7);
}

export function addMonths(monthKey: string, months: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(y, m - 1 + months, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const shortMonthFmt = new Intl.DateTimeFormat("es-CL", { month: "short", year: "numeric" });
const longMonthFmt = new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric" });

/** "nov 2026" */
export function formatMonthKey(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return shortMonthFmt.format(new Date(y, m - 1, 1));
}

/** "noviembre de 2026" */
export function formatMonthKeyLong(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return longMonthFmt.format(new Date(y, m - 1, 1));
}

/**
 * Amount of each installment, in whole pesos.
 * - Interest-free: exact split; the first installments absorb the rounding
 *   so the sum is the price.
 * - With interest: French amortization (equal installments) with the monthly
 *   rate, rounded to the peso.
 */
export function installmentAmounts(amount: number, installments: number, monthlyRate: number): number[] {
  const n = Math.max(1, Math.round(installments));
  if (monthlyRate <= 0) {
    const base = Math.floor(amount / n);
    const rest = amount - base * n;
    return Array.from({ length: n }, (_, i) => base + (i < rest ? 1 : 0));
  }
  const r = monthlyRate / 100;
  const quota = Math.round((amount * r) / (1 - Math.pow(1 + r, -n)));
  return Array.from({ length: n }, () => quota);
}

/** Price plus interest over the whole plan. */
export function totalWithInterest(amount: number, installments: number, monthlyRate: number): number {
  return installmentAmounts(amount, installments, monthlyRate).reduce((sum, a) => sum + a, 0);
}

/**
 * Month in which the first installment is paid. A purchase up to the closing
 * day enters that month's statement, otherwise the next one; the statement is
 * paid the same month when the payment day comes after the closing day, and
 * the following month otherwise.
 */
export function firstPaymentMonth(dateISO: string, card: BillingDays): string {
  const d = isoToDate(dateISO);
  let statement = dateISO.slice(0, 7);
  if (d.getDate() > card.closingDay) statement = addMonths(statement, 1);
  return card.paymentDay > card.closingDay ? statement : addMonths(statement, 1);
}

export function purchaseSchedule(purchase: CardPurchase, card: BillingDays): Installment[] {
  const first = firstPaymentMonth(purchase.date, card);
  return installmentAmounts(purchase.amount, purchase.installments, purchase.monthlyRate).map((amount, i) => ({
    index: i + 1,
    month: addMonths(first, i),
    amount,
  }));
}

export interface PurchaseProgress {
  /** Installments whose payment month is already past. */
  paid: number;
  remaining: number;
  /** Sum of the remaining installments. */
  outstanding: number;
  /** Amount of each installment (the first one, when interest-free splits differ). */
  installment: number;
  /** Payment month of the next installment, or null when all are paid. */
  nextMonth: string | null;
  firstMonth: string;
  lastMonth: string;
}

/** Installments with a payment month before `today` count as paid. */
export function purchaseProgress(
  purchase: CardPurchase,
  card: BillingDays,
  today = currentMonthKey(),
): PurchaseProgress {
  const schedule = purchaseSchedule(purchase, card);
  const pending = schedule.filter((i) => i.month >= today);
  return {
    paid: schedule.length - pending.length,
    remaining: pending.length,
    outstanding: pending.reduce((sum, i) => sum + i.amount, 0),
    installment: schedule[0]?.amount ?? 0,
    nextMonth: pending[0]?.month ?? null,
    firstMonth: schedule[0]?.month ?? today,
    lastMonth: schedule[schedule.length - 1]?.month ?? today,
  };
}

export interface SimulationItem {
  purchaseId: string;
  description: string;
  index: number;
  installments: number;
  amount: number;
}

export interface SimulationMonth {
  month: string;
  label: string;
  total: number;
  items: SimulationItem[];
}

/** What the card will charge in each of the next `months`, starting this month. */
export function simulateCard(card: CreditCard, months = SIMULATION_MONTHS, today = currentMonthKey()): SimulationMonth[] {
  const result: SimulationMonth[] = [];
  const byMonth = new Map<string, SimulationMonth>();
  for (let k = 0; k < months; k++) {
    const month = addMonths(today, k);
    const entry = { month, label: formatMonthKey(month), total: 0, items: [] };
    result.push(entry);
    byMonth.set(month, entry);
  }
  for (const p of card.purchases) {
    for (const i of purchaseSchedule(p, card)) {
      const entry = byMonth.get(i.month);
      if (!entry) continue;
      entry.total += i.amount;
      entry.items.push({
        purchaseId: p.id,
        description: p.description,
        index: i.index,
        installments: p.installments,
        amount: i.amount,
      });
    }
  }
  for (const m of result) m.items.sort((a, b) => b.amount - a.amount);
  return result;
}

export interface CardSummary {
  /** Sum of the installments not paid yet. */
  used: number;
  available: number;
  /** Used share of the limit, 0-100 (can exceed 100 when over the limit). */
  pct: number;
  overLimit: boolean;
  /** Charge of the current month. */
  thisMonth: number;
  /** Charge of the next month. */
  nextMonth: number;
  /** Purchases with installments left. */
  activePurchases: number;
}

export function cardSummary(card: CreditCard, today = currentMonthKey()): CardSummary {
  let used = 0;
  let activePurchases = 0;
  for (const p of card.purchases) {
    const { outstanding, remaining } = purchaseProgress(p, card, today);
    used += outstanding;
    if (remaining > 0) activePurchases++;
  }
  const [thisMonth, nextMonth] = simulateCard(card, 2, today);
  const pct = card.creditLimit > 0 ? Math.round((used / card.creditLimit) * 100) : 0;
  return {
    used,
    available: Math.max(0, card.creditLimit - used),
    pct,
    overLimit: used > card.creditLimit,
    thisMonth: thisMonth?.total ?? 0,
    nextMonth: nextMonth?.total ?? 0,
    activePurchases,
  };
}

export interface CardsTotals {
  totalLimit: number;
  totalUsed: number;
  totalAvailable: number;
  pct: number;
  thisMonth: number;
}

export function cardsTotals(cards: CreditCard[], today = currentMonthKey()): CardsTotals {
  let totalLimit = 0;
  let totalUsed = 0;
  let thisMonth = 0;
  for (const c of cards) {
    const s = cardSummary(c, today);
    totalLimit += c.creditLimit;
    totalUsed += s.used;
    thisMonth += s.thisMonth;
  }
  return {
    totalLimit,
    totalUsed,
    totalAvailable: Math.max(0, totalLimit - totalUsed),
    pct: totalLimit > 0 ? Math.min(100, Math.round((totalUsed / totalLimit) * 100)) : 0,
    thisMonth,
  };
}
