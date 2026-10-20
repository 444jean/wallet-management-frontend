export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  source?: "salary";
  goalId?: string;
}

export const SAVINGS_CATEGORY = "Ahorro";

export interface SalaryConfig {
  amount: number;
  category: string;
  description: string;
  day: number;
  since: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  /** null = "Fondo": savings without a target amount. */
  target: number | null;
  current: number;
  monthlyContribution: number;
  annualRate: number;
  deadline?: string;
  /** Bank or wallet where it is kept, a code from `lib/institutions.ts`. */
  institution?: string;
}

export interface FinanceData {
  transactions: Transaction[];
  goals: SavingsGoal[];
  salary: SalaryConfig | null;
}

export const EXPENSE_CATEGORIES = [
  "Alimentación",
  "Vivienda",
  "Transporte",
  "Salud",
  "Educación",
  "Entretención",
  "Servicios",
  "Compras",
  "Otros",
] as const;

export const INCOME_CATEGORIES = [
  "Sueldo",
  "Freelance",
  "Inversiones",
  "Regalo",
  "Reembolso",
  "Otros",
] as const;
