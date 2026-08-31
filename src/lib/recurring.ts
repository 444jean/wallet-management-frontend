import type { FinanceData, Transaction } from "@/types";
import { uid } from "@/lib/utils";

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function reconcileSalary(data: FinanceData): FinanceData {
  const { salary } = data;
  if (!salary) return data;

  const existingMonths = new Set(
    data.transactions
      .filter((t) => t.source === "salary")
      .map((t) => t.date.slice(0, 7)),
  );

  const now = new Date();
  const currentY = now.getFullYear();
  const currentM = now.getMonth() + 1;

  let [year, month] = salary.since.split("-").map(Number);

  const minSerial = currentY * 12 + (currentM - 1) - 23;
  if (year * 12 + (month - 1) < minSerial) {
    year = Math.floor(minSerial / 12);
    month = (minSerial % 12) + 1;
  }

  const added: Transaction[] = [];
  while (year < currentY || (year === currentY && month <= currentM)) {
    const key = `${year}-${String(month).padStart(2, "0")}`;
    if (!existingMonths.has(key)) {
      const day = Math.min(salary.day, daysInMonth(year, month));
      added.push({
        id: uid(),
        type: "income",
        amount: salary.amount,
        category: salary.category,
        description: salary.description,
        date: `${key}-${String(day).padStart(2, "0")}`,
        source: "salary",
      });
    }
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  if (added.length === 0) return data;
  return { ...data, transactions: [...added, ...data.transactions] };
}
