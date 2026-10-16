import { useMemo } from "react";
import type { Transaction } from "@/types";
import { useFinance } from "@/hooks/use-finance";
import { todayISO } from "@/lib/utils";

export interface MonthlyPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
}

export interface CategorySlice {
  category: string;
  total: number;
}

const monthLabelFmt = new Intl.DateTimeFormat("es-CL", { month: "short" });

function monthKey(iso: string): string {
  return iso.slice(0, 7); // yyyy-mm
}

export function useStats() {
  const { transactions } = useFinance();

  return useMemo(() => {
    const now = new Date();
    // Local month (todayISO), not UTC: in Chile UTC is already the next month
    // from 21:00 on the last day.
    const currentKey = todayISO().slice(0, 7);

    let totalIncome = 0;
    let totalExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;

    for (const t of transactions) {
      if (t.type === "income") {
        totalIncome += t.amount;
        if (monthKey(t.date) === currentKey) monthIncome += t.amount;
      } else {
        totalExpense += t.amount;
        if (monthKey(t.date) === currentKey) monthExpense += t.amount;
      }
    }

    // Últimos 6 meses para el gráfico
    const months: MonthlyPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: monthLabelFmt.format(d), income: 0, expense: 0 });
    }
    const monthIndex = new Map(months.map((m, idx) => [m.key, idx]));
    for (const t of transactions) {
      const idx = monthIndex.get(monthKey(t.date));
      if (idx === undefined) continue;
      if (t.type === "income") months[idx].income += t.amount;
      else months[idx].expense += t.amount;
    }

    // Gastos del mes actual por categoría
    const byCategory = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense" || monthKey(t.date) !== currentKey) continue;
      byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
    }
    const categorySlices: CategorySlice[] = [...byCategory.entries()]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    return {
      balance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      monthIncome,
      monthExpense,
      monthBalance: monthIncome - monthExpense,
      months,
      categorySlices,
    };
  }, [transactions]);
}

export function sortByDateDesc(a: Transaction, b: Transaction): number {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
}
