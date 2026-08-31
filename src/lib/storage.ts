import type { FinanceData, SavingsGoal, Transaction } from "@/types";
import { todayISO, uid } from "@/lib/utils";

const STORAGE_KEY = "wallet-management:data:v1";

function seedData(): FinanceData {
  const today = new Date();
  const iso = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offsetDays);
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 10);
  };

  const transactions: Transaction[] = [
    { id: uid(), type: "income", amount: 1200000, category: "Sueldo", description: "Sueldo mensual", date: iso(20) },
    { id: uid(), type: "income", amount: 250000, category: "Freelance", description: "Proyecto web", date: iso(8) },
    { id: uid(), type: "expense", amount: 450000, category: "Vivienda", description: "Arriendo", date: iso(18) },
    { id: uid(), type: "expense", amount: 180000, category: "Alimentación", description: "Supermercado", date: iso(12) },
    { id: uid(), type: "expense", amount: 45000, category: "Transporte", description: "Bencina", date: iso(6) },
    { id: uid(), type: "expense", amount: 35000, category: "Entretención", description: "Cine y salidas", date: iso(3) },
  ];

  const goals: SavingsGoal[] = [
    {
      id: uid(),
      name: "Fondo de emergencia",
      target: 3000000,
      current: 800000,
      monthlyContribution: 200000,
      annualRate: 4,
    },
    {
      id: uid(),
      name: "Viaje",
      target: 1500000,
      current: 300000,
      monthlyContribution: 150000,
      annualRate: 0,
      deadline: todayISO().slice(0, 4) + "-12-31",
    },
  ];

  return { transactions, goals, salary: null };
}

export function loadData(): FinanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedData();
      saveData(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as Partial<FinanceData>;
    return {
      transactions: parsed.transactions ?? [],
      goals: parsed.goals ?? [],
      salary: parsed.salary ?? null,
    };
  } catch {
    return { transactions: [], goals: [], salary: null };
  }
}

export function saveData(data: FinanceData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
  }
}
