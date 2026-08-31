import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FinanceData, SalaryConfig, SavingsGoal, Transaction } from "@/types";
import { loadData, saveData } from "@/lib/storage";
import { currentMonthKey, reconcileSalary } from "@/lib/recurring";
import { uid } from "@/lib/utils";

interface FinanceContextValue {
  transactions: Transaction[];
  goals: SavingsGoal[];
  salary: SalaryConfig | null;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateGoal: (id: string, goal: Omit<SavingsGoal, "id">) => void;
  deleteGoal: (id: string) => void;
  setSalary: (config: SalaryConfig) => void;
  clearSalary: () => void;
  resetAll: () => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

function adjustGoalCurrent(
  goals: SavingsGoal[],
  goalId: string,
  delta: number,
): SavingsGoal[] {
  return goals.map((g) =>
    g.id === goalId ? { ...g, current: Math.max(0, g.current + delta) } : g,
  );
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinanceData>(() => reconcileSalary(loadData()));

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    setData((d) => {
      const created = { ...tx, id: uid() };
      const goals = created.goalId
        ? adjustGoalCurrent(d.goals, created.goalId, created.amount)
        : d.goals;
      return { ...d, transactions: [created, ...d.transactions], goals };
    });
  }, []);

  const updateTransaction = useCallback((id: string, tx: Omit<Transaction, "id">) => {
    setData((d) => {
      const prev = d.transactions.find((t) => t.id === id);
      const updated = { ...tx, id };
      let goals = d.goals;
      // Revertimos el aporte anterior (si lo había) y aplicamos el nuevo.
      if (prev?.goalId) goals = adjustGoalCurrent(goals, prev.goalId, -prev.amount);
      if (updated.goalId) goals = adjustGoalCurrent(goals, updated.goalId, updated.amount);
      return {
        ...d,
        transactions: d.transactions.map((t) => (t.id === id ? updated : t)),
        goals,
      };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setData((d) => {
      const prev = d.transactions.find((t) => t.id === id);
      const goals = prev?.goalId
        ? adjustGoalCurrent(d.goals, prev.goalId, -prev.amount)
        : d.goals;
      return { ...d, transactions: d.transactions.filter((t) => t.id !== id), goals };
    });
  }, []);

  const addGoal = useCallback((goal: Omit<SavingsGoal, "id">) => {
    setData((d) => ({ ...d, goals: [...d.goals, { ...goal, id: uid() }] }));
  }, []);

  const updateGoal = useCallback((id: string, goal: Omit<SavingsGoal, "id">) => {
    setData((d) => ({
      ...d,
      goals: d.goals.map((g) => (g.id === id ? { ...goal, id } : g)),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
  }, []);

  const setSalary = useCallback((config: SalaryConfig) => {
    setData((d) => {
      const key = currentMonthKey();
      // Actualizamos el sueldo ya generado para el mes en curso, para que la
      // edición se refleje de inmediato; los meses pasados quedan como historial.
      const transactions = d.transactions.map((t) =>
        t.source === "salary" && t.date.slice(0, 7) === key
          ? {
              ...t,
              amount: config.amount,
              category: config.category,
              description: config.description,
            }
          : t,
      );
      return reconcileSalary({ ...d, salary: config, transactions });
    });
  }, []);

  const clearSalary = useCallback(() => {
    // Mantenemos el historial ya registrado; solo dejamos de generar nuevos.
    setData((d) => ({ ...d, salary: null }));
  }, []);

  const resetAll = useCallback(() => {
    setData({ transactions: [], goals: [], salary: null });
  }, []);

  const value = useMemo<FinanceContextValue>(
    () => ({
      transactions: data.transactions,
      goals: data.goals,
      salary: data.salary,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      setSalary,
      clearSalary,
      resetAll,
    }),
    [
      data,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      setSalary,
      clearSalary,
      resetAll,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance debe usarse dentro de <FinanceProvider>");
  return ctx;
}
